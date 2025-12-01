import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuestApplicationModal } from '@/components/jobs/GuestApplicationModal';
import { AuthenticatedApplicationModal } from '@/components/jobs/AuthenticatedApplicationModal';
import {
  Loader2,
  MapPin,
  Briefcase,
  TrendingUp,
  Clock,
  Building2,
  Globe,
  ChevronLeft,
  Send,
} from 'lucide-react';
import { formatRelativeTime, formatSalary, getCompanyLogoUrl } from '@/lib/helpers';
import { JOB_TYPE_LABELS, SENIORITY_LABELS } from '@/lib/constants';
import { 
  generateJobPostingSchema, 
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateFAQSchema
} from '@/lib/schema';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showAuthenticatedModal, setShowAuthenticatedModal] = useState(false);

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      // First try to get the job regardless of status
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      
      // If job is not active, check if user is the owner
      if (data.status !== 'active' && data.employer_id !== profile?.id) {
        throw new Error('Job not found or not accessible');
      }
      
      return data as Job;
    },
    enabled: !!jobId,
  });

  const handleApplyClick = () => {
    if (!user) {
      setShowGuestModal(true);
      return;
    }

    if (profile?.role === 'employer') {
      toast({
        title: 'Acțiune nepermisă',
        description: 'Angajatorii nu pot aplica la joburi',
        variant: 'destructive',
      });
      return;
    }

    if (profile?.role === 'candidate') {
      const isProfileComplete =
        profile.full_name &&
        profile.phone &&
        profile.linkedin_url &&
        profile.cv_url;

      if (!isProfileComplete) {
        toast({
          title: 'Profil incomplet',
          description: 'Te rugăm să completezi profilul înainte de a aplica',
        });
        navigate('/dashboard/candidate');
        return;
      }

      setShowAuthenticatedModal(true);
    }
  };

  const handleApplicationSuccess = () => {
    setShowGuestModal(false);
    setShowAuthenticatedModal(false);
    toast({
      title: 'Aplicație trimisă cu succes!',
      description: 'Angajatorul va vedea aplicația ta și te va contacta',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  // Error or not found
  if (error || !job) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <h1 className="text-3xl font-heading font-bold mb-4">Job negăsit</h1>
          <p className="text-muted-foreground mb-6">
            Jobul solicitat nu există sau nu mai este activ.
          </p>
          <Button asChild>
            <Link to="/">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Înapoi la joburi
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const jobFAQs = [
    {
      question: `Cum aplic la ${job.title}?`,
      answer: `Apasă butonul "Aplică acum", completează formularul rapid (nume, email, telefon, CV) și trimite aplicația. Durează mai puțin de 30 de secunde!`
    },
    {
      question: `Care sunt cerințele pentru ${job.title}?`,
      answer: job.requirements || job.description || 'Verifică descrierea jobului pentru detalii complete despre cerințe.'
    },
    {
      question: `Este ${job.title} un job remote, hybrid sau onsite?`,
      answer: `Acest job este ${JOB_TYPE_LABELS[job.job_type]}. ${job.location ? `Locația este ${job.location}.` : ''}`
    },
  ];

  return (
    <PageLayout>
      <SEO
        title={`${job.title} - ${job.company_name}`}
        description={`${job.description?.substring(0, 155)}... | ${JOB_TYPE_LABELS[job.job_type]} | ${job.location} | Aplică în <30 secunde pe joben.eu`}
        canonical={`https://joben.eu/jobs/${job.id}`}
        ogType="article"
        structuredData={[
          generateJobPostingSchema(job, job.company_name),
          generateBreadcrumbSchema([
            { name: 'Acasă', url: 'https://joben.eu' },
            { name: 'Joburi', url: 'https://joben.eu/#jobs' },
            { name: job.title, url: `https://joben.eu/jobs/${job.id}` },
          ]),
          generateOrganizationSchema(),
          generateFAQSchema(jobFAQs),
        ]}
        alternateLanguages={[
          { lang: 'ro', href: `https://joben.eu/jobs/${job.id}` },
          { lang: 'x-default', href: `https://joben.eu/jobs/${job.id}` },
        ]}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs for SEO */}
        <Breadcrumbs
          items={[
            { label: 'Joburi', href: '/' },
            { label: job.title },
          ]}
          className="mb-6"
        />
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Înapoi la joburi
        </Link>

        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Company Logo */}
                <Avatar className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                  <AvatarImage 
                    src={getCompanyLogoUrl(job.company_logo)} 
                  />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                    {job.company_name?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                    {job.title}
                  </h1>
                  <Link 
                    to={`/company/${job.employer_id}`}
                    className="flex items-center gap-2 text-lg text-muted-foreground hover:text-primary transition-smooth mb-4"
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">{job.company_name}</span>
                  </Link>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {JOB_TYPE_LABELS[job.job_type]}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {SENIORITY_LABELS[job.seniority]}
                    </Badge>
                  </div>

                  {/* Salary */}
                  {job.salary_public && (job.salary_min || job.salary_max) && (
                    <p className="text-lg font-semibold text-primary">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </p>
                  )}

                  {/* Posted date */}
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Postat {formatRelativeTime(new Date(job.created_at))}
                  </p>
                </div>
              </div>

              {/* Apply button */}
              <div className="flex flex-col gap-2">
                <Button size="lg" onClick={handleApplyClick} className="w-full md:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  Aplică acum
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-4">
                  Descrierea jobului
                </h2>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-heading font-semibold mb-4">
                    Cerințe
                  </h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold mb-4">Despre companie</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={getCompanyLogoUrl(job.company_logo)} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {job.company_name?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{job.company_name}</p>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  
                  {job.company_description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {job.company_description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Apply CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-heading font-semibold mb-2">
                  Interesat de acest job?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Aplică acum și fii contactat de angajator
                </p>
                <Button onClick={handleApplyClick} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Aplică acum
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Modals */}
      {job && (
        <>
          <GuestApplicationModal
            job={job}
            isOpen={showGuestModal}
            onClose={() => setShowGuestModal(false)}
            onSuccess={handleApplicationSuccess}
          />
          <AuthenticatedApplicationModal
            job={job}
            isOpen={showAuthenticatedModal}
            onClose={() => setShowAuthenticatedModal(false)}
            onSuccess={handleApplicationSuccess}
          />
        </>
      )}
    </PageLayout>
  );
};

export default JobDetailsPage;
