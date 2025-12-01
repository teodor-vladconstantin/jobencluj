-- Add company_logo and company_description to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_logo text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_description text;

-- Add company_logo and company_description to jobs table (denormalized for performance)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_description text;
