import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit3, Trash2, Eye } from "lucide-react";
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
  const router = useRouter();

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(business);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`¿Estás seguro de que quieres eliminar "${business.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const supabase = createClient();
      
      // Eliminar negocio
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', business.id);

      if (error) throw error;

      // Notificar al componente padre
      onDelete?.(business.id);
      
      // Refrescar la página
      router.refresh();
      
    } catch (error) {
      console.error('Error eliminando negocio:', error);
      alert('Error al eliminar el negocio');
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
    <div className="group relative bg-white rounded-lg shadow hover:shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.02]">
      {/* Imagen con overlay */}
      <div className="relative">
        {business.image_url ? (
          <div className="relative h-32 overflow-hidden">
            <Image
              src={business.image_url}
              alt={business.name}
              width={400}
              height={128}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-70"
              priority={false}
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
                  className="bg-blue-500/90 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                  title="Editar negocio"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleDelete}
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
          // Si no hay imagen, mostrar un placeholder con el mismo efecto
          <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 transition-all duration-300 group-hover:from-gray-200 group-hover:to-gray-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-400 group-hover:text-gray-500 transition-colors duration-300">
                {business.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            {/* Overlay para cards sin imagen */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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
                  className="bg-blue-500/90 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                  title="Editar negocio"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleDelete}
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
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
            {business.name}
          </h2>
          <p className="text-sm text-gray-500 capitalize">{business.type}</p>
          {business.description && (
            <p className="mt-2 text-sm text-gray-700 line-clamp-2">
              {business.description}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}