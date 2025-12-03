import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, MapPin, Briefcase, TrendingUp, Send } from 'lucide-react';
import { formatRelativeTime, formatSalary, truncateText, getCompanyLogoUrl } from '@/lib/helpers';
import { JOB_TYPE_LABELS, SENIORITY_LABELS } from '@/lib/constants';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GuestApplicationModal } from './GuestApplicationModal';
import { AuthenticatedApplicationModal } from './AuthenticatedApplicationModal';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

const JobCard = ({ job, onSave, isSaved = false }: JobCardProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showAuthenticatedModal, setShowAuthenticatedModal] = useState(false);

  const handleApplyClick = () => {
    if (!user) {
      // Guest user - show guest application modal
      setShowGuestModal(true);
      return;
    }

    if (profile?.role === 'employer') {
      // Employers cannot apply
      toast({
        title: 'Acțiune nepermisă',
        description: 'Angajatorii nu pot aplica la joburi',
        variant: 'destructive',
      });
      return;
    }

    if (profile?.role === 'candidate') {
      // Check if profile is complete
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

      // Show authenticated application modal
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

  return (
    <Card className="group hover:shadow-card transition-smooth border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Company Logo */}
            <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden">
              <img
                src={getCompanyLogoUrl(job.company_logo)}
                alt={job.company_name || 'Company'}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-sm font-semibold text-primary">
                {job.company_name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/jobs/${job.id}`}>
                <h3 className="font-heading font-semibold text-xl mb-1 group-hover:text-primary transition-smooth">
                  {job.title}
                </h3>
              </Link>
              <Link 
                to={`/company/${job.employer_id}`}
                className="text-sm text-muted-foreground font-medium hover:text-primary transition-smooth"
              >
                {job.company_name}
              </Link>
            </div>
          </div>
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onSave(job.id);
              }}
              className={isSaved ? 'text-primary' : ''}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
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
          <p className="text-sm font-semibold text-primary mb-3">
            {formatSalary(job.salary_min, job.salary_max)}
          </p>
        )}

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {truncateText(job.description, 150)}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{formatRelativeTime(new Date(job.created_at))}</span>
          <div className="flex gap-2">
            <Button
              onClick={handleApplyClick}
              size="sm"
              className="flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
              Aplică
            </Button>
            <Link to={`/jobs/${job.id}`}>
              <Button variant="ghost" size="sm" className="text-primary hover:text-white hover:bg-green-600 transition-all">
                Detalii →
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>

      {/* Application Modals */}
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
    </Card>
  );
};

export default JobCard;
