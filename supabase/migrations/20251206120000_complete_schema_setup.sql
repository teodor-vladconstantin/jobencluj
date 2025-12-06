-- ============================================
-- COMPLETE DATABASE SCHEMA SETUP
-- Platform: Joben.eu - Job Navigator
-- Date: 2025-12-06
-- Description: Complete schema for job posting platform with candidate and employer support
-- ============================================

-- ============================================
-- PART 2: CREATE ENUMS
-- ============================================

-- User role: candidate (looking for jobs) or employer (posting jobs)
CREATE TYPE public.user_role AS ENUM ('candidate', 'employer');

-- Job type: how the work is performed
CREATE TYPE public.job_type AS ENUM ('remote', 'hybrid', 'onsite');

-- Seniority level for job positions
CREATE TYPE public.seniority_level AS ENUM ('junior', 'mid', 'senior', 'lead');

-- Job status: active (visible), paused (hidden), closed (finished)
CREATE TYPE public.job_status AS ENUM ('active', 'paused', 'closed');

-- Application status tracking
CREATE TYPE public.application_status AS ENUM ('submitted', 'viewed', 'rejected', 'interview');

-- ============================================
-- PART 3: CREATE TABLES
-- ============================================

-- ============================================
-- PROFILES TABLE
-- Stores user information for both candidates and employers
-- Linked to auth.users via trigger
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  cv_url TEXT, -- For candidates
  company_name TEXT, -- For employers
  company_website TEXT, -- For employers
  company_logo TEXT, -- Path to logo in storage
  company_description TEXT, -- For employers
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profiles for both candidates and employers';
COMMENT ON COLUMN public.profiles.role IS 'Determines if user is a job seeker (candidate) or job poster (employer)';
COMMENT ON COLUMN public.profiles.cv_url IS 'Storage path for candidate CV (only for candidates)';
COMMENT ON COLUMN public.profiles.company_logo IS 'Storage path for company logo (only for employers)';

-- ============================================
-- JOBS TABLE
-- Job postings created by employers
-- ============================================
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 10 AND char_length(title) <= 200),
  company_name TEXT NOT NULL,
  company_logo TEXT, -- Copied from profile for denormalization
  company_description TEXT, -- Copied from profile for denormalization
  location TEXT NOT NULL,
  job_type public.job_type NOT NULL,
  seniority public.seniority_level NOT NULL,
  salary_min INTEGER CHECK (salary_min >= 0),
  salary_max INTEGER CHECK (salary_max >= salary_min),
  salary_public BOOLEAN DEFAULT FALSE,
  description TEXT NOT NULL CHECK (char_length(description) >= 50),
  requirements TEXT NOT NULL CHECK (char_length(requirements) >= 20),
  tech_stack TEXT[], -- Array of technologies
  status public.job_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days') NOT NULL
);

COMMENT ON TABLE public.jobs IS 'Job postings created by employers';
COMMENT ON COLUMN public.jobs.salary_public IS 'Whether salary range should be visible to candidates';
COMMENT ON COLUMN public.jobs.tech_stack IS 'Array of required technologies/skills';
COMMENT ON COLUMN public.jobs.expires_at IS 'When the job posting automatically closes';

-- ============================================
-- APPLICATIONS TABLE
-- Job applications from candidates (both authenticated and guest)
-- ============================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  
  -- Authenticated candidate fields
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Guest candidate fields
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  guest_linkedin_url TEXT,
  
  -- Common fields
  cv_url TEXT NOT NULL, -- Storage path to uploaded CV
  cover_letter TEXT CHECK (cover_letter IS NULL OR char_length(cover_letter) <= 1000),
  status public.application_status DEFAULT 'submitted' NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  viewed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  interview_at TIMESTAMPTZ,
  
  -- Constraint: either authenticated OR guest, not both
  CONSTRAINT check_application_source CHECK (
    (candidate_id IS NOT NULL AND guest_email IS NULL) OR
    (candidate_id IS NULL AND guest_email IS NOT NULL)
  ),
  
  -- Constraint: guest applications must have name and email
  CONSTRAINT check_guest_required_fields CHECK (
    (guest_email IS NULL) OR 
    (guest_email IS NOT NULL AND guest_name IS NOT NULL)
  )
);

COMMENT ON TABLE public.applications IS 'Job applications from both authenticated users and guests';
COMMENT ON COLUMN public.applications.candidate_id IS 'Reference to authenticated user (NULL for guest applications)';
COMMENT ON COLUMN public.applications.guest_email IS 'Email for guest applications (NULL for authenticated)';

-- ============================================
-- SAVED_JOBS TABLE
-- Candidates can save jobs for later (bookmarks)
-- ============================================
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Each user can save a job only once
  UNIQUE(user_id, job_id)
);

COMMENT ON TABLE public.saved_jobs IS 'Bookmarked jobs for authenticated candidates';

