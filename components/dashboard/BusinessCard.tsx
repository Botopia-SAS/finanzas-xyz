import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit3, Trash2, Eye, AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface Business {
  id: string;
  name: string;
  type: string;
  description?: string;
  image_url?: string;
  owner_id: string;
}

interface BusinessCardProps {
  business: Business;
  onEdit?: (business: Business) => void;
  onDelete?: (businessId: string) => void;
}

export default function BusinessCard({ business, onEdit, onDelete }: BusinessCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Función para obtener imagen por defecto según el tipo
  const getDefaultImage = (businessType: string) => {
    const defaultImages = {
      "Agricultura": "🌾",
      "Tecnologia": "💻", 
      "Otro": "🏢"
    };
    return defaultImages[businessType as keyof typeof defaultImages] || defaultImages["Otro"];
  };

  // Verificar si es una imagen personalizada o por defecto
  const isDefaultImage = (url?: string) => {
    if (!url) return true;
    return url.includes('/images/') && url.includes('-default.jpg');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(business);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    try {
      const supabase = createClient();
      
      console.log('🗑️ Iniciando eliminación del negocio:', business.name);
      
      // ✅ Eliminar paso a paso con logs detallados
      const steps = [
        { name: 'movimientos', table: 'movements' },
        { name: 'verticales', table: 'verticals' },
      ];
      
      for (const step of steps) {
        console.log(`Eliminando ${step.name}...`);
        
        const { error } = await supabase
          .from(step.table)
          .delete()
          .eq('business_id', business.id);
        
        if (error) {
          console.error(`Error eliminando ${step.name}:`, error);
          throw new Error(`Error eliminando ${step.name}: ${error.message || 'Error desconocido'}`);
        }
        
        console.log(`✅ ${step.name} eliminados`);
      }
      
      // Eliminar el negocio
      console.log('Eliminando negocio...');
      const { error: businessError } = await supabase
        .from('businesses')
        .delete()
        .eq('id', business.id);

      if (businessError) {
        console.error('Error eliminando negocio:', businessError);
        throw new Error(`Error eliminando negocio: ${businessError.message || 'Error desconocido'}`);
      }

      console.log('✅ Negocio eliminado exitosamente');
      setShowDeleteModal(false);
      onDelete?.(business.id);
      window.location.reload();
      
    } catch (error) {
      console.error('💥 Error eliminando negocio:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al eliminar el negocio';
      
      alert(`❌ ${errorMessage}\n\nPor favor intenta de nuevo.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/business/${business.id}`);
  };

  return (
    <>
      <div className="group relative bg-white rounded-lg shadow hover:shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.02]">
        {/* Imagen con overlay */}
        <div className="relative">
          {business.image_url && !imageError && !isDefaultImage(business.image_url) ? (
            // ✨ Imagen personalizada cargada
            <div className="relative h-32 overflow-hidden">
              <Image
                src={business.image_url}
                alt={business.name}
                width={400}
                height={128}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-70"
                priority={false}
                onError={() => setImageError(true)}
              />
              
              {/* Overlay con botones que aparece al hacer hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={handleView}
                    className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                    title="Ver negocio"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleEdit}
                    className="bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-orange-600 hover:to-blue-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                    title="Editar negocio"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar negocio"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ✨ Imagen por defecto - Diseño elegante con emoji
            <div className="relative h-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-all duration-300 group-hover:from-blue-100 group-hover:via-purple-100 group-hover:to-pink-100">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  {getDefaultImage(business.type)}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {business.type}
                </div>
              </div>
              
              {/* Patrón decorativo sutil */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-2 w-6 h-6 border border-current rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border border-current rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-current rounded-full"></div>
              </div>
              
              {/* Overlay para imagen por defecto */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={handleView}
                    className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                    title="Ver negocio"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleEdit}
                    className="bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-orange-600 hover:to-blue-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                    title="Editar negocio"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar negocio"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido del card */}
        <Link href={`/business/${business.id}`}>
          <div className="p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200">
                {business.name}
              </h2>
             
            </div>
            <p className="text-sm text-gray-500 capitalize mt-1">{business.type}</p>
            {business.description && (
              <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                {business.description}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* ✨ Modal de confirmación personalizado - VERSIÓN SUTIL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl transform transition-all">
            {/* Header del modal - MINIMALISTA */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 p-2 rounded-full mr-3">
                    <AlertTriangle className="h-6 w-6 text-[#fe8027]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#152241]">Eliminar Negocio</h3>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-[#152241] transition-colors p-1 hover:bg-gray-100 rounded-full"
                  disabled={isDeleting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-8 w-8 text-[#152241]" />
                </div>
                <h4 className="text-xl font-bold text-[#152241] mb-2">
                  ¿Estás seguro?
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Vas a eliminar el negocio <span className="font-semibold text-[#152241]">&quot;{business.name}&quot;</span>
                </p>
              </div>

              {/* Lista de lo que se eliminará - MÁS SUTIL */}
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200/50 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-[#152241] mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-[#fe8027]" />
                  Esta acción eliminará:
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#fe8027] rounded-full mr-2"></span>
                    Todos los movimientos financieros
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#7dd1d6] rounded-full mr-2"></span>
                    Todas las verticales del negocio
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#fe8027] rounded-full mr-2"></span>
                    Todo el inventario asociado
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#7dd1d6] rounded-full mr-2"></span>
                    Toda la información del negocio
                  </li>
                </ul>
                <div className="mt-3 flex items-center text-xs text-[#152241] font-medium bg-white/50 rounded-md p-2">
                  <AlertTriangle className="h-3 w-3 mr-1 text-[#fe8027]" />
                  Esta acción no se puede deshacer
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-[#152241] font-medium rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Trash2 className="h-5 w-5 mr-2" />
                      Sí, Eliminar
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}