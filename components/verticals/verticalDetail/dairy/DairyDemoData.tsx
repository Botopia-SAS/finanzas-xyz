// components/verticals/verticalDetail/dairy/DairyDemoData.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  Database, 
  AlertCircle
} from "lucide-react";

interface DairyDemoDataProps {
  onCreateTables?: () => void;
}

export default function DairyDemoData({ onCreateTables }: DairyDemoDataProps) {
  return (
    <div className="space-y-6">
      {/* Información sobre el estado de la base de datos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="h-5 w-5" />
            Estado de la Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">
              Las tablas de lechería aún no existen en la base de datos.
            </span>
          </div>
          
          <div className="text-sm text-blue-600">
            <p className="mb-2">Para utilizar esta funcionalidad, necesitas crear las siguientes tablas:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>cows</code> - Información de las vacas</li>
              <li><code>milk_records</code> - Registros de ordeño</li>
            </ul>
          </div>

          {onCreateTables && (
            <Button 
              onClick={onCreateTables}
              className="mt-4"
              variant="outline"
            >
              Crear Tablas de Ejemplo
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Datos de ejemplo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vacas</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">0</div>
            <p className="text-xs text-muted-foreground">
              Sin datos disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción Diaria</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">0 L</div>
            <p className="text-xs text-muted-foreground">
              Sin registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción Semanal</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">0 L</div>
            <p className="text-xs text-muted-foreground">
              Sin registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Vaca</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">0 L</div>
            <p className="text-xs text-muted-foreground">
              Sin datos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ejemplo de tabla vacía */}
      <Card>
        <CardHeader>
          <CardTitle>Vacas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-gray-500 mb-4">
              Una vez que se creen las tablas, podrás ver aquí la información de las vacas.
            </p>
            <Badge variant="outline" className="text-gray-500">
              Esperando configuración de base de datos
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
