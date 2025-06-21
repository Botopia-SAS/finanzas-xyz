"use client";

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, Clock } from 'lucide-react';
import { DEFAULT_ROLES } from '../types/permissions';

interface Invitation {
  id: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface InvitationCardProps {
  invitation: Invitation;
  onCancel: () => void;
}

export default function InvitationCard({ invitation, onCancel }: InvitationCardProps) {
  const roleInfo = DEFAULT_ROLES.find(r => r.id === invitation.role);
  const isExpiringSoon = new Date(invitation.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de cancelar esta invitación?')) return;

    const supabase = createClient();
    
    const { error } = await supabase
      .from('business_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitation.id);

    if (!error) {
      onCancel();
    } else {
      alert('Error al cancelar invitación');
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${
      isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium">{invitation.email}</p>
          <p className="text-sm text-gray-500">
            {roleInfo?.name || invitation.role}
          </p>
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            Expira: {new Date(invitation.expires_at).toLocaleDateString('es-ES')}
            {isExpiringSoon && (
              <span className="ml-2 text-yellow-600 font-medium">¡Expira pronto!</span>
            )}
          </div>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleCancel}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Cancelar
      </Button>
    </div>
  );
}