-- ============================================
-- PART 4: CREATE INDEXES
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Jobs indexes - optimized for search and filtering
CREATE INDEX idx_jobs_employer ON public.jobs(employer_id);
CREATE INDEX idx_jobs_status_created ON public.jobs(status, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_seniority ON public.jobs(seniority);
CREATE INDEX idx_jobs_expires ON public.jobs(expires_at) WHERE status = 'active';

-- Applications indexes
CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_candidate ON public.applications(candidate_id) WHERE candidate_id IS NOT NULL;
CREATE INDEX idx_applications_guest_email ON public.applications(guest_email) WHERE guest_email IS NOT NULL;
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created ON public.applications(created_at DESC);

-- Saved jobs indexes
CREATE INDEX idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job ON public.saved_jobs(job_id);

-- Unique constraints to prevent duplicate applications
CREATE UNIQUE INDEX applications_authenticated_unique 
  ON public.applications(job_id, candidate_id) 
  WHERE candidate_id IS NOT NULL;

CREATE UNIQUE INDEX applications_guest_unique 
  ON public.applications(job_id, guest_email) 
  WHERE guest_email IS NOT NULL;

-- ============================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: RLS POLICIES - PROFILES
-- ============================================

-- Anyone can view profiles (needed for employer info on job listings)
CREATE POLICY "profiles_select_all" 
  ON public.profiles 
  FOR SELECT 
  TO public 
  USING (true);

-- Authenticated users can insert their own profile (created by trigger)
CREATE POLICY "profiles_insert_own" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);

-- ============================================
-- PART 7: RLS POLICIES - JOBS
-- ============================================

-- Everyone can view active jobs; employers can view their own jobs regardless of status
CREATE POLICY "jobs_select_active" 
  ON public.jobs 
  FOR SELECT 
  TO public 
  USING (
    status = 'active' OR 
    (auth.uid() IS NOT NULL AND employer_id = auth.uid())
  );

-- Only employers can insert jobs
CREATE POLICY "jobs_insert_employer" 
  ON public.jobs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = employer_id AND 
    EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

-- Employers can update their own jobs
CREATE POLICY "jobs_update_own" 
  ON public.jobs 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = employer_id);

-- Employers can delete their own jobs
CREATE POLICY "jobs_delete_own" 
  ON public.jobs 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = employer_id);

-- ============================================
-- PART 8: RLS POLICIES - APPLICATIONS
-- ============================================

-- Anyone can insert applications (authenticated users AND guests)
CREATE POLICY "applications_insert_all" 
  ON public.applications 
  FOR INSERT 
  TO public 
  WITH CHECK (
    -- Authenticated candidate
    (auth.uid() IS NOT NULL AND candidate_id = auth.uid() AND guest_email IS NULL) OR
    -- Guest candidate
    (auth.uid() IS NULL AND candidate_id IS NULL AND guest_email IS NOT NULL)
  );

-- Candidates can view their own applications; employers can view applications for their jobs
CREATE POLICY "applications_select_own" 
  ON public.applications 
  FOR SELECT 
  TO public 
  USING (
    -- Authenticated candidate viewing their own
    (auth.uid() IS NOT NULL AND candidate_id = auth.uid()) OR
    -- Employer viewing applications for their jobs
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = applications.job_id 
        AND jobs.employer_id = auth.uid()
    ))
  );

-- Only employers can update applications (to change status)
CREATE POLICY "applications_update_employer" 
  ON public.applications 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = applications.job_id 
        AND jobs.employer_id = auth.uid()
    )
  );

-- ============================================
-- PART 9: RLS POLICIES - SAVED JOBS
-- ============================================

-- Users can only view their own saved jobs
CREATE POLICY "saved_jobs_select_own" 
  ON public.saved_jobs 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Users can only save jobs for themselves
CREATE POLICY "saved_jobs_insert_own" 
  ON public.saved_jobs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved jobs
CREATE POLICY "saved_jobs_delete_own" 
  ON public.saved_jobs 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- ============================================
-- PART 10: FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at column';

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: % %', NEW.id, SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile automatically when a user signs up';

-- Function to update application status timestamps
CREATE OR REPLACE FUNCTION public.update_application_status_timestamps()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set viewed_at when status changes to viewed
  IF NEW.status = 'viewed' AND (OLD.status IS NULL OR OLD.status != 'viewed') THEN
    NEW.viewed_at = NOW();
  END IF;
  
  -- Set rejected_at when status changes to rejected
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    NEW.rejected_at = NOW();
  END IF;
  
  -- Set interview_at when status changes to interview
  IF NEW.status = 'interview' AND (OLD.status IS NULL OR OLD.status != 'interview') THEN
    NEW.interview_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_application_status_timestamps() IS 'Automatically sets timestamp fields when application status changes';

-- ============================================
-- PART 11: TRIGGERS
-- ============================================

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update profiles.updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update jobs.updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update application status timestamps
CREATE TRIGGER update_application_status_timestamps_trigger
  BEFORE UPDATE OF status ON public.applications
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_application_status_timestamps();

-- ============================================
-- SETUP COMPLETE - Database schema created successfully!
-- ============================================
-- 
-- Next steps:
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Create two buckets manually:
--    - Bucket name: cvs (Private, 5MB limit, PDF/DOC/DOCX)
--    - Bucket name: logos (Public, 2MB limit, Images)
-- 3. Configure storage policies in the Storage > Policies section
-- 
-- ============================================
