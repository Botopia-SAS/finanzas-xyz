"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit3, Trash2, Grid3X3 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Vertical {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  price?: number;
  active: boolean;
  variables_schema?: {
    price?: number;
  };
}

interface VerticalsListProps {
  verticals: Vertical[];
  businessId: string;
  onVerticalDeleted?: () => void; // ✅ Para refrescar después de eliminar
}

export default function VerticalsList({ verticals, businessId, onVerticalDeleted }: VerticalsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ FUNCIÓN PARA ELIMINAR VERTICAL - CON MOVIMIENTOS
  const handleDeleteVertical = async (verticalId: string, verticalName: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar "${verticalName}"?\n\n` +
      `ATENCIÓN: Esto también eliminará TODOS los movimientos y producciones asociados.\n\n` +
      `Esta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    setDeletingId(verticalId);
    
    try {
      const supabase = createClient();
      
      console.log("🗑️ Eliminando vertical y sus movimientos:", verticalId);
      
      // ✅ PASO 1: Eliminar todos los movimientos del vertical
      console.log("🔥 Eliminando movimientos asociados...");
      const { error: movementsError } = await supabase
        .from("movements")
        .delete()
        .eq("vertical_id", verticalId);

      if (movementsError) {
        console.error("❌ Error eliminando movimientos:", movementsError);
        throw new Error(`Error eliminando movimientos: ${movementsError.message}`);
      }

      console.log("✅ Movimientos eliminados exitosamente");

      // ✅ PASO 2: Ahora eliminar el vertical
      console.log("🔥 Eliminando vertical...");
      const { error: verticalError } = await supabase
        .from("verticals")
        .delete()
        .eq("id", verticalId)
        .eq("business_id", businessId); // Seguridad extra

      if (verticalError) {
        console.error("❌ Error eliminando vertical:", verticalError);
        throw new Error(`Error eliminando vertical: ${verticalError.message}`);
      }

      console.log("✅ Vertical eliminado exitosamente");
      
      // Refrescar la lista
      onVerticalDeleted?.();
      
    } catch (err: any) {
      console.error("❌ Error completo eliminando:", err);
      alert(`Error al eliminar: ${err.message || 'Error desconocido'}`);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ ESTADO VACÍO - SIN HEADER
  if (verticals.length === 0) {
    return (
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-[#152241]" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#152241] mb-2 sm:mb-3">
              No hay verticales creados
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Usa el botón "Agregar vertical" de arriba para comenzar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ SOLO TABLA - SIN HEADER DUPLICADO
  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardContent className="p-0">
        {/* Desktop table */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verticals.map((vertical) => (
                  <tr key={vertical.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-[#152241]">{vertical.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {vertical.description || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vertical.unit || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#152241]">
                        {vertical.variables_schema?.price ? 
                          `$${(vertical.variables_schema.price * 100).toLocaleString()}` : 
                          "—"
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Link href={`/business/${businessId}/verticals/${vertical.id}`}>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-[#152241] hover:bg-[#152241]/5 transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[#fe8027] hover:bg-[#fe8027]/5 transition-colors duration-200"
                          title="Editar vertical"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        {/* ✅ BOTÓN ELIMINAR FUNCIONAL */}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:bg-red-50 transition-colors duration-200"
                          title="Eliminar vertical"
                          disabled={deletingId === vertical.id}
                          onClick={() => handleDeleteVertical(vertical.id, vertical.name)}
                        >
                          {deletingId === vertical.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {verticals.map((vertical) => (
            <div key={vertical.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-[#152241] truncate">
                    {vertical.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {vertical.description || "Sin descripción"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Unidad</span>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {vertical.unit || "—"}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Precio</span>
                  <div className="text-sm font-medium text-[#152241] mt-1">
                    {vertical.variables_schema?.price ? 
                      `$${(vertical.variables_schema.price * 100).toLocaleString()}` : 
                      "—"
                    }
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <Link href={`/business/${businessId}/verticals/${vertical.id}`}>
                  <Button size="sm" variant="outline" className="text-xs border-[#152241]/20 text-[#152241] hover:bg-[#152241]/5 transition-colors duration-200">
                    <Eye className="w-3 h-3 mr-1.5" />
                    Ver
                  </Button>
                </Link>
                <Button size="sm" variant="outline" className="text-xs border-[#fe8027]/20 text-[#fe8027] hover:bg-[#fe8027]/5 transition-colors duration-200">
                  <Edit3 className="w-3 h-3 mr-1.5" />
                  Editar
                </Button>
                {/* ✅ BOTÓN ELIMINAR MÓVIL */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs border-red-200 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  disabled={deletingId === vertical.id}
                  onClick={() => handleDeleteVertical(vertical.id, vertical.name)}
                >
                  {deletingId === vertical.id ? (
                    <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}