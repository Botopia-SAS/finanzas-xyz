"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload";

interface BusinessFormProps {
  onSuccess?: () => void;
}

export default function BusinessForm({ onSuccess }: BusinessFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (file) {
        try {
          imageUrl = await uploadImageToCloudinary(file);
        } catch (err) {
          console.error("Error uploading to Cloudinary", err);
          alert("Error al subir la imagen");
          setLoading(false);
          return;
        }
      }

      const supabase = createClient();

      // ✅ 1. Verificar autenticación primero
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Error de autenticación:", authError);
        alert("Error de autenticación. Por favor inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      console.log("Usuario autenticado:", user.id);

      // ✅ 2. Preparar datos del negocio
      const businessData = {
        name: name.trim(),
        type,
        description: description?.trim() || null,
        image_url: imageUrl,
        owner_id: user.id, // ✅ Agregar explícitamente el owner_id
      };

      console.log("Datos del negocio a insertar:", businessData);

      // ✅ 3. Crear el negocio con mejor manejo de errores
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert([businessData])
        .select()
        .single();

      // ✅ 4. Manejo detallado de errores
      if (businessError) {
        console.error("Error detallado creando negocio:", {
          message: businessError.message,
          details: businessError.details,
          hint: businessError.hint,
          code: businessError.code,
          fullError: businessError
        });

        // Mostrar error específico según el código
        let errorMessage = "Error al crear el negocio";

        if (businessError.code === '23505') {
          errorMessage = "Ya existe un negocio con ese nombre";
        } else if (businessError.code === '42501') {
          errorMessage = "No tienes permisos para crear negocios";
        } else if (businessError.code === '23502') {
          errorMessage = "Faltan campos obligatorios";
        } else if (businessError.message) {
          errorMessage = `Error: ${businessError.message}`;
        }

        alert(errorMessage);
        setLoading(false);
        return;
      }

      if (!business) {
        console.error("No se retornó el negocio creado");
        alert("Error: No se pudo crear el negocio correctamente");
        setLoading(false);
        return;
      }

      console.log("✅ Negocio creado exitosamente:", business);

      // ✅ 5. Crear vertical "General" de forma más robusta
      try {
        const generalVerticalData = {
          business_id: business.id,
          name: "General",
          description: "Movimientos generales del negocio",
          active: true,
          is_template: false,
          is_system: true,
          variables_schema: {
            type: "general",
            unit: "unidad",
            price: 0,
            templateConfig: {
              lastUpdated: new Date().toISOString(),
              version: "1.0.0",
              customFields: {},
              isSystemGenerated: true,
              isHidden: true,
              autoAssign: true,
              category: "sistema",
            },
          },
        };

        console.log("Creando vertical General:", generalVerticalData);

        const { data: generalVertical, error: verticalError } = await supabase
          .from("verticals")
          .insert([generalVerticalData])
          .select()
          .single();

        if (verticalError) {
          console.error("Error creando vertical General:", {
            message: verticalError.message,
            details: verticalError.details,
            hint: verticalError.hint,
            code: verticalError.code,
            fullError: verticalError
          });

          // ✅ No fallar por esto, pero informar
          console.warn("⚠️ El negocio se creó pero sin vertical General");
        } else {
          console.log("✅ Vertical General creada:", generalVertical);
        }
      } catch (verticalErr) {
        console.error("Error inesperado creando vertical:", verticalErr);
      }

      // ✅ 6. Navegar al dashboard del negocio
      console.log("Navegando a:", `/business/${business.id}`);
      router.push(`/business/${business.id}`);
      onSuccess?.();

    } catch (error) {
      console.error("💥 Error general creating business:", error);

      // ✅ Manejo mejorado de errores generales
      let errorMessage = "Error desconocido al crear el negocio";

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error stack:", error.stack);
      } else if (error && typeof error === 'object') {
        console.error("Error objeto:", JSON.stringify(error, null, 2));
        if ('message' in error) {
          if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
            errorMessage = (error as { message: string }).message;
          }
        }
      }

      alert(`❌ ${errorMessage}\n\nPor favor verifica:\n- Que todos los campos estén completos\n- Tu conexión a internet\n- Intenta de nuevo`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nombre del negocio *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Finca La Esperanza"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-1">
          Tipo de negocio *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un tipo</option>
          <option value="Agricultura">Agricultura</option>
          <option value="Tecnologia">Tecnología</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe brevemente tu negocio..."
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium mb-1">
          Imagen del negocio (opcional)
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Formatos soportados: JPG, PNG, GIF. Máximo 5MB.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !name.trim() || !type}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Creando..." : "Crear Negocio"}
        </Button>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-600 mt-2">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Configurando tu negocio...</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Esto incluye crear la estructura inicial y configuraciones por defecto
          </p>
        </div>
      )}
    </form>
  );
}