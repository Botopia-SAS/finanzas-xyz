"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CollaboratorManager from "@/components/business/collaborators/CollaboratorManager";
import { useRouter, useParams } from "next/navigation";

// Definir interfaces para los tipos
// Eliminar la interfaz no utilizada
// interface Business {
//   owner_id: string;
//   name: string;
// }

interface Vertical {
  id: string;
  name: string;
}

export default function CollaboratorsPage() {
  const router = useRouter();
  
  // ✅ SOLUCIÓN: Usar useParams() en lugar de React.use()
  const params = useParams();
  const businessId = params.businessId as string;
  
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const redirect = (path: string) => {
      router.replace(path);
    };
    
    const fetchData = async () => {
      const supabase = createClient();

      // Verificar permisos
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return redirect("/auth/login");

      const { data: businessData } = await supabase
        .from("businesses")
        .select("owner_id, name")
        .eq("id", businessId)
        .single();

      if (!businessData || businessData.owner_id !== user.id) {
        return redirect("/dashboard"); // Solo el dueño puede gestionar colaboradores
      }

      // Obtener verticales para el selector
      const { data: verticalsData } = await supabase
        .from("verticals")
        .select("id, name")
        .eq("business_id", businessId)
        .eq("active", true);

      setVerticals(verticalsData || []);
      setLoading(false);
    };

    fetchData();
  }, [businessId, router]); // ✅ Incluir router como dependencia

  return (
    <div className="container mx-auto py-6">
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <CollaboratorManager businessId={businessId} verticals={verticals} />
      )}
    </div>
  );
}
