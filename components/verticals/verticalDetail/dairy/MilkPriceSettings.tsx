// components/verticals/verticalDetail/dairy/MilkPriceSettings.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Save, Edit, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MilkPriceSettingsProps {
  businessId: string;
  verticalId: string;
  onPriceUpdate?: () => void;
}

export default function MilkPriceSettings({ businessId, verticalId, onPriceUpdate }: MilkPriceSettingsProps) {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCurrentPrice();
  }, []);

  const fetchCurrentPrice = async () => {
    try {
      console.log('Fetching price for verticalId:', verticalId);
      console.log('VerticalId type:', typeof verticalId);
      
      const { data, error } = await supabase
        .from('verticals')
        .select('price')
        .eq('id', verticalId)
        .single();

      console.log('Price query result:', { data, error });

      if (error) {
        console.error('Error fetching price:', error);
        return;
      }

      const price = data?.price || 0;
      console.log('Setting current price to:', price);
      setCurrentPrice(price);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: string): string => {
    // Remover todo excepto números
    const numbers = value.replace(/[^\d]/g, '');
    
    // Formatear con separadores de miles
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditingPrice(currentPrice.toString());
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPrice("");
    setError(null);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatNumber(value);
    setEditingPrice(formattedValue);
  };

  const handleSavePrice = async () => {
    setLoading(true);
    setError(null);

    try {
      const numericPrice = parseFormattedNumber(editingPrice);
      
      if (numericPrice < 0) {
        setError('El precio no puede ser negativo');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('verticals')
        .update({ price: numericPrice })
        .eq('id', verticalId);

      if (error) {
        console.error('Error updating price:', error);
        setError('Error al actualizar el precio');
        return;
      }

      setCurrentPrice(numericPrice);
      setIsEditing(false);
      setEditingPrice("");
      
      // Notify parent components that price was updated
      if (onPriceUpdate) {
        onPriceUpdate();
      }
    } catch (error) {
      console.error('Error saving price:', error);
      setError('Error inesperado al guardar el precio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Precio del Litro de Leche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isEditing ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(currentPrice)}
                </div>
                <p className="text-sm text-gray-600">Precio por litro</p>
              </div>
              <Button
                onClick={handleStartEdit}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="price">Precio por litro (COP)</Label>
                <Input
                  id="price"
                  type="text"
                  value={editingPrice}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: {editingPrice ? formatCurrency(parseFormattedNumber(editingPrice)) : '$0'}
                </p>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSavePrice}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
