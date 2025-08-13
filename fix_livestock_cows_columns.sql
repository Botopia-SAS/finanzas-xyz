-- Agregar columnas faltantes a la tabla livestock_cows
-- Ejecutar en Supabase SQL Editor

-- Agregar columna acquisition_type
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS acquisition_type VARCHAR(50) DEFAULT 'purchase';

-- Agregar columna purchase_price si no existe
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);

-- Agregar columna seller_name si no existe
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255);

-- Agregar columna father_id si no existe
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS father_id UUID;

-- Agregar columna mother_id si no existe
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS mother_id UUID;

-- Agregar columna notes si no existe
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Agregar columna acquisition_date si no existe
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS acquisition_date DATE DEFAULT CURRENT_DATE;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'livestock_cows' 
ORDER BY ordinal_position;
