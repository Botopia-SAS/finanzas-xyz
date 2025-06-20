export interface ProfileData {
  id: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  company?: string;
  location?: string;
  avatar_url?: string;
  email_notifications?: boolean;
  whatsapp_notifications?: boolean;
  marketing_emails?: boolean;
  created_at: string;
  updated_at?: string;
}