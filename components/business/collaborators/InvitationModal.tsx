"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_ROLES, BusinessPermissions } from '../types/permissions';
import PermissionSelector from './PermissionSelector';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: () => void;
  businessId: string;
  verticals: Array<{id: string; name: string}>;
}

export default function InvitationModal({ 
  isOpen, 
  onClose, 
  onInvitationSent, 
  businessId, 
  verticals 
}: InvitationModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('data_entry_income');
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;

    setLoading(true);
    const supabase = createClient();
    
    try {
      // Obtener permisos del rol seleccionado
      const rolePermissions = DEFAULT_ROLES.find(r => r.id === selectedRole)?.permissions;
      if (!rolePermissions) return;

      // Personalizar permisos si es necesario
      const finalPermissions: BusinessPermissions = { ...rolePermissions };
      if (selectedRole.includes('data_entry') && selectedVerticals.length > 0) {
        finalPermissions.verticals.allowedVerticals = selectedVerticals;
      }

      // Crear invitación
      const { data, error } = await supabase
        .from('business_invitations')
        .insert([{
          business_id: businessId,
          email: inviteEmail,
          phone: invitePhone || null,
          role: selectedRole,
          permissions: finalPermissions,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        }])
        .select()
        .single();

      if (error) throw error;

      // Enviar invitación por email/WhatsApp
      await fetch('/api/business/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: data.id,
          email: inviteEmail,
          phone: invitePhone,
          businessId
        })
      });

      // Limpiar form y cerrar
      setInviteEmail('');
      setInvitePhone('');
      setSelectedVerticals([]);
      onInvitationSent();

      alert('Invitación enviada exitosamente');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Invitar Colaborador</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              {DEFAULT_ROLES.filter(role => role.id !== 'owner').map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de permisos personalizados */}
          <PermissionSelector
            selectedRole={selectedRole}
            verticals={verticals}
            selectedVerticals={selectedVerticals}
            onVerticalsChange={setSelectedVerticals}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleInvite}
            disabled={!inviteEmail || loading}
          >
            {loading ? 'Enviando...' : 'Enviar Invitación'}
          </Button>
        </div>
      </div>
    </div>
  );
}