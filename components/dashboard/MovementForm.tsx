"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import DairyProductionForm, { DairySchema } from "./vertical-templates/DairyProductionForm";
import EggsProductionForm, { 
  EggsSchema, 
  EggsProductionData,
  TypeProduction
} from "./vertical-templates/EggsProductionForm";

// ✅ Definir interfaces tipadas localmente
interface CowProductionHistory {
  date: string;
  movement_id: string;
  total_liters: number;
  production: CowProductionEntry[];
}

interface EggProductionHistory {
  date: string;
  movement_id: string;
  total_eggs: number;
  production_details?: {
    type_id: string;
    type_name: string;
    quantity: number;
    unit_price: number;
    total_value: number;
  }[];
  production: Record<string, number>;
}

// Interfaces existentes...
interface InventoryItem {
  id: string;
  name: string;
  inProduction?: boolean;
  notes?: string;
}

interface ProductionType {
  id: string;
  name: string;
  price: number;
  active?: boolean;
  description?: string;
}

interface TemplateConfig {
  trackByType?: boolean;
  trackIndividualProduction?: boolean;
  productionFrequency?: string;
  lastUpdated?: string;
  version?: string;
  // ✅ Cambiar any por un tipo más específico
  customFields?: Record<string, string | number | boolean | null>;
  milkingTimes?: number;
  qualityControl?: boolean;
  qualityMetrics?: boolean;
  eggGradingEnabled?: boolean;
  collectionFrequency?: string;
}

interface VerticalSchema {
  type: "dairy" | "eggs";
  unit: string;
  price: number;
  inventory?: {
    items?: InventoryItem[];
    total?: number;
  };
  productionTypes?: ProductionType[];
  templateConfig?: TemplateConfig;
  // ✅ Agregar historiales tipados
  cowProductionHistory?: CowProductionHistory[];
  eggProductionHistory?: EggProductionHistory[];
}

interface Vertical {
  id: string;
  name: string;
  variables_schema: VerticalSchema;
}

interface CowProductionEntry {
  id: string;
  name: string;
  liters: number;
}

interface ProductionData {
  total_eggs?: number;
  total_liters?: number;
  total_value?: number;
  by_type?: Record<string, number> | TypeProduction[];
  by_animal?: CowProductionEntry[];
  price_per_liter?: number;
}

interface Movement {
  id?: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  description?: string;
  vertical_id?: string;
  // ✅ Tipar production_data correctamente
  production_data?: {
    total_eggs?: number;
    total_liters?: number;
    total_value?: number;
    by_type?: Record<string, number>;
    by_animal?: CowProductionEntry[];
  };
}

interface MovementFormProps {
  businessId: string;
  onComplete?: (movement: Movement) => void;
  movement?: Movement;
}

interface DairyProductionData {
  total_liters?: number;
  price_per_liter?: number;
  total_value?: number;
  by_animal?: CowProductionEntry[];
}

