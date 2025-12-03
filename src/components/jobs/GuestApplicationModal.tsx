import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CVUpload } from './CVUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { COVER_LETTER_MAX_LENGTH } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface GuestApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const guestApplicationSchema = z.object({
  firstName: z.string().min(2, 'Prenumele trebuie să aibă minim 2 caractere'),
  lastName: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere'),
  email: z.string().email('Email invalid'),
  phone: z.string().min(10, 'Telefonul trebuie să aibă minim 10 caractere'),
  linkedinUrl: z.string().url('URL LinkedIn invalid').optional().or(z.literal('')),
  coverLetter: z.string().max(COVER_LETTER_MAX_LENGTH, `Cover letter maxim ${COVER_LETTER_MAX_LENGTH} caractere`).optional().or(z.literal('')),
});

type FormData = z.infer<typeof guestApplicationSchema>;

export const GuestApplicationModal = ({ job, isOpen, onClose, onSuccess }: GuestApplicationModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    coverLetter: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCvUploadComplete = (uploadedCvUrl: string) => {
    setCvUrl(uploadedCvUrl);
  };

  const validateForm = (): boolean => {
    try {
      guestApplicationSchema.parse(formData);

      if (!cvFile) {
        toast({
          title: 'CV lipsă',
          description: 'Te rugăm să încarci CV-ul',
          variant: 'destructive',
        });
        return false;
      }

      if (!acceptTerms) {
        toast({
          title: 'Termeni neacceptați',
          description: 'Trebuie să accepți termenii și condițiile',
          variant: 'destructive',
        });
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const uploadCV = async (): Promise<string | null> => {
    if (!cvFile) return null;

    try {
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `guest-applications/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('cvs')
        .upload(fileName, cvFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      return data.path;
    } catch (error) {
      console.error('CV upload error:', error);
      throw new Error('Eroare la încărcarea CV-ului');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Upload CV
      const uploadedCvPath = await uploadCV();
      if (!uploadedCvPath) {
        throw new Error('Eroare la încărcarea CV-ului');
      }

      // 2. Create application
      const applicationData = {
        job_id: job.id,
        candidate_id: null, // Explicitly set to null for guest applications
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_linkedin_url: formData.linkedinUrl || null,
        cv_url: uploadedCvPath,
        cover_letter: formData.coverLetter || null,
        status: 'submitted' as const,
      };
      
      console.log('Submitting guest application with data:', applicationData);
      
      const { error: applicationError } = await supabase
        .from('applications')
        .insert(applicationData);

      if (applicationError) {
        console.error('Application insert error:', applicationError);
        // Check for duplicate application
        if (applicationError.code === '23505') {
          toast({
            title: 'Aplicație existentă',
            description: 'Ai aplicat deja la acest job cu acest email',
            variant: 'destructive',
          });
          return;
        }
        throw applicationError;
      }

      toast({
        title: 'Aplicație trimisă cu succes!',
        description: 'Angajatorul va vedea aplicația ta și te va contacta',
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        coverLetter: '',
      });
      setCvFile(null);
      setCvUrl(null);

      onSuccess();
    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Eroare la trimiterea aplicației',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aplică pentru {job.title}</DialogTitle>
          <DialogDescription>
            Completează formularul pentru a aplica la acest job. Angajatorul va primi aplicația ta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prenume <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Ion"
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nume <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Popescu"
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="ion.popescu@email.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+40 712 345 678"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL (opțional)</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/nume-prenume"
              disabled={isSubmitting}
            />
            {errors.linkedinUrl && (
              <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
            )}
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <Label>
              CV <span className="text-destructive">*</span>
            </Label>
            <CVUpload
              onFileSelect={setCvFile}
              onUploadComplete={handleCvUploadComplete}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              disabled={isSubmitting}
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm text-muted-foreground leading-tight cursor-pointer"
            >
              Accept{' '}
              <Link to="/terms" className="text-primary hover:underline" target="_blank">
                termenii și condițiile
              </Link>
              {' '}și{' '}
              <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                politica de confidențialitate
              </Link>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting || !cvFile || !acceptTerms}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se trimite...
                </>
              ) : (
                'Aplică'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
