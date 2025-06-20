import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    console.log("🚀 POST /api/send-whatsapp - Iniciando...");
    
    const body = await request.json();
    console.log("📥 Body recibido:", { 
      phone: body.phone?.substring(0, 5) + "***", 
      hasPin: !!body.pin 
    });
    
    const { phone, pin, buttonText = pin } = body; // ✅ Agregar buttonText
    
    if (!phone || !pin) {
      console.log("❌ Faltan parámetros requeridos");
      return NextResponse.json(
        { message: "Se requiere teléfono y PIN" },
        { status: 400 }
      );
    }
    
    // Verificar variables de entorno
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    
    console.log("🔧 Variables de entorno:", {
      hasApiUrl: !!apiUrl,
      hasApiToken: !!apiToken,
      apiUrlStart: apiUrl?.substring(0, 50) + "..."
    });
    
    if (!apiUrl || !apiToken) {
      console.log("❌ Variables de entorno faltantes");
      return NextResponse.json(
        { message: "Error de configuración del servidor" },
        { status: 500 }
      );
    }
    
    // ✅ USAR EL TEMPLATE CORRECTO (igual que Thunderclient)
    console.log("📱 Enviando mensaje con template dumar_auth...");
    
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
                text: pin // ✅ El código PIN
              },
              {
                type: "text", 
                text: phone // ✅ El número de teléfono
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
                text: buttonText // ✅ El texto del botón
              }
            ]
          }
        ]
      }
    };
    
    console.log("📤 Payload enviado:", {
      ...messagePayload,
      to: phone.substring(0, 5) + "***",
      template: {
        ...messagePayload.template,
        components: messagePayload.template.components.map(comp => ({
          ...comp,
          parameters: comp.parameters?.map(p => ({
            ...p,
            text: p.text === phone ? phone.substring(0, 5) + "***" : 
                  p.text === pin ? "***" + pin.slice(-2) : p.text
          }))
        }))
      }
    });
    
    try {
      const whatsappResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      });
      
      console.log("📡 WhatsApp API status:", whatsappResponse.status);
      console.log("📡 WhatsApp API statusText:", whatsappResponse.statusText);
      
      const responseText = await whatsappResponse.text();
      console.log("📄 WhatsApp response (raw):", responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Error parseando respuesta de WhatsApp:", parseError);
        return NextResponse.json({
          message: "Error en la respuesta de WhatsApp - No es JSON válido",
          raw: responseText.substring(0, 500),
          status: whatsappResponse.status
        }, { status: 500 });
      }
      
      if (!whatsappResponse.ok) {
        console.error("❌ Error detallado de WhatsApp API:", {
          status: whatsappResponse.status,
          statusText: whatsappResponse.statusText,
          data: responseData
        });
        
        return NextResponse.json({
          message: "Error al enviar mensaje de WhatsApp",
          whatsappError: responseData,
          status: whatsappResponse.status,
          statusText: whatsappResponse.statusText,
          debug: {
            phone: phone.substring(0, 5) + "***",
            apiUrl: apiUrl.substring(0, 50) + "...",
            hasToken: !!apiToken
          }
        }, { status: whatsappResponse.status });
      }
      
      console.log("✅ Mensaje enviado exitosamente a WhatsApp");
      return NextResponse.json({
        success: true,
        data: responseData,
        message: "PIN enviado correctamente via WhatsApp con template dumar_auth"
      });
      
    } catch (fetchError) {
      console.error("💥 Error al hacer fetch a WhatsApp:", fetchError);
      return NextResponse.json({
        message: "Error de conexión con WhatsApp",
        error: fetchError instanceof Error ? fetchError.message : "Unknown fetch error"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("💥 Error en POST /api/send-whatsapp:", error);
    return NextResponse.json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}