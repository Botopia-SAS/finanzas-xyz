// components/verticals/verticalDetail/dairy/ExpensesTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  Search,
  Filter
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Movement {
  id: string;
  business_id: string;
  vertical_id: string;
  date: string;
  amount: number;
  type: string; // 'income' o 'expense'
  description?: string;
  store?: string;
  payment_method?: string;
  entity?: string;
  created_at: string;
}

interface ExpensesTableProps {
  businessId: string;
  verticalId: string;
  refreshTrigger: number;
  onRefresh: () => void;
  onAddExpense: () => void;
}

export default function ExpensesTable({ 
  businessId, 
  verticalId, 
  refreshTrigger, 
  onRefresh, 
  onAddExpense 
}: ExpensesTableProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("expense"); // Por defecto mostrar solo gastos
  const [dateFilter, setDateFilter] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchMovements();
  }, [refreshTrigger]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      const { data: movementsData, error: movementsError } = await supabase
        .from('movements')
        .select('*')
        .eq('business_id', businessId)
        .eq('vertical_id', verticalId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (movementsError) {
        console.error('Error fetching movements:', movementsError);
        if (movementsError.code === 'PGRST116' || movementsError.code === '42P01') {
          setMovements([]);
          return;
        }
        throw movementsError;
      }

      setMovements(movementsData || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movementId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este movimiento?')) return;

    try {
      const { error } = await supabase
        .from('movements')
        .delete()
        .eq('id', movementId);

      if (error) throw error;
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting movement:', error);
      alert('Error al eliminar el movimiento');
    }
  };

  const getMovementTypeBadge = (type: string, amount: number) => {
    if (type === 'expense' || amount < 0) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          💸 Gasto
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          💰 Ingreso
        </Badge>
      );
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = !searchTerm || 
      movement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.store?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || 
      (typeFilter === 'expense' && (movement.type === 'expense' || movement.amount < 0)) ||
      (typeFilter === 'income' && (movement.type === 'income' || movement.amount > 0));
    
    const matchesDate = !dateFilter || movement.date.startsWith(dateFilter);
    
    return matchesSearch && matchesType && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getTotalAmount = () => {
    return filteredMovements.reduce((sum, movement) => sum + Math.abs(movement.amount), 0);
  };

  const getTotalExpenses = () => {
    return filteredMovements
      .filter(m => m.type === 'expense' || m.amount < 0)
      .reduce((sum, movement) => sum + Math.abs(movement.amount), 0);
  };

  const getTotalIncome = () => {
    return filteredMovements
      .filter(m => m.type === 'income' || m.amount > 0)
      .reduce((sum, movement) => sum + movement.amount, 0);
  };

  const getNetAmount = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos de la Vertical</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle>Movimientos de la Vertical ({filteredMovements.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar movimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="expense">Solo Gastos</option>
                <option value="income">Solo Ingresos</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={onAddExpense} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Movimiento
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Resumen de movimientos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredMovements.length}</div>
            <div className="text-sm text-gray-600">Total Movimientos</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${getTotalIncome().toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Ingresos</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">${getTotalExpenses().toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Gastos</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${getNetAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${getNetAmount().toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Balance Neto</div>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || typeFilter || dateFilter ? 'No se encontraron movimientos con esos criterios' : 'No hay movimientos registrados'}
          </div>
        ) : (
          <>
            {/* Vista de escritorio */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Fecha</th>
                    <th className="text-left py-2 px-4 font-medium">Tipo</th>
                    <th className="text-left py-2 px-4 font-medium">Descripción</th>
                    <th className="text-left py-2 px-4 font-medium">Entidad</th>
                    <th className="text-left py-2 px-4 font-medium">Método Pago</th>
                    <th className="text-left py-2 px-4 font-medium">Monto</th>
                    <th className="text-left py-2 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(movement.date)}</td>
                      <td className="py-3 px-4">{getMovementTypeBadge(movement.type, movement.amount)}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={movement.description || ''}>
                          {movement.description || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">{movement.entity || '-'}</td>
                      <td className="py-3 px-4">{movement.payment_method || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className={`h-4 w-4 ${movement.amount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`font-semibold ${movement.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.amount >= 0 ? '+' : ''}${movement.amount.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Edit movement */}}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(movement.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista móvil */}
            <div className="md:hidden space-y-4">
              {filteredMovements.map((movement) => (
                <div key={movement.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getMovementTypeBadge(movement.type, movement.amount)}
                        <span className="text-sm text-gray-500">{formatDate(movement.date)}</span>
                      </div>
                      <h3 className="font-medium text-lg">{movement.description || 'Sin descripción'}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: Edit movement */}}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(movement.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Monto:</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className={`h-4 w-4 ${movement.amount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`font-bold text-lg ${movement.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.amount >= 0 ? '+' : ''}${movement.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {movement.entity && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Entidad:</span>
                        <span className="font-medium">{movement.entity}</span>
                      </div>
                    )}
                    
                    {movement.payment_method && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Método Pago:</span>
                        <span className="font-medium">{movement.payment_method}</span>
                      </div>
                    )}
                    
                    {movement.store && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tienda:</span>
                        <span className="font-medium">{movement.store}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
