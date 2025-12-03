-- Migration: Fix RLS policies for guest applications
-- Allow anonymous users to insert guest applications

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can create their own applications" ON public.applications;

-- Create new insert policy that allows both authenticated and anonymous users
CREATE POLICY "Users can create applications"
  ON public.applications
  FOR INSERT
  TO public
  WITH CHECK (
    -- Authenticated users can only insert with their own candidate_id
    (auth.uid() IS NOT NULL AND candidate_id = auth.uid() AND guest_email IS NULL)
    OR
    -- Anonymous users can insert guest applications (no candidate_id, must have guest_email)
    (auth.uid() IS NULL AND candidate_id IS NULL AND guest_email IS NOT NULL)
  );

-- Ensure select policy allows employers to see all applications
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.applications;

CREATE POLICY "Employers can view applications for their jobs"
  ON public.applications
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

-- Ensure candidates can see their own applications
DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;

CREATE POLICY "Candidates can view their own applications"
  ON public.applications
  FOR SELECT
  TO public
  USING (
    candidate_id = auth.uid()
  );

-- Update policy allows only the application owner or employer to update
DROP POLICY IF EXISTS "Update own applications" ON public.applications;

CREATE POLICY "Update own applications or by employer"
  ON public.applications
  FOR UPDATE
  TO public
  USING (
    -- Employer can update applications for their jobs
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );
