import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email, phone, businessId, role = 'member' } = await request.json();
    
    if (!businessId || !email) {
      return NextResponse.json({ error: "Business ID y email son requeridos" }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Verificar que el usuario actual es dueño del negocio
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('owner_id, name')
      .eq('id', businessId)
      .single();

    if (!business || business.owner_id !== user.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Generar token único para la invitación
    const token = uuidv4();
    
    // Crear la invitación en la base de datos
    const { data: invitation, error: invitationError } = await supabase
      .from('business_invitations')
      .insert({
        business_id: businessId,
        email,
        phone,
        role,
        token,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return NextResponse.json({ error: "Error al crear invitación" }, { status: 500 });
    }

    // Generar link de aceptación
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const acceptLink = `${baseUrl}/accept-invitation?token=${token}`;

    // Enviar email (implementar según tu proveedor de email)
    console.log(`📧 Invitación por email a: ${email}`);
    console.log(`🔗 Link de aceptación: ${acceptLink}`);

    // Si hay teléfono, enviar WhatsApp
    if (phone) {
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
          console.error('Error enviando WhatsApp');
        } else {
          console.log('✅ WhatsApp enviado correctamente');
        }
      } catch (whatsappError) {
        console.error('Error con WhatsApp:', whatsappError);
      }
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
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}