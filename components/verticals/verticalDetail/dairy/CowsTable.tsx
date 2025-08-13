// components/verticals/verticalDetail/dairy/CowsTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Search
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CowHistoryModal from "./CowHistoryModal";

interface Cow {
  id: string;
  tag: string;
  name: string;
  breed: string;
  birth_date: string;
  status: string;
  mother_id?: string;
  father_id?: string;
  acquisition_date: string;
  precio?: number; // Nuevo campo precio
  created_at: string;
  updated_at: string;
}

interface CowsTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function CowsTable({ businessId, verticalId, refreshTrigger, onRefresh }: CowsTableProps) {
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchCows();
  }, [refreshTrigger]);

  const fetchCows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('livestock_cows')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cows:', error);
        // Si la tabla no existe, usar array vacío
        if (error.code === 'PGRST116' || error.code === '42P01') {
          setCows([]);
          return;
        }
        throw error;
      }
      setCows(data || []);
    } catch (error) {
      console.error('Error fetching cows:', error);
      setCows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cowId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta vaca?')) return;

    try {
      const { error } = await supabase
        .from('livestock_cows')
        .delete()
        .eq('id', cowId);

      if (error) throw error;
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting cow:', error);
      alert('Error al eliminar la vaca');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status || 'active') {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activa</Badge>;
      case 'pregnant':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Preñada</Badge>;
      case 'dry':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Seca</Badge>;
      case 'sick':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Enferma</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const filteredCows = cows.filter(cow => 
    (cow.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cow.tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cow.breed || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} años ${months > 0 ? `${months} meses` : ''}`;
    } else {
      return `${months} meses`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vacas</CardTitle>
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
        <div className="flex items-center justify-between">
          <CardTitle>Vacas ({filteredCows.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vacas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron vacas con ese criterio' : 'No hay vacas registradas'}
          </div>
        ) : (
          <>
            {/* Vista de escritorio */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Etiqueta</th>
                    <th className="text-left py-2 px-4 font-medium">Nombre</th>
                    <th className="text-left py-2 px-4 font-medium">Raza</th>
                    <th className="text-left py-2 px-4 font-medium">Edad</th>
                    <th className="text-left py-2 px-4 font-medium">Estado</th>
                    <th className="text-left py-2 px-4 font-medium">Precio</th>
                    <th className="text-left py-2 px-4 font-medium">Fecha Adquisición</th>
                    <th className="text-left py-2 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCows.map((cow) => (
                    <tr key={cow.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{cow.tag || '-'}</td>
                      <td className="py-3 px-4 font-medium">{cow.name || '-'}</td>
                      <td className="py-3 px-4">{cow.breed || '-'}</td>
                      <td className="py-3 px-4">{calculateAge(cow.birth_date)}</td>
                      <td className="py-3 px-4">{getStatusBadge(cow.status)}</td>
                      <td className="py-3 px-4">
                        {cow.precio ? (
                          <span className="text-green-600 font-medium">
                            ${cow.precio.toLocaleString('es-CO')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{formatDate(cow.acquisition_date)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCowId(cow.id);
                              setShowHistoryModal(true);
                            }}
                            title="Ver historia"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Edit cow */}}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cow.id)}
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
              {filteredCows.map((cow) => (
                <div key={cow.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{cow.name || 'Sin nombre'}</h3>
                      <p className="text-sm text-gray-600 font-mono">#{cow.tag || 'Sin etiqueta'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCowId(cow.id);
                          setShowHistoryModal(true);
                        }}
                        title="Ver historia"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: Edit cow */}}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cow.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Raza:</span>
                      <p className="font-medium">{cow.breed || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Edad:</span>
                      <p className="font-medium">{calculateAge(cow.birth_date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <div className="mt-1">{getStatusBadge(cow.status)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Adquisición:</span>
                      <p className="font-medium">{formatDate(cow.acquisition_date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Modal de historia */}
        {showHistoryModal && selectedCowId && (
          <CowHistoryModal
            isOpen={showHistoryModal}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedCowId(null);
            }}
            cowId={selectedCowId}
            businessId={businessId}
          />
        )}
      </CardContent>
    </Card>
  );
}
