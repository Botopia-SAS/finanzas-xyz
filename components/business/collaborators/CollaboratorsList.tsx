"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Calendar } from "lucide-react";

interface Collaborator {
  id: string;
  role: string;
  status: string;
  created_at: string;
  user_id: string;
  full_name?: string;
  job_title?: string;
}

export default function CollaboratorsList({ businessId }: { businessId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadCollaborators = async () => {
    setLoading(true);
    setError('');
    
    try {
      const supabase = createClient();
      
      console.log('🔍 Cargando colaboradores para business:', businessId);
      
      const { data: collaboratorsData, error: collaboratorsError } = await supabase
        .from('business_collaborators')
        .select(`
          *,
          profiles:user_id(full_name, phone)
        `)
        .eq('business_id', businessId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (collaboratorsError) {
        throw new Error(`Error cargando colaboradores: ${collaboratorsError.message}`);
      }

      console.log('📊 Colaboradores encontrados:', collaboratorsData);
      setCollaborators(collaboratorsData || []);
      
    } catch (err) {
      console.error('💥 Error loading collaborators:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, [businessId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#fe8027] border-t-transparent"></div>
            <span className="text-gray-600">Cargando colaboradores...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-semibold">Error al cargar colaboradores</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={loadCollaborators}
              className="mt-3 px-4 py-2 bg-[#fe8027] text-white rounded hover:bg-[#e5722a]"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Colaboradores Activos ({collaborators.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No hay colaboradores activos</p>
            <p className="text-sm">Invita a tu primer colaborador usando el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div 
                key={collaborator.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#fe8027] to-[#7dd1d6] rounded-full flex items-center justify-center text-white font-bold">
                      {collaborator.full_name?.[0] || collaborator.role[0] || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#152241]">
                        {collaborator.full_name || 'Pendiente completar perfil'}
                      </h3>
                      {collaborator.job_title && (
                        <p className="text-sm text-gray-600">{collaborator.job_title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {new Date(collaborator.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span className="capitalize">{collaborator.role.replace('_', ' ')}</span>
                  </Badge>
                  <Badge 
                    variant={collaborator.status === 'active' ? 'default' : 'secondary'}
                    className={collaborator.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {collaborator.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}