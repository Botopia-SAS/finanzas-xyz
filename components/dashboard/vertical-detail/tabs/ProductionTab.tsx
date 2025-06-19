import { VerticalSchema, Vertical, Movement } from "../types/interfaces";
import ProductionChart from "../components/ProductionChart";
import ProductionFilters from "../components/ProductionFilters";
import { useProductionData } from "../hooks/useProductionData";
import { Calendar, TrendingUp, DollarSign, Target } from "lucide-react";

interface ProductionTabProps {
  vertical: Vertical;
  schema: VerticalSchema;
  movements: Movement[];
}

export default function ProductionTab({ vertical, schema, movements }: ProductionTabProps) {
  const { 
    startDate, setStartDate,
    endDate, setEndDate,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    filteredMovements,
    stats,
    clearFilters
  } = useProductionData(schema, movements, vertical);

  // Análisis de rentabilidad por períodos
  const analyzeRentabilityTrends = () => {
    if (schema.type !== 'eggs') return [];

    const eggMovements = filteredMovements.filter(m => m.production_data?.total_eggs);
    const totalHens = schema.inventory?.total || 1;

    return eggMovements.map(movement => {
      const eggs = movement.production_data?.total_eggs || 0;
      const profitability = eggs / totalHens;
      const date = new Date(movement.date);
      
      return {
        date: date.toLocaleDateString('es-ES'),
        eggs,
        profitability,
        revenue: movement.amount,
        unitPrice: eggs > 0 ? movement.amount / eggs : 0
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const rentabilityData = analyzeRentabilityTrends();

  // Calcular estadísticas avanzadas
  const advancedStats = {
    bestDay: rentabilityData.reduce((best, current) => 
      current.profitability > best.profitability ? current : best, 
      { profitability: 0, date: '', eggs: 0 }
    ),
    averageDaily: rentabilityData.length > 0 
      ? rentabilityData.reduce((sum, day) => sum + day.profitability, 0) / rentabilityData.length 
      : 0,
    trend: rentabilityData.length > 1 
      ? (rentabilityData[rentabilityData.length - 1].profitability - rentabilityData[0].profitability) / rentabilityData.length
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header con información clave */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Análisis Detallado de Producción - {schema.type === 'eggs' ? 'Huevos' : 'Lechería'}
        </h2>
        <p className="text-gray-600">
          Seguimiento completo de producción y rentabilidad para optimizar tus operaciones
        </p>
      </div>

      {/* Estadísticas avanzadas para huevos */}
      {schema.type === 'eggs' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mejor Día</p>
                <p className="text-xl font-bold text-green-600">
                  {advancedStats.bestDay.profitability.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">huevos/gallina</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio Diario</p>
                <p className="text-xl font-bold text-blue-600">
                  {advancedStats.averageDaily.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">huevos/gallina</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendencia</p>
                <p className={`text-xl font-bold ${
                  advancedStats.trend > 0 ? 'text-green-600' : 
                  advancedStats.trend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {advancedStats.trend > 0 ? '+' : ''}{(advancedStats.trend * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">cambio promedio</p>
              </div>
              <TrendingUp className={`w-8 h-8 ${
                advancedStats.trend > 0 ? 'text-green-500' : 
                advancedStats.trend < 0 ? 'text-red-500' : 'text-gray-500'
              }`} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-xl font-bold text-purple-600">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">período seleccionado</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
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

      {/* Gráfico detallado */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Gráfico de Producción y Rentabilidad</h3>
        <ProductionChart 
          filteredMovements={filteredMovements} 
          schema={schema}
        />
      </div>

      {/* Tabla detallada de rentabilidad */}
      {schema.type === 'eggs' && rentabilityData.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Análisis de Rentabilidad por Fecha</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-medium">Fecha</th>
                  <th className="p-3 text-right font-medium">Huevos Producidos</th>
                  <th className="p-3 text-right font-medium">Rentabilidad</th>
                  <th className="p-3 text-right font-medium">Precio Unitario</th>
                  <th className="p-3 text-right font-medium">Ingresos</th>
                  <th className="p-3 text-center font-medium">Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {rentabilityData.map((day, index) => {
                  const performanceLevel = 
                    day.profitability >= 0.8 ? 'excellent' :
                    day.profitability >= 0.6 ? 'good' :
                    day.profitability >= 0.4 ? 'average' : 'poor';

                  const performanceConfig = {
                    excellent: { color: 'text-green-600', bg: 'bg-green-100', label: 'Excelente' },
                    good: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Bueno' },
                    average: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Regular' },
                    poor: { color: 'text-red-600', bg: 'bg-red-100', label: 'Bajo' }
                  };

                  const config = performanceConfig[performanceLevel];

                  return (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{day.date}</td>
                      <td className="p-3 text-right">{day.eggs}</td>
                      <td className="p-3 text-right font-bold text-blue-600">
                        {day.profitability.toFixed(2)} huevos/gallina
                      </td>
                      <td className="p-3 text-right">${day.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium text-green-600">
                        ${day.revenue.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumen de rendimiento */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Resumen de Rendimiento</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Días excelentes:</span>
                <span className="ml-1 font-bold text-green-600">
                  {rentabilityData.filter(d => d.profitability >= 0.8).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Días buenos:</span>
                <span className="ml-1 font-bold text-blue-600">
                  {rentabilityData.filter(d => d.profitability >= 0.6 && d.profitability < 0.8).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Días regulares:</span>
                <span className="ml-1 font-bold text-yellow-600">
                  {rentabilityData.filter(d => d.profitability >= 0.4 && d.profitability < 0.6).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Días bajos:</span>
                <span className="ml-1 font-bold text-red-600">
                  {rentabilityData.filter(d => d.profitability < 0.4).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {schema.type === 'eggs' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Recomendaciones</h3>
          <div className="space-y-2 text-sm">
            {advancedStats.averageDaily < 0.5 && (
              <p className="text-blue-700">
                • Tu rentabilidad promedio está por debajo de 0.5 huevos por gallina. Considera revisar la alimentación y condiciones de las gallinas.
              </p>
            )}
            {advancedStats.trend < 0 && (
              <p className="text-blue-700">
                • Se detecta una tendencia decreciente en la producción. Evalúa factores como salud del rebaño y condiciones ambientales.
              </p>
            )}
            {stats.averagePrice < schema.price * 0.9 && (
              <p className="text-blue-700">
                • El precio promedio actual está por debajo del precio configurado. Considera ajustar precios o buscar mejores mercados.
              </p>
            )}
            {advancedStats.averageDaily >= 0.7 && (
              <p className="text-green-700">
                • ¡Excelente trabajo! Tu rentabilidad está por encima del promedio. Mantén las buenas prácticas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}