import { useState, useMemo } from "react";
import { VerticalSchema, DairySchema, CowStats, CowData } from "../types/interfaces";

export const useCowAnalysis = (schema: VerticalSchema) => {
  const [selectedCow, setSelectedCow] = useState<CowData | null>(null);
  const [showCowModal, setShowCowModal] = useState(false);

  // Función para calcular tendencia
  const calculateTrend = (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length/2));
    const secondHalf = values.slice(Math.floor(values.length/2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (diff > 0.5) return 'increasing';
    if (diff < -0.5) return 'decreasing';
    return 'stable';
  };

  // Calcular datos de producción para cada vaca
  const cowStats = useMemo(() => {
    if (schema.type !== "dairy") {
      return [];
    }
    
    const dairySchema = schema as DairySchema;
    
    if (!dairySchema.cowProductionHistory?.length) {
      return [];
    }
    
    const cowStatsMap = new Map<string, CowStats>();
    
    dairySchema.cowProductionHistory.forEach((record) => {
      if (!record.production) return;
      
      record.production.forEach((cow) => {
        if (!cowStatsMap.has(cow.id)) {
          const cowInfo = dairySchema.inventory?.items?.find((c) => c.id === cow.id) || { 
            id: cow.id, 
            name: cow.name 
          };
          
          cowStatsMap.set(cow.id, { 
            id: cow.id,
            name: cow.name,
            records: [],
            avgProduction: 0,
            lastProduction: 0,
            trend: 'stable' as const,
            inProduction: cowInfo.inProduction !== false,
            comments: cowInfo.comments || ""
          });
        }
        
        cowStatsMap.get(cow.id)!.records.push({
          date: record.date,
          liters: cow.liters
        });
      });
    });
    
    return Array.from(cowStatsMap.values())
      .map((cow) => ({
        ...cow,
        avgProduction: cow.records.length > 0 ? 
          cow.records.reduce((sum, r) => sum + r.liters, 0) / cow.records.length : 0,
        lastProduction: cow.records.length > 0 ? 
          cow.records.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]?.liters || 0 : 0,
        trend: cow.records.length > 1 ? 
          calculateTrend(cow.records.map((r) => r.liters).slice(-7)) : 'stable' as const
      }))
      .sort((a, b) => b.avgProduction - a.avgProduction);
  }, [schema]);

  const handleCowClick = (cow: CowStats) => {
    const cowData: CowData = {
      id: cow.id,
      name: cow.name,
      production_average: cow.avgProduction,
      last_production: cow.lastProduction,
      trend: cow.trend,
      status: cow.inProduction ? 'active' : 'inactive',
      comments: cow.comments || ""
    };
    
    setSelectedCow(cowData);
    setShowCowModal(true);
  };

  const handleUpdateCow = (cowId: string, updates: Partial<CowData>) => {
    console.log("Actualizando vaca:", cowId, updates);
    if (selectedCow && selectedCow.id === cowId) {
      setSelectedCow(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // ✅ Agregar función para cerrar modal
  const closeCowModal = () => {
    setShowCowModal(false);
    setSelectedCow(null);
  };

  return {
    selectedCow,
    showCowModal,
    cowStats,
    handleCowClick,
    handleUpdateCow,
    closeCowModal // ✅ Exportar la función
  };
};