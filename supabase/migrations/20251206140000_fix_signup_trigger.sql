-- ============================================
-- FIX SIGNUP TRIGGER
-- ============================================
-- Make the handle_new_user function more robust
-- Note: Can't modify trigger on auth.users directly, only the function

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role public.user_role;
BEGIN
  -- Get role from metadata, default to 'candidate' if not set
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'candidate');
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    NEW.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role,
    company_name = COALESCE(EXCLUDED.company_name, profiles.company_name);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    -- Return NEW to allow signup to continue
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile automatically when a user signs up (with robust error handling)';
