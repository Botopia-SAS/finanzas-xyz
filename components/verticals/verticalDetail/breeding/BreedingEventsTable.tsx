// components/verticals/verticalDetail/breeding/BreedingEventsTable.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreedingEventsTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function BreedingEventsTable({ businessId, verticalId, refreshTrigger, onRefresh }: BreedingEventsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos de Reproducción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Tabla de eventos de reproducción</p>
          <p className="text-sm mt-2">Próximamente disponible</p>
        </div>
      </CardContent>
    </Card>
  );
}
