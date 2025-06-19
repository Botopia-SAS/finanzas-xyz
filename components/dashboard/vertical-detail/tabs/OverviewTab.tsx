import { useState } from "react";
import { VerticalSchema, Vertical, Movement } from "../types/interfaces";
import ProductionChart from "../components/ProductionChart";
import ProductionFilters from "../components/ProductionFilters";
import CowProductionTable from "../components/CowProductionTable";
import { useProductionData } from "../hooks/useProductionData";

interface OverviewTabProps {
  vertical: Vertical;
  schema: VerticalSchema;
  movements: Movement[];
}

interface EggStats {
  averagePrice: number;
  totalProduction: number;
  profitability: number; // Huevos por gallina
  totalRevenue: number;
}

interface DairyStats {
  averagePrice: number;
  totalProduction: number;
  averageProductionPerCow: number;
  totalRevenue: number;
}

export default function OverviewTab({ vertical, schema, movements }: OverviewTabProps) {
  const { 
    startDate, setStartDate,
    endDate, setEndDate,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    filteredMovements,
    stats,
    clearFilters
  } = useProductionData(schema, movements, vertical);

  // ✅ Debug: Agregar logs para diagnosticar
  console.log("=== DEBUG OVERVIEW TAB ===");
  console.log("Total movements:", movements.length);
  console.log("Filtered movements:", filteredMovements.length);
  console.log("Vertical ID:", vertical.id);
  console.log("Schema type:", schema.type);
  console.log("Movements for this vertical:", movements.filter(m => m.vertical_id === vertical.id));
  console.log("Production movements:", movements.filter(m => 
    m.vertical_id === vertical.id && 
    m.type === 'ingreso' && 
    m.production_data
  ));

  // Calcular estadísticas específicas para huevos - CORREGIDO
  const calculateEggStats = (): EggStats => {
    if (schema.type !== 'eggs') {
      return { averagePrice: 0, totalProduction: 0, profitability: 0, totalRevenue: 0 };
    }

    console.log("🥚 Calculating egg stats...");
    console.log("Filtered movements for eggs:", filteredMovements);

    const totalEggs = filteredMovements.reduce((sum, m) => {
      const eggs = Number(m.production_data?.total_eggs || 0);
      console.log(`🥚 Adding ${eggs} eggs from movement ${m.id}`);
      return sum + eggs;
    }, 0);

    const totalRevenue = filteredMovements.reduce((sum, m) => {
      console.log(`💰 Adding $${m.amount} revenue from movement ${m.id}`);
      return sum + Number(m.amount || 0);
    }, 0);
    
    // ✅ Calcular precio promedio correctamente
    const averagePrice = totalEggs > 0 ? totalRevenue / totalEggs : Number(schema.price || 0);
    
    const totalHens = Number(schema.inventory?.total || 1);
    const profitability = totalHens > 0 ? totalEggs / totalHens : 0;

    console.log("🥚 Egg stats calculated:", {
      totalEggs,
      totalRevenue,
      averagePrice,
      totalHens,
      profitability
    });

    return {
      averagePrice,
      totalProduction: totalEggs,
      profitability,
      totalRevenue
    };
  };

  // Calcular estadísticas específicas para lechería
  const calculateDairyStats = (): DairyStats => {
    if (schema.type !== 'dairy') {
      return { averagePrice: 0, totalProduction: 0, averageProductionPerCow: 0, totalRevenue: 0 };
    }

    console.log("🥛 Calculating dairy stats...");
    console.log("Filtered movements for dairy:", filteredMovements);

    const totalLiters = filteredMovements.reduce((sum, m) => {
      const liters = Number(m.production_data?.total_liters || 0);
      console.log(`🥛 Adding ${liters} liters from movement ${m.id}`);
      return sum + liters;
    }, 0);

    const totalRevenue = filteredMovements.reduce((sum, m) => {
      console.log(`💰 Adding $${m.amount} revenue from movement ${m.id}`);
      return sum + Number(m.amount || 0);
    }, 0);

    const averagePrice = totalLiters > 0 ? totalRevenue / totalLiters : Number(schema.price || 0);
    
    const totalCows = schema.inventory?.items?.filter(cow => cow.inProduction !== false).length || 1;
    const averageProductionPerCow = totalCows > 0 ? totalLiters / totalCows : 0;

    console.log("🥛 Dairy stats calculated:", {
      totalLiters,
      totalRevenue,
      averagePrice,
      totalCows,
      averageProductionPerCow
    });

    return {
      averagePrice,
      totalProduction: totalLiters,
      averageProductionPerCow,
      totalRevenue
    };
  };

  const eggStats = calculateEggStats();
  const dairyStats = calculateDairyStats();

  // Renderizar estadísticas específicas según el tipo
  const renderSpecificStats = () => {
    if (schema.type === 'eggs') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Precio Promedio</h3>
            <p className="text-2xl font-bold text-yellow-600">
              ${eggStats.averagePrice.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">por huevo</p>
            {/* ✅ Debug info */}
            <p className="text-xs text-gray-400 mt-1">
              Debug: ${eggStats.totalRevenue} / {eggStats.totalProduction} huevos
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Producción Total</h3>
            <p className="text-2xl font-bold text-green-600">
              {eggStats.totalProduction.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">huevos producidos</p>
            {/* ✅ Debug info */}
            <p className="text-xs text-gray-400 mt-1">
              Debug: {movements.filter(m => m.vertical_id === vertical.id && m.production_data).length} registros
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Rentabilidad</h3>
            <p className="text-2xl font-bold text-blue-600">
              {eggStats.profitability.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">huevos por gallina</p>
            {/* ✅ Debug info */}
            <p className="text-xs text-gray-400 mt-1">
              Debug: {eggStats.totalProduction} huevos / {schema.inventory?.total || 0} gallinas
            </p>
          </div>
        </div>
      );
    }

    if (schema.type === 'dairy') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Precio Promedio</h3>
            <p className="text-2xl font-bold text-blue-600">
              ${dairyStats.averagePrice.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">por litro</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Producción Total</h3>
            <p className="text-2xl font-bold text-green-600">
              {dairyStats.totalProduction.toFixed(1)} L
            </p>
            <p className="text-xs text-gray-500">litros producidos</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Promedio por Vaca</h3>
            <p className="text-2xl font-bold text-purple-600">
              {dairyStats.averageProductionPerCow.toFixed(1)} L
            </p>
            <p className="text-xs text-gray-500">por vaca activa</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* ✅ Debug panel - TEMPORAL para diagnosticar */}
      <div className="bg-red-50 p-4 rounded border border-red-200">
        <h4 className="font-bold text-red-800 mb-2">🐛 Debug Info (Temporal)</h4>
        <div className="text-xs space-y-1">
          <p><strong>Total movements:</strong> {movements.length}</p>
          <p><strong>Vertical ID:</strong> {vertical.id}</p>
          <p><strong>Schema type:</strong> {schema.type}</p>
          <p><strong>Total gallinas:</strong> {schema.inventory && 'total' in schema.inventory ? schema.inventory.total : (schema.inventory?.items?.length || 0)}</p>
          <p><strong>Movements for this vertical:</strong> {movements.filter(m => m.vertical_id === vertical.id).length}</p>
          <p><strong>Production movements:</strong> {movements.filter(m => 
            m.vertical_id === vertical.id && 
            m.type === 'ingreso' && 
            m.production_data
          ).length}</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Ver movimientos completos</summary>
            <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(movements.filter(m => m.vertical_id === vertical.id), null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* Estadísticas específicas por tipo */}
      {renderSpecificStats()}

      {/* Filtros de producción */}
      <ProductionFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onClearFilters={clearFilters}
      />

      {/* Gráfico de producción */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Tendencia de Producción</h3>
        <ProductionChart 
          filteredMovements={filteredMovements} 
          schema={schema}
        />
      </div>

      {/* Tabla de producción con rentabilidad */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Registros de Producción</h3>
        <EnhancedProductionTable 
          filteredMovements={filteredMovements} 
          schema={schema} 
          stats={stats}
        />
      </div>

      {/* Tabla específica para vacas (solo lechería) */}
      {schema.type === 'dairy' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Producción por Vaca</h3>
          <CowProductionTable schema={schema} vertical={vertical} />
        </div>
      )}
    </div>
  );
}

// Componente mejorado de tabla de producción con rentabilidad
interface EnhancedProductionTableProps {
  filteredMovements: Movement[];
  schema: VerticalSchema;
  stats: { totalProduction: number; totalRevenue: number; averagePrice: number };
}

function EnhancedProductionTable({ filteredMovements, schema, stats }: EnhancedProductionTableProps) {
  if (filteredMovements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay registros de producción para mostrar</p>
        <p className="text-xs text-gray-400 mt-2">
          Los registros aparecerán cuando crees movimientos con datos de producción
        </p>
      </div>
    );
  }

  // Resto del componente igual...
  const calculateDailyProfitability = (movement: Movement): number => {
    if (schema.type !== 'eggs' || !movement.production_data?.total_eggs) return 0;
    
    const totalHens = schema.inventory?.total || 1;
    return (movement.production_data.total_eggs / totalHens);
  };

  const calculateProductionPerCow = (movement: Movement): number => {
    if (schema.type !== 'dairy' || !movement.production_data?.total_liters) return 0;
    
    const activeCows = schema.inventory?.items?.filter(cow => cow.inProduction !== false).length || 1;
    return (movement.production_data.total_liters / activeCows);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left font-medium">Fecha</th>
            <th className="p-3 text-right font-medium">Cantidad</th>
            <th className="p-3 text-right font-medium">Precio Unitario</th>
            <th className="p-3 text-right font-medium">Ingreso</th>
            <th className="p-3 text-right font-medium">
              {schema.type === 'eggs' ? 'Rentabilidad' : 'Producción/Vaca'}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredMovements.map((movement) => {
            const quantity = (() => {
              if (!movement.production_data) return 0;
              if (schema.type === 'dairy') {
                return movement.production_data.total_liters || 0;
              } else if (schema.type === 'eggs') {
                return movement.production_data.total_eggs || 0;
              }
              return 0;
            })();
            
            const unitPrice = quantity > 0 ? movement.amount / quantity : schema.price;
            const profitability = schema.type === 'eggs' 
              ? calculateDailyProfitability(movement)
              : calculateProductionPerCow(movement);
            
            return (
              <tr key={movement.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {new Date(movement.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="p-3 text-right font-medium">
                  {quantity.toFixed(1)} {schema.unit}
                </td>
                <td className="p-3 text-right">
                  ${unitPrice.toFixed(2)}
                </td>
                <td className="p-3 text-right font-medium text-green-600">
                  ${movement.amount.toFixed(2)}
                </td>
                <td className="p-3 text-right">
                  <span className={`font-medium ${
                    profitability > (schema.type === 'eggs' ? 0.8 : 15) 
                      ? 'text-green-600' 
                      : profitability > (schema.type === 'eggs' ? 0.5 : 10)
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {schema.type === 'eggs' 
                      ? `${profitability.toFixed(2)} huevos/gallina`
                      : `${profitability.toFixed(1)} L/vaca`
                    }
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50 border-t-2">
          <tr>
            <td className="p-3 font-bold">Totales</td>
            <td className="p-3 text-right font-bold">
              {stats.totalProduction.toFixed(1)} {schema.unit}
            </td>
            <td className="p-3 text-right font-bold">
              ${stats.averagePrice.toFixed(2)}
            </td>
            <td className="p-3 text-right font-bold text-green-600">
              ${stats.totalRevenue.toFixed(2)}
            </td>
            <td className="p-3 text-right font-bold">
              {schema.type === 'eggs' 
                ? `${(stats.totalProduction / (schema.inventory?.total || 1)).toFixed(2)} promedio`
                : `${(stats.totalProduction / (schema.inventory?.items?.filter(c => c.inProduction !== false).length || 1)).toFixed(1)} promedio`
              }
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}