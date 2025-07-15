// components/verticals/VerticalTemplateCard.tsx
"use client";

import React from "react";
import { Loader2, Lock } from "lucide-react";
import { VerticalTemplate } from "./constants/verticalTemplates";

interface VerticalTemplateCardProps {
  template: VerticalTemplate;
  loading: string | null;
  onAdd: (template: VerticalTemplate) => void;
}

export default function VerticalTemplateCard({ 
  template, 
  loading, 
  onAdd 
}: VerticalTemplateCardProps) {
  const isLoading = loading === template.name;
  const isDisabled = !template.isActive || isLoading;

  return (
    <div
      className={`border rounded-lg p-4 transition ${
        template.isActive 
          ? 'hover:shadow-md cursor-pointer border-gray-200' 
          : 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-100'
      }`}
    >
      <div className="text-4xl mb-3 text-center relative">
        {template.icon}
        {!template.isActive && (
          <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-1">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-between">
        {template.name}
        {template.isComingSoon && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Próximamente
          </span>
        )}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4">
        {template.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-700 font-medium">
          {template.price === 0 ? "Gratis" : `${template.price} COP`}
        </span>
        <button
          onClick={() => template.isActive && onAdd(template)}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            template.isActive
              ? 'bg-gradient-to-r from-orange-400 to-green-400 hover:from-orange-500 hover:to-green-500 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : template.isActive ? (
            "Agregar"
          ) : (
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Bloqueado</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
