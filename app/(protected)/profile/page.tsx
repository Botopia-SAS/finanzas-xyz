import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileContainer from "@/components/profile/ProfileContainer";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Obtener usuario autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Obtener datos del perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>
        <ProfileContainer user={user} profile={profile} />
      </div>
    </div>
  );
}