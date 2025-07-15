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
    const { data, error } = await supabase
      .from("verticals")
      .select("id,name,description,price")
      .eq("business_id", businessId)
      .eq("is_system", false)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVerticals(data as Vertical[]);
    }
    setLoading(false);
  }, [businessId]);

  const deleteVertical = async (verticalId: string, hardDelete: boolean = false) => {
    const supabase = createClient();
    
    if (hardDelete) {
      // Lista de tablas que podrían tener datos relacionados
      const potentialTables = [
        'movements',
        'inventory', 
        'inventories',
        'records',
        'dairy_records',
        'production_records'
      ];

      // Eliminar datos relacionados de todas las tablas que existan
      for (const tableName of potentialTables) {
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq("vertical_id", verticalId);

          // Solo mostrar error si no es "tabla no existe"
          if (error && !error.message.includes('does not exist') && !error.message.includes('relation') && !error.message.includes('table')) {
            console.warn(`Error eliminando de ${tableName}: ${error.message}`);
          }
        } catch {
          // Ignorar errores de tablas que no existen
          console.warn(`Tabla ${tableName} no existe o no es accesible`);
        }
      }

      // Finalmente eliminar la vertical
      const { error: verticalError } = await supabase
        .from("verticals")
        .delete()
        .eq("id", verticalId);

      if (verticalError) {
        throw new Error(`Error eliminando vertical: ${verticalError.message}`);
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
