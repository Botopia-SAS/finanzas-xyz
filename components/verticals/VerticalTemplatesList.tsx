// components/verticals/VerticalTemplatesList.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, GlassWater } from "lucide-react";

interface Vertical {
  id: string;
  name: string;
  description: string;
  price: number | null;
}

const DAIRY_TEMPLATE = {
  name: "Lechería",
  description: "Gestión de producción de leche, control de vacas y registros diarios.",
  price: 0,
};

export default function VerticalTemplatesList({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(false);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchVerticals() {
      setFetching(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("verticals")
        .select("id,name,description,price")
        .eq("business_id", businessId)
        .eq("is_system", false)
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (!error && data) setVerticals(data as Vertical[]);
      setFetching(false);
    }
    fetchVerticals();
  }, [businessId, loading]);

  const handleAdd = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("verticals")
      .insert([{
        business_id: businessId,
        name: DAIRY_TEMPLATE.name,
        description: DAIRY_TEMPLATE.description,
        price: DAIRY_TEMPLATE.price,
        is_template: false,
        is_system: false,
        active: true,
      }]);
    setLoading(false);
    if (error) {
      alert("Error al agregar vertical: " + error.message);
      return;
    }
    // refresca la lista
    setVerticals([]);
    setFetching(true);
  };

  return (
    <div className="space-y-12">
      {/* Plantilla central */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl">
          <div className="flex flex-col items-center space-y-4">
            <GlassWater size={48} className="text-blue-400" />
            <h3 className="text-2xl font-semibold">{DAIRY_TEMPLATE.name}</h3>
            <p className="text-gray-600 text-center max-w-md">
              {DAIRY_TEMPLATE.description}
            </p>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Agregar vertical"}
            </button>
          </div>
        </div>
      </div>

      {/* Tus verticales como cards clicables */}
      <div className="max-w-6xl mx-auto px-4">
        <h4 className="text-2xl font-semibold text-gray-800 mb-6">Tus verticales</h4>
        {fetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          </div>
        ) : verticals.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No has agregado verticales aún.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {verticals.map((v) => (
              <Link
                key={v.id}
                href={`/business/${businessId}/verticals/${v.id}`}
                className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-md transition p-6 flex flex-col"
              >
                <div className="text-5xl mb-3 self-center">🥛</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {v.name}
                </h2>
                <p className="text-gray-600 text-sm flex-1">{v.description}</p>
                <div className="mt-4 text-gray-700">
                  Precio: <span className="font-medium">{v.price ?? "—"} COP</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
