-- Migration: Add support for guest applications
-- Allows users to apply for jobs without creating an account

-- Add guest user fields to applications table
ALTER TABLE public.applications ADD COLUMN guest_name TEXT;
ALTER TABLE public.applications ADD COLUMN guest_email TEXT;
ALTER TABLE public.applications ADD COLUMN guest_phone TEXT;
ALTER TABLE public.applications ADD COLUMN guest_linkedin_url TEXT;

-- Make candidate_id nullable to allow guest applications
ALTER TABLE public.applications ALTER COLUMN candidate_id DROP NOT NULL;

-- Add constraint: either candidate_id OR guest_email must be provided
ALTER TABLE public.applications ADD CONSTRAINT check_application_source
  CHECK (
    (candidate_id IS NOT NULL AND guest_email IS NULL) OR
    (candidate_id IS NULL AND guest_email IS NOT NULL)
  );

-- Drop existing UNIQUE constraint on (job_id, candidate_id)
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_job_id_candidate_id_key;

-- Create UNIQUE index for authenticated candidates: one application per job per candidate
CREATE UNIQUE INDEX applications_authenticated_unique
  ON public.applications(job_id, candidate_id)
  WHERE candidate_id IS NOT NULL;

-- Create UNIQUE index for guest users: one application per job per email
CREATE UNIQUE INDEX applications_guest_unique
  ON public.applications(job_id, guest_email)
  WHERE guest_email IS NOT NULL;

-- Create index for searching guest applications by email
CREATE INDEX applications_guest_email_idx
  ON public.applications(guest_email)
  WHERE guest_email IS NOT NULL;

-- Note: RLS policies already in place for applications table
-- Employers can see all applications (guest + authenticated) for their jobs
-- Authenticated candidates can see only their own applications
-- Guest applications are visible to employers but not to the guest users (no account)
