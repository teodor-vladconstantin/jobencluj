import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, MapPin, Briefcase, TrendingUp, ExternalLink, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime, formatSalary, getCompanyLogoUrl } from '@/lib/helpers';
import { JOB_TYPE_LABELS, SENIORITY_LABELS } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

const CompanyProfile = () => {
  const { companyId } = useParams<{ companyId: string }>();

  // Fetch company profile
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company-profile', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', companyId)
        .eq('role', 'employer')
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!companyId,
  });

  // Fetch company jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['company-jobs', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', companyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!companyId,
  });

  if (companyLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!company) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 max-w-6xl text-center">
          <h1 className="text-2xl font-bold mb-4">Companie negăsită</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la joburi
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la joburi
          </Link>
        </Button>

        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden">
                <img
                  src={getCompanyLogoUrl(company.company_logo)}
                  alt={company.company_name || 'Company'}
                  className="w-full h-full object-contain p-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-3xl font-semibold text-primary">
                  {company.company_name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-heading font-bold mb-2">
                  {company.company_name || 'Companie'}
                </h1>

                {company.company_website && (
                  <a
                    href={company.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline mb-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {company.company_website.replace(/^https?:\/\//, '')}
                  </a>
                )}

                {company.company_description && (
                  <p className="text-muted-foreground whitespace-pre-wrap mt-4">
                    {company.company_description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Section */}
        <div>
          <h2 className="text-2xl font-heading font-bold mb-6">
            Joburi active ({jobs?.length || 0})
          </h2>

          {jobsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-card transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link to={`/jobs/${job.id}`}>
                          <h3 className="text-xl font-heading font-semibold mb-2 hover:text-primary transition-smooth">
                            {job.title}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {JOB_TYPE_LABELS[job.job_type]}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {SENIORITY_LABELS[job.seniority]}
                          </Badge>
                        </div>

                        {job.salary_public && job.salary_min && (
                          <p className="text-sm font-semibold text-primary mb-2">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </p>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>

                        <p className="text-xs text-muted-foreground mt-3">
                          Postat {formatRelativeTime(new Date(job.created_at))}
                        </p>
                      </div>

                      <Button asChild>
                        <Link to={`/jobs/${job.id}`}>
                          Detalii
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Această companie nu are joburi active momentan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default CompanyProfile;
