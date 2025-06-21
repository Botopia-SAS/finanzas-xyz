"use client";

import { useState } from 'react';
import FloatingActionButton from './FloatingActionButton';
import Modal from './dashboard/Modal';
import MovementForm from './dashboard/MovementForm';

interface BusinessLayoutWrapperProps {
  children: React.ReactNode;
  businessId: string;
}

export default function BusinessLayoutWrapper({ children, businessId }: BusinessLayoutWrapperProps) {
  const [moveModalOpen, setMoveModalOpen] = useState(false);

  return (
    <>
      {children}
      
      {/* FAB que aparece en todas las páginas del negocio */}
      <FloatingActionButton 
        businessId={businessId}
        onAddMovement={() => setMoveModalOpen(true)}
      />

      {/* Modal para agregar movimiento */}
      <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Nuevo Movimiento</h2>
        <MovementForm 
          businessId={businessId}
          onComplete={() => {
            setMoveModalOpen(false);
            // Opcionalmente refrescar la página
            window.location.reload();
          }}
        />
      </Modal>
    </>
  );
}