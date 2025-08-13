-- Agregar columna precio a la tabla livestock_cows
-- Ejecutar en Supabase SQL Editor

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) NULL;

-- Agregar comentario a la columna para documentar su propósito
COMMENT ON COLUMN livestock_cows.precio IS 'Precio de compra de la vaca. Si se especifica, se registra automáticamente como gasto en movimientos.';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'livestock_cows' AND column_name = 'precio';
