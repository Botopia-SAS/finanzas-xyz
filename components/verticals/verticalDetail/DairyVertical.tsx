// components/verticals/verticalDetail/DairyVertical.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Cow {
  id: string;
  business_id: string;
  tag: string | null;
  name: string | null;
  birth_date: string | null;
}

interface MilkRecord {
  date: string;
  liters: number;
}

export default function DairyVertical({
  businessId,
  verticalId,
}: {
  businessId: string;
  verticalId: string;
}) {
  const supabase = createClient();
  const [tab, setTab] = useState<"overview" | "cows" | "milk">("overview");

  const [cows, setCows] = useState<Cow[]>([]);
  const [loadingCows, setLoadingCows] = useState(false);

  const [milk, setMilk] = useState<MilkRecord[]>([]);
  const [loadingMilk, setLoadingMilk] = useState(false);

  // 1) Fetch cows assigned to this vertical
  useEffect(() => {
    (async () => {
      setLoadingCows(true);

      const { data: cvData, error: cvErr } = await supabase
        .from("livestock.cow_verticals")
        .select("cow_id")
        .eq("vertical_id", verticalId);

      if (cvErr || !cvData) {
        setLoadingCows(false);
        return;
      }

      const ids = (cvData as { cow_id: string }[]).map((r) => r.cow_id);
      if (ids.length > 0) {
        const { data: cowsData, error: cowsErr } = await supabase
          .from("livestock.cows")
          .select("id,business_id,tag,name,birth_date")
          .in("id", ids);

        if (!cowsErr && cowsData) {
          setCows(cowsData as Cow[]);
        }
      }

      setLoadingCows(false);
    })();
  }, [verticalId, supabase]);

  // 2) Fetch milk records (last 30 days)
  useEffect(() => {
    (async () => {
      setLoadingMilk(true);

      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000)
        .toISOString()
        .split("T")[0];

      const { data: mrData, error: mrErr } = await supabase
        .from("livestock.milk_records")
        .select("date,liters")
        .gte("date", since)
        .order("date", { ascending: true });

      if (!mrErr && mrData) {
        setMilk(mrData as MilkRecord[]);
      }

      setLoadingMilk(false);
    })();
  }, [supabase]);

  const totalLiters = milk.reduce((sum, rec) => sum + rec.liters, 0);

  // 3) Add a new cow and relate it to this vertical
  const addCow = async () => {
    const tag = prompt("Tag de la vaca (opcional):") || null;
    const name = prompt("Nombre de la vaca (opcional):") || null;

    const { data: newCowData, error: cowErr } = await supabase
      .from("livestock.cows")
      .insert([{ business_id: businessId, tag, name }])
      .select("id,business_id,tag,name,birth_date")
      .single();

    if (cowErr || !newCowData) {
      alert("Error al crear vaca: " + cowErr?.message);
      return;
    }

    // relate to vertical
    const { error: relErr } = await supabase
      .from("livestock.cow_verticals")
      .insert([{ cow_id: (newCowData as Cow).id, vertical_id: verticalId }]);

    if (relErr) {
      alert("Error al relacionar vaca: " + relErr.message);
      return;
    }

    setCows((prev) => [...prev, newCowData as Cow]);
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { key: "overview", label: "Resumen" },
            { key: "cows", label: "Vacas" },
            { key: "milk", label: "Ordeños" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "overview" | "cows" | "milk")}
              className={`pb-2 text-lg font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Total Producción (30d)
            </h3>
            {loadingMilk ? (
              <p>Cargando…</p>
            ) : (
              <p className="text-4xl font-bold text-indigo-600">
                {totalLiters} L
              </p>
            )}
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Vacas Activas</h3>
            {loadingCows ? (
              <p>Cargando…</p>
            ) : (
              <p className="text-4xl font-bold text-indigo-600">
                {cows.length}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Vacas */}
      {tab === "cows" && (
        <div className="space-y-4">
          <button
            onClick={addCow}
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
          >
            + Añadir vaca
          </button>

          {loadingCows ? (
            <p>Cargando vacas…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    {["Tag", "Nombre", "Nacimiento"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cows.map((c) => (
                    <tr key={c.id} className="border-b last:border-none">
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {c.tag ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {c.name ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {c.birth_date ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Ordeños */}
      {tab === "milk" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Producción de leche (30d)</h3>
          {loadingMilk ? (
            <p>Cargando…</p>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer>
                <LineChart
                  data={milk}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="liters"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
