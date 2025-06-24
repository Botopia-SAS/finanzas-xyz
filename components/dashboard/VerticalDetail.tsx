"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft} from "lucide-react";
import TabHeader from "./vertical-detail/tabs/TabHeader";
import OverviewTab from "./vertical-detail/tabs/OverviewTab";
import ConfigTab from "./vertical-detail/tabs/ConfigTab";
import ProductionTab from "./vertical-detail/tabs/ProductionTab";
import { 
  VerticalSchema, 
  DairyTemplateConfig, 
  EggTemplateConfig,
  Vertical,
  Movement
} from "./vertical-detail/types/interfaces";

interface VerticalDetailProps {
  vertical: Vertical;
  movements: Movement[];
}

export default function VerticalDetail({ vertical, movements }: VerticalDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  
  const [currentSchema, setCurrentSchema] = useState<VerticalSchema | null>(null);
  
  useEffect(() => {
    if (vertical?.variables_schema) {
      const baseSchema = vertical.variables_schema;
      
      if (baseSchema.type === 'dairy') {
        const normalizedSchema = {
          ...baseSchema,
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            trackIndividualProduction: true,
            productionFrequency: 'daily' as const,
            milkingTimes: 2,
            qualityMetrics: false,
            ...baseSchema.templateConfig
          } as DairyTemplateConfig
        } as VerticalSchema;
        setCurrentSchema(normalizedSchema);
      } else if (baseSchema.type === 'eggs') {
        const normalizedSchema = {
          ...baseSchema,
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            trackByType: true,
            eggGradingEnabled: false,
            collectionFrequency: 'daily' as const,
            qualityControl: false,
            ...baseSchema.templateConfig
          } as EggTemplateConfig
        } as VerticalSchema;
        setCurrentSchema(normalizedSchema);
      } else {
        setCurrentSchema(baseSchema);
      }
    }
  }, [vertical]);

  const renderActiveTab = () => {
    if (!currentSchema) return <div>Cargando...</div>;

    switch (activeTab) {
      case "overview":
        return <OverviewTab vertical={vertical} schema={currentSchema} movements={movements} />;
      case "edit":
        return <ConfigTab schema={currentSchema} verticalId={vertical.id} loading={false} />;
      case "production":
        return <ProductionTab vertical={vertical} schema={currentSchema} movements={movements} />;
      default:
        return <div>Pestaña no disponible</div>;
    }
  };

  if (!currentSchema) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#fe8027]/20 border-t-[#fe8027] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-[#152241] mb-2">Cargando configuración</h3>
          <p className="text-gray-500">Preparando tu vertical...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* ✨ Header del vertical mejorado */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banda superior con gradiente */}
          <div className="h-2 bg-gradient-to-r from-[#fe8027] to-[#7dd1d6]"></div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-4">
                {/* Botón volver mejorado */}
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#fe8027] transition-colors duration-200 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Volver
                </button>
                
                {/* Info del vertical */}
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 p-4 rounded-xl">
                    <div className="text-2xl">
                      {currentSchema?.type === 'dairy' ? '🥛' : 
                       currentSchema?.type === 'eggs' ? '🥚' : '📊'}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[#152241]">
                      {vertical.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {vertical.description || "Sin descripción"}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                        Activo
                      </span>
                      <span className="text-sm text-gray-500">
                        Tipo: {currentSchema?.type || 'Personalizado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats rápidas */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#fe8027]/5 to-[#7dd1d6]/5 px-4 py-3 rounded-xl border border-[#fe8027]/10 text-center">
                  <div className="text-lg font-bold text-[#152241]">
                    {movements.length}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Registros
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✨ Tabs mejoradas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
        
          <div className="p-6">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
}