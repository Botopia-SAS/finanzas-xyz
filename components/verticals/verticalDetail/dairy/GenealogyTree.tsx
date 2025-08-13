// components/verticals/verticalDetail/dairy/GenealogyTree.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Crown, Heart, Baby, ChevronRight, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Cow {
  id: string;
  name: string;
  tag: string;
  breed: string;
  status: string;
  birth_date: string;
}

interface ParentInfo {
  father_id?: string;
  father_name?: string;
  father_tag?: string;
  mother_id?: string;
  mother_name?: string;
  mother_tag?: string;
  birth_date?: string;
}

interface ChildInfo {
  child_id: string;
  child_name: string;
  child_tag: string;
  birth_date: string;
  other_parent_id?: string;
  other_parent_name?: string;
  other_parent_tag?: string;
  parent_type: 'father' | 'mother';
}

interface GenealogyTreeProps {
  cowId: string;
  businessId: string;
}

export default function GenealogyTree({ cowId, businessId }: GenealogyTreeProps) {
  const [cow, setCow] = useState<Cow | null>(null);
  const [parents, setParents] = useState<ParentInfo | null>(null);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [grandparents, setGrandparents] = useState<{
    paternal: ParentInfo | null;
    maternal: ParentInfo | null;
  }>({ paternal: null, maternal: null });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    ancestors: true,
    descendants: true
  });
  const supabase = createClient();

  useEffect(() => {
    if (cowId) {
      fetchGenealogyData();
    }
  }, [cowId]);

  const fetchGenealogyData = async () => {
    setLoading(true);
    try {
      // Obtener información de la vaca
      const { data: cowData, error: cowError } = await supabase
        .from('livestock_cows')
        .select('*')
        .eq('id', cowId)
        .single();

      if (cowError) throw cowError;
      setCow(cowData);

      // Obtener padres
      const { data: parentsData, error: parentsError } = await supabase
        .rpc('get_cow_parents', { cow_id_param: cowId });

      if (parentsError) {
        console.error('Error getting parents:', parentsError);
      } else if (parentsData && parentsData.length > 0) {
        setParents(parentsData[0]);
        
        // Obtener abuelos paternos
        if (parentsData[0].father_id) {
          const { data: paternalGrandparents } = await supabase
            .rpc('get_cow_parents', { cow_id_param: parentsData[0].father_id });
          
          if (paternalGrandparents && paternalGrandparents.length > 0) {
            setGrandparents(prev => ({ ...prev, paternal: paternalGrandparents[0] }));
          }
        }

        // Obtener abuelos maternos
        if (parentsData[0].mother_id) {
          const { data: maternalGrandparents } = await supabase
            .rpc('get_cow_parents', { cow_id_param: parentsData[0].mother_id });
          
          if (maternalGrandparents && maternalGrandparents.length > 0) {
            setGrandparents(prev => ({ ...prev, maternal: maternalGrandparents[0] }));
          }
        }
      }

      // Obtener hijos
      const { data: childrenData, error: childrenError } = await supabase
        .rpc('get_cow_children', { cow_id_param: cowId });

      if (childrenError) {
        console.error('Error getting children:', childrenError);
      } else {
        setChildren(childrenData || []);
      }

    } catch (error) {
      console.error('Error fetching genealogy:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Activa', color: 'bg-green-100 text-green-800' },
      'pregnant': { label: 'Preñada', color: 'bg-blue-100 text-blue-800' },
      'dry': { label: 'Seca', color: 'bg-yellow-100 text-yellow-800' },
      'sick': { label: 'Enferma', color: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${statusInfo.color} border-0`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const CowCard = ({ 
    id, 
    name, 
    tag, 
    breed, 
    status, 
    birth_date, 
    icon: Icon, 
    title, 
    bgColor = "bg-white",
    borderColor = "border-gray-200"
  }: {
    id?: string;
    name?: string;
    tag?: string;
    breed?: string;
    status?: string;
    birth_date?: string;
    icon: React.ElementType;
    title: string;
    bgColor?: string;
    borderColor?: string;
  }) => {
    if (!name) {
      return (
        <Card className={`${bgColor} ${borderColor} border-2 border-dashed`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Icon className="h-4 w-4" />
              <span className="text-sm">No registrado</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{title}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`${bgColor} ${borderColor} border-2 hover:shadow-md transition-shadow`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-blue-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{name}</span>
                  <span className="text-xs text-gray-600 font-mono bg-gray-100 px-1 rounded">{tag}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{breed}</p>
                {birth_date && (
                  <p className="text-xs text-gray-500">Nació: {formatDate(birth_date)}</p>
                )}
              </div>
            </div>
            {status && getStatusBadge(status)}
          </div>
        </CardContent>
      </Card>
    );
  };

  const toggleSection = (section: 'ancestors' | 'descendants') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Cargando árbol genealógico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cow) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 text-center">No se encontró información de la vaca</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ancestros */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleSection('ancestors')}
          >
            {expandedSections.ancestors ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Users className="h-5 w-5 text-blue-600" />
            Ancestros
          </CardTitle>
        </CardHeader>
        {expandedSections.ancestors && (
          <CardContent>
            {/* Abuelos */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Abuelos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Abuelos paternos */}
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Línea Paterna</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CowCard
                      id={grandparents.paternal?.father_id}
                      name={grandparents.paternal?.father_name}
                      tag={grandparents.paternal?.father_tag}
                      icon={Crown}
                      title="Abuelo Paterno"
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />
                    <CowCard
                      id={grandparents.paternal?.mother_id}
                      name={grandparents.paternal?.mother_name}
                      tag={grandparents.paternal?.mother_tag}
                      icon={Heart}
                      title="Abuela Paterna"
                      bgColor="bg-pink-50"
                      borderColor="border-pink-200"
                    />
                  </div>
                </div>

                {/* Abuelos maternos */}
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Línea Materna</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CowCard
                      id={grandparents.maternal?.father_id}
                      name={grandparents.maternal?.father_name}
                      tag={grandparents.maternal?.father_tag}
                      icon={Crown}
                      title="Abuelo Materno"
                      bgColor="bg-blue-50"
                      borderColor="border-blue-200"
                    />
                    <CowCard
                      id={grandparents.maternal?.mother_id}
                      name={grandparents.maternal?.mother_name}
                      tag={grandparents.maternal?.mother_tag}
                      icon={Heart}
                      title="Abuela Materna"
                      bgColor="bg-pink-50"
                      borderColor="border-pink-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Padres */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Padres</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CowCard
                  id={parents?.father_id}
                  name={parents?.father_name}
                  tag={parents?.father_tag}
                  icon={Crown}
                  title="Padre"
                  bgColor="bg-blue-50"
                  borderColor="border-blue-300"
                />
                <CowCard
                  id={parents?.mother_id}
                  name={parents?.mother_name}
                  tag={parents?.mother_tag}
                  icon={Heart}
                  title="Madre"
                  bgColor="bg-pink-50"
                  borderColor="border-pink-300"
                />
              </div>
            </div>

            {/* Vaca actual */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Vaca Actual</h4>
                <CowCard
                  id={cow.id}
                  name={cow.name}
                  tag={cow.tag}
                  breed={cow.breed}
                  status={cow.status}
                  birth_date={cow.birth_date}
                  icon={User}
                  title="Vaca Principal"
                  bgColor="bg-yellow-50"
                  borderColor="border-yellow-400"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Descendientes */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleSection('descendants')}
          >
            {expandedSections.descendants ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Baby className="h-5 w-5 text-green-600" />
            Descendientes ({children.length})
          </CardTitle>
        </CardHeader>
        {expandedSections.descendants && (
          <CardContent>
            {children.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child, index) => (
                  <div key={child.child_id} className="space-y-2">
                    <CowCard
                      id={child.child_id}
                      name={child.child_name}
                      tag={child.child_tag}
                      birth_date={child.birth_date}
                      icon={Baby}
                      title={`Hijo ${index + 1}`}
                      bgColor="bg-green-50"
                      borderColor="border-green-300"
                    />
                    {child.other_parent_name && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">
                          {child.parent_type === 'father' ? 'Madre' : 'Padre'}:
                        </span> {child.other_parent_name} ({child.other_parent_tag})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Baby className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay descendientes registrados</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
