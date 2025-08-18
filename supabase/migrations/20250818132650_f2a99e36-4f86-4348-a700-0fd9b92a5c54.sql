-- Update the incorrect phone number record with the correct information
UPDATE phone_numbers 
SET 
  phone_number = '+37379315040',
  elevenlabs_phone_id = 'phnum_9501k2y60kzjfr98sybbze66vy2x',
  updated_at = now()
WHERE elevenlabs_phone_id = 'phnum_01jz5v97bgfmdsvyy3hb095k3c';