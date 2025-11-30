import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, MapPin, Briefcase, TrendingUp } from 'lucide-react';
import { formatRelativeTime, formatSalary, truncateText } from '@/lib/helpers';
import { JOB_TYPE_LABELS, SENIORITY_LABELS } from '@/lib/constants';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

const JobCard = ({ job, onSave, isSaved = false }: JobCardProps) => {
  const techStackPreview = job.tech_stack?.slice(0, 4) || [];
  const remainingTechCount = (job.tech_stack?.length || 0) - 4;

  return (
    <Card className="group hover:shadow-card transition-smooth border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link to={`/jobs/${job.id}`}>
              <h3 className="font-heading font-semibold text-xl mb-1 group-hover:text-primary transition-smooth">
                {job.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground font-medium">{job.company_name}</p>
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

        {techStackPreview.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {techStackPreview.map((tech) => (
              <Badge key={tech} variant="default" className="text-xs">
                {tech}
              </Badge>
            ))}
            {remainingTechCount > 0 && (
              <Badge variant="default" className="text-xs">
                +{remainingTechCount} mai mult
              </Badge>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {truncateText(job.description, 150)}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatRelativeTime(new Date(job.created_at))}</span>
          <Link to={`/jobs/${job.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              Vezi detalii →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
