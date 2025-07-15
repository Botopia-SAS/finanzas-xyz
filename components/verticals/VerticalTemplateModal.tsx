// components/verticals/VerticalTemplateModal.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useVerticals } from "./hooks/useVerticals";
import { VERTICAL_TEMPLATES, VerticalTemplate } from "./constants/verticalTemplates";
import VerticalTemplateCard from "./VerticalTemplateCard";

interface VerticalTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess: () => void;
}

export default function VerticalTemplateModal({ 
  isOpen, 
  onClose, 
  businessId, 
  onSuccess 
}: VerticalTemplateModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { createVertical } = useVerticals(businessId);

  const handleAddVertical = async (template: VerticalTemplate) => {
    setLoading(template.name);
    
    try {
      await createVertical({
        name: template.name,
        description: template.description,
        price: template.price,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al agregar vertical: " + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Plantillas de Verticales</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {VERTICAL_TEMPLATES.map((template) => (
            <VerticalTemplateCard
              key={template.name}
              template={template}
              loading={loading}
              onAdd={handleAddVertical}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
