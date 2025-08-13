// components/verticals/verticalDetail/fattening/FatteningDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, 
  Users, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Activity,
  BarChart3,
  Eye,
  ArrowLeft
} from "lucide-react";
import FatteningCowsTable from "./FatteningCowsTable";
import WeightRecordsTable from "./WeightRecordsTable";
import FatteningStats from "./FatteningStats";
import AddWeightRecordModal from "./AddWeightRecordModal";
import { useRouter } from "next/navigation";

interface FatteningDashboardProps {
  businessId: string;
  verticalId: string;
}

export default function FatteningDashboard({ businessId, verticalId }: FatteningDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddRecord, setShowAddRecord] = useState(false);
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Scale className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ceba</h1>
              <p className="text-gray-600">Gestión de engorde y control de peso</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddRecord(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Registro de Peso
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <FatteningStats businessId={businessId} verticalId={verticalId} refreshTrigger={refreshTrigger} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="cattle" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ganado
          </TabsTrigger>
          <TabsTrigger value="weights" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Pesos
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
                  Próximos Pesajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Pesaje semanal</span>
                    <span className="text-xs text-gray-500">En 2 días</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Evaluación mensual</span>
                    <span className="text-xs text-gray-500">En 1 semana</span>
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
                    <span className="text-sm">Ganancia diaria promedio</span>
                    <Badge variant="outline" className="text-green-600">1.2 kg</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Animales en engorde</span>
                    <Badge variant="outline" className="text-blue-600">156</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cattle">
          <FatteningCowsTable 
            businessId={businessId} 
            verticalId={verticalId} 
            refreshTrigger={refreshTrigger}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="weights">
          <WeightRecordsTable 
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
                <CardTitle>Ganancia de Peso por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de ganancia de peso mensual
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Pesos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Gráfico de distribución de pesos
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddWeightRecordModal
        isOpen={showAddRecord}
        onClose={() => setShowAddRecord(false)}
        businessId={businessId}
        verticalId={verticalId}
        onSuccess={refreshData}
      />
    </div>
  );
}
