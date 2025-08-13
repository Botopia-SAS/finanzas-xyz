'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from '@/lib/supabase/client';
import { Bell, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface DairyStatsProps {
  businessId: string;
  verticalId?: string;
  refreshTrigger?: number;
}

interface CowStats {
  total: number;
  active: number;
  sold: number;
  deceased: number;
  inactive: number;
}

interface ProductionData {
  date: string;
  total_liters: number;
  cow_count: number;
  avg_per_cow: number;
}

export default function DairyStats({ businessId, verticalId, refreshTrigger }: DairyStatsProps) {
  const [cowStats, setCowStats] = useState<CowStats>({
    total: 0,
    active: 0,
    sold: 0,
    deceased: 0,
    inactive: 0
  });
  const [todayProduction, setTodayProduction] = useState<ProductionData | null>(null);
  const [weeklyProduction, setWeeklyProduction] = useState<ProductionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchDairyStats();
  }, [businessId, refreshTrigger]);

  const fetchDairyStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching dairy stats for business:', businessId);

      // Obtener estadísticas de vacas por estado
      const { data: cowsData, error: cowsError } = await supabase
        .from('livestock_cows')
        .select('status')
        .eq('business_id', businessId);

      if (cowsError) {
        console.error('Error fetching cows:', cowsError);
        throw cowsError;
      }

      // Procesar estadísticas de vacas
      const stats: CowStats = {
        total: 0,
        active: 0,
        sold: 0,
        deceased: 0,
        inactive: 0
      };

      if (cowsData && Array.isArray(cowsData)) {
        cowsData.forEach((cow: any) => {
          stats.total += 1;
          if (stats.hasOwnProperty(cow.status)) {
            stats[cow.status as keyof CowStats] += 1;
          }
        });
      }

      setCowStats(stats);

      // Obtener producción diaria (hoy)
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyData, error: dailyError } = await supabase
        .from('livestock_milk_records')
        .select('liters, cow_id')
        .eq('business_id', businessId)
        .eq('date', today);

      if (dailyError) {
        console.error('Error fetching daily production:', dailyError);
      } else if (dailyData && dailyData.length > 0) {
        const totalLiters = dailyData.reduce((sum, record) => sum + parseFloat(record.liters), 0);
        const cowCount = new Set(dailyData.map(record => record.cow_id)).size;
        const avgPerCow = cowCount > 0 ? totalLiters / cowCount : 0;
        
        setTodayProduction({
          date: today,
          total_liters: totalLiters,
          cow_count: cowCount,
          avg_per_cow: avgPerCow
        });
      }

      // Obtener producción semanal
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
      
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('livestock_milk_records')
        .select('date, liters, cow_id')
        .eq('business_id', businessId)
        .gte('date', sevenDaysAgoStr)
        .order('date', { ascending: false });

      if (weeklyError) {
        console.error('Error fetching weekly production:', weeklyError);
      } else if (weeklyData) {
        // Agrupar por fecha
        const groupedData: { [key: string]: any[] } = {};
        weeklyData.forEach(record => {
          if (!groupedData[record.date]) {
            groupedData[record.date] = [];
          }
          groupedData[record.date].push(record);
        });

        // Procesar datos agrupados
        const weeklyProcessed = Object.entries(groupedData).map(([date, records]) => {
          const totalLiters = records.reduce((sum, record) => sum + parseFloat(record.liters), 0);
          const cowCount = new Set(records.map(record => record.cow_id)).size;
          const avgPerCow = cowCount > 0 ? totalLiters / cowCount : 0;
          
          return {
            date,
            total_liters: totalLiters,
            cow_count: cowCount,
            avg_per_cow: avgPerCow
          };
        });

        setWeeklyProduction(weeklyProcessed);
      }

    } catch (error) {
      console.error('Error in fetchDairyStats:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'deceased': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activas';
      case 'sold': return 'Vendidas';
      case 'deceased': return 'Fallecidas';
      case 'inactive': return 'Inactivas';
      default: return status;
    }
  };

  const calculateWeeklyTotal = () => {
    return weeklyProduction.reduce((total, day) => total + day.total_liters, 0);
  };

  const calculateWeeklyAverage = () => {
    const total = calculateWeeklyTotal();
    return weeklyProduction.length > 0 ? total / weeklyProduction.length : 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Error al cargar estadísticas: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Inventario de Ganado */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Inventario de Ganado</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl">🐄</span>
              </div>
            </div>
            <CardDescription className="text-sm text-gray-600">
              Total de vacas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-gray-900">
              {cowStats.total}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                Activas: {cowStats.active}
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                Vendidas: {cowStats.sold}
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 text-xs">
                Fallecidas: {cowStats.deceased}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                Inactivas: {cowStats.inactive}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Producción Hoy */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Producción Hoy</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <CardDescription className="text-sm text-gray-600">
              Litros de leche producidos hoy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-gray-900">
              {todayProduction?.total_liters || 0}L
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-gray-600">
                Vacas ordeñadas: <span className="font-medium text-gray-900">{todayProduction?.cow_count || 0}</span>
              </div>
              <div className="text-gray-600">
                Promedio por vaca: <span className="font-medium text-gray-900">{todayProduction?.avg_per_cow?.toFixed(1) || '0.0'}L</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Producción Semanal */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Producción Semanal</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <CardDescription className="text-sm text-gray-600">
              Últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-gray-900">
              {calculateWeeklyTotal()}L
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-gray-600">
                Promedio diario: <span className="font-medium text-gray-900">{calculateWeeklyAverage().toFixed(1)}L</span>
              </div>
              <div className="text-gray-600">
                Días registrados: <span className="font-medium text-gray-900">{weeklyProduction.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Alertas</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!todayProduction && (
              <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg border border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm text-orange-800">No hay registro de producción hoy</span>
              </div>
            )}
            {weeklyProduction.length < 7 && (
              <div className="flex items-center gap-2 p-3 bg-amber-100 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-800">Faltan registros de producción esta semana</span>
              </div>
            )}
            {todayProduction && weeklyProduction.length >= 7 && (
              <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg border border-green-200">
                <div className="h-4 w-4 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-green-800">Sistema funcionando correctamente</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalle Producción Semanal */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Detalle Producción Semanal</CardTitle>
          <CardDescription className="text-gray-600">
            Desglose por día de la producción de leche
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyProduction.length > 0 ? (
            <div className="space-y-3">
              {weeklyProduction.map((day, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-gray-900 min-w-[100px]">
                      {formatDate(day.date)}
                    </div>
                    <div className="text-sm text-gray-600 border-l border-gray-300 pl-4">
                      {day.cow_count} vacas
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{day.avg_per_cow?.toFixed(1)}L</span>/vaca
                    </div>
                    <div className="font-bold text-lg text-blue-600 min-w-[60px] text-right">
                      {day.total_liters}L
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-lg font-medium text-gray-600 mb-2">No hay registros de producción</p>
              <p className="text-sm text-gray-500">No se encontraron datos en los últimos 7 días</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
