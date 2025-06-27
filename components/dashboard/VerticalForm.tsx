"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// ✅ ACTUALIZAR EL TIPO Template
export type Template = {
  id: string;
  name: string;
  description?: string;
  variables_schema: { 
    unit?: string; 
    price?: number; 
    type?: string;
    [key: string]: unknown; // ✅ CAMBIO: any -> unknown
  };
};

interface FormProps {
  businessId: string;
  onCreated?: () => void;
}

export default function VerticalForm({
  businessId,
  onCreated,
}: FormProps) {
  // Estados - SIN estimated
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ USAR useCallback PARA ESTABILIZAR LA FUNCIÓN
  const loadTemplates = useCallback(async () => {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("verticals")
        .select("*")
        .eq("is_template", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error cargando plantillas:", error);
      } else {
        console.log("🔥 Plantillas cargadas:", data);
        setTemplates(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, []); // ✅ Sin dependencias porque no usa variables externas

  // ✅ CARGAR PLANTILLAS CON DEPENDENCIA ESTABLE
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // ✅ FORMATEAR NÚMEROS CON PUNTOS
  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumber = (value: string) => {
    return value.replace(/\./g, '');
  };

  // Al cambiar plantilla, auto-rellena campos - CORREGIDO
  useEffect(() => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      console.log("🎯 Aplicando plantilla:", tpl);
      setName(tpl.name);
      setDescription(tpl.description || "");
      
      // ✅ LEER PRECIO DEL JSON variables_schema
      const schema = tpl.variables_schema;
      setUnit(typeof schema?.unit === 'string' ? schema.unit : "");
      
      // Convertir precio decimal a entero para mostrar (1.5 -> 150)
      const priceInCents = typeof schema?.price === 'number' ? Math.round(schema.price * 100) : 0;
      setPrice(priceInCents > 0 ? formatNumber(priceInCents.toString()) : "");
    } else {
      setName("");
      setDescription("");
      setUnit("");
      setPrice("");
    }
  }, [templateId, templates]);

  // ✅ HANDLE CAMBIOS EN PRECIO CON FORMATO
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setPrice(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ VALIDACIÓN BÁSICA
      if (!name.trim()) {
        alert("El nombre es requerido");
        return;
      }

      if (!businessId) {
        alert("Error: ID de negocio no encontrado");
        return;
      }

      // Convertir precio formateado de vuelta a número
      const priceNumber = price ? parseFloat(parseNumber(price)) / 100 : 0;

      // ✅ DETERMINAR EL TIPO SEGÚN LA PLANTILLA O DATOS
      let verticalType = "generic"; // Tipo por defecto
      
      // Si viene de plantilla, usar su tipo
      if (templateId) {
        const template = templates.find(t => t.id === templateId);
        if (template?.variables_schema?.type && typeof template.variables_schema.type === 'string') {
          verticalType = template.variables_schema.type;
        }
      }

      console.log("🔍 Datos a enviar:", {
        business_id: businessId,
        name: name.trim(),
        description: description.trim() || null,
        variables_schema: {
          unit: unit.trim() || null,
          price: priceNumber,
          type: verticalType,
          inventory: {
            total: 0,
            items: []
          }
        }
      });

      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("verticals")
        .insert([
          {
            business_id: businessId,
            name: name.trim(),
            description: description.trim() || null,
            variables_schema: {
              unit: unit.trim() || null,
              price: priceNumber,
              type: verticalType,
              inventory: {
                total: 0,
                items: []
              }
            },
            is_template: false,
            is_system: false,
            active: true
          }
        ])
        .select();

      if (error) {
        console.error("❌ Error de Supabase completo:", error);
        throw error;
      }

      console.log("✅ Vertical creado exitosamente:", data);
      
      // Limpiar formulario
      setTemplateId("");
      setName("");
      setDescription("");
      setUnit("");
      setPrice("");
      
      // Cerrar modal
      onCreated?.();
      
    } catch (err: unknown) { // ✅ CAMBIO: any -> unknown
      console.error("❌ Error completo capturado:", err);
      
      // ✅ TYPE GUARD PARA ERROR
      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      } else {
        alert('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
      
      {/* ✅ SELECTOR DE PLANTILLAS NORMAL */}
      <div>
        <label className="block text-sm font-medium mb-1">Plantilla (opcional)</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">— Elige una plantilla —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Lechería, Cultivos, Huevos..."
          required
        />
      </div>

      {/* ✅ DESCRIPCIÓN OPCIONAL */}
      <div>
        <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe brevemente este vertical de negocio..."
          rows={2}
        />
      </div>

      {/* ✅ Grid de solo 2 campos - SIN ESTIMADO */}
      <div className="grid grid-cols-2 gap-4">
        {/* Unidad */}
        <div>
          <label className="block text-sm font-medium mb-1">Unidad</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="litros, kg..."
          />
        </div>

        {/* ✅ PRECIO CON FORMATO AUTOMÁTICO */}
        <div>
          <label className="block text-sm font-medium mb-1">Precio x unidad</label>
          <input
            value={price}
            onChange={handlePriceChange}
            className="block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
      </div>

      {/* ✅ BOTÓN CON COLOR NARANJA TRANSPARENTE */}
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full bg-orange-500/70 hover:bg-orange-500/80 text-white py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-md hover:shadow-lg"
      >
        {loading ? "Guardando..." : "+ Nueva Vertical"}
      </button>
    </form>
  );
}

// Fetch templates (this code should be placed where you fetch data, e.g., in a useEffect or getServerSideProps)
// const { data: templates } = await supabase
//   .from("verticals")
//   .select("*")
//   .eq("is_template", true);