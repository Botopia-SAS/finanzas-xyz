// components/verticals/verticalDetail/embryos/EmbryoEventsTable.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmbryoEventsTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function EmbryoEventsTable({ businessId, verticalId, refreshTrigger, onRefresh }: EmbryoEventsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos de Embriones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Tabla de eventos de embriones</p>
          <p className="text-sm mt-2">Próximamente disponible</p>
        </div>
      </CardContent>
    </Card>
  );
}
