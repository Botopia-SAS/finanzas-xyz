# 🔧 Solución al Error de Lechería

## 🚨 Error Actual
```
Error: Error fetching dairy stats: {}
```

## 🔍 Causa del Error
El error ocurre porque las tablas `livestock.cows` y `livestock.milk_records` no existen en la base de datos de Supabase.

## 🛠️ Solución Paso a Paso

### 1. **Crear las Tablas en Supabase**

1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido del archivo `dairy/setup.sql`
4. Verifica que las tablas se crearon correctamente

### 2. **Actualizar el Business ID**

En el archivo `setup.sql`, cambia este valor:
```sql
-- Cambiar este UUID por el ID real de tu negocio
'00000000-0000-0000-0000-000000000001'
```

### 3. **Verificar la Conexión**

1. Ve a la tabla `livestock.cows` en Supabase
2. Confirma que tienes datos de ejemplo
3. Verifica que las políticas de RLS estén activas

### 4. **Verificar en la Aplicación**

1. Recarga la página de Lechería
2. Deberías ver las estadísticas con datos
3. Las tablas deberían mostrar información

## 📊 Estructura de Tablas Creadas

### `livestock.cows`
- Información básica de las vacas
- Estados: active, pregnant, dry, sick
- Relaciones de parentesco

### `livestock.milk_records`
- Registros de ordeño diarios
- Cantidad en litros
- Calidad de la leche

### `livestock.weight_records`
- Registros de peso
- Para seguimiento de crecimiento

### `livestock.embryo_events`
- Eventos de transferencia de embriones
- Seguimiento de éxito/fracaso

### `livestock.birth_events`
- Registro de nacimientos
- Información del ternero

## 🔐 Seguridad

- **RLS habilitado** en todas las tablas
- **Políticas básicas** para usuarios autenticados
- **Índices** para mejorar el rendimiento

## 🧪 Datos de Ejemplo

El script incluye:
- 3 vacas de ejemplo
- 2 registros de ordeño
- Diferentes razas y estados

## 📝 Notas Importantes

1. **Backup**: Siempre haz backup antes de ejecutar scripts
2. **Permisos**: Asegúrate de tener permisos de administrador
3. **Testing**: Prueba en un entorno de desarrollo primero
4. **Logs**: Revisa los logs de Supabase para errores

## 🆘 Si Aún Tienes Problemas

1. **Revisa los logs** del navegador (F12 > Console)
2. **Verifica la conexión** a Supabase
3. **Confirma los UUIDs** del negocio y vertical
4. **Revisa las políticas** de RLS

---

**Próximo paso**: Una vez resuelto este error, podrás usar completamente la funcionalidad de Lechería y continuar con las otras verticales.
