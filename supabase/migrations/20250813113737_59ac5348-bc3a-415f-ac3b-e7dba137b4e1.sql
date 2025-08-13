-- Add missing is_primary column to phone_numbers table
ALTER TABLE public.phone_numbers 
ADD COLUMN is_primary boolean DEFAULT false;

-- Update the first phone number for each user to be primary if none exists
UPDATE public.phone_numbers 
SET is_primary = true 
WHERE id IN (
  SELECT DISTINCT ON (user_id) id 
  FROM public.phone_numbers 
  ORDER BY user_id, created_at ASC
);