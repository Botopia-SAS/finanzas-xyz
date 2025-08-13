// components/verticals/verticalDetail/breeding/BreedingDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Users, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Activity,
  BarChart3,
  Eye,
  Baby,
  ArrowLeft
} from "lucide-react";
import BreedingCowsTable from "./BreedingCowsTable";
import BreedingEventsTable from "./BreedingEventsTable";
import BreedingStats from "./BreedingStats";
import AddBreedingEventModal from "./AddBreedingEventModal";
import { useRouter } from "next/navigation";

interface BreedingDashboardProps {
  businessId: string;
  verticalId: string;
}

export default function BreedingDashboard({ businessId, verticalId }: BreedingDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Volver a Verticales</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cría</h1>
              <p className="text-gray-600">Gestión de reproducción y cría de ganado</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddEvent(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <BreedingStats businessId={businessId} verticalId={verticalId} refreshTrigger={refreshTrigger} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="cows" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vacas
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Servicio programado</span>
                    <span className="text-xs text-gray-500">En 2 días</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Chequeo de preñez</span>
                    <span className="text-xs text-gray-500">En 5 días</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasa de concepción</span>
                    <Badge variant="outline" className="text-green-600">78%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vacas preñadas</span>
                    <Badge variant="outline" className="text-blue-600">45</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cows">
          <BreedingCowsTable 
            businessId={businessId} 
            verticalId={verticalId} 
            refreshTrigger={refreshTrigger}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="events">
          <BreedingEventsTable 
            businessId={businessId} 
            verticalId={verticalId} 
            refreshTrigger={refreshTrigger}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tasa de Concepción por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de tasa de concepción mensual
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de distribución de eventos
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddBreedingEventModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        businessId={businessId}
        verticalId={verticalId}
        onSuccess={refreshData}
      />
    </div>
  );
}
