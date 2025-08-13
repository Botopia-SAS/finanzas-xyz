# Sistema de Precio de Ganado con Registro Automático de Gastos

## Implementación Completa

### 1. **Modificación de Base de Datos**

#### Archivo: `add_precio_column.sql`
```sql
-- Agregar columna precio a la tabla livestock_cows
ALTER TABLE livestock_cows 
ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) NULL;
```

**Características:**
- ✅ **Nullable**: Puede ser NULL (no obligatorio)
- ✅ **Decimal**: Precisión de 10 dígitos, 2 decimales
- ✅ **Opcional**: Solo se completa si se conoce el precio

### 2. **Componente AddCowModal Actualizado**

#### Nuevas Funcionalidades:
- **Campo precio opcional** en el formulario
- **Registro automático** de gasto cuando se especifica precio
- **Validación** para solo números positivos
- **Información clara** sobre el comportamiento automático

#### Flujo de Trabajo:
1. **Usuario llena formulario** con datos básicos de la vaca
2. **Opcionalmente** especifica precio de compra
3. **Sistema guarda la vaca** en `livestock_cows`
4. **Si hay precio**, crea automáticamente movimiento de gasto:
   - Tipo: `'gasto'`
   - Monto: `-precio` (negativo)
   - Descripción: `"Compra de ganado - [Nombre] ([Etiqueta])"`
   - Asociado a la vertical actual

### 3. **Tabla de Vacas Actualizada**

#### Nueva Columna:
- **Precio**: Muestra el precio de compra si está disponible
- **Formato**: `$1.000.000` (formato colombiano)
- **Placeholder**: `-` si no hay precio

### 4. **Integración con Sistema de Movimientos**

#### Movimiento Automático:
```typescript
const movementData = {
  type: 'gasto',
  amount: -Math.abs(parseFloat(precio)),
  description: `Compra de ganado - ${nombre} (${etiqueta})`,
  date: new Date().toISOString().split('T')[0],
  business_id: businessId,
  vertical_id: verticalId,
  entity: 'Compra de Ganado'
};
```

### 5. **Manejo de Errores**

#### Estrategia Robusta:
- **Vaca se guarda siempre** (prioritario)
- **Movimiento opcional** (no falla si hay error)
- **Logging detallado** para debugging
- **Advertencias** si el movimiento falla

## Beneficios del Sistema

### ✅ **Flexibilidad**
- Precio opcional, no obligatorio
- Funciona con o sin precio
- No afecta vacas existentes

### ✅ **Automatización**
- Registro automático de gastos
- Consistencia en descripciones
- Asociación correcta a vertical

### ✅ **Transparencia**
- Usuario sabe qué sucederá
- Información clara en UI
- Logging para debugging

### ✅ **Integridad**
- Transacciones seguras
- Manejo de errores
- Datos consistentes

## Instrucciones de Uso

### Para Desarrollador:
1. **Ejecutar SQL**: `add_precio_column.sql` en Supabase
2. **Verificar cambios**: Los componentes ya están actualizados
3. **Probar funcionalidad**: Agregar vaca con y sin precio

### Para Usuario:
1. **Agregar vaca**: Usar formulario normal
2. **Especificar precio** (opcional): Campo "Precio de Compra"
3. **Guardar**: Sistema registra vaca y gasto automáticamente
4. **Verificar**: Revisar tabla de vacas y movimientos

## Ejemplo de Flujo

### Sin Precio:
```
1. Usuario: Agrega vaca "Bella" sin precio
2. Sistema: Guarda vaca en BD
3. Resultado: Solo vaca registrada
```

### Con Precio:
```
1. Usuario: Agrega vaca "Bella" con precio $2.000.000
2. Sistema: Guarda vaca con precio en BD
3. Sistema: Crea movimiento de gasto por $2.000.000
4. Resultado: Vaca + movimiento registrados
```

## Verificación

### Consultas para Verificar:
```sql
-- Ver vacas con precio
SELECT tag, name, precio 
FROM livestock_cows 
WHERE precio IS NOT NULL;

-- Ver movimientos de compra de ganado
SELECT * FROM movements 
WHERE description LIKE 'Compra de ganado%';
```
