"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { VerticalSchema, DairySchema, EggSchema } from "../types/interfaces";
import DairyEditor from "../../vertical-templates/DairyEditor";
import EggsEditor from "../../vertical-templates/EggsEditor";
import GenericEditor from "../../vertical-templates/GenericEditor"; // ✅ Crear editor genérico

interface ConfigTabProps {
  schema: VerticalSchema;
  verticalId: string;
  loading: boolean;
}

export default function ConfigTab({ schema: initialSchema, verticalId, loading }: ConfigTabProps) {
  const [schema, setSchema] = useState<VerticalSchema>(initialSchema);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSchema(initialSchema);
  }, [initialSchema]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // ✅ VALIDACIONES PREVIAS
      if (!verticalId) {
        throw new Error("ID de vertical no encontrado");
      }

      if (!schema) {
        throw new Error("Schema no válido");
      }

      console.log("🔍 Validando datos antes de guardar:");
      console.log("- verticalId:", verticalId);
      console.log("- schema:", schema);

      const supabase = createClient();
      
      // ✅ VERIFICAR QUE EL VERTICAL EXISTE PRIMERO
      const { data: existingVertical, error: checkError } = await supabase
        .from("verticals")
        .select("id, business_id, name")
        .eq("id", verticalId)
        .single();

      if (checkError) {
        console.error("❌ Error verificando vertical:", checkError);
        throw new Error(`No se encontró el vertical: ${checkError.message}`);
      }

      console.log("✅ Vertical encontrado:", existingVertical);
      
      // ✅ ACTUALIZAR SOLO variables_schema
      const { data, error } = await supabase
        .from("verticals")
        .update({ 
          variables_schema: schema
        })
        .eq("id", verticalId)
        .select();

      if (error) {
        console.error("❌ Error de Supabase completo:", error);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error details:", error.details);
        console.error("❌ Error hint:", error.hint);
        throw error;
      }

      console.log("✅ Configuración guardada exitosamente:", data);
      alert("Configuración guardada exitosamente");
      
    } catch (err: any) {
      console.error("❌ Error completo capturado:", err);
      
      if (err?.message) {
        alert(`Error: ${err.message}`);
      } else {
        alert("Error desconocido al guardar. Revisa la consola.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSchema(initialSchema);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Configuración de {
                schema.type === 'dairy' ? 'Lechería' : 
                schema.type === 'eggs' ? 'Huevos' : 
                'Vertical Personalizado'
              }
            </h2>
            <p className="text-gray-600">
              Personaliza los parámetros y configuraciones de tu vertical
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Restaurar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] text-white rounded-lg hover:from-[#e5722a] hover:to-[#6bc5ca] disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ EDITOR SEGÚN TIPO CON SOPORTE PARA TODOS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {schema.type === "dairy" ? (
          <DairyEditor 
            schema={schema as DairySchema} 
            onChange={setSchema}
          />
        ) : schema.type === "eggs" ? (
          <EggsEditor 
            schema={schema as EggSchema} 
            onChange={setSchema}
          />
        ) : (
          // ✅ EDITOR GENÉRICO PARA OTROS TIPOS
          <GenericEditor 
            schema={schema} 
            onChange={setSchema}
          />
        )}
      </div>

      {/* Información de debug */}
      <div className="bg-gray-50 rounded-lg p-4">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 mb-2">
            Ver JSON de configuración (Debug)
          </summary>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}