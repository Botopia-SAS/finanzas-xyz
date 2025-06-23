import { createClient } from "@/lib/supabase/client";

/**
 * Crea la vertical "General" para un negocio específico
 */
export async function createGeneralVertical(businessId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Verificar si ya existe una vertical General para este negocio
    const { data: existing } = await supabase
      .from('verticals')
      .select('id')
      .eq('business_id', businessId)
      .eq('name', 'General')
      .eq('is_system', true)
      .single();
    
    if (existing) {
      console.log('✅ Vertical General ya existe para este negocio');
      return existing.id;
    }
    
    // Crear nueva vertical General
    const { data: generalVertical, error } = await supabase
      .from('verticals')
      .insert([{
        business_id: businessId,
        name: "General",
        description: "Movimientos generales del negocio",
        active: true,
        is_template: false,
        is_system: true,
        variables_schema: {
          type: "general",
          unit: "unidad",
          price: 0,
          category: "sistema",
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            isSystemGenerated: true,
            isHidden: true,
            autoAssign: true
          }
        }
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating general vertical:', error);
      return null;
    }
    
    console.log('✅ Vertical General creada:', generalVertical.id);
    return generalVertical.id;
    
  } catch (error) {
    console.error('Error in createGeneralVertical:', error);
    return null;
  }
}

/**
 * Agrega vertical General a todos los negocios existentes que no la tengan
 */
export async function addGeneralVerticalToExistingBusinesses(): Promise<void> {
  try {
    const supabase = createClient();
    
    // Obtener todos los negocios del usuario actual
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name');
    
    if (businessError) {
      console.error('Error fetching businesses:', businessError);
      return;
    }
    
    if (!businesses || businesses.length === 0) {
      console.log('No hay negocios para procesar');
      return;
    }
    
    console.log(`Procesando ${businesses.length} negocios...`);
    
    for (const business of businesses) {
      const verticalId = await createGeneralVertical(business.id);
      if (verticalId) {
        console.log(`✅ Vertical General agregada a: ${business.name}`);
      } else {
        console.warn(`⚠️ No se pudo agregar vertical General a: ${business.name}`);
      }
    }
    
    console.log('✅ Proceso completado');
    
  } catch (error) {
    console.error('Error in addGeneralVerticalToExistingBusinesses:', error);
  }
}

/**
 * Obtiene la vertical General de un negocio específico
 */
export async function getGeneralVertical(businessId: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('verticals')
      .select('*')
      .eq('business_id', businessId)
      .eq('name', 'General')
      .eq('is_system', true)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error getting general vertical:', error);
      return null;
    }
    
    return data;
    
  } catch (error) {
    console.error('Error in getGeneralVertical:', error);
    return null;
  }
}

/**
 * Obtiene TODAS las verticales incluyendo las del sistema (solo para uso interno)
 */
export async function getAllVerticals(businessId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('verticals')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting all verticals:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Obtiene solo las verticales visibles para el usuario
 */
export async function getUserVerticals(businessId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('verticals')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .neq('is_system', true) // ✅ Excluir verticales del sistema
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting user verticals:', error);
    return [];
  }
  
  return data || [];
}