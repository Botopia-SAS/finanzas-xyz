// components/verticals/verticalDetail/dairy/AddCowModal.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ParentSearchSelector from "./ParentSearchSelector";

interface AddCowModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  verticalId: string;
  onSuccess: () => void;
}

export default function AddCowModal({ isOpen, onClose, businessId, verticalId, onSuccess }: AddCowModalProps) {
  const [formData, setFormData] = useState({
    tag: '',
    name: '',
    breed: '',
    birth_date: '',
    status: 'active',
    precio: '' // Nuevo campo para precio
  });
  const [selectedFather, setSelectedFather] = useState<any>(null);
  const [selectedMother, setSelectedMother] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos de la vaca
      const cowData = {
        tag: formData.tag,
        name: formData.name,
        breed: formData.breed,
        birth_date: formData.birth_date,
        status: formData.status,
        business_id: businessId,
        precio: formData.precio ? parseFormattedNumber(formData.precio) : null
      };

      console.log('Enviando datos de vaca:', cowData);

      // Insertar la vaca
      const { data: insertedCow, error: cowError } = await supabase
        .from('livestock_cows')
        .insert([cowData])
        .select()
        .single();

      if (cowError) {
        console.error('Error de base de datos:', cowError);
        throw cowError;
      }

      // Si hay padres seleccionados, crear registro de nacimiento
      if (selectedFather || selectedMother) {
        const birthEventData = {
          business_id: businessId,
          calf_id: insertedCow.id,
          dam_id: selectedMother?.id || null,
          sire_id: selectedFather?.id || null,
          birth_date: formData.birth_date,
          notes: `Registro de nacimiento para ${formData.name} (${formData.tag})`
        };

        console.log('Creando evento de nacimiento:', birthEventData);

        const { error: birthError } = await supabase
          .from('livestock_birth_events')
          .insert([birthEventData]);

        if (birthError) {
          console.error('Error creando evento de nacimiento:', birthError);
          // No lanzar error, la vaca ya se guardó
          console.warn('La vaca se guardó pero no se pudo crear el evento de nacimiento');
        }
      }

      // Si se especificó un precio, registrarlo como gasto
      if (formData.precio && parseFormattedNumber(formData.precio) > 0) {
        const movementData = {
          type: 'gasto',
          amount: -Math.abs(parseFormattedNumber(formData.precio)), // Negativo para gastos
          description: `Compra de ganado - ${formData.name} (${formData.tag})`,
          date: new Date().toISOString().split('T')[0],
          business_id: businessId,
          vertical_id: verticalId,
          entity: 'Compra de Ganado',
          payment_method: '',
          store: ''
        };

        console.log('Registrando movimiento de compra:', movementData);

        const { error: movementError } = await supabase
          .from('movements')
          .insert([movementData]);

        if (movementError) {
          console.error('Error registrando movimiento:', movementError);
          // No lanzar error aquí, la vaca ya se guardó correctamente
          console.warn('La vaca se guardó pero no se pudo registrar el movimiento');
        }
      }

      onSuccess();
      onClose();
      setFormData({
        tag: '',
        name: '',
        breed: '',
        birth_date: '',
        status: 'active',
        precio: ''
      });
      setSelectedFather(null);
      setSelectedMother(null);
    } catch (error) {
      console.error('Error adding cow:', error);
      alert('Error al agregar la vaca: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Formato especial para el campo precio
    if (name === 'precio') {
      const formattedValue = formatNumber(value);
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Función para formatear números con separadores de miles
  const formatNumber = (value: string): string => {
    // Remover todo excepto números
    const numbers = value.replace(/[^\d]/g, '');
    
    // Formatear con separadores de miles
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Función para parsear número formateado a número
  const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl xl:max-w-7xl 2xl:max-w-[90rem] max-h-[98vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🐄</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Agregar Nueva Vaca</h2>
                <p className="text-sm text-gray-500">Registra una nueva vaca en el inventario</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
          {/* Información Básica */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs">ℹ️</span>
              </div>
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tag" className="text-sm font-medium text-gray-700">
                  Etiqueta *
                </Label>
                <Input
                  id="tag"
                  name="tag"
                  type="text"
                  value={formData.tag}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 001"
                  className="text-base h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Bella"
                  className="text-base h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed" className="text-sm font-medium text-gray-700">
                  Raza *
                </Label>
                <Input
                  id="breed"
                  name="breed"
                  type="text"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Holstein"
                  className="text-base h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs">📅</span>
              </div>
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
                  Fecha de Nacimiento *
                </Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                  className="text-base h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Estado
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base bg-white"
                >
                  <option value="active">Activa</option>
                  <option value="pregnant">Preñada</option>
                  <option value="dry">Seca</option>
                  <option value="sick">Enferma</option>
                </select>
              </div>
            </div>
          </div>

          {/* Genealogía */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs">🧬</span>
              </div>
              Genealogía (Opcional)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Padre (Toro)
                </Label>
                <ParentSearchSelector
                  businessId={businessId}
                  selectedParentId={selectedFather?.id}
                  onParentSelect={setSelectedFather}
                  label="Padre (Toro)"
                  placeholder="Buscar padre por nombre o etiqueta..."
                  excludeCowId={undefined}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Madre (Vaca)
                </Label>
                <ParentSearchSelector
                  businessId={businessId}
                  selectedParentId={selectedMother?.id}
                  onParentSelect={setSelectedMother}
                  label="Madre (Vaca)"
                  placeholder="Buscar madre por nombre o etiqueta..."
                  excludeCowId={undefined}
                />
              </div>
            </div>
          </div>

          {/* Información Económica */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs">💰</span>
              </div>
              Información Económica
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="precio" className="text-sm font-medium text-gray-700">
                  Precio de Compra (Opcional)
                </Label>
                <Input
                  id="precio"
                  name="precio"
                  type="text"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="0"
                  className="text-base h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                  <p className="text-sm text-amber-800 font-medium">
                    Formato: {formData.precio ? `$${parseFormattedNumber(formData.precio).toLocaleString('es-CO')}` : '$0'}
                  </p>
                  {formData.precio && (
                    <p className="text-xs text-amber-600 mt-1">
                      Se registrará automáticamente como gasto en movimientos
                    </p>
                  )}
                </div>
              </div>
              <div className="lg:pl-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200 h-full flex items-center">
                  <div className="text-center w-full">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      Registro Automático
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Si especificas un precio de compra, se creará automáticamente 
                      un movimiento de gasto asociado a esta vertical por el valor ingresado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-4 -mx-6 lg:-mx-8 -mb-6 lg:-mb-8 rounded-b-xl">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="px-8 py-2.5 h-11 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-2.5 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>💾</span>
                    Guardar Vaca
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
