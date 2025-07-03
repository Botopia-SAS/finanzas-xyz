import React from "react";
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
  profitability: number; // <-- Agrega esto
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

  // ✅ Agregar todos los movimientos de la vertical (ingresos y gastos)
  const allVerticalMovements = React.useMemo(() => {
    return movements.filter(m => m.vertical_id === vertical.id);
  }, [movements, vertical.id]);

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
  console.log("Filtered Movements:", filteredMovements);
  console.log("Gastos:", filteredMovements.filter(m => m.type === 'gasto'));
  console.log("Ingresos:", filteredMovements.filter(m => m.type === 'ingreso'));

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
      return { averagePrice: 0, totalProduction: 0, averageProductionPerCow: 0, totalRevenue: 0, profitability: 0 };
    }

    const totalLiters = filteredMovements.reduce((sum, m) => {
      return sum + Number(m.production_data?.total_liters || 0);
    }, 0);

    // ⚠️ Cambiar a allVerticalMovements para rentabilidad
    const totalRevenue = allVerticalMovements
      .filter(m => m.type === 'ingreso')
      .reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const totalExpenses = allVerticalMovements
      .filter(m => m.type === 'gasto')
      .reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const averagePrice = totalLiters > 0 ? totalRevenue / totalLiters : Number(schema.price || 0);
    
    const totalCows = schema.inventory?.items?.filter(cow => cow.inProduction !== false).length || 1;
    const averageProductionPerCow = totalCows > 0 ? totalLiters / totalCows : 0;

    // Rentabilidad: (ingresos + gastos) / |gastos| * 100
    const profitability = totalExpenses !== 0
      ? ((totalRevenue + totalExpenses) / Math.abs(totalExpenses)) * 100
      : 0;

    console.log("=== Rentabilidad Debug ===");
    console.log("Total ingresos:", totalRevenue);
    console.log("Total gastos:", totalExpenses);
    console.log("Rentabilidad calculada:", profitability);

    return {
      averagePrice,
      totalProduction: totalLiters,
      averageProductionPerCow,
      totalRevenue,
      profitability
    };
  };

  const eggStats = calculateEggStats();
  const dairyStats = calculateDairyStats();

  // Calcula el promedio diario de rentabilidad (igual que en la tabla)
  const avgDailyProfitability = React.useMemo(() => {
    if (schema.type !== 'eggs' || filteredMovements.length === 0) return 0;
    const totalHens = Number(schema.inventory?.total || 1);
    return (
      filteredMovements.reduce((sum, m) => {
        const eggs = Number(m.production_data?.total_eggs || 0);
        return sum + (totalHens > 0 ? eggs / totalHens : 0);
      }, 0) / filteredMovements.length
    );
  }, [schema, filteredMovements]);

  // Renderizar estadísticas específicas según el tipo
  const renderSpecificStats = () => {
    // Utilidad: función para formatear dinero con separador de miles y símbolo
    const formatCurrency = (value: number) =>
      value.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 });

    if (schema.type === 'eggs') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Precio Promedio</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(eggStats.averagePrice)}
            </p>
            <p className="text-xs text-gray-500">por huevo</p>
            <p className="text-xs text-gray-400 mt-1">
              Debug: {formatCurrency(eggStats.totalRevenue)} / {eggStats.totalProduction} huevos
            </p>
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Producción Total</h3>
            <p className="text-2xl font-bold text-cyan-600">
              {eggStats.totalProduction.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">huevos producidos</p>
            <p className="text-xs text-gray-400 mt-1">
              Debug: {movements.filter(m => m.vertical_id === vertical.id && m.production_data).length} registros
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Rentabilidad</h3>
            <p className="text-2xl font-bold text-green-600">
              {avgDailyProfitability.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">huevos por gallina</p>
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
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Precio Promedio</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(dairyStats.averagePrice)}
            </p>
            <p className="text-xs text-gray-500">por litro</p>
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Producción Total</h3>
            <p className="text-2xl font-bold text-cyan-600">
              {dairyStats.totalProduction.toLocaleString()} L
            </p>
            <p className="text-xs text-gray-500">litros producidos</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Rentabilidad</h3>
            <p className="text-2xl font-bold text-green-600">
              {dairyStats.profitability.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">según ingresos y gastos</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      
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

  // --- Funciones auxiliares deben ir antes de usarlas ---
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

  // --- Diccionario de ID a nombre de tipo de huevo ---
  let eggTypes: string[] = [];
  const eggTypeNames: Record<string, string> = {}; // prefer-const

  if (schema.type === 'eggs') {
    const typeSet = new Set<string>();
    // 1. Construir diccionario id->nombre desde la config
    const templateConfigWithTypes = schema.templateConfig as { types?: { id: string; name: string }[] };
    if (templateConfigWithTypes?.types && Array.isArray(templateConfigWithTypes.types)) {
      templateConfigWithTypes.types.forEach((t: { id: string; name: string }) => { // especificar tipo
        if (t.id && t.name) eggTypeNames[t.id] = t.name;
      });
    }
    // 2. Detectar tipos presentes en los movimientos
    filteredMovements.forEach(m => {
      if (m.production_data?.by_type && typeof m.production_data.by_type === 'object') {
        Object.keys(m.production_data.by_type).forEach(typeId => {
          typeSet.add(typeId);
        });
      }
    });
    eggTypes = Array.from(typeSet);
  }

  // --- Calcular promedio diario de rentabilidad ---
  const avgProfitability = filteredMovements.length > 0
    ? filteredMovements.reduce((sum, m) => sum + calculateDailyProfitability(m), 0) / filteredMovements.length
    : 0;

  // --- Formatear como moneda ---
  const formatCurrency = (value: number) =>
    value.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left font-medium">Fecha</th>
            <th className="p-3 text-right font-medium">Cantidad</th>
            {/* Mostrar nombre del tipo de huevo */}
            {schema.type === 'eggs' && eggTypes.map(typeId => (
              <th key={typeId} className="p-3 text-right font-medium">
                {eggTypeNames[typeId] || typeId}
              </th>
            ))}
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

            // Cantidad por tipo de huevo
            const typeQuantities: Record<string, number> = {}; // prefer-const
            if (
              schema.type === 'eggs' &&
              movement.production_data?.by_type &&
              typeof movement.production_data.by_type === 'object'
            ) {
              Object.entries(movement.production_data.by_type).forEach(([typeId, qty]) => {
                typeQuantities[typeId] = qty as number;
              });
            }

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
                {/* Mostrar cantidad por tipo de huevo */}
                {schema.type === 'eggs' && eggTypes.map(typeId => (
                  <td key={typeId} className="p-3 text-right">
                    {typeQuantities[typeId] !== undefined ? typeQuantities[typeId] : 0}
                  </td>
                ))}
                <td className="p-3 text-right">
                  ${unitPrice.toFixed(2)}
                </td>
                <td className="p-3 text-right font-medium text-green-600">
                  {formatCurrency(movement.amount)}
                </td>
                <td className="p-3 text-right">
                  <span className={`font-medium ${
                    profitability > 0.8
                      ? 'text-green-600'
                      : profitability > 0.5
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
            {/* Totales por tipo de huevo */}
            {schema.type === 'eggs' && eggTypes.map(typeId => {
              const totalType = filteredMovements.reduce((sum, m) => {
                if (m.production_data?.by_type && typeof m.production_data.by_type === 'object') {
                  return sum + (m.production_data.by_type[typeId] || 0);
                }
                return sum;
              }, 0);
              return (
                <td key={typeId} className="p-3 text-right font-bold">
                  {totalType}
                </td>
              );
            })}
            <td className="p-3 text-right font-bold">
              {formatCurrency(stats.averagePrice)}
            </td>
            <td className="p-3 text-right font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </td>
            <td className="p-3 text-right font-bold">
              {schema.type === 'eggs'
                ? `${avgProfitability.toFixed(2)} promedio`
                : `${(stats.totalProduction / (schema.inventory?.items?.filter(c => c.inProduction !== false).length || 1)).toFixed(1)} promedio`
              }
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}