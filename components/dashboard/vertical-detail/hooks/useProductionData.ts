import { useState, useMemo } from "react";
import { VerticalSchema, Movement, Vertical, EggProductionHistory, CowProductionHistory } from "../types/interfaces";

interface ProductionStats {
  totalProduction: number;
  totalRevenue: number;
  averagePrice: number;
}

// ✅ Definir tipos específicos para production_details
interface ProductionDetail {
  type_id: string;
  type_name: string;
  quantity: number;
  unit_price: number;
  total_value: number;
}



export function useProductionData(
  schema: VerticalSchema, 
  movements: Movement[], 
  vertical: Vertical
) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  console.log("=== useProductionData Debug ===");
  console.log("Schema:", schema);
  console.log("All movements:", movements);
  console.log("Vertical:", vertical);

  // ✅ Crear movimientos sintéticos desde el historial guardado en variables_schema
  const syntheticMovements = useMemo(() => {
    const synthetic: Movement[] = [];
    
    // ✅ Para huevos - leer de eggProductionHistory con tipos específicos
    if (schema.type === 'eggs' && schema.eggProductionHistory) {
      const eggHistory = schema.eggProductionHistory as EggProductionHistory[];
      console.log("🥚 Creating synthetic movements from eggProductionHistory:", eggHistory);
      
      eggHistory.forEach((record: EggProductionHistory) => {
        // Buscar el movimiento original
        const originalMovement = movements.find(m => m.id === record.movement_id);
        
        if (originalMovement) {
          // ✅ Calcular valor total desde los precios específicos por tipo
          let totalValue = originalMovement.amount;
          
          // Si hay production_details, usar esos valores
          if (record.production_details && Array.isArray(record.production_details)) {
            totalValue = record.production_details.reduce((sum: number, detail: ProductionDetail) => 
              sum + (detail.total_value || 0), 0
            );
          }
          
          // Crear movimiento sintético con production_data
          const syntheticMovement: Movement = {
            ...originalMovement,
            production_data: {
              total_eggs: record.total_eggs,
              total_value: totalValue,
              by_type: record.production || {}
            }
          };
          synthetic.push(syntheticMovement);
          console.log(`🥚 Created synthetic egg movement: ${record.total_eggs} eggs, $${totalValue}`);
        } else {
          console.warn(`⚠️ Movement ${record.movement_id} not found in movements array`);
        }
      });
    }
    
    // ✅ Para lechería - leer de cowProductionHistory con tipos específicos
    if (schema.type === 'dairy' && schema.cowProductionHistory) {
      const dairyHistory = schema.cowProductionHistory as CowProductionHistory[];
      console.log("🥛 Creating synthetic movements from cowProductionHistory:", dairyHistory);
      
      dairyHistory.forEach((record: CowProductionHistory) => {
        // Buscar el movimiento original
        const originalMovement = movements.find(m => m.id === record.movement_id);
        
        if (originalMovement) {
          // Crear movimiento sintético con production_data
          const syntheticMovement: Movement = {
            ...originalMovement,
            production_data: {
              total_liters: record.total_liters,
              total_value: originalMovement.amount,
              by_animal: record.production || []
            }
          };
          synthetic.push(syntheticMovement);
          console.log(`🥛 Created synthetic dairy movement: ${record.total_liters} liters, $${originalMovement.amount}`);
        } else {
          console.warn(`⚠️ Movement ${record.movement_id} not found in movements array`);
        }
      });
    }
    
    console.log("✅ Total synthetic movements created:", synthetic.length);
    console.log("Synthetic movements:", synthetic);
    return synthetic;
  }, [schema, movements]);

  // ✅ Filtrar movimientos de producción para esta vertical específica
  const productionMovements = useMemo(() => {
    console.log("🔍 Filtering production movements...");
    console.log("Synthetic movements to filter:", syntheticMovements);
    
    const filtered = syntheticMovements.filter(m => {
      const isCorrectVertical = m.vertical_id === vertical.id;
      const isIngreso = m.type === 'ingreso';
      const hasProductionData = m.production_data && (
        (schema.type === 'eggs' && m.production_data.total_eggs && m.production_data.total_eggs > 0) ||
        (schema.type === 'dairy' && m.production_data.total_liters && m.production_data.total_liters > 0)
      );
      
      console.log(`Movement ${m.id} check:`, {
        isCorrectVertical,
        isIngreso,
        hasProductionData,
        production_data: m.production_data,
        vertical_id: m.vertical_id,
        expected_vertical_id: vertical.id
      });
      
      return isCorrectVertical && isIngreso && hasProductionData;
    });
    
    console.log("✅ Production movements filtered:", filtered.length);
    console.log("Filtered movements:", filtered);
    return filtered;
  }, [syntheticMovements, vertical.id, schema.type]);

  // Aplicar filtros de fecha y precio
  const filteredMovements = useMemo(() => {
    let filtered = [...productionMovements];

    console.log("🔧 Applying filters to", filtered.length, "movements");

    if (startDate) {
      const startDateObj = new Date(startDate);
      filtered = filtered.filter(m => new Date(m.date) >= startDateObj);
      console.log(`📅 After start date filter (${startDate}):`, filtered.length);
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      filtered = filtered.filter(m => new Date(m.date) <= endDateObj);
      console.log(`📅 After end date filter (${endDate}):`, filtered.length);
    }

    if (minPrice) {
      const minPriceNum = Number(minPrice);
      filtered = filtered.filter(m => {
        const quantity = getQuantityFromMovement(m, schema);
        const unitPrice = quantity > 0 ? m.amount / quantity : 0;
        return unitPrice >= minPriceNum;
      });
      console.log(`💰 After min price filter ($${minPrice}):`, filtered.length);
    }

    if (maxPrice) {
      const maxPriceNum = Number(maxPrice);
      filtered = filtered.filter(m => {
        const quantity = getQuantityFromMovement(m, schema);
        const unitPrice = quantity > 0 ? m.amount / quantity : 0;
        return unitPrice <= maxPriceNum;
      });
      console.log(`💰 After max price filter ($${maxPrice}):`, filtered.length);
    }

    console.log("✅ Final filtered movements:", filtered.length);
    return filtered;
  }, [productionMovements, startDate, endDate, minPrice, maxPrice, schema]);

  // Calcular estadísticas
  const stats = useMemo((): ProductionStats => {
    console.log("📊 Calculating stats from", filteredMovements.length, "movements");
    
    const totalProduction = filteredMovements.reduce((sum, m) => {
      const quantity = getQuantityFromMovement(m, schema);
      console.log(`Adding ${quantity} from movement ${m.id}`);
      return sum + quantity;
    }, 0);

    const totalRevenue = filteredMovements.reduce((sum, m) => {
      console.log(`Adding $${m.amount} revenue from movement ${m.id}`);
      return sum + Number(m.amount || 0);
    }, 0);

    const averagePrice = totalProduction > 0 ? totalRevenue / totalProduction : Number(schema.price || 0);

    console.log("📊 Stats calculated:", {
      totalProduction,
      totalRevenue,
      averagePrice,
      movementsCount: filteredMovements.length
    });

    return {
      totalProduction,
      totalRevenue,
      averagePrice
    };
  }, [filteredMovements, schema]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setMinPrice("");
    setMaxPrice("");
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    filteredMovements,
    stats,
    clearFilters
  };
}

// ✅ Helper function mejorada para extraer cantidad
function getQuantityFromMovement(movement: Movement, schema: VerticalSchema): number {
  if (!movement.production_data) {
    console.log("❌ No production_data in movement:", movement.id);
    return 0;
  }
  
  if (schema.type === 'dairy') {
    const liters = Number(movement.production_data.total_liters || 0);
    console.log(`🥛 Dairy movement ${movement.id}: ${liters} liters`);
    return liters;
  } else if (schema.type === 'eggs') {
    const eggs = Number(movement.production_data.total_eggs || 0);
    console.log(`🥚 Egg movement ${movement.id}: ${eggs} eggs`);
    return eggs;
  }
  
  console.log("❓ Unknown schema type:", schema.type);
  return 0;
}