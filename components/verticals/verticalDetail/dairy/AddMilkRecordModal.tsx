// components/verticals/verticalDetail/dairy/AddMilkRecordModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Cow {
  id: string;
  tag: string;
  name: string;
  status: string;
}

interface AddMilkRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  verticalId: string;
  onSuccess: () => void;
  refreshTrigger?: number;
}

export default function AddMilkRecordModal({ isOpen, onClose, businessId, verticalId, onSuccess, refreshTrigger }: AddMilkRecordModalProps) {
  const [cows, setCows] = useState<Cow[]>([]);
  const [milkPrice, setMilkPrice] = useState<number>(0);
  const [formData, setFormData] = useState({
    cow_id: '',
    date: new Date().toISOString().split('T')[0],
    liters: '',
    quality: 'A',
    notes: '',
    sold: false
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchCows();
      fetchMilkPrice();
    }
  }, [isOpen, refreshTrigger]);

  const fetchMilkPrice = async () => {
    try {
      console.log('Fetching milk price for verticalId:', verticalId);
      console.log('VerticalId type:', typeof verticalId);
      
      const { data, error } = await supabase
        .from('verticals')
        .select('price')
        .eq('id', verticalId)
        .single();

      console.log('Milk price query result:', { data, error });

      if (error) {
        console.error('Error fetching milk price:', error);
        return;
      }

      const price = data?.price || 0;
      console.log('Setting milk price to:', price);
      setMilkPrice(price);
    } catch (error) {
      console.error('Error fetching milk price:', error);
    }
  };

  const fetchCows = async () => {
    try {
      console.log('Fetching cows for business:', businessId);
      console.log('Business ID type:', typeof businessId);
      console.log('Business ID length:', businessId.length);
      
      const { data, error } = await supabase
        .from('livestock_cows')
        .select('id, tag, name, status')
        .eq('business_id', businessId)
        .eq('status', 'active')
        .order('tag');

      console.log('Cows query result:', { data, error });
      console.log('Raw error details:', error);

      if (error) {
        console.error('Error fetching cows:', error);
        // Si la tabla no existe, usar array vacío
        if (error.code === 'PGRST116' || error.code === '42P01') {
          setCows([]);
          return;
        }
        throw error;
      }
      setCows(data || []);
    } catch (error) {
      console.error('Error fetching cows:', error);
      setCows([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting milk record:', formData);
      console.log('Business ID:', businessId);
      
      const recordData = {
        cow_id: formData.cow_id,
        date: formData.date,
        liters: parseFloat(formData.liters),
        quality: formData.quality || 'A',
        notes: formData.notes || '',
        business_id: businessId
      };
      
      console.log('Record data to insert:', recordData);
      
      const { data, error } = await supabase
        .from('livestock_milk_records')
        .insert([recordData])
        .select();

      console.log('Milk record insert result:', { data, error });

      if (error) {
        console.error('Detailed error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw error;
      }

      // Si se marcó como vendido, crear el ingreso automático
      if (formData.sold && formData.liters && milkPrice > 0) {
        const liters = parseFloat(formData.liters);
        const totalAmount = liters * milkPrice;
        
        // Obtener el nombre de la vaca para la descripción
        const selectedCow = cows.find(cow => cow.id === formData.cow_id);
        const cowName = selectedCow ? `${selectedCow.name} (${selectedCow.tag})` : 'Vaca desconocida';
        
        // Validar que tenemos todos los datos necesarios
        if (!businessId || !verticalId || !formData.date || !totalAmount) {
          console.error('Missing required data for movement:', {
            businessId,
            verticalId,
            date: formData.date,
            totalAmount
          });
          alert('Registro de ordeño creado exitosamente, pero faltan datos para el ingreso automático.');
          return;
        }
        
        const movementData = {
          business_id: businessId,
          vertical_id: verticalId,
          date: formData.date,
          amount: totalAmount,
          type: 'ingreso',
          description: `Venta de leche - ${liters}L de ${cowName}`
        };

        console.log('Creating income movement:', movementData);
        console.log('Data types:', {
          business_id: typeof businessId,
          vertical_id: typeof verticalId,
          date: typeof formData.date,
          amount: typeof totalAmount,
          type: typeof 'ingreso',
          description: typeof movementData.description
        });

        const { error: movementError } = await supabase
          .from('movements')
          .insert([movementData]);

        if (movementError) {
          console.error('Error creating income movement:', movementError);
          console.error('Movement error details:', {
            code: movementError.code,
            message: movementError.message,
            details: movementError.details,
            hint: movementError.hint
          });
          // No fallar toda la operación si hay error en el movimiento
          alert('Registro de ordeño creado exitosamente, pero hubo un problema al registrar el ingreso automático.');
        } else {
          console.log('Income movement created successfully');
        }
      }

      onSuccess();
      onClose();
      setFormData({
        cow_id: '',
        date: new Date().toISOString().split('T')[0],
        liters: '',
        quality: 'A',
        notes: '',
        sold: false
      });
    } catch (error) {
      console.error('Error adding milk record:', error);
      
      // Mostrar error más específico
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error, null, 2);
      }
      
      alert(`Error al agregar el registro de ordeño: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Registrar Ordeño</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="cow_id">Vaca *</Label>
            <select
              id="cow_id"
              name="cow_id"
              value={formData.cow_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar vaca</option>
              {cows.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.tag} - {cow.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="liters">Litros *</Label>
              <Input
                id="liters"
                name="liters"
                type="number"
                step="0.1"
                min="0"
                value={formData.liters}
                onChange={handleChange}
                required
                placeholder="Ej: 15.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quality">Calidad</Label>
            <select
              id="quality"
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">A - Excelente</option>
              <option value="B">B - Buena</option>
              <option value="C">C - Regular</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Checkbox de venta */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2">
              <input
                id="sold"
                name="sold"
                type="checkbox"
                checked={formData.sold}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="sold" className="text-sm font-medium">
                ¿Se vendió la leche?
              </Label>
            </div>
            
            {formData.sold && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm text-green-800">
                  <div className="font-medium">Ingreso automático:</div>
                  <div className="flex justify-between items-center mt-1">
                    <span>Litros: {formData.liters || '0'}L</span>
                    <span>Precio: ${milkPrice.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-green-300">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">
                      ${((parseFloat(formData.liters) || 0) * milkPrice).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
