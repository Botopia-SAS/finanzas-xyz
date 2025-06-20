export async function sendPinWhatsApp({ phone, pin }: { phone: string; pin: string }) {
  try {
    console.log("🚀 Enviando PIN por WhatsApp:", { 
      phone: phone.substring(0, 5) + "***", 
      pin: "***" + pin.slice(-2) 
    });
    
    // ✅ Limpiar y formatear el número correctamente
    let cleanPhone = phone.replace(/\D/g, ""); // Solo números
    
    // Si empieza con 57 (Colombia), mantenerlo
    // Si empieza con 3, agregar 57
    if (cleanPhone.startsWith("3")) {
      cleanPhone = "57" + cleanPhone;
    }
    
    console.log("📱 Número formateado:", cleanPhone.substring(0, 5) + "***");
    
    const response = await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: cleanPhone, // ✅ Usar número limpio
        pin
      }),
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);
    
    // ✅ Obtener todos los headers para debugging
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("📡 Response headers:", headers);

    // ✅ Leer como texto primero para ver qué estamos recibiendo
    const responseText = await response.text();
    console.log("📄 Response text (first 200 chars):", responseText.substring(0, 200));

    // ✅ Verificar si la respuesta es realmente JSON
    const contentType = response.headers.get("content-type") || "";
    console.log("📋 Content-Type:", contentType);
    
    if (!contentType.includes("application/json")) {
      console.error("❌ Response no es JSON - Content-Type:", contentType);
      console.error("❌ Response completo:", responseText);
      throw new Error(`Error del servidor: Respuesta no válida (${response.status}) - Content-Type: ${contentType}`);
    }

    // ✅ Intentar parsear el JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError);
      console.error("❌ Texto recibido:", responseText);
      throw new Error(`Error del servidor: JSON inválido (${response.status})`);
    }

    if (!response.ok) {
      console.error("❌ Error al enviar mensaje:", result);
      // ✅ Mostrar el error específico de WhatsApp
      const errorMessage = result.whatsappError ? 
        `WhatsApp Error: ${JSON.stringify(result.whatsappError)}` : 
        result.message || `Error HTTP ${response.status}`;
      throw new Error(errorMessage);
    }
    
    console.log("✅ PIN enviado exitosamente:", result);
    return result;
    
  } catch (error: unknown) {
    console.error("💥 Error al enviar PIN por WhatsApp:", error);
    throw error;
  }
}