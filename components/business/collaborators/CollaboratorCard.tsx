"use client";

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, User } from 'lucide-react';
import { DEFAULT_ROLES } from '../types/permissions';

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  user: {
    email: string;
    phone?: string;
  };
}

interface CollaboratorCardProps {
  collaborator: Collaborator;
  onRemove: () => void;
}

export default function CollaboratorCard({ collaborator, onRemove }: CollaboratorCardProps) {
  const roleInfo = DEFAULT_ROLES.find(r => r.id === collaborator.role);

  const handleRemove = async () => {
    if (!confirm('¿Estás seguro de remover este colaborador?')) return;

    const supabase = createClient();
    
    const { error } = await supabase
      .from('business_collaborators')
      .update({ status: 'removed' })
      .eq('id', collaborator.id);

    if (!error) {
      onRemove();
    } else {
      alert('Error al remover colaborador');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium">{collaborator.user.email}</p>
          <p className="text-sm text-gray-500">
            {roleInfo?.name || collaborator.role}
          </p>
          <p className="text-xs text-gray-400">
            Miembro desde: {new Date(collaborator.joined_at).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" title="Configurar permisos">
          <Settings className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRemove}
          title="Remover colaborador"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}