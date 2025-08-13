// components/verticals/verticalDetail/fattening/WeightRecordsTable.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeightRecordsTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function WeightRecordsTable({ businessId, verticalId, refreshTrigger, onRefresh }: WeightRecordsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Peso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Tabla de registros de peso</p>
          <p className="text-sm mt-2">Próximamente disponible</p>
        </div>
      </CardContent>
    </Card>
  );
}
