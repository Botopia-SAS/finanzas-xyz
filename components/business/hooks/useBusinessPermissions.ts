import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BusinessPermissions, DEFAULT_ROLES } from '../types/permissions';

export function useBusinessPermissions(businessId: string) {
  const [permissions, setPermissions] = useState<BusinessPermissions | null>(null);
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadPermissions() {
      const supabase = createClient();
      
      try {
        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Verificar si es el dueño del negocio
        const { data: business } = await supabase
          .from('businesses')
          .select('owner_id')
          .eq('id', businessId)
          .single();

        if (business?.owner_id === user.id) {
          setIsOwner(true);
          setRole('owner');
          setPermissions(DEFAULT_ROLES.find(r => r.id === 'owner')?.permissions || null);
          return;
        }

        // Verificar si es colaborador
        const { data: collaborator } = await supabase
          .from('business_collaborators')
          .select('role, permissions')
          .eq('business_id', businessId)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (collaborator) {
          setRole(collaborator.role);
          setPermissions(collaborator.permissions as BusinessPermissions);
        }

      } catch (error) {
        console.error('Error loading permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      loadPermissions();
    }
  }, [businessId]);

  const hasPermission = (permission: string, subPermission?: string): boolean => {
    if (isOwner) return true;
    if (!permissions) return false;
    
    const keys = permission.split('.');
    // ✅ Cambiar any por unknown y hacer type checking
    let current: unknown = permissions;
    
    for (const key of keys) {
      if (typeof current === 'object' && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return false;
      }
    }
    
    if (subPermission) {
      if (typeof current === 'object' && current !== null && subPermission in current) {
        return (current as Record<string, unknown>)[subPermission] === true;
      }
      return false;
    }
    
    return current === true;
  };

  const canAccessVertical = (verticalId: string): boolean => {
    if (isOwner) return true;
    if (!permissions) return false;
    
    if (permissions.verticals.canViewAll) return true;
    return permissions.verticals.allowedVerticals.includes(verticalId);
  };

  const canCreateMovementType = (type: 'ingreso' | 'gasto'): boolean => {
    if (isOwner) return true;
    if (!permissions) return false;
    
    return permissions.movements.canCreate && 
           permissions.movements.types.includes(type);
  };

  return {
    permissions,
    role,
    isOwner,
    loading,
    hasPermission,
    canAccessVertical,
    canCreateMovementType
  };
}