export default function MovementForm({ businessId, onComplete, movement }: MovementFormProps) {
  // ✅ TODOS los hooks deben estar aquí, al nivel superior
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [date, setDate] = useState(movement?.date || new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(movement?.description || "");
  const [productionData, setProductionData] = useState<ProductionData | null>(null);
  const [qty, setQty] = useState(0);
  const [selV, setSelV] = useState(movement?.vertical_id || "");
  const [movementType, setMovementType] = useState<"ingreso" | "gasto">(movement?.type || "ingreso");
  const [manualAmount, setManualAmount] = useState<number | "">(movement?.amount || 0);
  const [recordProduction, setRecordProduction] = useState(true);
  const [expenseCategory, setExpenseCategory] = useState("");

  // ✅ Mover handleEggsDataChange al nivel superior con useCallback
  const handleEggsDataChange = useCallback((data: EggsProductionData) => {
    console.log("Datos de huevos recibidos:", data);
    
    const converted: ProductionData = {
      ...data,
      total_value: data.total_value,
      by_type: Array.isArray(data.by_type) 
        ? Object.fromEntries(data.by_type.map((tp: TypeProduction) => [tp.id, tp.count])) 
        : data.by_type
    };
    setProductionData(converted);
  }, []);

  // ✅ Mover handleDairyDataChange al nivel superior con useCallback
  const handleDairyDataChange = useCallback((data: DairyProductionData) => {
    console.log("Datos de lechería recibidos:", data);
    
    const converted: ProductionData = {
      total_liters: data.total_liters,
      total_value: data.total_value,
      price_per_liter: data.price_per_liter,
      by_animal: data.by_animal
    };
    setProductionData(converted);
  }, []);

  // ✅ Mover handleQuantityChange al nivel superior con useCallback
  const handleQuantityChange = useCallback((newQty: number) => {
    setQty(newQty);
  }, []);

  // useEffect para cargar verticales
  useEffect(() => {
    const loadVerticals = async () => {
      const supabase = createClient();
      
      // Cargar verticales normales (excluir sistema)
      const { data: normalVerticals } = await supabase
        .from("verticals")
        .select("*")
        .eq("business_id", businessId)
        .eq("active", true)
        .eq("is_system", false); // ✅ Solo verticales no del sistema
    
      if (normalVerticals) {
        setVerticals(normalVerticals);
      }
    };
    
    loadVerticals();
  }, [businessId]);

  // Calcular monto basado en vertical seleccionada o monto manual
  const chosen = verticals.find((v) => v.id === selV);
  const pricePerUnit = chosen?.variables_schema.price ?? 0;

  // ✅ Para huevos, usar el valor total calculado por el formulario
  const computedAmount = (() => {
    if (!chosen || !recordProduction || movementType !== "ingreso") {
      return 0;
    }
    
    if (chosen.variables_schema.type === "eggs") {
      // ✅ Usar el valor total calculado que incluye precios específicos
      return productionData?.total_value || 0;
    } else if (chosen.variables_schema.type === "dairy") {
      // Para lechería, usar precio por litro
      return pricePerUnit * qty;
    }
    
    // Para otros tipos genéricos
    return pricePerUnit * qty;
  })();

  const amount = (selV && recordProduction && movementType === "ingreso") 
    ? computedAmount 
    : Number(manualAmount);

  // Cuando cambia el tipo de movimiento, resetear recordProduction
  useEffect(() => {
    if (movementType === "gasto") {
      setRecordProduction(false);
    }
  }, [movementType]);

  // ✅ Función para renderizar el formulario de producción - SIN useCallback interno
  const renderProductionForm = () => {
    if (!selV) return null;

    const selectedVertical = verticals.find((v) => v.id === selV);
    if (!selectedVertical) return null;

    const schema = selectedVertical.variables_schema;

    // Para tipo lechería
    if (schema.type === "dairy") {
      return (
        <DairyProductionForm
          schema={schema as DairySchema}
          defaultQuantity={qty}
          onQuantityChange={handleQuantityChange} // ✅ Usar callback ya definido
          onDataChange={handleDairyDataChange}    // ✅ Usar callback ya definido
        />
      );
    }

    // Para tipo huevos
    if (schema.type === "eggs") {
      return (
        <EggsProductionForm
          schema={schema as EggsSchema}
          defaultQuantity={qty}
          onQuantityChange={handleQuantityChange} // ✅ Usar callback ya definido
          onDataChange={handleEggsDataChange}     // ✅ Usar callback ya definido
        />
      );
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      // Si no hay vertical seleccionada, buscar la General
      let finalVerticalId = selV;
      
      if (!selV || selV === "") {
        const { data: generalVertical, error: generalError } = await supabase
          .from('verticals')
          .select('id')
          .eq('business_id', businessId)
          .eq('name', 'General')
          .eq('is_system', true)
          .single();
        
        if (generalError) {
          console.warn('⚠️ No se encontró vertical General, creando una nueva...');
          
          // ✅ Crear vertical General si no existe
          const { data: newGeneral, error: createError } = await supabase
            .from('verticals')
            .insert([{
              business_id: businessId,
              name: 'General',
              description: 'Movimientos generales del negocio',
              active: true,
              is_template: false,
              is_system: true,
              variables_schema: {
                type: 'general',
                unit: 'unidad',
                price: 0,
                templateConfig: {
                  lastUpdated: new Date().toISOString(),
                  version: '1.0.0',
                  customFields: {},
                  isSystemGenerated: true,
                  isHidden: true,
                  autoAssign: true
                }
              }
            }])
            .select('id')
            .single();
          
          finalVerticalId = newGeneral?.id || null;
          
          if (createError) {
            console.error('Error creando vertical General:', createError);
          }
        } else {
          finalVerticalId = generalVertical.id;
        }
      }
      
      // ✅ Generar descripción automática para gastos
      const finalDescription = (() => {
        if (movementType === "gasto" && expenseCategory) {
          const categoryName = expenseCategory.charAt(0).toUpperCase() + expenseCategory.slice(1).replace('_', ' ');
          const dateStr = new Date().toLocaleDateString('es-ES');
          const verticalInfo = selV ? ` - ${chosen?.name}` : '';
          
          return `[${categoryName}] Gasto registrado el ${dateStr}${verticalInfo}`;
        }
        // Para ingresos, usar la descripción del usuario
        return description || `Ingreso registrado el ${new Date().toLocaleDateString('es-ES')}`;
      })();
      
      // ✅ Crear movimiento
      const movementData = {
        business_id: businessId,
        vertical_id: finalVerticalId, // ✅ Usar General si no hay otra selección
        date,
        type: movementType as "ingreso" | "gasto",
        amount: movementType === "gasto" ? -Math.abs(amount) : Math.abs(amount),
        description: finalDescription
      };

      console.log("=== SAVING MOVEMENT DATA ===");
      console.log("Movement data:", movementData);
      console.log("Expense category:", expenseCategory);

      const { data: movementResult, error: movementError } = await supabase
        .from("movements")
        .insert([movementData])
        .select()
        .single();

      if (movementError) throw movementError;

      // ✅ Resto del código igual (producción, etc.)
      if (selV && recordProduction && productionData) {
        const { data: vertical } = await supabase
          .from('verticals')
          .select('variables_schema')
          .eq('id', selV)
          .single();

        if (vertical) {
          // ✅ Usar const en lugar de let ya que se reasigna el objeto completo
          const updatedSchema = { ...vertical.variables_schema };
          const productionTotal = chosen?.variables_schema.type === "eggs" 
            ? productionData.total_eggs || qty
            : productionData.total_liters || qty;

          if (chosen?.variables_schema.type === "dairy") {
            if (!updatedSchema.cowProductionHistory) {
              updatedSchema.cowProductionHistory = [];
            }

            // ✅ Crear objeto tipado para cowProductionHistory
            const cowHistoryEntry: CowProductionHistory = {
              date,
              movement_id: movementResult.id,
              total_liters: productionTotal,
              production: productionData.by_animal || []
            };

            updatedSchema.cowProductionHistory.push(cowHistoryEntry);

          } else if (chosen?.variables_schema.type === "eggs") {
            if (!updatedSchema.eggProductionHistory) {
              updatedSchema.eggProductionHistory = [];
            }

            // ✅ Crear objeto tipado para eggProductionHistory
            const eggHistoryEntry: EggProductionHistory = {
              date,
              movement_id: movementResult.id,
              total_eggs: productionTotal,
              production_details: productionData.by_type && Array.isArray(productionData.by_type) 
                ? productionData.by_type.map((tp: TypeProduction) => ({
                    type_id: tp.id,
                    type_name: tp.name,
                    quantity: tp.count,
                    unit_price: tp.price,
                    total_value: tp.count * tp.price
                  }))
                : undefined,
              production: productionData.by_type as Record<string, number> || {}
            };

            updatedSchema.eggProductionHistory.push(eggHistoryEntry);
          }

          const { error: updateError } = await supabase
            .from('verticals')
            .update({ variables_schema: updatedSchema })
            .eq('id', selV);

          if (updateError) throw updateError;
        }
      }

      // Éxito
      onComplete?.({ 
        ...movementResult, 
        vertical: selV ? { name: chosen?.name } : null 
      });
      
    } catch (error) {
      console.error("Error al guardar el movimiento:", error);
      if (error instanceof Error) {
        alert(`Error al guardar el movimiento: ${error.message}`);
      } else {
        alert("Error desconocido al guardar el movimiento");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de fecha */}
      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="block w-full border rounded p-2"
          required
        />
      </div>

      {/* Selector de tipo ingreso/gasto */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as "ingreso" | "gasto")}
          className="block w-full border rounded p-2"
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </div>

      {/* ✅ Solo mostrar descripción para INGRESOS */}
      {movementType === "ingreso" && (
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del movimiento"
            className="block w-full border rounded p-2 h-24 resize-none"
          />
        </div>
      )}

      {/* ✅ Select Vertical - MOSTRAR SIEMPRE */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {movementType === "ingreso" ? "Vertical (Producción)" : "Vertical (Relacionado)"}
        </label>
        <select
          value={selV}
          onChange={(e) => setSelV(e.target.value)}
          className="block w-full border rounded p-2"
        >
          <option value="">
            {movementType === "ingreso" ? "— General —" : "— Sin vertical específica —"}
          </option>
          {verticals.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        {movementType === "gasto" && (
          <p className="text-xs text-gray-500 mt-1">
            Opcional: Relaciona este gasto con una vertical específica para mejor seguimiento de costos.
          </p>
        )}
      </div>

      {/* ✅ Categoría de gasto - SOLO para gastos */}
      {movementType === "gasto" && (
        <div>
          <label className="block text-sm font-medium mb-1">Categoría de Gasto *</label>
          <select
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            className="block w-full border rounded p-2"
            required
          >
            <option value="">— Seleccionar categoría —</option>
            <option value="alimentacion">Alimentación</option>
            <option value="medicamentos">Medicamentos y Veterinaria</option>
            <option value="mantenimiento">Mantenimiento y Reparaciones</option>
            <option value="combustible">Combustible y Transporte</option>
            <option value="suministros">Suministros y Materiales</option>
            <option value="servicios">Servicios (Electricidad, Agua, etc.)</option>
            <option value="mano_obra">Mano de Obra</option>
            <option value="insumos">Insumos Agrícolas</option>
            <option value="equipamiento">Equipamiento y Herramientas</option>
            <option value="otros">Otros</option>
          </select>
          {/* ✅ Preview de cómo se guardará - Escapar comillas */}
          {expenseCategory && (
            <div className="mt-2 p-2 bg-blue-50 rounded border text-sm">
              <span className="text-blue-600 font-medium">Se guardará como:</span>
              <div className="text-gray-800 mt-1">
                &quot;[{expenseCategory.charAt(0).toUpperCase() + expenseCategory.slice(1).replace('_', ' ')}] Gasto registrado el {new Date().toLocaleDateString('es-ES')}&quot;
                {selV && ` - ${chosen?.name}`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkbox para registrar producción - Solo mostrar si es ingreso Y hay vertical seleccionada */}
      {movementType === "ingreso" && selV && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="record-production"
            checked={recordProduction}
            onChange={(e) => setRecordProduction(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="record-production" className="ml-2 text-sm">
            Registrar producción
          </label>
        </div>
      )}

      {/* Si hay vertical Y es ingreso Y checkbox activado => mostrar form de producción */}
      {selV && movementType === "ingreso" && recordProduction && renderProductionForm()}

      {/* En cualquier otro caso => monto manual */}
      {(!selV || !recordProduction || movementType === "gasto") && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {movementType === "ingreso" ? "Monto del ingreso" : "Monto del gasto"}
          </label>
          <input
            type="number"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value === "" ? "" : Number(e.target.value))}
            className="block w-full border rounded p-2"
            min="0"
            step="0.01"
            required
          />
        </div>
      )}

      {/* ✅ Mostrar el total calculado */}
      <div className={`p-3 rounded border ${
        movementType === "ingreso" 
          ? "bg-green-50 border-green-200" 
          : "bg-red-50 border-red-200"
      }`}>
        <div className="flex justify-between items-center">
          <span className={`font-medium ${
            movementType === "ingreso" ? "text-green-700" : "text-red-700"
          }`}>
            Total {movementType === "ingreso" ? "Ingreso" : "Gasto"}:
          </span>
          <span className={`text-xl font-bold ${
            movementType === "ingreso" ? "text-green-800" : "text-red-800"
          }`}>
            ${Math.abs(amount).toFixed(2)}
          </span>
        </div>
        {selV && (
          <p className="text-xs text-gray-600 mt-1">
            Relacionado con: <strong>{chosen?.name}</strong>
          </p>
        )}
        {movementType === "gasto" && expenseCategory && (
          <p className="text-xs text-gray-600 mt-1">
            Categoría: <strong>{expenseCategory.charAt(0).toUpperCase() + expenseCategory.slice(1).replace('_', ' ')}</strong>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || (movementType === "gasto" && !expenseCategory)}
        className={`w-full py-2 rounded text-white ${
          movementType === "ingreso" 
            ? "bg-green-600 hover:bg-green-700 disabled:bg-green-300" 
            : "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
        }`}
      >
        {loading ? "Guardando..." : 
         (movementType === "gasto" && !expenseCategory) ? "Selecciona una categoría" :
         `+ Agregar ${movementType}`
        }
      </button>
    </form>
  );
}