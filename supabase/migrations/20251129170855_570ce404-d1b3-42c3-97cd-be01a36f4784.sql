-- Create enum types
CREATE TYPE public.user_role AS ENUM ('candidate', 'employer');
CREATE TYPE public.job_type AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE public.seniority_level AS ENUM ('junior', 'mid', 'senior', 'lead');
CREATE TYPE public.job_status AS ENUM ('active', 'paused', 'closed');
CREATE TYPE public.application_status AS ENUM ('submitted', 'viewed', 'rejected', 'interview');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  cv_url TEXT,
  company_name TEXT,
  company_website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 10),
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type public.job_type NOT NULL,
  seniority public.seniority_level NOT NULL,
  salary_min INTEGER CHECK (salary_min >= 0),
  salary_max INTEGER CHECK (salary_max >= salary_min),
  salary_public BOOLEAN DEFAULT FALSE,
  tech_stack TEXT[] DEFAULT '{}',
  description TEXT NOT NULL CHECK (char_length(description) >= 50),
  requirements TEXT NOT NULL,
  status public.job_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days') NOT NULL
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cv_url TEXT NOT NULL,
  cover_letter TEXT CHECK (char_length(cover_letter) <= 300),
  status public.application_status DEFAULT 'submitted' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  viewed_at TIMESTAMPTZ,
  UNIQUE(job_id, candidate_id)
);

-- Create saved_jobs table
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, job_id)
);

-- Create indexes for performance
CREATE INDEX idx_jobs_employer ON public.jobs(employer_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_seniority ON public.jobs(seniority);

CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX idx_applications_status ON public.applications(status);

CREATE INDEX idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job ON public.saved_jobs(job_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for jobs
CREATE POLICY "Active jobs are viewable by everyone" 
  ON public.jobs FOR SELECT 
  USING (status = 'active' OR employer_id = auth.uid());

CREATE POLICY "Employers can insert jobs" 
  ON public.jobs FOR INSERT 
  WITH CHECK (
    auth.uid() = employer_id AND 
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
  );

CREATE POLICY "Employers can update their own jobs" 
  ON public.jobs FOR UPDATE 
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs" 
  ON public.jobs FOR DELETE 
  USING (auth.uid() = employer_id);

-- RLS Policies for applications
CREATE POLICY "Users can view their own applications" 
  ON public.applications FOR SELECT 
  USING (
    auth.uid() = candidate_id OR 
    EXISTS(SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid())
  );

CREATE POLICY "Candidates can insert applications" 
  ON public.applications FOR INSERT 
  WITH CHECK (
    auth.uid() = candidate_id AND 
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'candidate')
  );

CREATE POLICY "Employers can update application status" 
  ON public.applications FOR UPDATE 
  USING (
    EXISTS(SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid())
  );

-- RLS Policies for saved_jobs
CREATE POLICY "Users can view their own saved jobs" 
  ON public.saved_jobs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved jobs" 
  ON public.saved_jobs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jobs" 
  ON public.saved_jobs FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'role')::public.user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for CVs
CREATE POLICY "Users can upload their own CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own CVs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Employers can view CVs from applications"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs' AND
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE j.employer_id = auth.uid()
      AND a.cv_url LIKE '%' || name || '%'
    )
  );