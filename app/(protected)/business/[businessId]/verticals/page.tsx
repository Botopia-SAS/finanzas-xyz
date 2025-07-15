// app/business/[businessId]/verticals/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Grid, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Vertical {
  id: string;
  name: string;
  description: string;
  price: number | null;
}

export default function VerticalesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = React.use(params);
  const router = useRouter();

  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      setFetching(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("verticals")
        .select("id,name,description,price")
        .eq("business_id", businessId)
        .eq("is_system", false)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVerticals(data as Vertical[]);
      }
      setFetching(false);
    })();
  }, [businessId, loading]);

  const handleAdd = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("verticals").insert([
      {
        business_id: businessId,
        name: "Lechería",
        description:
          "Gestión de producción de leche, control de vacas y registros diarios.",
        price: 0,
        is_template: false,
        is_system: false,
        active: true,
      },
    ]);
    setLoading(false);
    if (!error) setFetching(true);
    else alert("Error al agregar vertical: " + error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6 mb-8">
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
              <div className="text-2xl font-bold">{verticals.length}</div>
              <div className="text-xs uppercase text-gray-500">
                Verticales
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-green-400 hover:from-orange-500 hover:to-green-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar vertical</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="max-w-6xl mx-auto px-4">
        {fetching ? (
          <div className="flex justify-center py-12 text-gray-400">Cargando…</div>
        ) : verticals.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No hay verticales activas.
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
