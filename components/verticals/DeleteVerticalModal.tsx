// components/verticals/DeleteVerticalModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DeleteVerticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  verticalId: string;
  verticalName: string;
  onConfirm: (hardDelete: boolean) => void;
}

interface RelatedData {
  cows: number;
  milkRecords: number;
  movements: number;
}

export default function DeleteVerticalModal({ 
  isOpen, 
  onClose, 
  verticalId, 
  verticalName, 
  onConfirm 
}: DeleteVerticalModalProps) {
  const [relatedData, setRelatedData] = useState<RelatedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && verticalId) {
      fetchRelatedData();
    }
  }, [isOpen, verticalId]);

  const fetchRelatedData = async () => {
    setLoading(true);
    try {
      // Obtener información de la vertical
      const { data: vertical, error: verticalError } = await supabase
        .from('verticals')
        .select('business_id')
        .eq('id', verticalId)
        .single();

      if (verticalError) {
        console.error('Error obteniendo vertical:', verticalError);
        setRelatedData({ cows: 0, milkRecords: 0, movements: 0 });
        return;
      }

      // Contar vacas
      const { count: cowsCount } = await supabase
        .from('livestock_cows')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', vertical.business_id);

      // Contar registros de leche
      const { data: cows } = await supabase
        .from('livestock_cows')
        .select('id')
        .eq('business_id', vertical.business_id);

      let milkRecordsCount = 0;
      if (cows && cows.length > 0) {
        const cowIds = cows.map(cow => cow.id);
        const { count: milkCount } = await supabase
          .from('livestock_milk_records')
          .select('*', { count: 'exact', head: true })
          .in('cow_id', cowIds);
        milkRecordsCount = milkCount || 0;
      }

      // Contar movimientos
      const { count: movementsCount } = await supabase
        .from('movements')
        .select('*', { count: 'exact', head: true })
        .eq('vertical_id', verticalId);

      setRelatedData({
        cows: cowsCount || 0,
        milkRecords: milkRecordsCount,
        movements: movementsCount || 0
      });
    } catch (error) {
      console.error('Error contando datos relacionados:', error);
      setRelatedData({ cows: 0, milkRecords: 0, movements: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(hardDelete);
    onClose();
  };

  if (!isOpen) return null;

  const totalRecords = relatedData ? relatedData.cows + relatedData.milkRecords + relatedData.movements : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Eliminación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center">
            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-900 font-medium">
              ¿Estás seguro de que deseas eliminar la vertical "{verticalName}"?
            </p>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Calculando datos relacionados...</p>
            </div>
          ) : relatedData && totalRecords > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">
                Esta acción eliminará también:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                {relatedData.cows > 0 && (
                  <li>• {relatedData.cows} vaca{relatedData.cows !== 1 ? 's' : ''}</li>
                )}
                {relatedData.milkRecords > 0 && (
                  <li>• {relatedData.milkRecords} registro{relatedData.milkRecords !== 1 ? 's' : ''} de ordeño</li>
                )}
                {relatedData.movements > 0 && (
                  <li>• {relatedData.movements} movimiento{relatedData.movements !== 1 ? 's' : ''} financiero{relatedData.movements !== 1 ? 's' : ''}</li>
                )}
              </ul>
              <p className="text-xs text-red-600 mt-2 font-medium">
                Total: {totalRecords} registro{totalRecords !== 1 ? 's' : ''} será{totalRecords !== 1 ? 'n' : ''} eliminado{totalRecords !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                No hay datos relacionados que se eliminarán.
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-yellow-800">
                  Advertencia
                </p>
                <p className="text-xs text-yellow-700">
                  Esta acción no se puede deshacer. Todos los datos relacionados se eliminarán permanentemente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="confirmDelete"
              checked={hardDelete}
              onChange={(e) => setHardDelete(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="confirmDelete" className="text-sm text-gray-700">
              Confirmo que entiendo que esta acción eliminará todos los datos relacionados
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hardDelete || loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Cargando...' : 'Eliminar Definitivamente'}
          </Button>
        </div>
      </div>
    </div>
  );
}
