import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Upload, ArrowRight } from 'lucide-react';
import { z } from 'zod';

const companyProfileSchema = z.object({
  company_name: z.string().min(2, 'Numele companiei trebuie să aibă cel puțin 2 caractere'),
  company_description: z.string().min(10, 'Descrierea trebuie să aibă cel puțin 10 caractere'),
});

type CompanyProfileData = z.infer<typeof companyProfileSchema>;

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CompanyProfileData>({
    company_name: '',
    company_description: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyProfileData, string>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CompanyProfileData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Fișier prea mare',
          description: 'Logo-ul nu poate depăși 2MB',
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Format invalid',
          description: 'Te rugăm să încarci o imagine',
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (userId: string): Promise<string | null> => {
    if (!logoFile) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Logo upload error:', uploadError);
      throw new Error('Eroare la încărcarea logo-ului');
    }

    return filePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: 'Trebuie să fii autentificat pentru a continua',
      });
      navigate('/login');
      return;
    }

    // Validate form
    const result = companyProfileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CompanyProfileData, string>> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof CompanyProfileData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Upload logo if provided
      let logoPath: string | null = null;
      if (logoFile) {
        logoPath = await uploadLogo(user.id);
      }

      // Update profile with company info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          company_name: formData.company_name,
          company_description: formData.company_description,
          company_logo: logoPath,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh profile in auth context
      await refreshProfile();

      toast({
        title: 'Profil complet!',
        description: 'Profilul companiei a fost creat cu succes',
      });

      navigate('/dashboard/employer', { replace: true });
    } catch (error: any) {
      console.error('Company profile error:', error);
      toast({
        variant: 'destructive',
        title: 'Eroare',
        description: error.message || 'A apărut o eroare. Te rugăm să încerci din nou.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-2">
              Creează profilul companiei
            </h1>
            <p className="text-muted-foreground">
              Pasul 2 din 2 - Completează informațiile despre companie
            </p>
          </div>

          <Card className="p-8 border border-border shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                  Nume companie *
                </label>
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  placeholder="Ex: Tech Solutions SRL"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.company_name ? 'border-destructive' : ''}
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive mt-1">{errors.company_name}</p>
                )}
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="company_description" className="block text-sm font-medium mb-2">
                  Descriere companie *
                </label>
                <Textarea
                  id="company_description"
                  name="company_description"
                  placeholder="Descrie compania ta, domeniile de activitate, cultura organizațională..."
                  value={formData.company_description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={6}
                  className={errors.company_description ? 'border-destructive' : ''}
                />
                {errors.company_description && (
                  <p className="text-sm text-destructive mt-1">{errors.company_description}</p>
                )}
              </div>

              {/* Company Logo */}
              <div>
                <label htmlFor="company_logo" className="block text-sm font-medium mb-2">
                  Logo companie (opțional)
                </label>
                <div className="space-y-4">
                  {logoPreview && (
                    <div className="flex items-center gap-4">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 object-contain rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview('');
                        }}
                        disabled={loading}
                      >
                        Schimbă logo
                      </Button>
                    </div>
                  )}
                  {!logoPreview && (
                    <div className="flex items-center gap-4">
                      <Input
                        id="company_logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={loading}
                        className="cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Format: PNG, JPG sau SVG. Dimensiune maximă: 2MB
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    'Se salvează...'
                  ) : (
                    <>
                      Finalizează configurarea
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Vei putea modifica aceste informații oricând din dashboard
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default CompanyOnboarding;
