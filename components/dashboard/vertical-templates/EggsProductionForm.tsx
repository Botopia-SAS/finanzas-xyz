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

  return (
    <div className="space-y-4">
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Producción por tipo</h3>
            <button 
              type="button"
              onClick={assignByPercentage}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              Distribuir automáticamente
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto p-1">
            {schema.productionTypes
              .filter(eggType => eggType.active !== false)
              .map(eggType => (
              <div key={eggType.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{eggType.name}</span>
                  <span className="ml-2 text-xs text-green-600 font-bold">
                    ${eggType.price.toFixed(2)} c/u
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={typeProduction[eggType.id] || 0}
                    onChange={(e) => updateTypeProduction(eggType.id, Number(e.target.value))}
                    className="w-24 border rounded p-1 text-right"
                    min="0"
                  />
                  <span className="ml-1 text-gray-500">unidades</span>
                  <span className="ml-2 text-xs text-blue-600 font-medium">
                    = ${((typeProduction[eggType.id] || 0) * eggType.price).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-2 p-2 bg-gray-100 rounded text-sm">
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
      
      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-blue-700">Valor total estimado:</span>
          <span className="text-xl font-bold text-blue-800">
            ${calculateTotalValue().toFixed(2)}
          </span>
        </div>
        {schema.templateConfig.trackByType && schema.productionTypes.length > 0 && (
          <div className="mt-2 text-xs text-blue-600">
            Calculado con precios específicos por tipo
          </div>
        )}
      </div>
    </div>
  );
}