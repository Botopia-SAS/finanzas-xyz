// components/verticals/VerticalsList.tsx
"use client";

import React, { useState } from "react";
import VerticalCard from "./VerticalCard";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useVerticals } from "./hooks/useVerticals";

interface VerticalsListProps {
  businessId: string;
  refreshTrigger: number;
}

export default function VerticalsList({ businessId, refreshTrigger }: VerticalsListProps) {
  const { verticals, loading, deleteVertical, fetchVerticals } = useVerticals(businessId);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    verticalId: string;
    verticalName: string;
  }>({ isOpen: false, verticalId: "", verticalName: "" });

  React.useEffect(() => {
    fetchVerticals();
  }, [refreshTrigger]);

  const handleDelete = (verticalId: string) => {
    const vertical = verticals.find(v => v.id === verticalId);
    if (vertical) {
      setDeleteModal({
        isOpen: true,
        verticalId,
        verticalName: vertical.name,
      });
    }
  };

  const handleConfirmDelete = async (hardDelete: boolean) => {
    try {
      await deleteVertical(deleteModal.verticalId, hardDelete);
      setDeleteModal({ isOpen: false, verticalId: "", verticalName: "" });
    } catch (error) {
      alert("Error al eliminar vertical: " + (error as Error).message);
    }
  };

  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, verticalId: "", verticalName: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-gray-400">
        Cargando…
      </div>
    );
  }

  if (verticals.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No hay verticales activas.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {verticals.map((vertical) => (
          <VerticalCard
            key={vertical.id}
            vertical={vertical}
            businessId={businessId}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        verticalName={deleteModal.verticalName}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
