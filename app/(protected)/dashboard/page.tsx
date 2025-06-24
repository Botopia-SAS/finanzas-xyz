import { createClient } from "@/lib/supabase/server";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import UserIdSection from "@/components/dashboard/UserIdSection";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Negocios propios
  const { data: ownedBusinesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id);

  // Negocios como socio (simplificado)
  const { data: partnerBusinesses } = await supabase
    .from("business_collaborators")
    .select(`
      business_id,
      role,
      businesses(*)  
    `)
    .eq("user_id", user.id)
    .eq("status", "active");

  // Extraer solo los negocios de la relación
  const collaboratorBusinessList =
    partnerBusinesses?.map((p) => ({
      ...p.businesses,
      user_role: p.role,
      is_collaborator: true,
    })) || [];

  // Combinar listas
  const allBusinesses = [...(ownedBusinesses || []), ...collaboratorBusinessList];

  console.log("🔍 Debug businesses:", {
    owned: ownedBusinesses?.length || 0,
    collaborator: collaboratorBusinessList.length,
    total: allBusinesses.length,
    partnerBusinesses,
  });

  return (
    <div>
      <UserIdSection userId={user.id} />
      <DashboardPanel businesses={allBusinesses} user={{
        email: user.email,
        ...user
      }} />
    </div>
  );
}