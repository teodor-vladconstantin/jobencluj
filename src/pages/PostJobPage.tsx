import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Briefcase, ChevronRight } from 'lucide-react';
import { LOCATIONS, JOB_TYPE_LABELS, SENIORITY_LABELS } from '@/lib/constants';

// Zod validation schema
const postJobSchema = z.object({
  title: z.string().min(10, 'Titlul trebuie să aibă minim 10 caractere'),
  company_name: z.string().min(2, 'Numele companiei este obligatoriu'),
  location: z.string().min(1, 'Locația este obligatorie'),
  job_type: z.enum(['remote', 'hybrid', 'onsite'], {
    errorMap: () => ({ message: 'Tipul jobului este obligatoriu' })
  }),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead'], {
    errorMap: () => ({ message: 'Nivelul de senioritate este obligatoriu' })
  }),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  salary_public: z.boolean().default(false),
  salary_in_description: z.boolean().default(false),
  no_salary_disclosure: z.boolean().default(false),
  job_description: z.string().min(150, 'Job Description trebuie să aibă minim 150 caractere'),
  acceptTerms: z.boolean().optional(),
}).refine(data => {
  // Dacă se completează salariul, ambele câmpuri trebuie completate
  if ((data.salary_min && !data.salary_max) || (!data.salary_min && data.salary_max)) {
    return false;
  }
  // Dacă ambele sunt completate, max >= min
  if (data.salary_min && data.salary_max && data.salary_max < data.salary_min) {
    return false;
  }
  return true;
}, {
  message: 'Dacă introduci salariul, ambele valori trebuie completate și salariul maxim trebuie să fie mai mare sau egal cu minimul',
  path: ['salary_max'],
});

type PostJobFormData = z.infer<typeof postJobSchema>;

const PostJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<PostJobFormData>>({
    salary_public: false,
    salary_in_description: false,
    no_salary_disclosure: false,
    location: undefined,
    job_type: undefined,
    seniority: undefined,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);

  // Auto-fill from employer profile
  useEffect(() => {
    if (profile && !jobId) {
      setFormData(prev => ({
        ...prev,
        company_name: profile.company_name || '',
      }));
    }
  }, [profile, jobId]);

  // Fetch job for edit mode
  useEffect(() => {
    if (jobId && profile) {
      setEditMode(true);
      setIsLoadingJob(true);

      const fetchJob = async () => {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('employer_id', profile.id)
          .single();

        if (error || !data) {
          toast({
            title: 'Job negăsit',
            description: 'Jobul solicitat nu există sau nu îți aparține',
            variant: 'destructive',
          });
          navigate('/dashboard/employer');
          return;
        }

        setFormData({
          title: data.title,
          company_name: data.company_name,
          location: data.location,
          job_type: data.job_type,
          seniority: data.seniority,
          salary_min: data.salary_min || 0,
          salary_max: data.salary_max || 0,
          salary_public: data.salary_public || false,
          job_description: data.description,
        });
        setIsLoadingJob(false);
      };

      fetchJob();
    }
  }, [jobId, profile, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check terms acceptance for new jobs
    if (!editMode && !formData.acceptTerms) {
      setErrors({ acceptTerms: 'Trebuie să accepți termenii și condițiile' });
      return;
    }

    try {
      // Validare Zod
      const validatedData = postJobSchema.parse(formData);
      
      // Prep Job Description - adaug\u0103 salariul dac\u0103 e bifat
      let finalDescription = validatedData.job_description;
      
      if (validatedData.salary_in_description && validatedData.salary_min && validatedData.salary_max) {
        const salaryText = `\n\n---\n\n**💰 Salariu:** ${validatedData.salary_min.toLocaleString('ro-RO')} - ${validatedData.salary_max.toLocaleString('ro-RO')} RON net/lun\u0103`;
        finalDescription += salaryText;
      }
      
      const jobData = {
        title: validatedData.title,
        company_name: validatedData.company_name,
        location: validatedData.location,
        job_type: validatedData.job_type,
        seniority: validatedData.seniority,
        salary_min: validatedData.salary_min || null,
        salary_max: validatedData.salary_max || null,
        salary_public: validatedData.salary_public || false,
        description: finalDescription,
        requirements: validatedData.job_description,
        company_logo: profile?.company_logo || null,
        company_description: profile?.company_description || null,
      };

      setIsSubmitting(true);

      if (editMode && jobId) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId)
          .eq('employer_id', profile!.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast({
          title: 'Job actualizat!',
          description: 'Modificările au fost salvate cu succes',
        });
        navigate('/dashboard/employer');
      } else {
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert({
            ...jobData,
            employer_id: profile!.id,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        console.log('Job created successfully:', data);

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
        await queryClient.invalidateQueries({ queryKey: ['jobs'] });

        toast({
          title: 'Jobul a fost postat!',
          description: 'Jobul este acum activ și vizibil pentru candidați',
        });
        navigate('/dashboard/employer');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Mapare erori Zod la fields
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Supabase error:', error);
        toast({
          title: 'Eroare',
          description: error instanceof Error ? error.message : 'A apărut o eroare',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state for edit mode
  if (isLoadingJob) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </PageLayout>
    );
  }

  // Form
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard/employer" className="hover:text-primary">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">
            {editMode ? 'Editează job' : 'Postează job nou'}
          </span>
        </div>

        {/* Warning if profile incomplete */}
        {!editMode && !profile?.company_name && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Atenție:</strong> Trebuie să completezi numele companiei în{' '}
              <Link to="/dashboard/employer" className="underline font-semibold">
                Profil companie
              </Link>
              {' '}înainte de a posta un job.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            {editMode ? 'Editează job' : 'Postează job nou'}
          </h1>
          <p className="text-muted-foreground">
            {editMode
              ? 'Modifică detaliile jobului tău.'
              : 'Completează toate câmpurile pentru a posta un job nou.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Informații generale */}
          <Card>
            <CardHeader>
              <CardTitle>Informații generale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="title">Titlu job *</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.title?.length || 0}/10 minim
                  </span>
                </div>
                <Input
                  id="title"
                  placeholder="Ex: Senior React Developer"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name">Nume companie *</Label>
                <Input
                  id="company_name"
                  placeholder="Ex: Acme Corporation"
                  value={formData.company_name || ''}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Numele companiei este preluat din profilul tău</p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Locație *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger className={errors.location ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selectează locația" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>
            </CardContent>
          </Card>

          {/* 2. Detalii poziție */}
          <Card>
            <CardHeader>
              <CardTitle>Detalii poziție</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Type */}
                <div className="space-y-2">
                  <Label htmlFor="job_type">Tip job *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value as any })}
                  >
                    <SelectTrigger className={errors.job_type ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.job_type && <p className="text-sm text-destructive">{errors.job_type}</p>}
                </div>

                {/* Seniority */}
                <div className="space-y-2">
                  <Label htmlFor="seniority">Senioritate *</Label>
                  <Select
                    value={formData.seniority}
                    onValueChange={(value) => setFormData({ ...formData, seniority: value as any })}
                  >
                    <SelectTrigger className={errors.seniority ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selectează nivelul" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SENIORITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.seniority && <p className="text-sm text-destructive">{errors.seniority}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Salariu */}
          <Card>
            <CardHeader>
              <CardTitle>Salariu (opțional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Checkbox: Nu doresc să trec salariul */}
              <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  id="no_salary_disclosure"
                  checked={formData.no_salary_disclosure || false}
                  onCheckedChange={(checked) => {
                    setFormData({ 
                      ...formData, 
                      no_salary_disclosure: checked as boolean,
                      salary_min: checked ? null : formData.salary_min,
                      salary_max: checked ? null : formData.salary_max,
                      salary_public: checked ? false : formData.salary_public,
                      salary_in_description: checked ? false : formData.salary_in_description,
                    });
                  }}
                />
                <div className="space-y-1">
                  <Label htmlFor="no_salary_disclosure" className="cursor-pointer font-medium">
                    Nu doresc să trec salariul
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Bifează dacă nu vrei să afișezi informații despre salariu
                  </p>
                </div>
              </div>

              {/* Salary Fields - disabled dacă no_salary_disclosure */}
              {!formData.no_salary_disclosure && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Salary Min */}
                    <div className="space-y-2">
                      <Label htmlFor="salary_min">Salariu minim (RON)</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        placeholder="Ex: 5000"
                        value={formData.salary_min || ''}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value ? parseFloat(e.target.value) : null })}
                        className={errors.salary_min ? 'border-destructive' : ''}
                      />
                      {errors.salary_min && <p className="text-sm text-destructive">{errors.salary_min}</p>}
                    </div>

                    {/* Salary Max */}
                    <div className="space-y-2">
                      <Label htmlFor="salary_max">Salariu maxim (RON)</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        placeholder="Ex: 8000"
                        value={formData.salary_max || ''}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value ? parseFloat(e.target.value) : null })}
                        className={errors.salary_max ? 'border-destructive' : ''}
                      />
                      {errors.salary_max && <p className="text-sm text-destructive">{errors.salary_max}</p>}
                    </div>
                  </div>

                  {/* Opțiuni salariu */}
                  {(formData.salary_min || formData.salary_max) && (
                    <div className="space-y-3 pt-2 border-t">
                      {/* Salary Public */}
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="salary_public"
                          checked={formData.salary_public || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, salary_public: checked as boolean })}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="salary_public" className="cursor-pointer">
                            Afișează salariul public
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Salariul va fi vizibil pentru toți candidații pe listingul de joburi
                          </p>
                        </div>
                      </div>

                      {/* Salary in Description */}
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="salary_in_description"
                          checked={formData.salary_in_description || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, salary_in_description: checked as boolean })}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="salary_in_description" className="cursor-pointer">
                            Treci salariul în descriere (recomandat)
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Salariul va fi adăugat automat la finalul descrierii jobului
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="job_description">Job Description *</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.job_description?.length || 0}/150 minim
                  </span>
                </div>
                <Textarea
                  id="job_description"
                  rows={12}
                  placeholder="Descrie rolul, cerințele, responsabilitățile principale și mediul de lucru. Folosește bullet points pentru claritate:&#10;&#10;- Responsabilități principale&#10;- Cerințe tehnice&#10;- Experiență necesară&#10;- Avantaje..."
                  value={formData.job_description || ''}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  className={errors.job_description ? 'border-destructive' : ''}
                />
                {errors.job_description && <p className="text-sm text-destructive">{errors.job_description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions (only for new jobs) */}
          {!editMode && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms || false}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
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
                {' '}pentru postarea de joburi
              </label>
            </div>
          )}
          {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms}</p>}

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/employer')}
              disabled={isSubmitting}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting || (!editMode && (!formData.acceptTerms || !profile?.company_name))}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editMode ? 'Se salvează...' : 'Se publică...'}
                </>
              ) : (
                editMode ? 'Salvează modificări' : 'Postează job'
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default PostJobPage;
