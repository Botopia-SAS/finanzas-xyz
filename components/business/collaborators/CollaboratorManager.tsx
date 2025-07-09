"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InvitationCard from './InvitationCard';
import InvitationModal from './InvitationModal';
import { Plus } from 'lucide-react';
import { BusinessPermissions } from '../types/permissions';

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  permissions: BusinessPermissions;
  status: string;
  joined_at: string;
  user: {
    email: string;
    phone?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  phone?: string;
  role: string;
  permissions: BusinessPermissions;
  status: string;
  expires_at: string;
  created_at: string;
}

interface CollaboratorManagerProps {
  businessId: string;
  verticals: Array<{id: string; name: string}>;
}

export default function CollaboratorManager({ businessId, verticals }: CollaboratorManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Usar useCallback para evitar el warning de dependencies
  const loadCollaborators = useCallback(async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('business_collaborators')
      .select(`
        *,
        user:users(email, phone)
      `)
      .eq('business_id', businessId)
      .eq('status', 'active');

    if (data && !error) setCollaborators(data);
  }, [businessId]);

  const loadInvitations = useCallback(async () => {
    const supabase = createClient();
    
    const { data } = await supabase
      .from('business_invitations')
      .select('*')
      .eq('business_id', businessId)
      .in('status', ['pending']);

    if (data) setInvitations(data);
    setLoading(false);
  }, [businessId]);

  // ✅ Ahora las dependencias están incluidas correctamente
  useEffect(() => {
    loadCollaborators();
    loadInvitations();
  }, [loadCollaborators, loadInvitations]);

  const handleCollaboratorRemoved = () => {
    loadCollaborators();
  };

  const handleInvitationCancelled = () => {
    loadInvitations();
  };

  if (loading) return <div>Cargando colaboradores...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#152241]">
            Colaboradores
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu equipo de trabajo
          </p>
        </div>
        
        {/* ACTUALIZAR EL BOTÓN EXISTENTE */}
        <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium">
          <Plus className="w-5 h-5" />
          Invitar Colaborador
        </Button>
      </div>

      
      {/* Invitaciones Pendientes */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Invitaciones Pendientes ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <InvitationCard 
                  key={invitation.id}
                  invitation={invitation}
                  onCancel={handleInvitationCancelled}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>
            Colaboradores Activos ({collaborators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborators.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No hay colaboradores activos</p>
              </div>
            ) : (
              <div>
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{collaborator.user?.email}</h3>
                        <p className="text-sm text-gray-600">{collaborator.role}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleCollaboratorRemoved()}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AGREGAR EL MODAL */}
      <InvitationModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvitationSent={() => {
          setShowInviteModal(false);
          loadInvitations(); // ✅ Usar directamente
        }}
        businessId={businessId}
        verticals={verticals}
      />
    </div>
  );
}