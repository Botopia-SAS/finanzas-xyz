// components/verticals/VerticalCard.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { Vertical } from "./hooks/useVerticals";
import { getVerticalIcon } from "./utils/verticalIcons";

interface VerticalCardProps {
  vertical: Vertical;
  businessId: string;
  onDelete: (id: string) => void;
}

export default function VerticalCard({ vertical, businessId, onDelete }: VerticalCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative bg-white rounded-2xl shadow hover:shadow-md transition p-6 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Opciones hover */}
      {isHovered && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link
            href={`/business/${businessId}/verticals/${vertical.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(vertical.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contenido de la tarjeta */}
      <div className="text-5xl mb-3 self-center">{getVerticalIcon(vertical.name)}</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">
        {vertical.name}
      </h2>
      <p className="text-gray-600 text-sm flex-1">{vertical.description}</p>
      <div className="mt-4 text-gray-700">
        Precio: <span className="font-medium">{vertical.price ?? "—"} COP</span>
      </div>
    </div>
  );
}
