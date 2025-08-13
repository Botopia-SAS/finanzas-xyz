// components/verticals/verticalDetail/dairy/DairyDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Update the import path below if your Tabs components are located elsewhere
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Milk, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Activity,
  BarChart3,
  Eye,
  Users,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import CowsTable from "./CowsTable";
import MilkRecordsTable from "./MilkRecordsTable";
import DairyStats from "./DairyStats";
import AddCowModal from "./AddCowModal";
import AddMilkRecordModal from "./AddMilkRecordModal";
import ExpensesTable from "./ExpensesTable";
import AddExpenseModal from "./AddExpenseModal";
import DairyDemoData from "./DairyDemoData";
import MilkPriceSettings from "./MilkPriceSettings";
import { useRouter } from "next/navigation";

interface DairyDashboardProps {
  businessId: string;
  verticalId: string;
}

export default function DairyDashboard({ businessId, verticalId }: DairyDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddCow, setShowAddCow] = useState(false);
  const [showAddMilkRecord, setShowAddMilkRecord] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 w-full">
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
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Milk className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Lechería</h1>
              <p className="text-base lg:text-lg text-gray-600">Gestión de vacas y producción láctea</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Button 
              onClick={() => setShowAddCow(true)} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-6"
            >
              <Plus className="h-4 w-4" />
              Agregar Vaca
            </Button>
            <Button 
              onClick={() => setShowAddMilkRecord(true)} 
              variant="outline" 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-6"
            >
              <Plus className="h-4 w-4" />
              Registro Ordeño
            </Button>
            <Button 
              onClick={() => setShowAddExpense(true)} 
              variant="outline" 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-11 px-6"
            >
              <Plus className="h-4 w-4" />
              Agregar Gasto
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DairyStats businessId={businessId} verticalId={verticalId} refreshTrigger={refreshTrigger} />

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 px-6 pt-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-12 p-1 bg-gray-100">
              <TabsTrigger value="overview" className="flex items-center justify-center gap-2 text-sm font-medium h-10">
                <Eye className="h-4 w-4" />
                <span>Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="cows" className="flex items-center justify-center gap-2 text-sm font-medium h-10">
                <Users className="h-4 w-4" />
                <span>Vacas</span>
              </TabsTrigger>
              <TabsTrigger value="milk" className="flex items-center justify-center gap-2 text-sm font-medium h-10">
                <Milk className="h-4 w-4" />
                <span>Producción</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center justify-center gap-2 text-sm font-medium h-10">
                <DollarSign className="h-4 w-4" />
                <span>Gastos</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center justify-center gap-2 text-sm font-medium h-10">
                <BarChart3 className="h-4 w-4" />
                <span>Análisis</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="text-sm font-medium text-gray-800">Nuevo registro de ordeño</span>
                        <span className="text-xs text-blue-600 font-medium">Hace 2 horas</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-sm font-medium text-gray-800">Vaca registrada</span>
                        <span className="text-xs text-green-600 font-medium">Ayer</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Tendencias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-sm font-medium text-gray-800">Producción diaria</span>
                        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 font-medium">+5.2%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="text-sm font-medium text-gray-800">Vacas productivas</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 font-medium">85%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="md:col-span-2 xl:col-span-1">
                  <MilkPriceSettings 
                    businessId={businessId} 
                    verticalId={verticalId} 
                    onPriceUpdate={refreshData}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cows" className="mt-0">
              <CowsTable 
                businessId={businessId} 
                verticalId={verticalId} 
                refreshTrigger={refreshTrigger}
                onRefresh={refreshData}
              />
            </TabsContent>

            <TabsContent value="milk" className="mt-0">
              <MilkRecordsTable 
                businessId={businessId} 
                verticalId={verticalId} 
                refreshTrigger={refreshTrigger}
                onRefresh={refreshData}
              />
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <ExpensesTable 
                businessId={businessId} 
                verticalId={verticalId} 
                refreshTrigger={refreshTrigger}
                onRefresh={refreshData}
                onAddExpense={() => setShowAddExpense(true)}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Producción por Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">Gráfico de producción semanal</p>
                        <p className="text-xs text-gray-400 mt-1">Próximamente disponible</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Rendimiento por Vaca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">Gráfico de rendimiento individual</p>
                        <p className="text-xs text-gray-400 mt-1">Próximamente disponible</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Modals */}
      <AddCowModal
        isOpen={showAddCow}
        onClose={() => setShowAddCow(false)}
        businessId={businessId}
        verticalId={verticalId}
        onSuccess={refreshData}
      />

      <AddMilkRecordModal
        isOpen={showAddMilkRecord}
        onClose={() => setShowAddMilkRecord(false)}
        businessId={businessId}
        verticalId={verticalId}
        onSuccess={refreshData}
        refreshTrigger={refreshTrigger}
      />

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        businessId={businessId}
        verticalId={verticalId}
        onSuccess={refreshData}
      />
    </div>
  );
}
