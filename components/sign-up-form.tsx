"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelector, countries, type Country } from "@/components/ui/country-selector";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendPinWhatsApp } from "@/lib/whatsapp/sendPin";

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'CO') || countries[0]
  );
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  const [generatedPin, setGeneratedPin] = useState("");
  const router = useRouter();

  // Paso 1: Solo validar y enviar PIN (sin crear usuario aún)
  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const pin = generatePin();
      setGeneratedPin(pin);

      // ✅ Enviar PIN usando el número ingresado (aún necesario para el registro)
      await sendPinWhatsApp({
        phone: `${selectedCountry.dialCode}${phone}`,
        pin,
      });

      setShowPinPopup(true);
    } catch (err) {
      console.error("Error al enviar PIN:", err);
      setError(err instanceof Error ? err.message : "Error al enviar el PIN");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Verifica PIN y si es correcto, crea el usuario
  const handleVerifyAndCreateUser = async () => {
    if (pinInput !== generatedPin) {
      setError("PIN incorrecto");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // ✅ PASO 1: Crear usuario solo con email/password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      const userId = signUpData.user?.id;
      if (!userId) throw new Error("No se pudo crear el usuario");

      console.log("Usuario creado:", userId);

      // ✅ PASO 2: Hacer login inmediatamente para poder actualizar
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) throw loginError;

      // ✅ PASO 3: Ahora actualizar el usuario con el teléfono
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: {
          phone: `${selectedCountry.dialCode}${phone}`,
          dial_code: selectedCountry.dialCode,
          country_code: selectedCountry.code,
          raw_phone: phone
        }
      });

      if (updateError) {
        console.error("Error actualizando teléfono:", updateError);
      } else {
        console.log("Teléfono actualizado:", updateData);
      }

      // ✅ PASO 4: Crear perfil con el teléfono
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{
          id: userId,
          phone: `${selectedCountry.dialCode}${phone}`,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.warn("Error creando perfil:", profileError);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registrarte</CardTitle>
          <CardDescription>Crea una nueva cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendPin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Repetir Contraseña</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              
              {/* Selector de país y número de teléfono */}
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                phoneNumber={phone}
                onPhoneChange={setPhone}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando código..." : "Continuar"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Popup para verificar PIN */}
      {showPinPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Verificar tu número</h2>
            <p className="mb-4">
              Hemos enviado un PIN a tu WhatsApp{" "}
              <span className="font-mono">{selectedCountry.dialCode}{phone.substring(0, 3)}***</span>
            </p>
            <div className="mb-4">
              <Input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN de 6 dígitos"
                className="text-center text-xl tracking-widest"
              />
            </div>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPinPopup(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVerifyAndCreateUser}
                disabled={isLoading || pinInput.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar y registrarme"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
