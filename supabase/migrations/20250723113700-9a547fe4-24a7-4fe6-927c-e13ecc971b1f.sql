-- Fix search path for security functions
CREATE OR REPLACE FUNCTION public.book_appointment(
  slot_id UUID,
  patient_id UUID,
  appointment_type TEXT DEFAULT 'consultation',
  reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  appointment_id UUID;
  slot_record RECORD;
BEGIN
  -- Get the available slot details
  SELECT * INTO slot_record
  FROM public.available_slots
  WHERE id = slot_id AND is_available = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not available or does not exist';
  END IF;
  
  -- Create the appointment
  INSERT INTO public.appointments (
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    type,
    status,
    reason,
    duration
  ) VALUES (
    patient_id,
    slot_record.doctor_id,
    slot_record.date,
    slot_record.start_time,
    appointment_type::appointment_type,
    'pending'::appointment_status,
    reason,
    EXTRACT(EPOCH FROM (slot_record.end_time::time - slot_record.start_time::time))/60
  ) RETURNING id INTO appointment_id;
  
  -- Mark the slot as unavailable
  UPDATE public.available_slots
  SET is_available = false
  WHERE id = slot_id;
  
  RETURN appointment_id;
END;
$$;

-- Fix search path for get_available_doctors function
CREATE OR REPLACE FUNCTION public.get_available_doctors()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  specialization TEXT,
  available_slots_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.specialization,
    COUNT(a.id) as available_slots_count
  FROM profiles p
  LEFT JOIN available_slots a ON p.id = a.doctor_id 
    AND a.is_available = true 
    AND a.date >= CURRENT_DATE
  WHERE p.role = 'doctor'
  GROUP BY p.id, p.full_name, p.specialization
  ORDER BY available_slots_count DESC, p.full_name;
$$;