-- Agregar columnas de genealogía a la tabla livestock_cows
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas father_id y mother_id si no existen
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS father_id UUID REFERENCES livestock_cows(id) ON DELETE SET NULL;

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS mother_id UUID REFERENCES livestock_cows(id) ON DELETE SET NULL;

-- Agregar comentarios para documentar
COMMENT ON COLUMN livestock_cows.father_id IS 'ID del padre de la vaca. Referencia a otra vaca en la misma tabla.';
COMMENT ON COLUMN livestock_cows.mother_id IS 'ID de la madre de la vaca. Referencia a otra vaca en la misma tabla.';

-- Crear vista para obtener información de genealogía fácilmente
CREATE OR REPLACE VIEW cow_genealogy AS
SELECT 
    c.id,
    c.tag,
    c.name,
    c.breed,
    c.birth_date,
    c.status,
    c.precio,
    c.business_id,
    -- Información del padre
    f.id as father_id,
    f.tag as father_tag,
    f.name as father_name,
    f.breed as father_breed,
    -- Información de la madre
    m.id as mother_id,
    m.tag as mother_tag,
    m.name as mother_name,
    m.breed as mother_breed,
    -- Información de los abuelos paternos
    gf.id as paternal_grandfather_id,
    gf.tag as paternal_grandfather_tag,
    gf.name as paternal_grandfather_name,
    gm.id as paternal_grandmother_id,
    gm.tag as paternal_grandmother_tag,
    gm.name as paternal_grandmother_name,
    -- Información de los abuelos maternos
    mgf.id as maternal_grandfather_id,
    mgf.tag as maternal_grandfather_tag,
    mgf.name as maternal_grandfather_name,
    mgm.id as maternal_grandmother_id,
    mgm.tag as maternal_grandmother_tag,
    mgm.name as maternal_grandmother_name
FROM livestock_cows c
LEFT JOIN livestock_cows f ON c.father_id = f.id
LEFT JOIN livestock_cows m ON c.mother_id = m.id
LEFT JOIN livestock_cows gf ON f.father_id = gf.id  -- Abuelo paterno
LEFT JOIN livestock_cows gm ON f.mother_id = gm.id  -- Abuela paterna
LEFT JOIN livestock_cows mgf ON m.father_id = mgf.id -- Abuelo materno
LEFT JOIN livestock_cows mgm ON m.mother_id = mgm.id; -- Abuela materna

-- Función para obtener todos los descendientes de una vaca
CREATE OR REPLACE FUNCTION get_cow_descendants(cow_id UUID)
RETURNS TABLE(
    id UUID,
    tag VARCHAR,
    name VARCHAR,
    breed VARCHAR,
    birth_date DATE,
    generation INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE descendants AS (
        -- Caso base: la vaca actual
        SELECT c.id, c.tag, c.name, c.breed, c.birth_date, 0 as generation
        FROM livestock_cows c
        WHERE c.id = cow_id
        
        UNION ALL
        
        -- Caso recursivo: hijos
        SELECT c.id, c.tag, c.name, c.breed, c.birth_date, d.generation + 1
        FROM livestock_cows c
        INNER JOIN descendants d ON (c.father_id = d.id OR c.mother_id = d.id)
    )
    SELECT d.id, d.tag, d.name, d.breed, d.birth_date, d.generation
    FROM descendants d
    ORDER BY generation, birth_date;
END;
$$ LANGUAGE plpgsql;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'livestock_cows' AND column_name IN ('father_id', 'mother_id');
