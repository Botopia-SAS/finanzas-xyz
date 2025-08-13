-- Sistema de Genealogía usando tabla livestock_birth_events existente
-- Ejecutar en Supabase SQL Editor

-- Verificar estructura de la tabla livestock_birth_events
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'livestock_birth_events' 
ORDER BY ordinal_position;

-- Función para obtener padres de una vaca
CREATE OR REPLACE FUNCTION get_cow_parents(cow_id_param UUID)
RETURNS TABLE(
    father_id UUID,
    father_name VARCHAR,
    father_tag VARCHAR,
    mother_id UUID,
    mother_name VARCHAR,
    mother_tag VARCHAR,
    birth_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sire.id as father_id,
        sire.name as father_name,
        sire.tag as father_tag,
        dam.id as mother_id,
        dam.name as mother_name,
        dam.tag as mother_tag,
        be.birth_date
    FROM livestock_birth_events be
    LEFT JOIN livestock_cows sire ON be.sire_id = sire.id
    LEFT JOIN livestock_cows dam ON be.dam_id = dam.id
    WHERE be.calf_id = cow_id_param;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener hijos de una vaca
CREATE OR REPLACE FUNCTION get_cow_children(cow_id_param UUID)
RETURNS TABLE(
    child_id UUID,
    child_name VARCHAR,
    child_tag VARCHAR,
    birth_date DATE,
    other_parent_id UUID,
    other_parent_name VARCHAR,
    other_parent_tag VARCHAR,
    parent_type VARCHAR -- 'father' o 'mother'
) AS $$
BEGIN
    -- Hijos donde esta vaca es la madre
    RETURN QUERY
    SELECT 
        calf.id as child_id,
        calf.name as child_name,
        calf.tag as child_tag,
        be.birth_date,
        sire.id as other_parent_id,
        sire.name as other_parent_name,
        sire.tag as other_parent_tag,
        'mother'::VARCHAR as parent_type
    FROM livestock_birth_events be
    LEFT JOIN livestock_cows calf ON be.calf_id = calf.id
    LEFT JOIN livestock_cows sire ON be.sire_id = sire.id
    WHERE be.dam_id = cow_id_param
    
    UNION ALL
    
    -- Hijos donde esta vaca es el padre
    SELECT 
        calf.id as child_id,
        calf.name as child_name,
        calf.tag as child_tag,
        be.birth_date,
        dam.id as other_parent_id,
        dam.name as other_parent_name,
        dam.tag as other_parent_tag,
        'father'::VARCHAR as parent_type
    FROM livestock_birth_events be
    LEFT JOIN livestock_cows calf ON be.calf_id = calf.id
    LEFT JOIN livestock_cows dam ON be.dam_id = dam.id
    WHERE be.sire_id = cow_id_param;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener árbol genealógico completo
CREATE OR REPLACE FUNCTION get_genealogy_tree(cow_id_param UUID, generations INT DEFAULT 3)
RETURNS TABLE(
    cow_id UUID,
    name VARCHAR,
    tag VARCHAR,
    generation INT,
    relationship VARCHAR,
    parent_id UUID
) AS $$
BEGIN
    -- Esta función se puede expandir para múltiples generaciones
    -- Por ahora retorna padres y abuelos
    RETURN QUERY
    WITH RECURSIVE genealogy AS (
        -- Vaca base
        SELECT 
            c.id as cow_id,
            c.name,
            c.tag,
            0 as generation,
            'self'::VARCHAR as relationship,
            NULL::UUID as parent_id
        FROM livestock_cows c
        WHERE c.id = cow_id_param
        
        UNION ALL
        
        -- Padres
        SELECT 
            COALESCE(sire.id, dam.id) as cow_id,
            COALESCE(sire.name, dam.name) as name,
            COALESCE(sire.tag, dam.tag) as tag,
            g.generation + 1 as generation,
            CASE 
                WHEN sire.id IS NOT NULL THEN 'father'
                WHEN dam.id IS NOT NULL THEN 'mother'
            END as relationship,
            g.cow_id as parent_id
        FROM genealogy g
        LEFT JOIN livestock_birth_events be ON be.calf_id = g.cow_id
        LEFT JOIN livestock_cows sire ON be.sire_id = sire.id
        LEFT JOIN livestock_cows dam ON be.dam_id = dam.id
        WHERE g.generation < generations
        AND (sire.id IS NOT NULL OR dam.id IS NOT NULL)
    )
    SELECT * FROM genealogy;
END;
$$ LANGUAGE plpgsql;
