"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import VerticalDetail from "@/components/verticals/verticalDetail/VerticalDetail";
import VerticalDetailWrapper from "@/components/verticals/verticalDetail/VerticalDetailWrapper";

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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-none">
        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-none mx-auto">
            {vert ? (
              <VerticalDetailWrapper
                businessId={businessId}
                verticalId={verticalId}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando detalle…</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
