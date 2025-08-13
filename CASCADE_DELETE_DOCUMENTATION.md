# Sistema de Borrado en Cascada para Verticals

## Implementación Completa

### 1. **Archivos SQL para Configuración de Base de Datos**

#### `cascade_delete_setup.sql`
- Configura las restricciones de foreign key con `ON DELETE CASCADE`
- Asegura que cuando se elimine un business, se eliminen automáticamente:
  - Vacas (`livestock_cows`)
  - Registros de leche (`livestock_milk_records`)
  - Movimientos (`movements`)
  - Verticals (`verticals`)

#### `delete_vertical_function.sql`
- Función de PostgreSQL para borrado manual en cascada
- Elimina en orden correcto:
  1. Registros de leche
  2. Movimientos
  3. Vacas
  4. Vertical

### 2. **Componente de Confirmación Mejorado**

#### `DeleteVerticalModal.tsx`
**Características:**
- Muestra el conteo exacto de registros que se eliminarán
- Confirma la acción con checkbox obligatorio
- Interfaz clara con íconos y colores de advertencia
- Información detallada sobre:
  - Número de vacas
  - Número de registros de ordeño
  - Número de movimientos financieros

### 3. **Hook Actualizado**

#### `useVerticals.ts`
**Mejoras implementadas:**
- Intenta usar función de base de datos primero
- Fallback a borrado manual si la función no existe
- Orden correcto de eliminación:
  1. Obtiene información de la vertical
  2. Encuentra todas las vacas del business
  3. Elimina registros de leche de esas vacas
  4. Elimina movimientos de la vertical
  5. Elimina todas las vacas del business
  6. Elimina la vertical
- Manejo de errores robusto
- Logging detallado para debugging

### 4. **Proceso de Eliminación**

#### Flujo Completo:
1. **Usuario hace clic en eliminar** → Se abre modal de confirmación
2. **Modal calcula datos relacionados** → Muestra conteos exactos
3. **Usuario confirma con checkbox** → Habilita botón de eliminación
4. **Sistema ejecuta borrado en cascada:**
   - Opción A: Función SQL (automática)
   - Opción B: Borrado manual paso a paso
5. **Confirmación visual** → Logs en consola y actualización de UI

## Datos que se Eliminan

### Por Vertical de Ganadería:
- ✅ **Vacas**: Todas las vacas del business
- ✅ **Registros de Ordeño**: Todos los registros de leche
- ✅ **Movimientos**: Ingresos, gastos, ventas de leche
- ✅ **Configuración**: Precio de leche, configuraciones de vertical

### Seguridad:
- ❌ **No se puede deshacer**
- ✅ **Confirmación obligatoria**
- ✅ **Conteo previo de registros**
- ✅ **Advertencias claras**

## Instrucciones de Uso

### Para Ejecutar las Configuraciones:
1. Ejecuta `cascade_delete_setup.sql` en Supabase SQL Editor
2. Ejecuta `delete_vertical_function.sql` en Supabase SQL Editor
3. Los componentes ya están integrados en el sistema

### Para Eliminar una Vertical:
1. Ir a la lista de verticals
2. Hacer clic en el ícono de basura
3. Revisar la información de datos relacionados
4. Marcar el checkbox de confirmación
5. Hacer clic en "Eliminar Definitivamente"

## Beneficios

### ✅ **Seguridad**
- Confirmación obligatoria
- Información previa de impacto
- No se puede deshacer accidentalmente

### ✅ **Completitud**
- Elimina todos los datos relacionados
- No deja registros huérfanos
- Mantiene integridad de base de datos

### ✅ **Transparencia**
- Muestra exactamente qué se va a eliminar
- Conteos en tiempo real
- Logging detallado para debugging

### ✅ **Robustez**
- Manejo de errores
- Fallback automático
- Funciona con o sin función SQL
