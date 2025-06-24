"use client";

import { useState } from 'react';
import { X, Users, Crown, Send, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: () => void;
  businessId: string;
  verticals: Array<{id: string; name: string}>; // ✅ Tipo específico
}

// Función para generar PIN
function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Roles por defecto
const DEFAULT_ROLES = [
  {
    id: 'partner',
    name: 'Socio',
    permissions: ['read', 'write', 'delete', 'invite']
  },
  {
    id: 'manager', 
    name: 'Administrador',
    permissions: ['read', 'write', 'delete']
  },
  {
    id: 'worker',
    name: 'Trabajador', 
    permissions: ['read', 'write']
  }
];

export default function InvitationModal({ 
  isOpen, 
  onClose, 
  onInvitationSent, 
  businessId 
}: InvitationModalProps) {
  const [invitationType, setInvitationType] = useState<'partner' | 'collaborator'>('collaborator');
  const [partnerUserId, setPartnerUserId] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    role: ''
  });
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationToken, setInvitationToken] = useState('');
  const [pin, setPin] = useState('');

  const resetForm = () => {
    setInvitationType('collaborator');
    setPartnerUserId('');
    setFormData({ phone: '', role: '' });
    setStep('form');
    setError('');
    setInvitationToken('');
    setPin('');
  };

  const sendInvitation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No autenticado');
      
      if (invitationType === 'partner') {
        // SOCIOS: Verificar formato y crear invitación
        if (!partnerUserId.trim()) {
          setError('Ingresa el ID del usuario');
          return;
        }
        
        if (!formData.phone.trim()) {
          setError('Ingresa el teléfono para notificación');
          return;
        }
        
        // Verificar formato UUID básico
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(partnerUserId.trim())) {
          setError('❌ El ID de usuario no tiene un formato válido.');
          return;
        }
        
        // Verificar que no sea ya socio
        const { data: existingPartner } = await supabase
          .from('business_collaborators')
          .select('id')
          .eq('business_id', businessId)
          .eq('user_id', partnerUserId.trim())
          .single();
        
        if (existingPartner) {
          setError('❌ Este usuario ya es socio de este negocio.');
          return;
        }
        
        // Crear invitación directamente (verificación se hace al aceptar)
        const generatedPin = generatePin();
        const token = crypto.randomUUID();
        
        const { error: inviteError } = await supabase
          .from('business_invitations')
          .insert([{
            business_id: businessId,
            invited_user_id: partnerUserId.trim(),
            phone: formData.phone,
            role: 'partner',
            permissions: DEFAULT_ROLES.find(r => r.id === 'partner')?.permissions,
            verification_pin: generatedPin,
            token: token,
            status: 'pending',
            invited_by: user.id
          }]);
        
        if (inviteError) {
          console.error('Error creando invitación:', inviteError);
          throw inviteError;
        }
        
        setPin(generatedPin);
        setInvitationToken(token);
        setStep('success');
        
        console.log(`✅ Invitación creada para usuario: ${partnerUserId.trim()}`);
        
      } else {
        // COLABORADORES: Proceso actual
        if (!formData.phone || !formData.role) {
          setError('Completa todos los campos requeridos');
          return;
        }
        
        const generatedPin = generatePin();
        const token = crypto.randomUUID();
        
        const { error: inviteError } = await supabase
          .from('business_invitations')
          .insert([{
            business_id: businessId,
            phone: formData.phone,
            role: formData.role,
            permissions: DEFAULT_ROLES.find(r => r.id === formData.role)?.permissions,
            verification_pin: generatedPin,
            token: token,
            status: 'pending',
            invited_by: user.id
          }]);
        
        if (inviteError) throw inviteError;
        
        setPin(generatedPin);
        setInvitationToken(token);
        setStep('success');
        
        console.log(`✅ Colaborador invitado: ${formData.role} - ${formData.phone}`);
      }
      
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
    if (step === 'success') {
      onInvitationSent();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'form' ? 'Invitar Colaborador' : '¡Invitación Enviada!'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' ? (
            <>
              {/* Selector de tipo */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Tipo de invitación:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInvitationType('collaborator')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'collaborator'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-5 w-5 mb-2 text-gray-600" />
                    <div className="font-medium text-sm">Colaborador</div>
                    <div className="text-xs text-gray-500">Admin/Trabajador</div>
                  </button>
                  <button
                    onClick={() => setInvitationType('partner')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'partner'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Crown className="h-5 w-5 mb-2 text-gray-600" />
                    <div className="font-medium text-sm">Socio</div>
                    <div className="text-xs text-gray-500">Usuario registrado</div>
                  </button>
                </div>
              </div>

              {invitationType === 'partner' ? (
                // Formulario para SOCIOS
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-yellow-800 mb-2">👑 Invitar Socio</h4>
                    <p className="text-sm text-yellow-700">
                      El socio debe estar registrado en la plataforma. Necesitas su ID de usuario.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        ID de Usuario del Socio *
                      </label>
                      <input
                        type="text"
                        value={partnerUserId}
                        onChange={(e) => setPartnerUserId(e.target.value)}
                        placeholder="67d15f68-6cb3-4e39-a902-d0c495b4a0b"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        El socio puede encontrar su ID en su dashboard personal
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Teléfono (para notificación) *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="+57 321 401 2579"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Formulario para COLABORADORES
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-800 mb-2">👷 Invitar Colaborador</h4>
                    <p className="text-sm text-blue-700">
                      El colaborador no necesita cuenta en la plataforma.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="+57 321 401 2579"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Rol *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar rol...</option>
                        <option value="manager">⚙️ Administrador</option>
                        <option value="worker">👷 Trabajador</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={sendInvitation}
                  disabled={loading || (invitationType === 'partner' ? (!partnerUserId || !formData.phone) : (!formData.phone || !formData.role))}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar Invitación'}
                </button>
              </div>
            </>
          ) : (
            // Pantalla de éxito
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Invitación enviada!
                </h3>
                <p className="text-sm text-gray-600">
                  {invitationType === 'partner' 
                    ? 'El socio recibirá un PIN para aceptar la invitación.'
                    : 'El colaborador recibirá un PIN para completar su registro.'
                  }
                </p>
              </div>

              {/* Info de la invitación */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">PIN:</span>
                    <span className="font-mono font-bold text-lg">{pin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">
                      {invitationType === 'partner' ? '👑 Socio' : `👷 ${formData.role === 'manager' ? 'Administrador' : 'Trabajador'}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Link de invitación */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Link de invitación:
                </label>
                <div className="flex gap-2">
                  <input
                    value={`${window.location.origin}/accept-invitation?token=${invitationToken}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-xs font-mono bg-gray-50"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/accept-invitation?token=${invitationToken}`)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}