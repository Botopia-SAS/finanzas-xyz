// components/verticals/verticalDetail/VerticalDetailWrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import DairyDashboard from "./dairy/DairyDashboard";
import BreedingDashboard from "./breeding/BreedingDashboard";
import EmbryosDashboard from "./embryos/EmbryosDashboard";
import FatteningDashboard from "./fattening/FatteningDashboard";
import { createClient } from "@/lib/supabase/client";

interface VerticalDetailWrapperProps {
  businessId: string;
  verticalId: string;
}

interface Vertical {
  id: string;
  name: string;
  description?: string;
}

export default function VerticalDetailWrapper({ businessId, verticalId }: VerticalDetailWrapperProps) {
  const [vertical, setVertical] = useState<Vertical | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchVertical();
  }, [verticalId]);

  const fetchVertical = async () => {
    try {
      const { data, error } = await supabase
        .from('verticals')
        .select('id, name, description')
        .eq('id', verticalId)
        .single();

      if (error) throw error;
      setVertical(data);
    } catch (error) {
      console.error('Error fetching vertical:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vertical) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">No se pudo cargar la vertical</p>
      </div>
    );
  }

  // Renderizar el componente correspondiente según el nombre de la vertical
  switch (vertical.name.toLowerCase()) {
    case 'lechería':
      return <DairyDashboard businessId={businessId} verticalId={verticalId} />;
    
    case 'cría':
      return <BreedingDashboard businessId={businessId} verticalId={verticalId} />;
    
    case 'embriones':
      return <EmbryosDashboard businessId={businessId} verticalId={verticalId} />;
    
    case 'ceba':
    case 'ceba de ganado':
      return <FatteningDashboard businessId={businessId} verticalId={verticalId} />;
    
    default:
      return (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Vertical en Desarrollo
            </h3>
            <p className="text-yellow-700">
              La vertical &quot;{vertical.name}&quot; aún no tiene un dashboard específico implementado.
            </p>
            <p className="text-yellow-600 text-sm mt-2">
              Próximamente estará disponible con funcionalidades específicas para esta vertical.
            </p>
          </div>
        </div>
      );
  }
}
