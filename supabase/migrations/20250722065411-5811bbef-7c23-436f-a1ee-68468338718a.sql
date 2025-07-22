-- Update the handle_new_user function to handle additional profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role, 
        phone, 
        date_of_birth, 
        address, 
        emergency_contact, 
        medical_license, 
        specialization
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'),
        NEW.raw_user_meta_data->>'phone',
        CASE 
            WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
            ELSE NULL 
        END,
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'emergency_contact',
        NEW.raw_user_meta_data->>'medical_license',
        NEW.raw_user_meta_data->>'specialization'
    );
    RETURN NEW;
END;
$$;