"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/BackButton";
import Modal from "@/components/dashboard/Modal";
import MovementForm from "@/components/dashboard/MovementForm";
import { Pencil, Trash2, Filter, X, CheckSquare, Square, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

// ✅ Interface actualizada para coincidir con la base de datos y MovementForm
interface Movement {
  id: string; // ✅ Siempre string, no opcional
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  vertical_id?: string; // ✅ Changed to match MovementForm interface
  vertical?: { name: string } | null;
  description?: string;
  business_id?: string;
  created_at?: string;
}

interface Vertical {
  id: string;
  name: string;
}

// ✅ Definir tipo para datos sin validar que vienen de Supabase
interface UnvalidatedMovement {
  id?: string | null;
  date?: string;
  type?: string;
  amount?: number;
  vertical_id?: string | null;
  vertical?: { name: string } | null;
  description?: string | null;
  business_id?: string;
  created_at?: string;
}

// ✅ Type guard mejorado con tipo específico
function isValidMovement(movement: UnvalidatedMovement): movement is Movement {
  return !!(
    movement && 
    typeof movement.id === 'string' && 
    movement.id.length > 0 &&
    typeof movement.date === 'string' &&
    (movement.type === 'ingreso' || movement.type === 'gasto') &&
    typeof movement.amount === 'number'
  );
}

export default function MovementsPage() {
  const { businessId } = useParams();
  
  const [movements, setMovements] = useState<Movement[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [filter, setFilter] = useState<"all" | "ingreso" | "gasto">("all");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para selección múltiple
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  
  // Por defecto, no filtrar por fechas
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });

  // Función para cargar movimientos sin filtro de fecha por defecto
  const loadMovements = useCallback(async () => {
    if (!businessId) return;
    
    setLoading(true);
    const supabase = createClient();
    
    // Cargar verticales para el filtro
    const { data: verticalsData } = await supabase
      .from("verticals")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true);
      
    setVerticals(verticalsData || []);
    
    // Construir la consulta base - sin filtro de fecha por defecto
    let query = supabase
      .from("movements")
      .select(`
        *,
        vertical:vertical_id (
          name
        )
      `)
      .eq("business_id", businessId)
      .order("date", { ascending: false }); // Ordenar de más reciente a más antiguo
      
    // Aplicar filtro de fecha solo si se han seleccionado
    if (dateRange.from) {
      query = query.gte("date", dateRange.from);
    }
    
    if (dateRange.to) {
      query = query.lte("date", dateRange.to);
    }
      
    // Aplicar filtro por tipo si no es "all"
    if (filter !== "all") {
      query = query.eq("type", filter);
    }
    
    // Aplicar filtro por vertical si no es "all"
    if (verticalFilter !== "all") {
      query = query.eq("vertical_id", verticalFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error cargando movimientos:", error);
    } else {
      const validMovements = (data as UnvalidatedMovement[] || []).filter(isValidMovement);
      setMovements(validMovements);
    }
    
    setLoading(false);
    
    // Resetear selecciones cuando cambian los datos
    setSelectedMovements([]);
    setSelectAllChecked(false);
  }, [businessId, filter, verticalFilter, dateRange]);

  // Cargar movimientos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  // Manejar selección de todos los movimientos
  const handleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedMovements([]);
    } else {
      setSelectedMovements(movements.map(m => m.id));
    }
    setSelectAllChecked(!selectAllChecked);
  };

  // Manejar selección individual
  const handleSelect = (id: string) => {
    if (selectedMovements.includes(id)) {
      setSelectedMovements(prev => prev.filter(itemId => itemId !== id));
    } else {
      setSelectedMovements(prev => [...prev, id]);
    }
  };

  // Eliminar un movimiento individual
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este movimiento?")) return;
    
    await deleteMovements([id]);
  };

  // Eliminar múltiples movimientos
  const handleDeleteSelected = async () => {
    if (selectedMovements.length === 0) return;
    
    if (!confirm(`¿Estás seguro de eliminar ${selectedMovements.length} movimientos seleccionados?`)) return;
    
    await deleteMovements(selectedMovements);
  };

  // Función para eliminar movimientos (individual o múltiples)
  const deleteMovements = async (ids: string[]) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("movements")
      .delete()
      .in("id", ids);
      
    if (error) {
      console.error("Error eliminando movimientos:", error);
      return;
    }
    
    // Actualizar la lista sin recargar
    setMovements(movements.filter(m => !ids.includes(m.id)));
    
    // Limpiar selecciones
    setSelectedMovements(prev => prev.filter(id => !ids.includes(id)));
    if (selectAllChecked) setSelectAllChecked(false);
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilter("all");
    setVerticalFilter("all");
    setDateRange({
      from: "",
      to: ""
    });
  };

  return (
    <div className="w-full pb-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold mt-2 text-[#152241]">Movimientos</h1>
      </div>
      
      {/* Panel superior con filtros y botón de añadir */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showFilters ? 'bg-[#152241] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={16} />
              {showFilters ? "Ocultar filtros" : "Filtros"}
            </button>
            
            {/* Pestañas de filtro temporal como en el dashboard */}
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              <button 
                className={`px-4 py-1.5 text-sm rounded-md transition ${
                  dateRange.from === new Date().toISOString().split('T')[0] && dateRange.to === new Date().toISOString().split('T')[0]
                  ? 'bg-white shadow-sm text-[#152241] font-medium' 
                  : 'text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setDateRange({from: today, to: today});
                }}
              >
                Hoy
              </button>
              <button
                className={`px-4 py-1.5 text-sm rounded-md transition ${
                  dateRange.from && dateRange.to && dateRange.from !== new Date().toISOString().split('T')[0]
                  ? 'bg-[#152241] text-white font-medium' 
                  : 'text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => {
                  const date = new Date();
                  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
                  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
                  setDateRange({from: firstDay, to: lastDay});
                }}
              >
                Mes
              </button>
              <button
                className={`px-4 py-1.5 text-sm rounded-md transition ${
                  !dateRange.from && !dateRange.to
                  ? 'bg-white shadow-sm text-[#152241] font-medium' 
                  : 'text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setDateRange({from: '', to: ''})}
              >
                Año
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:opacity-90 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <span className="text-lg font-bold leading-none">+</span>
            <span>Agregar movimiento</span>
          </button>
        </div>
        
        {/* Panel de filtros expandible */}
        <div className={`p-4 border-b transition-all ${showFilters ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Tipo</label>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "ingreso" | "gasto")}
                className="w-full border rounded-lg p-2.5 focus:ring-[#7dd1d6] focus:border-[#7dd1d6]"
              >
                <option value="all">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Vertical</label>
              <select 
                value={verticalFilter}
                onChange={(e) => setVerticalFilter(e.target.value)}
                className="w-full border rounded-lg p-2.5 focus:ring-[#7dd1d6] focus:border-[#7dd1d6]"
              >
                <option value="all">Todas las verticales</option>
                {verticals.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Desde</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full border rounded-lg p-2.5 pl-10 focus:ring-[#7dd1d6] focus:border-[#7dd1d6]"
                />
                <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Hasta</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full border rounded-lg p-2.5 pl-10 focus:ring-[#7dd1d6] focus:border-[#7dd1d6]"
                />
                <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 py-2 px-4 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            >
              <X size={14} />
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Barra de acciones para selección múltiple */}
      {selectedMovements.length > 0 && (
        <div className="bg-[#152241] text-white p-3 rounded-xl mb-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} />
            <span>{selectedMovements.length} movimiento(s) seleccionado(s)</span>
          </div>
          <button
            onClick={handleDeleteSelected}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      )}
      
      {/* Tabla de movimientos - Responsive con selección múltiple */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-[#152241]">Movimientos</h2>
        </div>
        
        {/* Tabla para desktop */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-3 border-b">
                  <div className="flex items-center">
                    <button 
                      onClick={handleSelectAll}
                      className="text-gray-500 hover:text-[#fe8027] focus:outline-none"
                    >
                      {selectAllChecked ? 
                        <CheckSquare size={18} className="text-[#fe8027]" /> : 
                        <Square size={18} />
                      }
                    </button>
                  </div>
                </th>
                <th className="px-4 py-3 border-b text-gray-500 font-medium text-xs">Fecha</th>
                <th className="px-4 py-3 border-b text-gray-500 font-medium text-xs">Tipo</th>
                <th className="px-4 py-3 border-b text-gray-500 font-medium text-xs">Vertical</th>
                <th className="px-4 py-3 border-b text-gray-500 font-medium text-xs">Descripción</th>
                <th className="px-4 py-3 border-b text-right text-gray-500 font-medium text-xs">Monto</th>
                <th className="px-4 py-3 border-b text-center text-gray-500 font-medium text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#fe8027] border-t-transparent"></div>
                      <span className="ml-2">Cargando movimientos...</span>
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron movimientos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr 
                    key={movement.id} 
                    className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${
                      selectedMovements.includes(movement.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-3 py-4">
                      <button 
                        onClick={() => handleSelect(movement.id)}
                        className="text-gray-500 hover:text-[#fe8027] focus:outline-none"
                      >
                        {selectedMovements.includes(movement.id) ? 
                          <CheckSquare size={18} className="text-[#fe8027]" /> : 
                          <Square size={18} />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {new Date(movement.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center ${
                        movement.type === "ingreso" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {movement.type === "ingreso" ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                              <ArrowUpRight size={14} className="text-[#fe8027]" />
                            </div>
                            <span className="text-sm font-medium">Ingreso</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <ArrowDownRight size={14} className="text-[#7dd1d6]" />
                            </div>
                            <span className="text-sm font-medium">Gasto</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm">{movement.vertical?.name || "General"}</span>
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-sm">
                      {movement.description || "-"}
                    </td>
                    <td className={`px-4 py-4 text-right font-medium ${
                      movement.type === "ingreso" ? "text-green-600" : "text-red-600"
                    }`}>
                      <span className="text-sm">
                        {movement.type === "ingreso" ? "+" : "-"}
                        ${Math.abs(movement.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center space-x-1">
                        <button 
                          onClick={() => setEditingMovement(movement)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(movement.id)}
                          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Vista de tarjetas para móvil con estilo similar al dashboard */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#fe8027] border-t-transparent"></div>
                <span className="ml-2">Cargando movimientos...</span>
              </div>
            </div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron movimientos para los filtros seleccionados.
            </div>
          ) : (
            <div className="divide-y">
              {movements.map((movement) => (
                <div 
                  key={movement.id} 
                  className={`p-4 hover:bg-gray-50 ${
                    selectedMovements.includes(movement.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => handleSelect(movement.id)}
                      className="mt-0.5 text-gray-500 hover:text-[#fe8027] focus:outline-none"
                    >
                      {selectedMovements.includes(movement.id) ? 
                        <CheckSquare size={18} className="text-[#fe8027]" /> : 
                        <Square size={18} />
                      }
                    </button>
                    
                    <div className="w-10 flex-shrink-0 h-10 rounded-lg flex items-center justify-center">
                      {movement.type === "ingreso" ? (
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <ArrowUpRight className="text-[#fe8027]" size={20} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <ArrowDownRight className="text-[#7dd1d6]" size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {movement.type === "ingreso" ? "Ingreso" : "Gasto"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(movement.date).toLocaleDateString()}
                          </p>
                          {movement.description && (
                            <p className="text-sm mt-1 line-clamp-1">{movement.description}</p>
                          )}
                        </div>
                        
                        <span className={`font-semibold ${
                          movement.type === "ingreso" ? "text-green-600" : "text-red-600"
                        }`}>
                          {movement.type === "ingreso" ? "+" : "-"}
                          ${Math.abs(movement.amount).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {movement.vertical?.name || "General"}
                        </span>
                        
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => setEditingMovement(movement)}
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                            aria-label="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(movement.id)}
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* FAB para añadir en móvil */}
      <div className="md:hidden fixed bottom-6 right-6 z-10">
        <button
          onClick={() => setAddModalOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:opacity-90 text-white flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>
      
      {/* Modal para agregar */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4 text-[#152241]">Nuevo Movimiento</h2>
        <MovementForm 
          businessId={businessId as string}
          onComplete={() => {
            setAddModalOpen(false);
            loadMovements();
          }} 
        />
      </Modal>
      
      {/* Modal para editar */}
      <Modal isOpen={!!editingMovement} onClose={() => setEditingMovement(null)}>
        <h2 className="text-xl font-semibold mb-4 text-[#152241]">Editar Movimiento</h2>
        {editingMovement && (
          <MovementForm
            businessId={businessId as string}
            movement={editingMovement}
            onComplete={() => {
              setEditingMovement(null);
              loadMovements();
            }}
          />
        )}
      </Modal>
    </div>
  );
}