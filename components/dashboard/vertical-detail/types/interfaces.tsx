// Interfaces para los datos de producción
export interface CowInventoryItem {
  id: string;
  name: string;
  notes?: string;
  comments?: string;
  inProduction?: boolean;
}

export interface ProductionRecord {
  id: string;
  date: string;
  liters: number;
  movement_id?: string;
}

export interface CowProductionEntry {
  id: string;
  name: string;
  liters: number;
}

export interface CowProductionHistory {
  date: string;
  movement_id: string; // ✅ Hacer obligatorio, no opcional
  total_liters: number;
  production: CowProductionEntry[];
}

export interface EggProductionHistory {
  date: string;
  movement_id: string; // ✅ Hacer obligatorio, no opcional
  total_eggs: number;
  production: Record<string, number>;
  production_details?: Array<{
    type_id: string;
    type_name: string;
    quantity: number;
    unit_price: number;
    total_value: number;
  }>;
}

// Configuración base del template
export interface BaseTemplateConfig {
  lastUpdated?: string;
  version?: string;
  customFields?: Record<string, unknown>; // ✅ Cambiar any por unknown
}

// Configuración específica para lechería
export interface DairyTemplateConfig extends BaseTemplateConfig {
  trackIndividualProduction?: boolean;
  productionFrequency?: 'daily' | 'weekly' | 'monthly';
  milkingTimes?: number;
  qualityMetrics?: boolean;
}

// Configuración específica para huevos
export interface EggTemplateConfig extends BaseTemplateConfig {
  trackByType?: boolean;
  eggGradingEnabled?: boolean;
  collectionFrequency?: 'daily' | 'twice-daily' | 'custom';
  qualityControl?: boolean;
}

export interface VerticalSchema {
  type: "dairy" | "eggs";
  unit: string;
  price: number;
  inventory?: {
    items?: Array<{
      id: string;
      name: string;
      inProduction?: boolean;
      notes?: string;
      comments?: string;
    }>;
    total?: number;
  };
  productionTypes?: Array<{
    id: string;
    name: string;
    price: number;
    active?: boolean;
    description?: string;
  }>;
  templateConfig?: {
    trackByType?: boolean;
    trackIndividualProduction?: boolean;
    productionFrequency?: string;
    lastUpdated?: string;
    version?: string;
    customFields?: Record<string, any>;
    milkingTimes?: number;
    qualityControl?: boolean;
    qualityMetrics?: boolean;
    eggGradingEnabled?: boolean;
    collectionFrequency?: string;
  };
  // ✅ Usar las interfaces tipadas
  eggProductionHistory?: EggProductionHistory[];
  cowProductionHistory?: CowProductionHistory[];
}

export interface DairySchema extends VerticalSchema {
  type: "dairy";
  inventory?: {
    items?: Array<{
      id: string;
      name: string;
      inProduction?: boolean;
      notes?: string;
      comments?: string;
    }>;
  };
  cowProductionHistory?: CowProductionHistory[]; // ✅ Usar interface tipada
}

export interface EggSchema extends VerticalSchema {
  type: "eggs";
  inventory?: {
    total?: number;
  };
  productionTypes?: Array<{
    id: string;
    name: string;
    price: number;
    active?: boolean;
    description?: string;
  }>;
  eggProductionHistory?: EggProductionHistory[]; // ✅ Usar interface tipada
}

export interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  description?: string;
  vertical_id?: string;
  business_id?: string;
  created_at?: string;
  production_data?: {
    total_eggs?: number;
    total_liters?: number;
    total_value?: number;
    by_type?: Record<string, number>;
    by_animal?: CowProductionEntry[];
  };
}

export interface Vertical {
  id: string;
  name: string;
  variables_schema: VerticalSchema;
  business_id?: string;
  active?: boolean;
  is_template?: boolean;
  created_at?: string;
  description?: string;
}