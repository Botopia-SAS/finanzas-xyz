import BusinessLayout from "@/components/BusinessLayout";
import { createClient } from "@/lib/supabase/server";
import VerticalsList from "@/components/dashboard/VerticalsList";
import Link from "next/link";

export default async function VerticalsPage({
  params,
}: {
  params: Promise<{ businessId: string; }>;
}) {
  const { businessId } = await params;
  
  const supabase = await createClient();
  
  // ✅ CORREGIR: Excluir verticales del sistema (is_system = true)
  const { data: verticals, error } = await supabase
    .from("verticals")
    .select("*")
    .eq("business_id", businessId)
    .eq("active", true)
    .neq("is_system", true) // ✅ EXCLUIR verticales del sistema
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error loading verticals:", error);
    return <div>Error cargando verticales</div>;
  }

  const { data: templates } = await supabase
    .from("verticals")
    .select("*")
    .eq("is_template", true)
    .order("name", { ascending: true });

  return (
    <BusinessLayout businessId={businessId}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link 
              href={`/business/${businessId}`}
              className="text-blue-600 hover:underline mb-2 inline-block"
            >
              &larr; Volver al negocio
            </Link>
            <h1 className="text-2xl font-bold mt-2">Verticales Activos</h1>
            <p className="text-gray-500">
              Administra las líneas de negocio de tu empresa
            </p>
          </div>
        </div>
        
        <VerticalsList 
          verticals={verticals || []} 
          templates={templates || []} 
          businessId={businessId}
        />
      </div>
    </BusinessLayout>
  );
}
