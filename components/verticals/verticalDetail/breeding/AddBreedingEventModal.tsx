// components/verticals/verticalDetail/breeding/AddBreedingEventModal.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AddBreedingEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  verticalId: string;
  onSuccess: () => void;
}

export default function AddBreedingEventModal({ isOpen, onClose, businessId, verticalId, onSuccess }: AddBreedingEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Agregar Evento de Reproducción</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <p>Formulario de evento de reproducción</p>
            <p className="text-sm mt-2">Próximamente disponible</p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
