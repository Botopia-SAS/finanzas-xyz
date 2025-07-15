"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import VerticalDetail from "@/components/verticals/verticalDetail/VerticalDetail";
import DairyVertical from "@/components/verticals/verticalDetail/DairyVertical";

export default function VerticalDetailPage({
  params,
}: {
  params: Promise<{ businessId: string; verticalId: string }>;
}) {
  const { businessId, verticalId } = React.use(params);
  const router = useRouter();

  // Primero cargamos la vertical para saber su nombre
  const [vert, setVert] = React.useState<{ name: string } | null>(null);
  React.useEffect(() => {
    (async () => {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data } = await supabase
        .from("verticals")
        .select("name")
        .eq("id", verticalId)
        .single();
      setVert(data);
    })();
  }, [verticalId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver a Verticales
        </button>

        {vert ? (
          vert.name === "Lechería" ? (
            <DairyVertical
              businessId={businessId}
              verticalId={verticalId}
            />
          ) : (
            <VerticalDetail verticalId={verticalId} />
          )
        ) : (
          <p>Cargando detalle…</p>
        )}
      </div>
    </div>
  );
}
