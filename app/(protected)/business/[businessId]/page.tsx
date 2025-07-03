"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import BusinessChart from "@/components/dashboard/BusinessChart";
import Modal from "@/components/dashboard/Modal";
import MovementForm from "@/components/dashboard/MovementForm";
import { ArrowRight, PlusCircle, Users, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url?: string;
  unit?: string;
}

interface Metrics {
  ingresos: number;
  gastos: number;
  rentabilidad: number;
}

interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  kind?: string;
  vertical_id?: string | null;
}

export default function BusinessDashboardPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    ingresos: 0,
    gastos: 0,
    rentabilidad: 0,
  });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "month" | "year" | "custom">("month");
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Función para obtener imagen por defecto según el tipo
  const getDefaultImage = (businessType: string) => {
    const defaultImages = {
      "Agricultura": "🌾",
      "Tecnologia": "💻", 
      "Lecheria": "🥛",
      "Otro": "🏢"
    };
    return defaultImages[businessType as keyof typeof defaultImages] || defaultImages["Otro"];
  };

  // Verificar si es una imagen personalizada o por defecto
  const isDefaultImage = (url?: string) => {
    if (!url) return true;
    return url.includes('/images/') && url.includes('-default.jpg');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: b, error: businessError } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", businessId)
          .single();
          
        if (businessError) {
          console.error("Error cargando negocio:", businessError);
          return;
        }
        
        setBusiness(b);

        let fromDate = new Date();
        if (filter === "today") {
          fromDate = new Date();
          fromDate.setHours(0, 0, 0, 0);
        } else if (filter === "month") {
          fromDate.setMonth(fromDate.getMonth() - 1);
        } else if (filter === "year") {
          fromDate.setFullYear(fromDate.getFullYear() - 1);
        }
        
        const { data: movs, error: movsError } = await supabase
          .from("movements")
          .select("*")
          .eq("business_id", businessId)
          .gte("date", fromDate.toISOString().split("T")[0])
          .order("date", { ascending: false });
        
        if (movsError) {
          console.error("Error cargando movimientos:", movsError);
        }
        
        const allMovements = movs || [];
        setMovements(allMovements);
        
        if (allMovements.length > 0) {
          const ingresos: number = allMovements
            .filter((m: Movement) => m.type === "ingreso")
            .reduce((sum: number, m: Movement) => sum + m.amount, 0);
          
          const gastos = allMovements
            .filter((m: Movement) => m.type === "gasto")
            .reduce((sum: number, m: Movement) => sum + m.amount, 0);

          // ✅ Rentabilidad correcta: (ingresos + gastos) / |gastos| * 100
          const rentabilidad = gastos !== 0
            ? Math.round(((ingresos + gastos) / Math.abs(gastos)) * 100)
            : 0;
          
          setMetrics({
            ingresos,
            gastos,
            rentabilidad
          });
        }
        
        setRecentMovements(allMovements.slice(0, 5));
      } catch (error) {
        console.error("Error general cargando datos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [businessId, filter, refreshTrigger]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg max-w-sm w-full">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#fe8027]/20 border-t-[#fe8027] mx-auto mb-4"></div>
          <h3 className="text-base sm:text-lg font-semibold text-[#152241] mb-2">Cargando negocio</h3>
          <p className="text-sm text-gray-500">Preparando información...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl sm:text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#152241] mb-2">Negocio no encontrado</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">No pudimos encontrar la información de este negocio.</p>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-[#e5722a] hover:to-[#6bc5ca] text-white"
            onClick={() => router.push('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full max-w-full mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* ✨ Header del negocio responsive - SIN BARRA DE COLOR */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              
              {/* Imagen del negocio */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
                {business.image_url && !imageError && !isDefaultImage(business.image_url) ? (
                  <div className="relative w-full h-full overflow-hidden rounded-lg sm:rounded-xl border-2 border-gray-100">
                    <Image
                      src={business.image_url}
                      alt={business.name}
                      fill
                      sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#fe8027]/10 to-[#7dd1d6]/10 rounded-lg sm:rounded-xl border-2 border-[#fe8027]/20 flex items-center justify-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl">
                      {getDefaultImage(business.type)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Info del negocio */}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#152241] mb-2 truncate">
                  {business.name}
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3">
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 text-[#152241] border border-[#fe8027]/20">
                    {business.type}
                  </span>
                 
                </div>
                {business.description && (
                  <p className="text-gray-600 text-sm sm:text-base max-w-2xl line-clamp-2">
                    {business.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✨ Métricas responsive: 2x2 móvil, 1x4 desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          
          {/* Ingresos */}
          <Card className="bg-white border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#fe8027] to-[#fe8027]/70"></div>
            <CardHeader className="pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="bg-[#fe8027]/10 p-1.5 sm:p-2 rounded-lg">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#fe8027]" />
                </div>
                <span className="leading-tight">Ingresos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#152241] break-words">
                ${metrics.ingresos.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          {/* Gastos */}
          <Card className="bg-white border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#7dd1d6] to-[#7dd1d6]/70"></div>
            <CardHeader className="pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="bg-[#7dd1d6]/10 p-1.5 sm:p-2 rounded-lg">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#7dd1d6]" />
                </div>
                <span className="leading-tight">Gastos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#152241] break-words">
                ${metrics.gastos.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          {/* Rentabilidad */}
          <Card className="bg-white border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className={`h-1 ${metrics.rentabilidad >= 0 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
              : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}></div>
            <CardHeader className="pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className={`p-1.5 sm:p-2 rounded-lg ${metrics.rentabilidad >= 0 
                  ? 'bg-emerald-100' 
                  : 'bg-red-100'
                }`}>
                  <DollarSign className={`w-3 h-3 sm:w-4 sm:h-4 ${metrics.rentabilidad >= 0 
                    ? 'text-emerald-600' 
                    : 'text-red-600'
                  }`} />
                </div>
                <span className="leading-tight">Rentabilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                metrics.rentabilidad >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {metrics.rentabilidad > 0 ? '+' : ''}{metrics.rentabilidad}%
              </div>
            </CardContent>
          </Card>

          {/* Colaboradores */}
          <Card className="bg-white border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group"
                onClick={() => router.push(`/business/${businessId}/collaborators`)}>
            <div className="h-1 bg-gradient-to-r from-[#152241] to-[#1a2a52]"></div>
            <CardHeader className="pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="bg-[#152241]/10 p-1.5 sm:p-2 rounded-lg">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#152241]" />
                  </div>
                  <span className="leading-tight">Equipo</span>
                </div>
                <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  3 activos
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-[#152241] mb-1 truncate">
                    Colaboradores
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    Gestionar permisos y roles
                  </p>
                </div>
                <div className="bg-gray-100 group-hover:bg-[#152241] group-hover:text-white p-2 rounded-full transition-all duration-200 ml-2">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel principal: gráfico y movimientos - Completamente responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Gráfico */}
          <div className="xl:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-100">
              <h2 className="font-bold text-base sm:text-lg text-[#152241]">Resumen Financiero</h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  variant={filter === "today" ? "default" : "outline"}
                  onClick={() => setFilter("today")}
                  size="sm"
                  className={`text-xs flex-1 sm:flex-none min-w-0 ${filter === "today" 
                    ? "bg-[#152241] hover:bg-[#1a2a52] text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Hoy
                </Button>
                <Button
                  variant={filter === "month" ? "default" : "outline"}
                  onClick={() => setFilter("month")}
                  size="sm"
                  className={`text-xs flex-1 sm:flex-none min-w-0 ${filter === "month" 
                    ? "bg-[#152241] hover:bg-[#1a2a52] text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Mes
                </Button>
                <Button
                  variant={filter === "year" ? "default" : "outline"}
                  onClick={() => setFilter("year")}
                  size="sm"
                  className={`text-xs flex-1 sm:flex-none min-w-0 ${filter === "year" 
                    ? "bg-[#152241] hover:bg-[#1a2a52] text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Año
                </Button>
              </div>
            </div>
            
            <div className="h-64 sm:h-72 lg:h-80 xl:h-96 p-4 sm:p-6">
              <BusinessChart movements={movements} period={filter} />
            </div>
          </div>
          
          {/* Movimientos recientes */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100">
              <h2 className="font-bold text-base sm:text-lg text-[#152241] truncate">Movimientos Recientes</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push(`/business/${businessId}/movements`)}
                className="text-[#fe8027] hover:text-[#e5722a] hover:bg-[#fe8027]/5 p-1 sm:p-2 flex items-center flex-shrink-0"
              >
                <span className="hidden sm:inline mr-1 text-xs">Ver todos</span>
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentMovements.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-gray-500">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#152241]" />
                  </div>
                  <p className="mb-4 text-sm sm:text-base text-[#152241] font-medium">No hay movimientos registrados</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setMoveModalOpen(true)}
                    className="w-full sm:w-auto border-[#fe8027]/30 text-[#152241] hover:bg-[#fe8027]/5 hover:border-[#fe8027]/50 text-xs sm:text-sm"
                  >
                    + Agregar movimiento
                  </Button>
                </div>
              ) : (
                <ul className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {recentMovements.map((mov) => (
                    <li
                      key={mov.id}
                      className="flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          mov.type === "ingreso" 
                            ? "bg-[#fe8027]/10 text-[#fe8027]" 
                            : "bg-[#7dd1d6]/10 text-[#7dd1d6]"
                        }`}>
                          {mov.type === "ingreso" ? (
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm lg:text-base text-[#152241] truncate">
                            {mov.kind || (mov.type === "ingreso" ? "Ingreso" : "Gasto")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(mov.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs sm:text-sm lg:text-base font-semibold flex-shrink-0 ml-2 ${
                        mov.type === "ingreso" ? "text-[#fe8027]" : "text-[#7dd1d6]"
                      }`}>
                        {mov.type === "ingreso" ? "+" : "-"}${Math.abs(mov.amount).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Modal para agregar movimiento */}
        <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)}>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#152241] mb-4">Nuevo Movimiento</h2>
            <MovementForm 
              businessId={businessId as string} 
              onComplete={(newMovement) => {
                setMoveModalOpen(false);
                
                if (newMovement && newMovement.id) {
                  setRecentMovements(prev => [newMovement as Movement, ...prev].slice(0, 5));
                  
                  setMetrics(prev => {
                    const newIngresos = newMovement.type === "ingreso" 
                      ? prev.ingresos + newMovement.amount 
                      : prev.ingresos;
                      
                    const newGastos = newMovement.type === "gasto" 
                      ? prev.gastos + newMovement.amount 
                      : prev.gastos;
                      
                    // ✅ Rentabilidad correcta: (ingresos + gastos) / |gastos| * 100
                    const newRentabilidad = newGastos !== 0 
                      ? Math.round(((newIngresos + newGastos) / Math.abs(newGastos)) * 100) 
                      : 0;
                      
                    return {
                      ingresos: newIngresos,
                      gastos: newGastos,
                      rentabilidad: newRentabilidad
                    };
                  });
                  
                  if (newMovement.id) {
                    setMovements(prev => [newMovement as Movement, ...prev]);
                  }
                } else {
                  setRefreshTrigger(prev => prev + 1);
                }
              }} 
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}