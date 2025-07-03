"use client";
import { useState, useEffect, useCallback } from "react";

export interface EggsSchema {
  type: "eggs";
  unit: string;
  price: number;
  inventory: {
    total: number;
  };
  productionTypes: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    active?: boolean;
  }>;
  templateConfig: {
    trackByType: boolean;
    productionFrequency: string;
  };
}

export interface TypeProduction {
  id: string;
  name: string;
  count: number;
  price: number;
}

export interface EggsProductionData {
  by_type?: TypeProduction[] | Record<string, number>;
  total_eggs?: number;
  total_value?: number;
  [key: string]: unknown;
}

interface EggsProductionFormProps {
  schema: EggsSchema;
  defaultQuantity?: number;
  onQuantityChange: (qty: number) => void;
  onDataChange: (data: EggsProductionData) => void;
}

export default function EggsProductionForm({ 
  schema, 
  defaultQuantity = 0, 
  onQuantityChange,
  onDataChange 
}: EggsProductionFormProps) {
  const [totalEggs, setTotalEggs] = useState(defaultQuantity || 0);
  const [typeProduction, setTypeProduction] = useState<Record<string, number>>({});
  
  // ✅ Inicializar producción por tipo solo cuando cambian los tipos (no cada render)
  useEffect(() => {
    const initialTypeProduction: Record<string, number> = {};
    schema.productionTypes.forEach(type => {
      initialTypeProduction[type.id] = 0;
    });
    setTypeProduction(initialTypeProduction);
  }, [schema.productionTypes.length]); // ✅ Solo depende de la longitud, no del array completo
  
  // ✅ Función memoizada para calcular valor total
  const calculateTotalValue = useCallback(() => {
    let totalValue = 0;
    
    if (schema.templateConfig.trackByType && schema.productionTypes.length > 0) {
      // Usar precios específicos por tipo
      Object.keys(typeProduction).forEach(typeId => {
        const eggType = schema.productionTypes.find(t => t.id === typeId);
        const quantity = typeProduction[typeId] || 0;
        const price = eggType?.price || schema.price;
        totalValue += quantity * price;
      });
    } else {
      // Usar precio general si no hay seguimiento por tipo
      totalValue = totalEggs * schema.price;
    }
    
    return totalValue;
  }, [typeProduction, totalEggs, schema.productionTypes, schema.price, schema.templateConfig.trackByType]);
  
  // ✅ Efecto que se ejecuta solo cuando cambian valores específicos
  useEffect(() => {
    // Notificar cambio de cantidad
    onQuantityChange(totalEggs);
    
    // Calcular valor total
    const totalValue = calculateTotalValue();
    
    // Preparar datos de producción
    const productionData: EggsProductionData = {
      total_eggs: totalEggs,
      total_value: totalValue,
      by_type: Object.keys(typeProduction).map(typeId => {
        const eggType = schema.productionTypes.find(t => t.id === typeId);
        return {
          id: typeId,
          name: eggType?.name || "",
          count: typeProduction[typeId],
          price: eggType?.price || schema.price
        };
      })
    };
    
    onDataChange(productionData);
  }, [totalEggs, calculateTotalValue]); // ✅ Dependencias específicas y estables
  
  // Actualiza la producción de un tipo específico
  const updateTypeProduction = (typeId: string, quantity: number) => {
    setTypeProduction(prev => {
      const newProduction = { ...prev, [typeId]: quantity };
      
      // Actualiza el total basado en la suma de todos los tipos
      const newTotal = Object.values(newProduction).reduce((sum, val) => sum + val, 0);
      setTotalEggs(newTotal);
      
      return newProduction;
    });
  };

  const assignByPercentage = () => {
    if (schema.productionTypes.length === 0) return;
    
    const newTypeProduction = { ...typeProduction };
    const typesCount = schema.productionTypes.length;
    
    const baseQuantity = Math.floor(totalEggs / typesCount);
    const remainder = totalEggs % typesCount;
    
    schema.productionTypes.forEach((type, index) => {
      newTypeProduction[type.id] = baseQuantity + (index < remainder ? 1 : 0);
    });
    
    setTypeProduction(newTypeProduction);
  };

  // Formato de moneda COP autotipado
  const formatCurrency = (value: number) =>
    value.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 });

  return (
    <div className="space-y-4 w-full">
      <div>
        <label className="block text-sm font-medium mb-1">Total de huevos producidos</label>
        <input
          type="number"
          value={totalEggs}
          onChange={(e) => setTotalEggs(Number(e.target.value))}
          className="block w-full border rounded p-2"
          min="0"
          required
        />
      </div>

      {schema.templateConfig.trackByType && schema.productionTypes.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
            <h3 className="text-sm font-medium">Producción por tipo</h3>
            <button
              type="button"
              onClick={assignByPercentage}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded w-fit"
            >
              Distribuir automáticamente
            </button>
          </div>

          {/* Responsive tabla-like layout */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[540px]">
              <div className="grid grid-cols-5 gap-2 px-2 pb-1 text-xs text-gray-500 bg-gray-100 rounded">
                <div>Tipo</div>
                <div>Precio</div>
                <div>Cantidad</div>
                <div>Unidades</div>
                <div>Total</div>
              </div>
              {schema.productionTypes
                .filter(eggType => eggType.active !== false)
                .map(eggType => (
                  <div
                    key={eggType.id}
                    className="grid grid-cols-5 gap-2 items-center bg-gray-50 rounded px-2 py-2"
                  >
                    {/* Tipo */}
                    <div className="font-medium text-sm truncate">{eggType.name}</div>
                    {/* Precio */}
                    <div className="text-green-600 font-bold text-xs whitespace-nowrap">
                      {formatCurrency(eggType.price)} <span className="font-normal text-xs">c/u</span>
                    </div>
                    {/* Cantidad */}
                    <div>
                      <input
                        type="number"
                        value={typeProduction[eggType.id] || 0}
                        onChange={(e) => updateTypeProduction(eggType.id, Number(e.target.value))}
                        className="w-full border rounded p-1 text-right"
                        min="0"
                      />
                    </div>
                    {/* Unidades */}
                    <div className="text-xs text-gray-500 text-center">unidades</div>
                    {/* Total */}
                    <div className="text-blue-700 font-semibold text-xs text-right whitespace-nowrap">
                      {formatCurrency((typeProduction[eggType.id] || 0) * eggType.price)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 p-2 bg-gray-100 rounded text-sm gap-2">
            <span>Total asignado:</span>
            <span className="font-bold">
              {Object.values(typeProduction).reduce((sum, val) => sum + val, 0)} unidades
              {totalEggs !== Object.values(typeProduction).reduce((sum, val) => sum + val, 0) && (
                <span className="text-red-500 ml-2">
                  (No coincide con el total: {totalEggs})
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}