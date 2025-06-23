"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import BusinessCard, { Business } from "./BusinessCard";
import BusinessForm from "./BusinessForm";
import BusinessEditModal from "./BusinessEditModal";
import Modal from "./Modal";

interface DashboardPanelProps {
  businesses: Business[];
}

export default function DashboardPanel({ businesses }: DashboardPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setShowEditModal(true);
  };

  const handleDelete = (businessId: string) => {
    // El BusinessCard ya maneja la eliminación
    // Aquí podrías agregar lógica adicional si es necesario
    console.log('Negocio eliminado:', businessId);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingBusiness(null);
    // Refrescar la página para mostrar los cambios
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mis Negocios
          </h1>
          
        </div>

        {/* Grid de negocios - ORIGINAL */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {businesses.map((business) => (
            <BusinessCard 
              key={business.id} 
              business={business}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {/* ✅ Card MEJORADA para agregar nuevo negocio */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="relative flex items-center justify-center border-2 border-dashed border-blue-200 rounded-xl h-48 cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group overflow-hidden"
          >
            {/* Fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Círculos decorativos */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-200/30 rounded-full group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-purple-200/30 rounded-full group-hover:scale-125 transition-transform duration-500" />
            
            {/* Contenido principal */}
            <div className="relative text-center z-10">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mx-auto mb-4 w-fit">
                <PlusCircle size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
                Crear Negocio
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                Comienza a gestionar
              </p>
            </div>
          </div>
        </div>

        {/* Modal para crear negocio */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <BusinessForm onSuccess={() => setShowCreateModal(false)} />
        </Modal>

        {/* Modal para editar negocio */}
        <BusinessEditModal
          business={editingBusiness}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBusiness(null);
          }}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
}