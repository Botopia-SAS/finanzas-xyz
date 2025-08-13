// components/verticals/verticalDetail/fattening/FatteningStats.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  Users, 
  TrendingUp, 
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FatteningStatsProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
}

interface StatsData {
  totalCattle: number;
  totalWeight: number;
  averageWeight: number;
  averageDailyGain: number;
}

export default function FatteningStats({ businessId, verticalId, refreshTrigger }: FatteningStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalCattle: 0,
    totalWeight: 0,
    averageWeight: 0,
    averageDailyGain: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obtener total de ganado
      const { data: cattle, error: cattleError } = await supabase
        .from('cows')
        .select('id, status')
        .eq('business_id', businessId);

      if (cattleError && cattleError.code !== 'PGRST116') {
        throw cattleError;
      }

      const totalCattle = cattle?.length || 0;

      // Obtener registros de peso más recientes
      const { data: weights, error: weightsError } = await supabase
        .from('weight_records')
        .select('weight, date, cow_id')
        .eq('business_id', businessId)
        .order('date', { ascending: false });

      if (weightsError && weightsError.code !== 'PGRST116') {
        throw weightsError;
      }

      const totalWeight = weights?.reduce((sum, record) => sum + (record.weight || 0), 0) || 0;
      const averageWeight = totalCattle > 0 ? totalWeight / totalCattle : 0;

      // Calcular ganancia diaria promedio (simulado por ahora)
      const averageDailyGain = 1.2; // kg por día

      setStats({
        totalCattle,
        totalWeight,
        averageWeight,
        averageDailyGain
      });
    } catch (error) {
      console.error('Error fetching fattening stats:', error);
      // Usar valores por defecto en caso de error
      setStats({
        totalCattle: 0,
        totalWeight: 0,
        averageWeight: 0,
        averageDailyGain: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCattle}</div>
          <p className="text-xs text-muted-foreground">
            Animales en engorde
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peso Promedio</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageWeight.toFixed(0)} kg</div>
          <p className="text-xs text-muted-foreground">
            Por animal
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Diaria</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageDailyGain.toFixed(1)} kg</div>
          <p className="text-xs text-muted-foreground">
            Promedio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWeight.toFixed(0)} kg</div>
          <p className="text-xs text-muted-foreground">
            Total del rebaño
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
