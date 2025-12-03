import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { COVER_LETTER_MAX_LENGTH } from '@/lib/constants';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface AuthenticatedApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthenticatedApplicationModal = ({ job, isOpen, onClose, onSuccess }: AuthenticatedApplicationModalProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  if (!profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.cv_url) {
      toast({
        title: 'CV lipsă',
        description: 'Te rugăm să încarci un CV în profilul tău',
        variant: 'destructive',
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: 'Termeni neacceptați',
        description: 'Trebuie să accepți termenii și condițiile',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting authenticated application:', {
        job_id: job.id,
        candidate_id: profile.id,
        cv_url: profile.cv_url,
        cover_letter: coverLetter || null,
      });

      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          candidate_id: profile.id,
          cv_url: profile.cv_url,
          cover_letter: coverLetter || null,
          status: 'submitted',
        });

      if (error) {
        console.error('Application insert error:', error);
        // Check for duplicate application
        if (error.code === '23505') {
          toast({
            title: 'Aplicație existentă',
            description: 'Ai aplicat deja la acest job',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      console.log('Application submitted successfully!');

      toast({
        title: 'Aplicație trimisă cu succes!',
        description: 'Angajatorul va vedea aplicația ta și te va contacta',
      });

      // Invalidate applications cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['candidate-applications'] });
      await queryClient.invalidateQueries({ queryKey: ['employer-applications'] });

      setCoverLetter('');
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

  const getCvFileName = () => {
    if (!profile.cv_url) return 'CV';
    const parts = profile.cv_url.split('/');
    return parts[parts.length - 1] || 'CV';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Aplică pentru {job.title}</DialogTitle>
          <DialogDescription>
            Verifică datele tale și aplică cu un singur click
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Profile Information (Read-only) */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Informațiile tale
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Nume complet</p>
                <p className="font-medium">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Telefon</p>
                <p className="font-medium">{profile.phone || 'Necompletat'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">LinkedIn</p>
                {profile.linkedin_url ? (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    Profil <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="font-medium text-muted-foreground">Necompletat</p>
                )}
              </div>
            </div>

            {/* CV */}
            <div>
              <p className="text-muted-foreground text-xs mb-1">CV</p>
              {profile.cv_url ? (
                <div className="flex items-center justify-between bg-background rounded px-3 py-2">
                  <span className="text-sm font-medium truncate">{getCvFileName()}</span>
                  <button
                    onClick={async () => {
                      window.open(`/dashboard/candidate#profile`, '_blank');
                    }}
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    Vezi <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-destructive">CV lipsă - te rugăm să încarci un CV</p>
              )}
            </div>
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
            <Button type="submit" disabled={isSubmitting || !profile.cv_url || !acceptTerms}>
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
