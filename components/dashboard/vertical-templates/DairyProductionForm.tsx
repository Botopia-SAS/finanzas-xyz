"use client";
import { useState, useEffect, useCallback } from "react";

export interface DairySchema {
  type: "dairy";
  unit: string;
  price: number;
  inventory: {
    items: Array<{
      id: string;
      name: string;
      inProduction?: boolean;
      notes?: string;
    }>;
  };
  templateConfig: {
    trackIndividualProduction: boolean;
    productionFrequency: string;
  };
}

interface CowProduction {
  id: string;
  name: string;
  liters: number;
}

interface DairyProductionData {
  by_animal?: CowProduction[];
  total_liters?: number;
  total_value?: number;
  price_per_liter?: number;
}

interface DairyProductionFormProps {
  schema: DairySchema;
  defaultQuantity?: number;
  onQuantityChange: (qty: number) => void;
  onDataChange: (data: DairyProductionData) => void;
}

export default function DairyProductionForm({ 
  schema, 
  defaultQuantity = 0, 
  onQuantityChange,
  onDataChange 
}: DairyProductionFormProps) {
  const [totalLiters, setTotalLiters] = useState(defaultQuantity || 0);
  const [cowProduction, setCowProduction] = useState<Record<string, number>>({});
  
  // ✅ Inicializar producción por vaca solo cuando cambia el número de vacas
  useEffect(() => {
    const initialCowProduction: Record<string, number> = {};
    schema.inventory.items.forEach(cow => {
      initialCowProduction[cow.id] = 0;
    });
    setCowProduction(initialCowProduction);
  }, [schema.inventory.items.length]); // ✅ Solo depende de la longitud
  
  // ✅ Función memoizada para preparar datos de producción
  const prepareProductionData = useCallback((): DairyProductionData => {
    return {
      total_liters: totalLiters,
      price_per_liter: schema.price,
      total_value: totalLiters * schema.price,
      by_animal: Object.keys(cowProduction).map(cowId => {
        const cow = schema.inventory.items.find(c => c.id === cowId);
        return {
          id: cowId,
          name: cow?.name || "",
          liters: cowProduction[cowId]
        };
      })
    };
  }, [totalLiters, cowProduction, schema.price, schema.inventory.items]);
  
  // ✅ Efecto con dependencias específicas y estables
  useEffect(() => {
    onQuantityChange(totalLiters);
    const productionData = prepareProductionData();
    onDataChange(productionData);
  }, [totalLiters, prepareProductionData]); // ✅ Dependencias memoizadas
  
  // Actualiza la producción de una vaca específica
  const updateCowProduction = (cowId: string, liters: number) => {
    setCowProduction(prev => {
      const newProduction = { ...prev, [cowId]: liters };
      
      // Actualiza el total basado en la suma de todas las vacas
      const newTotal = Object.values(newProduction).reduce((sum, val) => sum + val, 0);
      setTotalLiters(newTotal);
      
      return newProduction;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Total de litros producidos</label>
        <input
          type="number"
          value={totalLiters}
          onChange={(e) => setTotalLiters(Number(e.target.value))}
          className="block w-full border rounded p-2"
          min="0"
          step="0.1"
          required
        />
      </div>
      
      {schema.templateConfig.trackIndividualProduction && schema.inventory.items.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Producción por vaca</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto p-1">
            {schema.inventory.items
              .filter(cow => cow.inProduction !== false)
              .map(cow => (
                <div key={cow.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{cow.name}</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={cowProduction[cow.id] || 0}
                      onChange={(e) => updateCowProduction(cow.id, Number(e.target.value))}
                      className="w-24 border rounded p-1 text-right"
                      min="0"
                      step="0.1"
                    />
                    <span className="ml-1 text-gray-500">L</span>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="flex items-center justify-between mt-2 p-2 bg-gray-100 rounded text-sm">
            <span>Total asignado:</span>
            <span className="font-bold">
              {Object.values(cowProduction).reduce((sum, val) => sum + val, 0).toFixed(1)} L
              {totalLiters !== Object.values(cowProduction).reduce((sum, val) => sum + val, 0) && (
                <span className="text-red-500 ml-2">
                  (No coincide con el total: {totalLiters} L)
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}