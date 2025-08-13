// components/verticals/hooks/useVerticals.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Vertical {
  id: string;
  name: string;
  description: string;
  price: number | null;
}

export function useVerticals(businessId: string) {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerticals = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    
    console.log('Fetching verticals for business:', businessId);
    
    const { data, error } = await supabase
      .from("verticals")
      .select("id,name,description,price")
      .eq("business_id", businessId)
      .eq("active", true)
      .order("created_at", { ascending: false });

    console.log('Verticals query result:', { data, error });

    if (!error && data) {
      setVerticals(data as Vertical[]);
    }
    setLoading(false);
  }, [businessId]);

  const deleteVertical = async (verticalId: string, hardDelete: boolean = false) => {
    const supabase = createClient();
    
    if (hardDelete) {
      try {
        // Opción 1: Usar la función de base de datos (si está configurada)
        try {
          const { error: functionError } = await supabase.rpc('delete_vertical_with_data', {
            vertical_id_param: verticalId
          });
          
          if (!functionError) {
            // Si la función existe y funciona, terminar aquí
            return;
          }
        } catch (functionError) {
          console.log('Función de base de datos no disponible, usando método manual');
        }

        // Opción 2: Borrado manual en cascada
        // 1. Obtener información de la vertical
        const { data: vertical, error: verticalFetchError } = await supabase
          .from('verticals')
          .select('business_id')
          .eq('id', verticalId)
          .single();

        if (verticalFetchError) {
          throw new Error(`Error obteniendo vertical: ${verticalFetchError.message}`);
        }

        // 2. Obtener IDs de las vacas del negocio
        const { data: cows, error: cowsQueryError } = await supabase
          .from('livestock_cows')
          .select('id')
          .eq('business_id', vertical.business_id);

        if (cowsQueryError) {
          console.warn(`Error obteniendo vacas: ${cowsQueryError.message}`);
        }

        // 3. Eliminar registros de leche asociados a las vacas
        if (cows && cows.length > 0) {
          const cowIds = cows.map(cow => cow.id);
          const { error: milkError } = await supabase
            .from('livestock_milk_records')
            .delete()
            .in('cow_id', cowIds);

          if (milkError && !milkError.message.includes('does not exist')) {
            console.warn(`Error eliminando registros de leche: ${milkError.message}`);
          }
        }

        // 4. Eliminar movimientos de la vertical
        const { error: movementsError } = await supabase
          .from('movements')
          .delete()
          .eq('vertical_id', verticalId);

        if (movementsError && !movementsError.message.includes('does not exist')) {
          console.warn(`Error eliminando movimientos: ${movementsError.message}`);
        }

        // 5. Eliminar vacas del negocio
        const { error: cowsError } = await supabase
          .from('livestock_cows')
          .delete()
          .eq('business_id', vertical.business_id);

        if (cowsError && !cowsError.message.includes('does not exist')) {
          console.warn(`Error eliminando vacas: ${cowsError.message}`);
        }

        // 6. Eliminar otros registros relacionados (tabla genérica)
        const potentialTables = [
          'inventory', 
          'inventories',
          'records',
          'dairy_records',
          'production_records'
        ];

        for (const tableName of potentialTables) {
          try {
            const { error } = await supabase
              .from(tableName)
              .delete()
              .eq("vertical_id", verticalId);

            if (error && !error.message.includes('does not exist') && !error.message.includes('relation') && !error.message.includes('table')) {
              console.warn(`Error eliminando de ${tableName}: ${error.message}`);
            }
          } catch {
            console.warn(`Tabla ${tableName} no existe o no es accesible`);
          }
        }

        // 7. Finalmente eliminar la vertical
        const { error: verticalError } = await supabase
          .from("verticals")
          .delete()
          .eq("id", verticalId);

        if (verticalError) {
          throw new Error(`Error eliminando vertical: ${verticalError.message}`);
        }

        console.log(`Vertical ${verticalId} eliminada con todos sus datos relacionados`);

      } catch (error) {
        console.error('Error en borrado en cascada:', error);
        throw error;
      }
    } else {
      // Soft delete - solo marcar como inactivo
      const { error } = await supabase
        .from("verticals")
        .update({ active: false })
        .eq("id", verticalId);

      if (error) {
        throw new Error(error.message);
      }
    }

    await fetchVerticals();
  };

  const createVertical = async (verticalData: {
    name: string;
    description: string;
    price: number;
  }) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("verticals")
      .insert([{
        business_id: businessId,
        name: verticalData.name,
        description: verticalData.description,
        price: verticalData.price,
        is_template: false,
        is_system: false,
        active: true,
      }]);

    if (error) {
      throw new Error(error.message);
    }

    await fetchVerticals();
  };

  useEffect(() => {
    fetchVerticals();
  }, [businessId, fetchVerticals]);

  return {
    verticals,
    loading,
    fetchVerticals,
    deleteVertical,
    createVertical,
  };
}
