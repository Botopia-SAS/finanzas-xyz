import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_ROLES } from "@/components/business/types/permissions";

export async function POST(request: Request) {
  try {
    const { email, phone, businessId, role = 'data_entry_income', allowedVerticals = [] } = await request.json();
    
    console.log("📥 Datos recibidos:", { email, phone, businessId, role, allowedVerticals });
    
    if (!businessId || !email || !phone) {
      return NextResponse.json({ error: "Business ID, email y teléfono son requeridos" }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Verificar que el usuario actual es dueño del negocio
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    console.log("👤 Usuario autenticado:", user.id);

    // Verificar permisos del negocio
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('owner_id, name')
      .eq('id', businessId)
      .single();

    if (businessError) {
      console.error("Error obteniendo negocio:", businessError);
      return NextResponse.json({ error: "Error al verificar el negocio" }, { status: 500 });
    }

    if (!business || business.owner_id !== user.id) {
      return NextResponse.json({ error: "Sin permisos para este negocio" }, { status: 403 });
    }

    console.log("🏢 Negocio verificado:", business.name);

    // Verificar si ya existe una invitación pendiente
    const { data: existingInvitation } = await supabase
      .from('business_invitations')
      .select('id')
      .eq('business_id', businessId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return NextResponse.json({ error: "Ya existe una invitación pendiente para este email" }, { status: 400 });
    }

    // Obtener permisos del rol
    const rolePermissions = DEFAULT_ROLES.find(r => r.id === role)?.permissions;
    if (!rolePermissions) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }

    // Personalizar permisos si es capturista
    const finalPermissions = { ...rolePermissions };
    if (role.includes('data_entry') && allowedVerticals.length > 0) {
      finalPermissions.verticals.allowedVerticals = allowedVerticals;
    }

    console.log("🔐 Permisos configurados:", { role, finalPermissions });

    // Generar token único para la invitación
    const token = uuidv4();
    
    // Crear la invitación en la base de datos
    const invitationData = {
      business_id: businessId,
      email,
      phone,
      role,
      permissions: finalPermissions,
      token,
      invited_by: user.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      created_at: new Date().toISOString()
    };

    console.log("💾 Creando invitación:", invitationData);

    const { data: invitation, error: invitationError } = await supabase
      .from('business_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (invitationError) {
      console.error('❌ Error creating invitation:', invitationError);
      return NextResponse.json({ 
        error: `Error al crear invitación: ${invitationError.message}`,
        details: invitationError 
      }, { status: 500 });
    }

    console.log("✅ Invitación creada:", invitation.id);

    // Generar link de aceptación
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const acceptLink = `${baseUrl}/accept-invitation?token=${token}`;

    console.log("🔗 Link generado:", acceptLink);

    // Enviar WhatsApp
    try {
      const whatsappResponse = await fetch(`${baseUrl}/api/send-whatsapp-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          businessName: business.name,
          invitationLink: acceptLink,
          role
        })
      });

      if (!whatsappResponse.ok) {
        const whatsappError = await whatsappResponse.json();
        console.error('❌ Error enviando WhatsApp:', whatsappError);
        // No fallar toda la invitación por WhatsApp
      } else {
        console.log('✅ WhatsApp enviado correctamente');
      }
    } catch (whatsappError) {
      console.error('❌ Error con WhatsApp:', whatsappError);
      // No fallar toda la invitación por WhatsApp
    }

    return NextResponse.json({ 
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitationLink: acceptLink
      }
    });
    
  } catch (error) {
    console.error('💥 Error general sending invitation:', error);
    return NextResponse.json({ 
      error: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 });
  }
}