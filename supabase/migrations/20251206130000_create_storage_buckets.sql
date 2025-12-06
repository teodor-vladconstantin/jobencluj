-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================
-- This migration creates the storage buckets needed for the application
-- Run this AFTER the main schema migration (20251206120000_complete_schema_setup.sql)

-- ============================================
-- PART 1: CREATE BUCKETS
-- ============================================

-- Create CVs bucket (private - only authenticated users can upload/view their own CVs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create logos bucket (public - company logos should be publicly accessible)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 2: CVS BUCKET POLICIES
-- ============================================

-- Allow authenticated users to upload their own CVs
CREATE POLICY "Users can upload their own CVs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own CVs
CREATE POLICY "Users can view their own CVs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow employers to view CVs from applications to their jobs
CREATE POLICY "Employers can view CVs from applications"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  EXISTS (
    SELECT 1
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = auth.uid()
    AND a.cv_url LIKE '%' || name || '%'
  )
);

-- Allow users to update their own CVs
CREATE POLICY "Users can update their own CVs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own CVs
CREATE POLICY "Users can delete their own CVs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- PART 3: LOGOS BUCKET POLICIES
-- ============================================

-- Allow public read access to logos (since bucket is public)
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Allow employers to upload logos for their company
CREATE POLICY "Employers can upload company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'employer'
  )
);

-- Allow employers to update their company logos
CREATE POLICY "Employers can update company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'employer'
  )
)
WITH CHECK (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'employer'
  )
);

-- Allow employers to delete their company logos
CREATE POLICY "Employers can delete company logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'employer'
  )
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify buckets were created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'cvs') THEN
    RAISE EXCEPTION 'CVs bucket was not created successfully';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'logos') THEN
    RAISE EXCEPTION 'Logos bucket was not created successfully';
  END IF;
  
  RAISE NOTICE '✅ Storage buckets created successfully!';
  RAISE NOTICE '   - cvs bucket: private, 5MB limit, PDF/DOC/DOCX only';
  RAISE NOTICE '   - logos bucket: public, 2MB limit, images only';
END $$;
