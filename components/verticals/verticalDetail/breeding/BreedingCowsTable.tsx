// components/verticals/verticalDetail/breeding/BreedingCowsTable.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreedingCowsTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function BreedingCowsTable({ businessId, verticalId, refreshTrigger, onRefresh }: BreedingCowsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vacas en Programa de Cría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Tabla de vacas en programa de cría</p>
          <p className="text-sm mt-2">Próximamente disponible</p>
        </div>
      </CardContent>
    </Card>
  );
}
