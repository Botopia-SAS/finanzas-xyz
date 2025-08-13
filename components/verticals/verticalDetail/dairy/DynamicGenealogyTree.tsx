// components/verticals/verticalDetail/dairy/DynamicGenealogyTree.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, ChevronUp, Users } from "lucide-react";

interface Cow {
  id: string;
  name: string;
  tag: string;
  breed: string;
  status: string;
  birth_date: string;
}

interface GenealogyData {
  cow: Cow;
  father?: Cow;
  mother?: Cow;
  paternalGrandfather?: Cow;
  paternalGrandmother?: Cow;
  maternalGrandfather?: Cow;
  maternalGrandmother?: Cow;
  children?: Cow[];
}

interface DynamicGenealogyTreeProps {
  cowId: string;
  businessId: string;
}

export default function DynamicGenealogyTree({ cowId, businessId }: DynamicGenealogyTreeProps) {
  const [genealogyData, setGenealogyData] = useState<GenealogyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAncestors, setShowAncestors] = useState(true);
  const [showDescendants, setShowDescendants] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (cowId && businessId) {
      fetchGenealogyData();
    }
  }, [cowId, businessId]);

  const fetchGenealogyData = async () => {
    try {
      setLoading(true);
      
      // Obtener la vaca principal
      const { data: mainCow, error: mainCowError } = await supabase
        .from('livestock_cows')
        .select('*')
        .eq('id', cowId)
        .single();

      if (mainCowError || !mainCow) {
        console.error('Error fetching main cow:', mainCowError);
        return;
      }

      // Obtener eventos de nacimiento para encontrar padres
      const { data: birthEvent, error: birthError } = await supabase
        .from('livestock_birth_events')
        .select('*')
        .eq('calf_id', cowId)
        .eq('business_id', businessId)
        .single();

      let father: Cow | undefined;
      let mother: Cow | undefined;
      let paternalGrandfather: Cow | undefined;
      let paternalGrandmother: Cow | undefined;
      let maternalGrandfather: Cow | undefined;
      let maternalGrandmother: Cow | undefined;

      // Si hay evento de nacimiento, obtener padres
      if (birthEvent && !birthError) {
        const parentPromises = [];
        
        if (birthEvent.sire_id) {
          parentPromises.push(
            supabase
              .from('livestock_cows')
              .select('*')
              .eq('id', birthEvent.sire_id)
              .single()
          );
        }
        
        if (birthEvent.dam_id) {
          parentPromises.push(
            supabase
              .from('livestock_cows')
              .select('*')
              .eq('id', birthEvent.dam_id)
              .single()
          );
        }

        if (parentPromises.length > 0) {
          const parentResults = await Promise.all(parentPromises);
          
          if (birthEvent.sire_id && parentResults[0]?.data) {
            father = parentResults[0].data;
          }
          
          if (birthEvent.dam_id) {
            const motherIndex = birthEvent.sire_id ? 1 : 0;
            if (parentResults[motherIndex]?.data) {
              mother = parentResults[motherIndex].data;
            }
          }
        }

        // Obtener abuelos si hay padres
        const grandparentPromises = [];
        
        if (father) {
          grandparentPromises.push(
            supabase
              .from('livestock_birth_events')
              .select('*')
              .eq('calf_id', father.id)
              .eq('business_id', businessId)
              .single()
          );
        }
        
        if (mother) {
          grandparentPromises.push(
            supabase
              .from('livestock_birth_events')
              .select('*')
              .eq('calf_id', mother.id)
              .eq('business_id', businessId)
              .single()
          );
        }

        if (grandparentPromises.length > 0) {
          const grandparentEvents = await Promise.all(grandparentPromises);
          
          // Obtener abuelos paternos
          if (father && grandparentEvents[0]?.data) {
            const paternalEvent = grandparentEvents[0].data;
            const paternalGrandparentPromises = [];
            
            if (paternalEvent.sire_id) {
              paternalGrandparentPromises.push(
                supabase
                  .from('livestock_cows')
                  .select('*')
                  .eq('id', paternalEvent.sire_id)
                  .single()
              );
            }
            
            if (paternalEvent.dam_id) {
              paternalGrandparentPromises.push(
                supabase
                  .from('livestock_cows')
                  .select('*')
                  .eq('id', paternalEvent.dam_id)
                  .single()
              );
            }

            if (paternalGrandparentPromises.length > 0) {
              const paternalResults = await Promise.all(paternalGrandparentPromises);
              
              if (paternalEvent.sire_id && paternalResults[0]?.data) {
                paternalGrandfather = paternalResults[0].data;
              }
              
              if (paternalEvent.dam_id) {
                const grandmotherIndex = paternalEvent.sire_id ? 1 : 0;
                if (paternalResults[grandmotherIndex]?.data) {
                  paternalGrandmother = paternalResults[grandmotherIndex].data;
                }
              }
            }
          }

          // Obtener abuelos maternos
          if (mother && grandparentEvents[mother ? (father ? 1 : 0) : 0]?.data) {
            const maternalEvent = grandparentEvents[mother ? (father ? 1 : 0) : 0].data;
            const maternalGrandparentPromises = [];
            
            if (maternalEvent.sire_id) {
              maternalGrandparentPromises.push(
                supabase
                  .from('livestock_cows')
                  .select('*')
                  .eq('id', maternalEvent.sire_id)
                  .single()
              );
            }
            
            if (maternalEvent.dam_id) {
              maternalGrandparentPromises.push(
                supabase
                  .from('livestock_cows')
                  .select('*')
                  .eq('id', maternalEvent.dam_id)
                  .single()
              );
            }

            if (maternalGrandparentPromises.length > 0) {
              const maternalResults = await Promise.all(maternalGrandparentPromises);
              
              if (maternalEvent.sire_id && maternalResults[0]?.data) {
                maternalGrandfather = maternalResults[0].data;
              }
              
              if (maternalEvent.dam_id) {
                const grandmotherIndex = maternalEvent.sire_id ? 1 : 0;
                if (maternalResults[grandmotherIndex]?.data) {
                  maternalGrandmother = maternalResults[grandmotherIndex].data;
                }
              }
            }
          }
        }
      }

      // Obtener descendientes
      const { data: children, error: childrenError } = await supabase
        .from('livestock_birth_events')
        .select(`
          calf_id,
          livestock_cows!livestock_birth_events_calf_id_fkey (
            id,
            name,
            tag,
            breed,
            status,
            birth_date
          )
        `)
        .or(`sire_id.eq.${cowId},dam_id.eq.${cowId}`)
        .eq('business_id', businessId);

      const childrenData = children?.map(child => child.livestock_cows).filter(Boolean).flat() || [];

      setGenealogyData({
        cow: mainCow,
        father,
        mother,
        paternalGrandfather,
        paternalGrandmother,
        maternalGrandfather,
        maternalGrandmother,
        children: childrenData
      });

    } catch (error) {
      console.error('Error fetching genealogy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pregnant: 'bg-purple-100 text-purple-800',
      dry: 'bg-yellow-100 text-yellow-800',
      sick: 'bg-red-100 text-red-800',
      sold: 'bg-gray-100 text-gray-800',
      deceased: 'bg-black text-white'
    };

    const statusLabels = {
      active: 'Activa',
      pregnant: 'Preñada',
      dry: 'Seca',
      sick: 'Enferma',
      sold: 'Vendida',
      deceased: 'Fallecida'
    };

    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'} text-xs`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const CowCard = ({ cow, label, bgColor = "bg-blue-50", borderColor = "border-blue-200", textColor = "text-blue-600" }: { 
    cow: Cow; 
    label: string; 
    bgColor?: string; 
    borderColor?: string; 
    textColor?: string; 
  }) => (
    <div className={`text-center p-3 sm:p-4 ${bgColor} rounded-xl border-2 ${borderColor} min-w-[140px] sm:min-w-[160px] max-w-[200px] w-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 cursor-pointer group overflow-hidden relative`}>
      {/* Efecto hover sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className={`text-xs sm:text-sm ${textColor} font-semibold mb-2 uppercase tracking-wide`}>{label}</div>
        <div className="font-bold text-sm sm:text-base text-gray-800 mb-1 truncate">{cow.name}</div>
        <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{cow.tag}</div>
        <div className="text-xs text-gray-500 mb-2 truncate">{cow.breed}</div>
        <div className="text-xs text-gray-400 mb-2">
          {new Date(cow.birth_date).toLocaleDateString('es-ES', {
            year: '2-digit',
            month: 'short'
          })}
        </div>
        <div className="flex justify-center">
          {getStatusBadge(cow.status)}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Árbol Genealógico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Cargando árbol genealógico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!genealogyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Árbol Genealógico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">No se pudo cargar la información genealógica</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { cow, father, mother, paternalGrandfather, paternalGrandmother, maternalGrandfather, maternalGrandmother, children } = genealogyData;

  // Determinar qué secciones mostrar
  const hasAncestors = father || mother || paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother;
  const hasDescendants = children && children.length > 0;

  return (
    <Card className="w-full max-w-none overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">
            Árbol Genealógico
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {/* Sección de Ancestros */}
          {hasAncestors && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAncestors(!showAncestors)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showAncestors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="font-semibold">Ancestros</span>
                </button>
              </div>

              {showAncestors && (
                <div className="flex flex-col items-center space-y-8">
                  {/* Abuelos */}
                  {(paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother) && (
                    <div className="space-y-6 w-full">
                      <div className="text-center text-sm font-medium text-gray-600">Abuelos</div>
                      <div className="relative">
                        {/* SVG para líneas curvas */}
                        <svg 
                          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
                          style={{ height: '200px' }}
                        >
                          {/* Línea curva entre abuelos paternos */}
                          {paternalGrandfather && paternalGrandmother && (
                            <path
                              d="M 20% 60% Q 30% 50% 40% 60%"
                              stroke="rgb(156, 163, 175)"
                              strokeWidth="2"
                              fill="none"
                              className="drop-shadow-sm"
                            />
                          )}
                          
                          {/* Línea curva entre abuelos maternos */}
                          {maternalGrandfather && maternalGrandmother && (
                            <path
                              d="M 60% 60% Q 70% 50% 80% 60%"
                              stroke="rgb(156, 163, 175)"
                              strokeWidth="2"
                              fill="none"
                              className="drop-shadow-sm"
                            />
                          )}
                          
                          {/* Línea curva principal conectando líneas familiares */}
                          {(paternalGrandfather || paternalGrandmother) && (maternalGrandfather || maternalGrandmother) && (
                            <path
                              d="M 30% 80% Q 50% 70% 70% 80%"
                              stroke="rgb(156, 163, 175)"
                              strokeWidth="3"
                              fill="none"
                              className="drop-shadow-sm"
                            />
                          )}
                        </svg>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10">
                          {/* Línea Paterna */}
                          {(paternalGrandfather || paternalGrandmother) && (
                            <div className="flex flex-col items-center">
                              <div className="text-xs text-gray-500 mb-4">Línea Paterna</div>
                              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                                {paternalGrandfather && (
                                  <CowCard 
                                    cow={paternalGrandfather} 
                                    label="Abuelo Paterno" 
                                    bgColor="bg-blue-50" 
                                    borderColor="border-blue-200" 
                                    textColor="text-blue-600" 
                                  />
                                )}
                                {paternalGrandmother && (
                                  <CowCard 
                                    cow={paternalGrandmother} 
                                    label="Abuela Paterna" 
                                    bgColor="bg-pink-50" 
                                    borderColor="border-pink-200" 
                                    textColor="text-pink-600" 
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Línea Materna */}
                          {(maternalGrandfather || maternalGrandmother) && (
                            <div className="flex flex-col items-center">
                              <div className="text-xs text-gray-500 mb-4">Línea Materna</div>
                              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                                {maternalGrandfather && (
                                  <CowCard 
                                    cow={maternalGrandfather} 
                                    label="Abuelo Materno" 
                                    bgColor="bg-blue-50" 
                                    borderColor="border-blue-200" 
                                    textColor="text-blue-600" 
                                  />
                                )}
                                {maternalGrandmother && (
                                  <CowCard 
                                    cow={maternalGrandmother} 
                                    label="Abuela Materna" 
                                    bgColor="bg-pink-50" 
                                    borderColor="border-pink-200" 
                                    textColor="text-pink-600" 
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Padres */}
                  {(father || mother) && (
                    <div className="space-y-6 w-full relative">
                      <div className="text-center text-sm font-medium text-gray-600">Padres</div>
                      <div className="relative">
                        {/* SVG para líneas curvas de padres */}
                        <svg 
                          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
                          style={{ height: '150px' }}
                        >
                          {/* Línea curva desde abuelos a padres */}
                          {(paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother) && (
                            <path
                              d="M 50% 0% Q 50% 30% 50% 50%"
                              stroke="rgb(156, 163, 175)"
                              strokeWidth="2"
                              fill="none"
                              className="drop-shadow-sm"
                            />
                          )}
                          
                          {/* Línea curva entre padres */}
                          {father && mother && (
                            <path
                              d="M 25% 60% Q 50% 50% 75% 60%"
                              stroke="rgb(156, 163, 175)"
                              strokeWidth="2"
                              fill="none"
                              className="drop-shadow-sm"
                            />
                          )}
                          
                          {/* Línea curva hacia la vaca actual */}
                          <path
                            d="M 50% 80% Q 50% 90% 50% 100%"
                            stroke="rgb(156, 163, 175)"
                            strokeWidth="3"
                            fill="none"
                            className="drop-shadow-sm"
                          />
                        </svg>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 relative z-10">
                          {father && (
                            <CowCard 
                              cow={father} 
                              label="Padre" 
                              bgColor="bg-blue-50" 
                              borderColor="border-blue-200" 
                              textColor="text-blue-600" 
                            />
                          )}
                          {mother && (
                            <CowCard 
                              cow={mother} 
                              label="Madre" 
                              bgColor="bg-pink-50" 
                              borderColor="border-pink-200" 
                              textColor="text-pink-600" 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Vaca Actual */}
          <div className="flex justify-center relative">
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-3 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px] sm:min-w-[250px] max-w-[300px] w-full mx-4 relative overflow-hidden">
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="text-sm text-green-700 font-semibold mb-3 uppercase tracking-wide">Vaca Actual</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{cow.name}</div>
                <div className="text-lg sm:text-xl text-gray-600 mb-2 font-medium">{cow.tag}</div>
                <div className="text-sm text-gray-500 mb-3 font-medium">{cow.breed}</div>
                <div className="text-xs text-gray-400 mb-3">
                  <span className="font-medium">Nació:</span> {new Date(cow.birth_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex justify-center">
                  {getStatusBadge(cow.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Descendientes */}
          {hasDescendants && (
            <div className="space-y-6 w-full">
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={() => setShowDescendants(!showDescendants)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
                >
                  {showDescendants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="font-semibold">Descendientes ({children?.length || 0})</span>
                </button>
              </div>

              {showDescendants && children && children.length > 0 && (
                <div className="space-y-6 relative">
                  {/* SVG para líneas curvas de descendientes */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-0" 
                    style={{ height: '200px' }}
                  >
                    {/* Línea curva principal desde la vaca actual */}
                    <path
                      d="M 50% 0% Q 50% 20% 50% 40%"
                      stroke="rgb(156, 163, 175)"
                      strokeWidth="3"
                      fill="none"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Líneas curvas hacia cada descendiente */}
                    {children.map((_, index) => {
                      const totalChildren = children.length;
                      const isOdd = totalChildren % 2 === 1;
                      const middleIndex = Math.floor(totalChildren / 2);
                      
                      let xPosition: number;
                      if (totalChildren === 1) {
                        xPosition = 50;
                      } else if (totalChildren === 2) {
                        xPosition = index === 0 ? 30 : 70;
                      } else if (totalChildren === 3) {
                        xPosition = index === 0 ? 25 : (index === 1 ? 50 : 75);
                      } else {
                        // Para 4 o más hijos, distribuirlos uniformemente
                        const spacing = 60 / (totalChildren - 1);
                        xPosition = 20 + (index * spacing);
                      }
                      
                      return (
                        <path
                          key={index}
                          d={`M 50% 40% Q ${xPosition}% 55% ${xPosition}% 70%`}
                          stroke="rgb(156, 163, 175)"
                          strokeWidth="2"
                          fill="none"
                          className="drop-shadow-sm"
                        />
                      );
                    })}
                  </svg>
                  
                  <div className="text-center text-sm font-medium text-gray-600 pt-4">Hijos</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 justify-items-center relative z-10 pt-8">
                    {children.map((child) => (
                      <div key={child.id} className="transform hover:scale-105 transition-transform duration-200">
                        <CowCard 
                          cow={child} 
                          label="Hijo/a" 
                          bgColor="bg-yellow-50" 
                          borderColor="border-yellow-200" 
                          textColor="text-yellow-600" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensaje si no hay información genealógica */}
          {!hasAncestors && !hasDescendants && (
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <div className="mb-4">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              </div>
              <div className="text-gray-500 mb-3 text-lg sm:text-xl font-medium">No hay información genealógica registrada</div>
              <div className="text-sm sm:text-base text-gray-400 max-w-md mx-auto">
                Para ver el árbol genealógico, registra los padres de esta vaca o sus descendientes en el sistema
              </div>
            </div>
          )}

          {/* Información adicional si hay datos */}
          {(hasAncestors || hasDescendants) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Información del Árbol:</strong>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {hasAncestors && <div>• Ancestros: {[father, mother, paternalGrandfather, paternalGrandmother, maternalGrandfather, maternalGrandmother].filter(Boolean).length} registrados</div>}
                  {hasDescendants && <div>• Descendientes: {children?.length || 0} registrados</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
