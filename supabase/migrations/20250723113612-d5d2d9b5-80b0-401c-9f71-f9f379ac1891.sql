-- Create storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-documents', 'medical-documents', false);

-- Create storage policies for medical documents
CREATE POLICY "Users can upload their own medical documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'medical-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctors can view patient medical documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-documents' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'doctor'
  )
);

CREATE POLICY "Admins can view all medical documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-documents' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create patient-doctor relationships table
CREATE TABLE public.patient_doctor_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

-- Enable RLS for patient-doctor relationships
ALTER TABLE public.patient_doctor_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for patient-doctor relationships
CREATE POLICY "Patients can view their doctor relationships"
ON public.patient_doctor_relationships
FOR SELECT
USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their patient relationships"
ON public.patient_doctor_relationships
FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create patient relationships"
ON public.patient_doctor_relationships
FOR INSERT
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Admins can manage all relationships"
ON public.patient_doctor_relationships
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create system settings table for app configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for system settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for system settings (admin only)
CREATE POLICY "Only admins can manage system settings"
ON public.system_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create chat/messages table for patient-doctor communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages"
ON public.messages
FOR UPDATE
USING (receiver_id = auth.uid());

-- Add triggers for updated_at columns
CREATE TRIGGER update_patient_doctor_relationships_updated_at
BEFORE UPDATE ON public.patient_doctor_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime for new tables
ALTER TABLE public.patient_doctor_relationships REPLICA IDENTITY FULL;
ALTER TABLE public.system_settings REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_doctor_relationships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create appointment booking function
CREATE OR REPLACE FUNCTION public.book_appointment(
  slot_id UUID,
  patient_id UUID,
  appointment_type TEXT DEFAULT 'consultation',
  reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to get available doctors for patients
CREATE OR REPLACE FUNCTION public.get_available_doctors()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  specialization TEXT,
  available_slots_count BIGINT
)
LANGUAGE sql
STABLE
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