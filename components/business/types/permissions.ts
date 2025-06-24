export interface BusinessPermissions {
  // Permisos generales
  canViewDashboard: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  
  // Permisos de movimientos
  movements: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewAll: boolean;
    types: ('ingreso' | 'gasto')[];  // Qué tipos puede manejar
  };
  
  // Permisos de verticales
  verticals: {
    canViewAll: boolean;
    canEdit: boolean;
    canCreate: boolean;
    canDelete: boolean;
    allowedVerticals: string[]; // IDs de verticales permitidos
  };
  
  // Permisos de inventario
  inventory: {
    canView: boolean;
    canEdit: boolean;
    canCreate: boolean;
    canDelete: boolean;
  };
  
  // Permisos administrativos
  admin: {
    canInviteUsers: boolean;
    canManageUsers: boolean;
    canEditBusiness: boolean;
    canDeleteBusiness: boolean;
  };
}

export interface CollaboratorRole {
  id: string;
  name: string;
  description: string;
  permissions: BusinessPermissions;
}

// Roles predefinidos
export const DEFAULT_ROLES: CollaboratorRole[] = [
  {
    id: 'owner',
    name: 'Propietario',
    description: 'Acceso completo a todo el negocio',
    permissions: {
      canViewDashboard: true,
      canViewReports: true,
      canExportData: true,
      movements: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canViewAll: true,
        types: ['ingreso', 'gasto']
      },
      verticals: {
        canViewAll: true,
        canEdit: true,
        canCreate: true,
        canDelete: true,
        allowedVerticals: []
      },
      inventory: {
        canView: true,
        canEdit: true,
        canCreate: true,
        canDelete: true
      },
      admin: {
        canInviteUsers: true,
        canManageUsers: true,
        canEditBusiness: true,
        canDeleteBusiness: true
      }
    }
  },
  {
    id: 'partner',
    name: 'Socio',
    description: 'Socio del negocio - Acceso completo a la plataforma',
    permissions: {
      canViewDashboard: true,
      canViewReports: true,
      canExportData: true,
      movements: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewAll: true,
        types: ['ingreso', 'gasto']
      },
      verticals: {
        canViewAll: true,
        canEdit: true,
        canCreate: true,
        canDelete: false,
        allowedVerticals: []
      },
      inventory: {
        canView: true,
        canEdit: true,
        canCreate: true,
        canDelete: false
      },
      admin: {
        canInviteUsers: true,
        canManageUsers: true,
        canEditBusiness: true,
        canDeleteBusiness: false
      }
    }
  },
  {
    id: 'manager',
    name: 'Administrador',
    description: 'Puede registrar todos los ingresos y gastos del negocio',
    permissions: {
      canViewDashboard: false, // ❌ No accede al dashboard
      canViewReports: false,
      canExportData: false,
      movements: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewAll: false,
        types: ['ingreso', 'gasto']
      },
      verticals: {
        canViewAll: true,
        canEdit: false,
        canCreate: false,
        canDelete: false,
        allowedVerticals: []
      },
      inventory: {
        canView: false,
        canEdit: false,
        canCreate: false,
        canDelete: false
      },
      admin: {
        canInviteUsers: false,
        canManageUsers: false,
        canEditBusiness: false,
        canDeleteBusiness: false
      }
    }
  },
  {
    id: 'worker',
    name: 'Trabajador',
    description: 'Puede registrar información solo en verticales específicas',
    permissions: {
      canViewDashboard: false, // ❌ No accede al dashboard
      canViewReports: false,
      canExportData: false,
      movements: {
        canCreate: true,
        canEdit: false,
        canDelete: false,
        canViewAll: false,
        types: ['ingreso', 'gasto']
      },
      verticals: {
        canViewAll: false,
        canEdit: false,
        canCreate: false,
        canDelete: false,
        allowedVerticals: [] // Se especifica en la invitación
      },
      inventory: {
        canView: false,
        canEdit: false,
        canCreate: false,
        canDelete: false
      },
      admin: {
        canInviteUsers: false,
        canManageUsers: false,
        canEditBusiness: false,
        canDeleteBusiness: false
      }
    }
  }
];