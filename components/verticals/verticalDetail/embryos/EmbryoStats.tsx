// components/verticals/verticalDetail/embryos/EmbryoStats.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EmbryoStatsProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
}

interface StatsData {
  totalEvents: number;
  successfulTransfers: number;
  successRate: number;
  activeTransfers: number;
}

export default function EmbryoStats({ businessId, verticalId, refreshTrigger }: EmbryoStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalEvents: 0,
    successfulTransfers: 0,
    successRate: 0,
    activeTransfers: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obtener eventos de embriones
      const { data: events, error: eventsError } = await supabase
        .from('embryo_events')
        .select('id, event_type')
        .eq('business_id', businessId);

      if (eventsError && eventsError.code !== 'PGRST116') {
        throw eventsError;
      }

      const totalEvents = events?.length || 0;
      const successfulTransfers = events?.filter(event => event.event_type === 'successful_transfer').length || 0;
      const successRate = totalEvents > 0 ? (successfulTransfers / totalEvents) * 100 : 0;
      const activeTransfers = events?.filter(event => event.event_type === 'transfer').length || 0;

      setStats({
        totalEvents,
        successfulTransfers,
        successRate,
        activeTransfers
      });
    } catch (error) {
      console.error('Error fetching embryo stats:', error);
      setStats({
        totalEvents: 0,
        successfulTransfers: 0,
        successRate: 0,
        activeTransfers: 0
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
          <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            Eventos registrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transferencias Exitosas</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successfulTransfers}</div>
          <p className="text-xs text-muted-foreground">
            Confirmadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Promedio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transferencias Activas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeTransfers}</div>
          <p className="text-xs text-muted-foreground">
            En proceso
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
