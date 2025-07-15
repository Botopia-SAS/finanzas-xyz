// app/business/[businessId]/verticals/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Grid, Plus } from "lucide-react";
import VerticalTemplateModal from "@/components/verticals/VerticalTemplateModal";
import VerticalsList from "@/components/verticals/VerticalsList";
import { useVerticals } from "@/components/verticals/hooks/useVerticals";

export default function VerticalesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = React.use(params);
  const router = useRouter();
  const { verticals } = useVerticals(businessId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleModalSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      {/* HEADER */}
      <div className="w-full max-w-full mx-auto bg-white rounded-2xl shadow p-6 mb-6 mx-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver al negocio
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Grid className="w-8 h-8 text-indigo-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Verticales Activos
              </h1>
              <p className="text-gray-600">
                Administra las líneas de negocio de tu empresa
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
              <div className="text-2xl font-bold text-gray-800">{verticals.length}</div>
              <div className="text-xs uppercase text-gray-500">
                Verticales
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-green-400 hover:from-orange-500 hover:to-green-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar vertical</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="w-full px-4">
        <VerticalsList 
          businessId={businessId} 
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* MODAL */}
      <VerticalTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        businessId={businessId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
