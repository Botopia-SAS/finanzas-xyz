import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: "API funcionando correctamente",
      timestamp: new Date().toISOString(),
      method: "GET",
      env: {
        hasApiUrl: !!process.env.WHATSAPP_API_URL,
        hasApiToken: !!process.env.WHATSAPP_API_TOKEN,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error("Error en GET /api/send-whatsapp:", error);
    return NextResponse.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json();
    
    console.log("📱 Recibiendo solicitud WhatsApp:", { 
      phone: phone?.substring(0, 5) + "***", 
      pin: "***" + pin?.slice(-2) 
    });

    const whatsappUrl = process.env.WHATSAPP_API_URL;
    const whatsappToken = process.env.WHATSAPP_API_TOKEN;

    if (!whatsappUrl || !whatsappToken) {
      console.error("❌ Variables de entorno faltantes");
      return NextResponse.json(
        { error: "Configuración de WhatsApp incompleta" },
        { status: 500 }
      );
    }

    // ✅ Payload actualizado para la plantilla fridoom_companies
    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "fridoom_companies", // ✅ Nuevo nombre de plantilla
        language: {
          code: "es"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: pin // ✅ Primer parámetro: el código PIN
              },
              {
                type: "text", 
                text: phone // ✅ Segundo parámetro: el número de teléfono
              }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [
              {
                type: "text",
                text: pin // ✅ Parámetro para el botón dinámico
              }
            ]
          }
        ]
      }
    };

    console.log("📤 Enviando a WhatsApp:", JSON.stringify(payload, null, 2));

    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log("📥 Respuesta de WhatsApp:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Error parseando respuesta:", parseError);
      return NextResponse.json(
        { 
          error: "Error en la respuesta de WhatsApp", 
          details: responseText,
          whatsappError: responseText
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("❌ Error de WhatsApp:", result);
      return NextResponse.json(
        { 
          error: "Error enviando mensaje", 
          details: result,
          whatsappError: result
        },
        { status: response.status }
      );
    }

    console.log("✅ Mensaje enviado exitosamente");
    return NextResponse.json({ 
      success: true, 
      messageId: result.messages?.[0]?.id,
      whatsappResponse: result
    });

  } catch (error) {
    console.error("💥 Error en API:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor", 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}