// components/verticals/verticalDetail/dairy/CowHistoryModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Milk,
  Heart,
  Users,
  DollarSign,
  Baby,
  Award
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DynamicGenealogyTree from "./DynamicGenealogyTree";

interface CowData {
  id: string;
  tag: string;
  name: string;
  breed: string;
  birth_date: string;
  status: string;
  acquisition_date: string;
  acquisition_type: string;
  purchase_price?: number;
  seller_name?: string;
  father_id?: string;
  mother_id?: string;
  notes?: string;
  father?: CowData;
  mother?: CowData;
  children?: CowData[];
}

interface MilkRecord {
  id: string;
  date: string;
  liters: number;
  quality: string;
  notes?: string;
}

interface CowHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cowId: string;
  businessId: string;
}

export default function CowHistoryModal({ isOpen, onClose, cowId, businessId }: CowHistoryModalProps) {
  const [cowData, setCowData] = useState<CowData | null>(null);
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'production' | 'genealogy'>('general');
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && cowId) {
      fetchCowData();
    }
  }, [isOpen, cowId]);

  const fetchCowData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos básicos de la vaca
      const { data: cow, error: cowError } = await supabase
        .from('livestock_cows')
        .select('*')
        .eq('id', cowId)
        .single();

      if (cowError) throw cowError;

      // Obtener padre y madre si existen
      const promises = [];
      if (cow.father_id) {
        promises.push(
          supabase
            .from('livestock_cows')
            .select('*')
            .eq('id', cow.father_id)
            .single()
        );
      }
      if (cow.mother_id) {
        promises.push(
          supabase
            .from('livestock_cows')
            .select('*')
            .eq('id', cow.mother_id)
            .single()
        );
      }

      // Obtener hijos
      promises.push(
        supabase
          .from('livestock_cows')
          .select('*')
          .or(`father_id.eq.${cowId},mother_id.eq.${cowId}`)
          .eq('business_id', businessId)
      );

      // Obtener registros de producción
      promises.push(
        supabase
          .from('livestock_milk_records')
          .select('*')
          .eq('cow_id', cowId)
          .order('date', { ascending: false })
      );

      const results = await Promise.all(promises);
      
      const cowWithFamily = {
        ...cow,
        father: cow.father_id && results[0]?.data ? results[0].data : null,
        mother: cow.mother_id && results[1]?.data ? results[1].data : null,
        children: results[results.length - 2]?.data || []
      };

      setCowData(cowWithFamily);
      setMilkRecords(results[results.length - 1]?.data || []);
    } catch (error) {
      console.error('Error fetching cow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMs = today.getTime() - birth.getTime();
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) {
      return `${ageInDays} días`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} meses`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const months = Math.floor((ageInDays % 365) / 30);
      return `${years} años${months > 0 ? ` ${months} meses` : ''}`;
    }
  };

  const getProductionStats = () => {
    if (milkRecords.length === 0) return null;

    const totalLiters = milkRecords.reduce((sum, record) => sum + record.liters, 0);
    const avgLiters = totalLiters / milkRecords.length;
    
    const last30Days = milkRecords.filter(record => {
      const recordDate = new Date(record.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate >= thirtyDaysAgo;
    });

    const recentAvg = last30Days.length > 0 
      ? last30Days.reduce((sum, record) => sum + record.liters, 0) / last30Days.length
      : 0;

    return {
      totalLiters,
      avgLiters,
      recentAvg,
      totalRecords: milkRecords.length,
      recentRecords: last30Days.length
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-50 text-green-700 border-green-200', text: 'Activa' },
      pregnant: { color: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Preñada' },
      dry: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'Seca' },
      sick: { color: 'bg-red-50 text-red-700 border-red-200', text: 'Enferma' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant="outline" className={config.color}>{config.text}</Badge>;
  };

  const getAcquisitionBadge = (type: string) => {
    const typeConfig = {
      purchase: { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Compra', icon: DollarSign },
      birth: { color: 'bg-pink-50 text-pink-700 border-pink-200', text: 'Nacimiento', icon: Baby },
      donation: { color: 'bg-green-50 text-green-700 border-green-200', text: 'Donación', icon: Heart },
      transfer: { color: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Transferencia', icon: Users }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.purchase;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Historia de {cowData?.name}</h2>
            {cowData && getStatusBadge(cowData.status)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-4 md:p-6">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 border-b">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'general'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                General
              </button>
              <button
                onClick={() => setActiveTab('production')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'production'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Milk className="h-4 w-4 inline mr-2" />
                Producción
              </button>
              <button
                onClick={() => setActiveTab('genealogy')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'genealogy'
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Award className="h-4 w-4 inline mr-2" />
                Genealogía
              </button>
            </div>

            {/* Content */}
            {activeTab === 'general' && cowData && (
              <div className="space-y-6">
                {/* Información básica */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Etiqueta</label>
                        <p className="text-lg font-mono">{cowData.tag}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-lg font-semibold">{cowData.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Raza</label>
                        <p className="text-lg">{cowData.breed}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Edad</label>
                        <p className="text-lg">{calculateAge(cowData.birth_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                        <p className="text-lg">{new Date(cowData.birth_date).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Estado</label>
                        <div className="mt-1">{getStatusBadge(cowData.status)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información de adquisición */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Adquisición</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tipo de Adquisición</label>
                        <div className="mt-1">{getAcquisitionBadge(cowData.acquisition_type)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fecha de Adquisición</label>
                        <p className="text-lg">{new Date(cowData.acquisition_date).toLocaleDateString('es-ES')}</p>
                      </div>
                      {cowData.purchase_price && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Precio de Compra</label>
                          <p className="text-lg font-semibold text-green-600">${cowData.purchase_price}</p>
                        </div>
                      )}
                      {cowData.seller_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Vendedor</label>
                          <p className="text-lg">{cowData.seller_name}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Notas */}
                {cowData.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{cowData.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'production' && (
              <div className="space-y-6">
                {(() => {
                  const stats = getProductionStats();
                  if (!stats) {
                    return (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Milk className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No hay registros de producción</p>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <>
                      {/* Estadísticas de producción */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.totalLiters.toFixed(1)}L</div>
                            <div className="text-sm text-gray-600">Total Producido</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.avgLiters.toFixed(1)}L</div>
                            <div className="text-sm text-gray-600">Promedio Histórico</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.recentAvg.toFixed(1)}L</div>
                            <div className="text-sm text-gray-600">Promedio 30 días</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.totalRecords}</div>
                            <div className="text-sm text-gray-600">Total Registros</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Últimos registros */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Últimos Registros de Producción</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {milkRecords.slice(0, 10).map((record) => (
                              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{new Date(record.date).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <Milk className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">{record.liters}L</span>
                                  </div>
                                  <Badge variant="outline" className={
                                    record.quality === 'A' ? 'bg-green-50 text-green-700 border-green-200' :
                                    record.quality === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  }>
                                    {record.quality}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === 'genealogy' && cowData && (
              <div className="space-y-6">
                <DynamicGenealogyTree 
                  cowId={cowData.id} 
                  businessId={businessId} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
