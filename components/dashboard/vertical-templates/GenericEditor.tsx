"use client";
import { VerticalSchema } from "../vertical-detail/types/interfaces";

interface GenericEditorProps {
  schema: VerticalSchema;
  onChange: (schema: VerticalSchema) => void;
}

export default function GenericEditor({ schema, onChange }: GenericEditorProps) {
  
  // ✅ FUNCIÓN PARA ACTUALIZAR INVENTORY SEGURA
  const updateInventory = (total: number) => {
    const currentInventory = schema.inventory || { total: 0, items: [] };
    
    onChange({
      ...schema, 
      inventory: {
        ...currentInventory,
        total: total
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
          
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de vertical</label>
            <select
              value={schema.type || "generic"}
              onChange={(e) => {
                console.log("🔄 Cambiando tipo a:", e.target.value);
                onChange({...schema, type: e.target.value as any});
              }}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="generic">Genérico</option>
              <option value="dairy">Lechería</option>
              <option value="eggs">Huevos</option>
              <option value="crops">Cultivos</option>
              <option value="livestock">Ganado</option>
            </select>
          </div>

          {/* Unidad */}
          <div>
            <label className="block text-sm font-medium mb-2">Unidad de medida</label>
            <input
              type="text"
              value={schema.unit || ""}
              onChange={(e) => {
                console.log("📏 Cambiando unidad a:", e.target.value);
                onChange({...schema, unit: e.target.value});
              }}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: litros, kg, unidades..."
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-2">Precio por unidad</label>
            <input
              type="number"
              value={schema.price || 0}
              onChange={(e) => {
                const newPrice = Number(e.target.value);
                console.log("💰 Cambiando precio a:", newPrice);
                onChange({...schema, price: newPrice});
              }}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Configuración adicional */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Configuración</h3>
          
          {/* ✅ INVENTARIO TOTAL SEGURO */}
          <div>
            <label className="block text-sm font-medium mb-2">Inventario actual</label>
            <input
              type="number"
              value={schema.inventory?.total || 0}
              onChange={(e) => {
                const newTotal = Number(e.target.value);
                console.log("📦 Cambiando inventario a:", newTotal);
                updateInventory(newTotal);
              }}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              placeholder="0"
            />
          </div>

          {/* ✅ NOTAS SEGURAS */}
          <div>
            <label className="block text-sm font-medium mb-2">Notas adicionales</label>
            <textarea
              value={(schema as any).notes || ""}
              onChange={(e) => {
                console.log("📝 Cambiando notas a:", e.target.value);
                onChange({...schema, notes: e.target.value} as any);
              }}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Información adicional sobre este vertical..."
            />
          </div>
        </div>
      </div>

      {/* Preview del valor total */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-green-700">Valor total estimado:</span>
          <span className="text-xl font-bold text-green-800">
            ${((schema.inventory?.total || 0) * (schema.price || 0)).toFixed(2)}
          </span>
        </div>
        <div className="mt-1 text-sm text-green-600">
          {schema.inventory?.total || 0} {schema.unit || 'unidades'} × ${schema.price || 0}
        </div>
      </div>

      {/* ✅ PREVIEW DEL SCHEMA ACTUAL */}
      <div className="bg-gray-50 rounded-lg p-4">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 mb-2">
            Vista previa de cambios
          </summary>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}