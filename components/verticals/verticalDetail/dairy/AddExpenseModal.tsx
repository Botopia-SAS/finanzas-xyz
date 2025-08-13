// components/verticals/verticalDetail/dairy/AddExpenseModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Cow {
  id: string;
  name: string;
  tag: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  verticalId: string;
  onSuccess: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, businessId, verticalId, onSuccess }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    type: 'gasto',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    entity: '',
    payment_method: '',
    store: ''
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // No necesitamos cargar vacas para la tabla movements
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convertir el monto a negativo si es un gasto
      const finalAmount = formData.type === 'gasto' ? -Math.abs(parseFloat(formData.amount)) : parseFloat(formData.amount);
      
      const movementData = {
        ...formData,
        business_id: businessId,
        vertical_id: verticalId,
        amount: finalAmount
      };

      console.log('Sending movement data:', movementData);

      const { error } = await supabase
        .from('movements')
        .insert([movementData]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      onSuccess();
      onClose();
      setFormData({
        type: 'gasto',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        entity: '',
        payment_method: '',
        store: ''
      });
    } catch (error) {
      console.error('Error adding movement:', error);
      alert('Error al agregar el movimiento. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-lg font-semibold">Agregar Nuevo Gasto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Movimiento *</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="gasto">💸 Gasto</option>
                <option value="ingreso">💰 Ingreso</option>
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Descripción del movimiento"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="entity">Entidad/Persona</Label>
              <Input
                id="entity"
                name="entity"
                type="text"
                value={formData.entity}
                onChange={handleChange}
                placeholder="Nombre de la entidad o persona"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_method">Método de Pago</Label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar método</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="check">Cheque</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <Label htmlFor="store">Tienda/Lugar</Label>
              <Input
                id="store"
                name="store"
                type="text"
                value={formData.store}
                onChange={handleChange}
                placeholder="Nombre de la tienda o lugar"
              />
            </div>
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
              {loading ? 'Guardando...' : 'Guardar Movimiento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
