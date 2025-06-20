import { User } from "@supabase/supabase-js";
import { Mail, Phone } from "lucide-react"; // ✅ Eliminado UserIcon
import { ProfileData } from "./types";
import Image from "next/image"; // ✅ Agregado Image de Next.js

interface ProfileHeaderProps {
  user: User;
  profile: ProfileData | null;
}

export default function ProfileHeader({ user, profile }: ProfileHeaderProps) {
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // ✅ Agregar debugging
  console.log("ProfileHeader - User data:", {
    id: user.id,
    email: user.email,
    phone: user.phone,
    userMetadata: user.user_metadata,
    allUserProps: Object.keys(user),
  });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 rounded-t-lg">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xl">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Avatar"
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            getInitials(user.email || "")
          )}
        </div>

        {/* Info básica */}
        <div className="text-white">
          <h2 className="text-2xl font-bold">
            {profile?.full_name || user.email?.split("@")[0]}
          </h2>
          <div className="flex items-center space-x-4 mt-2 text-blue-100">
            <div className="flex items-center space-x-1">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            {/* ✅ Debug y mostrar teléfono */}
            {user.phone ? (
              <div className="flex items-center space-x-1">
                <Phone size={16} />
                <span>{user.phone}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-yellow-200">
                <Phone size={16} />
                <span>Sin teléfono registrado</span>
              </div>
            )}
          </div>
          <p className="text-blue-100 mt-1">
            Miembro desde{" "}
            {new Date(user.created_at).toLocaleDateString("es-ES")}
          </p>

          {/* ✅ Debug info temporal - caracteres escapados */}
          <div className="mt-2 text-xs text-blue-200 bg-blue-800 p-2 rounded">
            Debug: phone = &quot;{user.phone || "null"}&quot;
          </div>
        </div>
      </div>
    </div>
  );
}