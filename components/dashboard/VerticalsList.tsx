"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Edit3, Trash2, Grid3X3, FileText } from "lucide-react";
import Link from "next/link";

interface Vertical {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  price?: number;
  active: boolean;
}

interface VerticalsListProps {
  verticals: Vertical[];
  businessId: string;
}

export default function VerticalsList({ verticals, businessId }: VerticalsListProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  // Funciones para los botones
  const handleUseTemplate = () => {
    setShowTemplates(true);
    // Aquí puedes agregar lógica adicional para mostrar modal de plantillas
    console.log("Abriendo plantillas...");
  };

  const handleAddVertical = () => {
    // Aquí puedes agregar lógica para agregar nuevo vertical
    console.log("Agregando nuevo vertical...");
    // Por ejemplo: router.push(`/business/${businessId}/verticals/new`);
  };

  if (verticals.length === 0 && !showTemplates) {
    return (
      <div className="w-full">
        {/* Estado vacío responsive */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-[#152241]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#152241] mb-2 sm:mb-3">
                No hay verticales creados
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Agrega un nuevo vertical o usa una plantilla prediseñada para comenzar
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  onClick={handleUseTemplate}
                  variant="outline"
                  className="w-full sm:w-auto border-[#152241]/20 text-[#152241] hover:bg-[#152241]/5 hover:border-[#152241]/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Usar plantilla
                </Button>
                <Button 
                  onClick={handleAddVertical}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-[#e5722a] hover:to-[#6bc5ca] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar vertical
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
      
      {/* Header de la tabla responsive */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-base sm:text-lg font-semibold text-[#152241] flex items-center justify-between">
            <span>Verticales Activos</span>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleUseTemplate}
                className="text-xs sm:text-sm border-[#152241]/20 text-[#152241] hover:bg-[#152241]/5 hover:border-[#152241]/30 transition-all duration-200 flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Usar plantilla</span>
                <span className="sm:hidden">Plantilla</span>
              </Button>
              <Button 
                size="sm"
                onClick={handleAddVertical}
                className="text-xs sm:text-sm bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-[#e5722a] hover:to-[#6bc5ca] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Agregar vertical</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {/* Tabla responsive */}
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
                          {vertical.price ? `$${vertical.price.toLocaleString()}` : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Link href={`/business/${businessId}/verticals/${vertical.id}`}>
                            <Button size="sm" variant="ghost" className="text-[#152241] hover:bg-[#152241]/5 transition-colors duration-200">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" className="text-[#fe8027] hover:bg-[#fe8027]/5 transition-colors duration-200">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 transition-colors duration-200">
                            <Trash2 className="w-4 h-4" />
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
                      {vertical.price ? `$${vertical.price.toLocaleString()}` : "—"}
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
                  <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50 transition-colors duration-200">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}