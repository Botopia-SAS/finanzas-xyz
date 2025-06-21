import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, businessName, invitationLink, role } = await request.json();
    
    console.log("📱 Enviando invitación por WhatsApp:", { 
      phone: phone?.substring(0, 5) + "***", 
      businessName,
      role 
    });
    
    // Verificar variables de entorno
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    
    if (!apiUrl || !apiToken) {
      return NextResponse.json(
        { message: "Error de configuración del servidor" },
        { status: 500 }
      );
    }
    
    // Template para invitación de colaborador
    const messagePayload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "dumar_auth",
        language: {
          code: "es"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: `Invitación a ${businessName}`
              },
              {
                type: "text", 
                text: phone
              }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: invitationLink.split('/').pop() || "invitation"
              }
            ]
          }
        ]
      }
    };
    
    const whatsappResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });
    
    const responseData = await whatsappResponse.json();
    
    if (!whatsappResponse.ok) {
      console.error("❌ Error de WhatsApp API:", responseData);
      return NextResponse.json({
        message: "Error al enviar invitación por WhatsApp",
        error: responseData
      }, { status: whatsappResponse.status });
    }
    
    console.log("✅ Invitación enviada por WhatsApp");
    return NextResponse.json({
      success: true,
      message: "Invitación enviada por WhatsApp correctamente"
    });
    
  } catch (error) {
    console.error("💥 Error enviando invitación por WhatsApp:", error);
    return NextResponse.json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}