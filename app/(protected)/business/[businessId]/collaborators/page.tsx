import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CollaboratorManager from "@/components/business/collaborators/CollaboratorManager";
import BackButton from "@/components/BackButton";
import CollaboratorsList from "@/components/business/collaborators/CollaboratorsList";

export default async function CollaboratorsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  // Verificar permisos
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("owner_id, name")
    .eq("id", businessId)
    .single();

  if (!business || business.owner_id !== user.id) {
    redirect("/dashboard"); // Solo el dueño puede gestionar colaboradores
  }

  // Obtener verticales para el selector
  const { data: verticals } = await supabase
    .from("verticals")
    .select("id, name")
    .eq("business_id", businessId)
    .eq("active", true);

  return (
    <DashboardLayout>
      <BackButton />
      <CollaboratorManager 
        businessId={businessId} 
        verticals={verticals || []}
      />
      <CollaboratorsList businessId={businessId} />
    </DashboardLayout>
  );
}