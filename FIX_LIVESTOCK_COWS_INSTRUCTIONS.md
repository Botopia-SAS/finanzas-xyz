# Solución al Error de Columnas Faltantes en livestock_cows

## Problema
El error indica que la columna `acquisition_type` no existe en la tabla `livestock_cows`:
```
Could not find the 'acquisition_type' column of 'livestock_cows' in the schema cache
```

## Solución 1: Ejecutar Script SQL (Recomendado)

### Archivo: `fix_livestock_cows_columns.sql`
Ejecuta este script en **Supabase SQL Editor** para agregar las columnas faltantes:

```sql
-- Agregar columnas faltantes a la tabla livestock_cows
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS acquisition_type VARCHAR(50) DEFAULT 'purchase';

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255);

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS father_id UUID;

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS mother_id UUID;

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS acquisition_date DATE DEFAULT CURRENT_DATE;
```

### Después de ejecutar el script:
1. Vuelve a `AddCowModal.tsx`
2. Restaura el formulario completo con todos los campos
3. El formulario funcionará con todas las características

## Solución 2: Usar Versión Simplificada (Temporal)

### Estado Actual
He simplificado el componente `AddCowModal.tsx` para que solo use los campos básicos:
- ✅ `tag` (etiqueta)
- ✅ `name` (nombre)
- ✅ `breed` (raza)
- ✅ `birth_date` (fecha de nacimiento)
- ✅ `status` (estado)
- ✅ `business_id` (ID del negocio)

### Campos Deshabilitados Temporalmente:
- ❌ `acquisition_type` (tipo de adquisición)
- ❌ `purchase_price` (precio de compra)
- ❌ `seller_name` (vendedor)
- ❌ `father_id` (padre)
- ❌ `mother_id` (madre)
- ❌ `notes` (notas)
- ❌ `acquisition_date` (fecha de adquisición)

## Recomendación

**Ejecuta el script SQL** para tener la funcionalidad completa. Después podemos restaurar el formulario completo.

## Pasos para Solución Completa:

1. **Ejecutar SQL:**
   ```bash
   # Copia el contenido de fix_livestock_cows_columns.sql
   # Pégalo en Supabase SQL Editor
   # Ejecuta el script
   ```

2. **Verificar columnas:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'livestock_cows';
   ```

3. **Confirmar éxito:**
   - El formulario funcionará con todos los campos
   - Podrás agregar vacas con información completa
   - Tendrás genealogía, precios y notas

¿Prefieres ejecutar el script SQL o usar la versión simplificada por ahora?
