// components/verticals/verticalDetail/VerticalDetail.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Vertical {
  id: string;
  name: string;
  description: string;
  price: number | null;
}

export default function VerticalDetail({
  verticalId,
}: {
  verticalId: string;
}) {
  const [vertical, setVertical] = useState<Vertical | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("verticals")
        .select("id,name,description,price")
        .eq("id", verticalId)
        .single();
      setVertical(data);
    })();
  }, [verticalId]);

  if (!vertical) return <p>Cargando…</p>;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold mb-2">{vertical.name}</h2>
      <p className="text-gray-600 mb-4">{vertical.description}</p>
      <div>
        <strong>Precio:</strong> {vertical.price ?? "—"} COP
      </div>
    </div>
  );
}
