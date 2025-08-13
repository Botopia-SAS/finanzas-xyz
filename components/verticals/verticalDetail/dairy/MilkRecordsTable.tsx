// components/verticals/verticalDetail/dairy/MilkRecordsTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Milk,
  Calendar,
  Search,
  MoreVertical
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MilkRecord {
  id: string;
  cow_id: string;
  date: string;
  liters: number;
  quality: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  cow?: {
    tag: string;
    name: string;
  };
}

interface MilkRecordsTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function MilkRecordsTable({ businessId, verticalId, refreshTrigger, onRefresh }: MilkRecordsTableProps) {
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchRecords();
  }, [refreshTrigger]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      // Primero obtenemos los registros de leche
      const { data: milkData, error: milkError } = await supabase
        .from('livestock_milk_records')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (milkError) {
        console.error('Error fetching milk records:', milkError);
        // Si la tabla no existe, usar array vacío
        if (milkError.code === 'PGRST116' || milkError.code === '42P01') {
          setRecords([]);
          return;
        }
        throw milkError;
      }

      // Luego obtenemos la información de las vacas
      const { data: cowsData, error: cowsError } = await supabase
        .from('livestock_cows')
        .select('id, tag, name')
        .eq('business_id', businessId);

      if (cowsError) {
        console.error('Error fetching cows:', cowsError);
      }

      // Combinamos los datos
      const recordsWithCows = (milkData || []).map(record => {
        const cow = cowsData?.find(c => c.id === record.cow_id);
        return {
          ...record,
          cow: cow ? { tag: cow.tag, name: cow.name } : null
        };
      });

      setRecords(recordsWithCows);
    } catch (error) {
      console.error('Error fetching milk records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;

    try {
      const { error } = await supabase
        .from('livestock_milk_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error al eliminar el registro');
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'A':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Excelente (A)</Badge>;
      case 'B':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Buena (B)</Badge>;
      case 'C':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Regular (C)</Badge>;
      default:
        return <Badge variant="outline">Sin definir</Badge>;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.cow?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cow?.tag.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || record.date.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getTotalLiters = () => {
    return filteredRecords.reduce((sum, record) => sum + record.liters, 0);
  };

  const getAverageLiters = () => {
    if (filteredRecords.length === 0) return 0;
    return getTotalLiters() / filteredRecords.length;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registros de Ordeño</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Registros de Ordeño ({filteredRecords.length})</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por vaca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Registros</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{getTotalLiters().toFixed(1)}L</div>
            <div className="text-xs sm:text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{getAverageLiters().toFixed(1)}L</div>
            <div className="text-xs sm:text-sm text-gray-600">Promedio</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {filteredRecords.filter(r => r.quality === 'A').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Excelentes</div>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || dateFilter ? 'No se encontraron registros con esos criterios' : 'No hay registros de ordeño'}
          </div>
        ) : (
          <>
            {/* Vista de escritorio */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Fecha</th>
                    <th className="text-left py-2 px-4 font-medium">Vaca</th>
                    <th className="text-left py-2 px-4 font-medium">Etiqueta</th>
                    <th className="text-left py-2 px-4 font-medium">Litros</th>
                    <th className="text-left py-2 px-4 font-medium">Calidad</th>
                    <th className="text-left py-2 px-4 font-medium">Notas</th>
                    <th className="text-left py-2 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(record.date)}</td>
                      <td className="py-3 px-4 font-medium">{record.cow?.name || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono">{record.cow?.tag || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Milk className="h-4 w-4 text-blue-600" />
                          {record.liters}L
                        </div>
                      </td>
                      <td className="py-3 px-4">{getQualityBadge(record.quality)}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={record.notes || ''}>
                          {record.notes || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Edit record */}}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista móvil */}
            <div className="md:hidden space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{record.cow?.name || 'N/A'}</h3>
                      <p className="text-sm text-gray-600 font-mono">#{record.cow?.tag || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === record.id ? null : record.id);
                        }}
                        className="h-8 w-8 p-0"
                        title="Opciones"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openMenuId === record.id && (
                        <div 
                          className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 min-w-[120px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                /* TODO: Edit record */
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(record.id);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Litros:</span>
                        <div className="flex items-center gap-1">
                          <Milk className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold">{record.liters}L</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Calidad:</span>
                        <div>{getQualityBadge(record.quality)}</div>
                      </div>
                    </div>
                    {record.notes && (
                      <div>
                        <span className="text-gray-500">Notas:</span>
                        <p className="text-sm mt-1 break-words">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
