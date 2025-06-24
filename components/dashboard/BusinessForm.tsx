"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload";
import { Upload, X, Building2, FileText, Camera, Sparkles, ImageIcon } from "lucide-react";
import Image from "next/image";

interface BusinessFormProps {
  onSuccess?: () => void;
}

export default function BusinessForm({ onSuccess }: BusinessFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  // Función para obtener imagen por defecto según el tipo
  const getDefaultImage = (businessType: string) => {
    const defaultImages = {
      "Agricultura": "/images/agriculture-default.jpg",
      "Tecnologia": "/images/tech-default.jpg", 
      "Otro": "/images/business-default.jpg"
    };
    return defaultImages[businessType as keyof typeof defaultImages] || defaultImages["Otro"];
  };

  // Manejo de archivo de imagen
  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  // Drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        handleFileChange(droppedFile);
      }
    }
  };

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
      } else {
        // ✅ Usar imagen por defecto si no se sube ninguna
        imageUrl = getDefaultImage(type);
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
        owner_id: user.id,
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
    <div className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
      {/* ✨ Header del formulario */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] p-2 rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Negocio</h2>
              <p className="text-sm text-gray-600">Configura tu negocio y comienza a gestionar tus finanzas</p>
            </div>
          </div>
          <button
            onClick={onSuccess}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ✨ Contenido del formulario */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ✨ Grid para campos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ✨ Nombre del negocio */}
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 h-6">
                <Building2 className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                <span>Nombre del negocio</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Ej: Finca La Esperanza"
              />
            </div>

            {/* ✨ Tipo de negocio */}
            <div className="space-y-2">
              <label htmlFor="type" className="flex items-center text-sm font-semibold text-gray-700 h-6">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                <span>Tipo de negocio</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
              >
                <option value="">Selecciona un tipo</option>
                <option value="Agricultura">🌾 Agricultura</option>
                <option value="Tecnologia">💻 Tecnología</option>
                <option value="Otro">🏢 Otro</option>
              </select>
            </div>
          </div>

          {/* ✨ Descripción */}
          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 h-6">
              <FileText className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
              <span>Descripción (opcional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Describe brevemente tu negocio..."
            />
          </div>

          {/* ✨ Sección de imagen mejorada */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700 h-6">
              <Camera className="h-4 w-4 mr-2 text-pink-500 flex-shrink-0" />
              <span>Imagen del negocio (opcional)</span>
            </label>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* ✨ Vista previa */}
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-xl p-2">
                  <div className="relative h-40 rounded-lg overflow-hidden bg-white">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Vista previa"
                        fill
                        className="object-cover"
                      />
                    ) : type ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {type === "Agricultura" ? "🌾" : type === "Tecnologia" ? "💻" : "🏢"}
                          </div>
                          <p className="text-sm font-medium text-gray-700">Imagen por defecto</p>
                          <p className="text-xs text-gray-500">Se usará automáticamente</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Selecciona un tipo primero</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="w-full text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Usar imagen por defecto
                  </button>
                )}
              </div>

              {/* ✨ Zona de subida compacta */}
              <div
                className={`border-2 border-dashed rounded-xl p-4 transition-all duration-200 h-40 flex items-center justify-center ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] rounded-full flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Sube tu imagen
                  </h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Seleccionar
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG • Max 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ✨ Botones pegados al fondo */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 mt-8">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                disabled={loading}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim() || !type}
                className="px-6 py-2 bg-gradient-to-r from-[#fe8027] to-[#7dd1d6] hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Crear Negocio
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* ✨ Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configurando tu negocio
            </h3>
            <p className="text-gray-600 text-sm">
              Creando estructura inicial...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}