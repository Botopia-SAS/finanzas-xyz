// components/verticals/verticalDetail/fattening/FatteningCowsTable.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FatteningCowsTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function FatteningCowsTable({ businessId, verticalId, refreshTrigger, onRefresh }: FatteningCowsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganado en Engorde</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Tabla de ganado en engorde</p>
          <p className="text-sm mt-2">Próximamente disponible</p>
        </div>
      </CardContent>
    </Card>
  );
}
