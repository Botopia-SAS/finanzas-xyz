"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileData } from "../types";

interface NotificationsTabProps {
  profile: ProfileData | null;
  onUpdate: (profile: ProfileData) => void;
}

export default function NotificationsTab({ profile, onUpdate }: NotificationsTabProps) {
  const [settings, setSettings] = useState({
    email_notifications: profile?.email_notifications ?? true,
    whatsapp_notifications: profile?.whatsapp_notifications ?? true,
    marketing_emails: profile?.marketing_emails ?? false,
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(newSettings)
        .eq("id", profile?.id)
        .select()
        .single();

      if (error) throw error;
      if (data) onUpdate(data);
    } catch (error) {
      console.error("Error updating notifications:", error);
      // Revertir el cambio en caso de error
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Preferencias de notificaciones</h3>
      
      <div className="space-y-4">
        <NotificationToggle
          title="Notificaciones por email"
          description="Recibe actualizaciones importantes por correo electrónico"
          checked={settings.email_notifications}
          onChange={() => handleToggle("email_notifications")}
          disabled={loading}
        />
        
        <NotificationToggle
          title="Notificaciones por WhatsApp"
          description="Recibe alertas y recordatorios por WhatsApp"
          checked={settings.whatsapp_notifications}
          onChange={() => handleToggle("whatsapp_notifications")}
          disabled={loading}
        />
        
        <NotificationToggle
          title="Emails de marketing"
          description="Recibe ofertas especiales y novedades del producto"
          checked={settings.marketing_emails}
          onChange={() => handleToggle("marketing_emails")}
          disabled={loading}
        />
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}

function NotificationToggle({ title, description, checked, onChange, disabled }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}