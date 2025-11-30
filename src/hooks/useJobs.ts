import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface UseJobsParams {
  search?: string;
  location?: string;
  jobTypes?: string[];
  seniorities?: string[];
  techStack?: string[];
  page?: number;
  pageSize?: number;
}

interface UseJobsResult {
  jobs: Job[];
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

export const useJobs = ({
  search = '',
  location = 'all',
  jobTypes = [],
  seniorities = [],
  techStack = [],
  page = 1,
  pageSize = 20,
}: UseJobsParams = {}): UseJobsResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', search, location, jobTypes, seniorities, techStack, page],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%`);
      }

      // Location filter
      if (location && location !== 'all') {
        query = query.eq('location', location);
      }

      // Job type filter
      if (jobTypes.length > 0) {
        query = query.in('job_type', jobTypes as any);
      }

      // Seniority filter
      if (seniorities.length > 0) {
        query = query.in('seniority', seniorities as any);
      }

      // Tech stack filter
      if (techStack.length > 0) {
        query = query.overlaps('tech_stack', techStack);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        jobs: data || [],
        totalCount: count || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    jobs: data?.jobs || [],
    totalCount: data?.totalCount || 0,
    totalPages: Math.ceil((data?.totalCount || 0) / pageSize),
    isLoading,
    error: error as Error | null,
  };
};
