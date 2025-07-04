"use client";

import { useEffect, useState } from "react";
import BusinessLayout from "@/components/BusinessLayout";
import { createClient } from "@/lib/supabase/client";
import VerticalsList from "@/components/dashboard/VerticalsList";
import Link from "next/link";
import { ArrowLeft, Grid3X3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/dashboard/Modal";
import VerticalForm from "@/components/dashboard/VerticalForm";

interface Vertical {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  price?: number;
  active: boolean;
}

export default function VerticalsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const [businessId, setBusinessId] = useState<string>("");
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Resolver params y cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        setBusinessId(resolvedParams.businessId);
        
        const supabase = createClient();
        
        const { data: verticalsData, error: verticalsError } = await supabase
          .from("verticals")
          .select("*")
          .eq("business_id", resolvedParams.businessId)
          .eq("active", true)
          .neq("is_system", true)
          .order("created_at", { ascending: false });
        
        if (verticalsError) {
          setError("No se pudieron cargar los verticales");
          console.error("Error loading verticals:", verticalsError);
        } else {
          setVerticals(verticalsData || []);
        }
      } catch (err) {
        setError("Error al cargar la página");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  // Funciones para los botones del header
  const handleAddVertical = () => {
    setShowCreateModal(true);
    console.log("🔥 Abriendo modal desde HEADER para crear vertical...");
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refreshVerticals(); // ✅ Usar refresh en lugar de window.location.reload()
  };

  // En page.tsx, asegurar que refreshVerticals funcione:
  const refreshVerticals = async () => {
    try {
      console.log("🔄 Refrescando verticales para business:", businessId);
      
      const supabase = createClient();
      
      const { data: verticalsData, error: verticalsError } = await supabase
        .from("verticals")
        .select("*")
        .eq("business_id", businessId)
        .eq("active", true)
        .neq("is_system", true)
        .order("created_at", { ascending: false });
      
      if (verticalsError) {
        console.error("❌ Error reloading verticals:", verticalsError);
      } else {
        console.log("✅ Verticales recargados:", verticalsData);
        setVerticals(verticalsData || []);
      }
    } catch (err) {
      console.error("❌ Error en refreshVerticals:", err);
    }
  };

  if (loading) {
    return (
      <BusinessLayout businessId={businessId}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#fe8027] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando verticales...</p>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  if (error) {
    return (
      <BusinessLayout businessId={businessId}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
          <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl sm:text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#152241] mb-2">
              Error al cargar
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-[#e5722a] hover:to-[#6bc5ca] text-white"
              onClick={() => window.history.back()}
            >
              Volver atrás
            </Button>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout businessId={businessId}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="w-full max-w-full mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* ✨ Header completamente responsive */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
                
                {/* Breadcrumb */}
                <Link 
                  href={`/business/${businessId}`}
                  className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-500 hover:text-[#fe8027] transition-colors duration-200 group w-fit"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Volver al negocio
                </Link>
                
                {/* Header principal responsive */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                  
                  {/* Título e icono */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 p-2.5 sm:p-3 lg:p-4 rounded-xl">
                      <Grid3X3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#152241]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#152241] mb-1 sm:mb-2">
                        Verticales Activos
                      </h1>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                        Administra las líneas de negocio de tu empresa
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats y acciones responsive */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6">
                    
                    {/* Stats card */}
                    <div className="bg-gradient-to-r from-[#fe8027]/5 to-[#7dd1d6]/5 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-[#fe8027]/10 text-center sm:text-left">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#152241]">
                        {verticals?.length || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
                        Verticales
                      </div>
                    </div>
                    
                    {/* ✅ BOTONES FUNCIONALES */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button 
                        onClick={handleAddVertical}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-[#e5722a] hover:to-[#6bc5ca] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Agregar vertical
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lista de verticales con espaciado responsive */}
          <div className="w-full">
            <VerticalsList 
              verticals={verticals || []} 
              businessId={businessId}
              onVerticalDeleted={refreshVerticals} // ✅ Agregar callback
            />
          </div>
        </div>

        {/* ✅ MODAL DEL HEADER */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">🚀 Crear Nuevo Vertical (Header)</h2>
            <VerticalForm
              businessId={businessId}
             
              onCreated={handleCreateSuccess}
            />
          </div>
        </Modal>
      </div>
    </BusinessLayout>
  );
}
