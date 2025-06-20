"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ProfileData } from "../types";
import ProfileForm from "../forms/ProfileForm";
import { useRouter } from "next/navigation";

interface PersonalInfoTabProps {
  user: User;
  profile: ProfileData | null;
  onUpdate: (profile: ProfileData) => void;
}

export default function PersonalInfoTab({ user, profile, onUpdate }: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (formData: Partial<ProfileData>) => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {isEditing ? "Cancelar" : "Editar"}
        </button>
      </div>

      <ProfileForm
        profile={profile}
        isEditing={isEditing}
        loading={loading}
        onSave={handleSave}
      />
    </div>
  );
}