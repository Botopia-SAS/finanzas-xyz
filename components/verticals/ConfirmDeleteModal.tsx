// components/verticals/ConfirmDeleteModal.tsx
"use client";

import React from "react";
import { X, AlertTriangle, Trash2, Archive } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  verticalName: string;
  onConfirm: (hardDelete: boolean) => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  verticalName,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800">Confirmar eliminación</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            ¿Qué deseas hacer con la vertical <strong>&ldquo;{verticalName}&rdquo;</strong>?
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => onConfirm(false)}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Archive className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Desactivar</div>
                <div className="text-sm text-gray-500">
                  Oculta la vertical pero mantiene todos los datos
                </div>
              </div>
            </button>

            <button
              onClick={() => onConfirm(true)}
              className="w-full flex items-center space-x-3 p-3 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium text-red-700">Eliminar completamente</div>
                <div className="text-sm text-red-500">
                  Elimina la vertical y todos sus datos relacionados
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
