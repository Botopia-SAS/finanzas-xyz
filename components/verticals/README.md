# Componentes de Verticales

Esta carpeta contiene todos los componentes relacionados con la gestión de verticales en la aplicación.

## Estructura

```
components/verticals/
├── constants/
│   └── verticalTemplates.ts    # Plantillas de verticales disponibles
├── hooks/
│   └── useVerticals.ts         # Hook para manejo de verticales
├── utils/
│   └── verticalIcons.ts        # Utilidades para íconos
├── VerticalCard.tsx            # Tarjeta individual de vertical
├── VerticalsList.tsx           # Lista de verticales
├── VerticalTemplateModal.tsx   # Modal para seleccionar plantillas
├── VerticalTemplateCard.tsx    # Tarjeta individual de plantilla
├── VerticalTemplatesList.tsx   # Lista de plantillas (legacy)
├── ConfirmDeleteModal.tsx      # Modal de confirmación de eliminación
└── index.ts                    # Exportaciones
```

## Componentes

### VerticalCard
Tarjeta individual que muestra información de una vertical con opciones de hover:
- **Ver** (ícono de ojo): Navega a la vertical
- **Eliminar** (ícono de basura): Elimina la vertical

### VerticalsList
Lista que muestra todas las verticales activas usando `VerticalCard`.

### VerticalTemplateModal
Modal que muestra las plantillas disponibles para crear nuevas verticales.

### VerticalTemplateCard
Tarjeta individual de plantilla que maneja el estado activo/bloqueado y la UI correspondiente.

### ConfirmDeleteModal
Modal de confirmación que permite elegir entre:
- **Desactivar**: Soft delete (mantiene los datos)
- **Eliminar completamente**: Hard delete (elimina en cascada)

### useVerticals Hook
Hook personalizado que maneja:
- Obtener verticales
- Crear vertical
- Eliminar vertical (con opción de soft/hard delete)
- Estados de carga

## Uso

```tsx
import { 
  VerticalsList, 
  VerticalTemplateModal, 
  ConfirmDeleteModal,
  useVerticals 
} from '@/components/verticals';

// En tu componente
const { verticals, loading, createVertical, deleteVertical } = useVerticals(businessId);

// Para eliminación
await deleteVertical(verticalId, false); // Soft delete
await deleteVertical(verticalId, true);  // Hard delete
```

## Plantillas Disponibles

### Verticales Activas
- **Lechería** 🥛
- **Ceba de Ganado** 🐄
- **Embriones** 🧬
- **Cría** �

### Verticales Próximamente (Bloqueadas)
- **Agricultura** 🌾
- **Avicultura** 🐔
- **Porcicultura** 🐷
- **Apicultura** 🐝

## Eliminación en Cascada

El sistema maneja dos tipos de eliminación:

### Soft Delete (Desactivar)
- Marca la vertical como `active: false`
- Mantiene todos los datos relacionados
- Reversible - puede reactivarse
- Recomendado para datos históricos importantes

### Hard Delete (Eliminar Completamente)
- Elimina la vertical y **todos** sus datos relacionados automáticamente
- Busca y elimina datos en todas las tablas relacionadas que existan:
  - `movements` (movimientos)
  - `inventory` / `inventories` (inventario)
  - `records` (registros)
  - `dairy_records` (registros de lechería)
  - `production_records` (registros de producción)
- **No reversible** - los datos se pierden permanentemente
- Maneja automáticamente tablas que no existen (no genera errores)
- Usar con precaución

> ⚠️ **Advertencia**: La eliminación completa es irreversible y elimina todos los datos relacionados.
