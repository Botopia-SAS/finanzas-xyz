"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Calendar, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Collaborator {
  id: string;
  role: string;
  status: string;
  created_at: string;
  user_id: string;
  full_name?: string; 
  job_title?: string;
  phone?: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

// Componente Modal de confirmación personalizado
function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-[#fe8027]/10 to-[#7dd1d6]/10 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-[#fe8027]" />
            <h3 className="text-lg font-semibold text-[#152241]">{title}</h3>
          </div>
        </div>
        
        <div className="p-5">
          <p className="text-gray-600">{message}</p>
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-[#e5722a] hover:to-[#6bc5ca] text-white border-none"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente Toast de notificación personalizado
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
        type === 'success' 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200' 
          : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
      }`}>
        {type === 'success' ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        )}
        <p className={`font-medium ${
          type === 'success' ? 'text-emerald-800' : 'text-red-800'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default function CollaboratorsList({ businessId }: { businessId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Estados para modales y notificaciones
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    collaboratorId: '',
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  const loadCollaborators = async () => {
    setLoading(true);
    setError('');
    
    try {
      const supabase = createClient();
      
      console.log('🔍 Cargando colaboradores para business:', businessId);
      
      const { data: collaboratorsData, error: collaboratorsError } = await supabase
        .from('business_collaborators')
        .select('*')
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

  // Mostrar el modal de confirmación
  const showDeleteConfirm = (collaboratorId: string, collaboratorName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar colaborador',
      message: `¿Estás seguro de eliminar a ${collaboratorName || 'este colaborador'}?\n\nEsta acción no se puede deshacer.`,
      collaboratorId
    });
  };

  // Función para eliminar después de confirmar
  const handleDeleteConfirmed = async () => {
    const collaboratorId = confirmModal.collaboratorId;
    
    setDeletingId(collaboratorId);
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    
    try {
      const supabase = createClient();
      
      console.log("🗑️ Eliminando colaborador:", collaboratorId);
      
      const { error } = await supabase
        .from("business_collaborators")
        .delete()
        .eq("id", collaboratorId);

      if (error) {
        throw error;
      }

      // Mostrar toast de éxito
      setToast({
        show: true,
        message: "Colaborador eliminado exitosamente",
        type: 'success'
      });
      
      // Actualizar la lista
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      
    } catch (err) {
      console.error("❌ Error eliminando colaborador:", err);
      
      // Mostrar toast de error
      setToast({
        show: true,
        message: "Error al eliminar el colaborador",
        type: 'error'
      });
    } finally {
      setDeletingId(null);
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
    <>
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
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showDeleteConfirm(collaborator.id, collaborator.full_name || '')}
                      disabled={deletingId === collaborator.id}
                      className="ml-2 text-red-600 hover:bg-red-50"
                    >
                      {deletingId === collaborator.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación personalizado */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirmed}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      {/* Toast de notificación personalizado */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Añade esto para tener la animación de slide-up */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}