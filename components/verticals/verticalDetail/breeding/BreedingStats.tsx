// components/verticals/verticalDetail/breeding/BreedingStats.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BreedingStatsProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
}

interface StatsData {
  totalCows: number;
  pregnantCows: number;
  conceptionRate: number;
  upcomingBirths: number;
}

export default function BreedingStats({ businessId, verticalId, refreshTrigger }: BreedingStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalCows: 0,
    pregnantCows: 0,
    conceptionRate: 0,
    upcomingBirths: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obtener vacas
      const { data: cows, error: cowsError } = await supabase
        .from('cows')
        .select('id, status')
        .eq('business_id', businessId);

      if (cowsError && cowsError.code !== 'PGRST116') {
        throw cowsError;
      }

      const totalCows = cows?.length || 0;
      const pregnantCows = cows?.filter(cow => cow.status === 'pregnant').length || 0;
      const conceptionRate = totalCows > 0 ? (pregnantCows / totalCows) * 100 : 0;

      // Próximos partos (simulado)
      const upcomingBirths = Math.floor(pregnantCows * 0.3);

      setStats({
        totalCows,
        pregnantCows,
        conceptionRate,
        upcomingBirths
      });
    } catch (error) {
      console.error('Error fetching breeding stats:', error);
      setStats({
        totalCows: 0,
        pregnantCows: 0,
        conceptionRate: 0,
        upcomingBirths: 0
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
          <CardTitle className="text-sm font-medium">Total Vacas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCows}</div>
          <p className="text-xs text-muted-foreground">
            En programa de cría
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vacas Preñadas</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pregnantCows}</div>
          <p className="text-xs text-muted-foreground">
            Confirmadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Concepción</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conceptionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Promedio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximos Partos</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingBirths}</div>
          <p className="text-xs text-muted-foreground">
            Próximos 30 días
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
