"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ✅ Al inicio del archivo, agregar las interfaces:
interface InvitationVerticalPermissions {
  allowedVerticals?: string[];
  canCreate?: boolean;
  canEdit?: boolean;
}

interface InvitationPermissions {
  read?: boolean;
  write?: boolean;
  delete?: boolean;
  invite?: boolean;
  verticals?: InvitationVerticalPermissions;
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState('🔄 Iniciando...');
  const [invitation, setInvitation] = useState<{
    id: string;
    business_id: string;
    phone: string;
    verification_pin: string;
    status: string;
    role: string;
    invited_user_id?: string;
    permissions?: InvitationPermissions;
    invited_by?: string;
  } | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'loading' | 'pin' | 'register' | 'profile' | 'success'>('loading');
  const [profileData, setProfileData] = useState({
    full_name: '',
    job_title: ''
  });
  const [registrationData, setRegistrationData] = useState({
    full_name: '',
    job_title: '',
    email: '', // Opcional para socios
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const testConnection = async () => {
      setStatus('🔍 Probando conexión a Supabase...');
      const supabase = createClient();
      
      try {
        // Test 1: Conexión básica
        setStatus('📡 Test 1: Conexión básica...');
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Usuario actual:', user?.email || 'No logueado');
        
        // Test 2: Leer invitaciones sin filtros
        setStatus('📊 Test 2: Leyendo invitaciones...');
        const { data: allInvitations, error: allError } = await supabase
          .from('business_invitations')
          .select('id, token, phone, verification_pin, status')
          .limit(3);
        
        console.log('Todas las invitaciones:', allInvitations);
        console.log('Error al leer todas:', allError);
        
        if (allError) {
          setStatus(`❌ Error RLS: ${allError.message}`);
          return;
        }
        
        // Test 3: Buscar invitación específica
        setStatus('🎯 Test 3: Buscando invitación específica...');
        const { data: specificInvitation, error: specificError } = await supabase
          .from('business_invitations')
          .select('*')
          .eq('token', token)
          .single();
        
        console.log('Invitación específica:', specificInvitation);
        console.log('Error específico:', specificError);
        
        if (specificError) {
          setStatus(`❌ Error buscando invitación: ${specificError.message}`);
          return;
        }
        
        if (!specificInvitation) {
          setStatus('❌ Invitación no encontrada');
          return;
        }
        
        setInvitation(specificInvitation);
        setStatus('✅ ¡Invitación encontrada! Puedes ingresar el PIN.');
        setStep('pin');
        
      } catch (err) {
        console.error('Error general:', err);
        setStatus(`💥 Error inesperado: ${err instanceof Error ? err.message : 'Desconocido'}`);
      }
    };

    if (token) {
      testConnection();
    } else {
      setStatus('❌ No hay token en la URL');
    }
  }, [token]); // ✅ Solo token como dependencia

  // Solo necesitas estas dos funciones:

  const verifyPin = async () => {
    if (!invitation || !pin) return;
    
    setStatus('🔐 Verificando PIN...');
    setError('');
    
    try {
      if (pin !== invitation.verification_pin) {
        setError('❌ PIN incorrecto');
        return;
      }
      
      console.log('✅ PIN correcto, rol:', invitation.role);
      
      if (invitation.role === 'partner') {
        // SOCIOS: Agregar usando su user.id real
        await addPartnerToBusiness();
      } else {
        // COLABORADORES: Perfil sin cuenta (user_id = NULL)
        setStep('profile');
        setStatus('📝 Completa tu información como colaborador...');
      }
      
    } catch (err) {
      console.error('Error verificando PIN:', err);
      setError(`💥 Error: ${err instanceof Error ? err.message : 'Desconocido'}`);
    }
  };

  const addPartnerToBusiness = async () => {
    if (!invitation) {
      setError('❌ No hay datos de invitación disponibles');
      return;
    }
    
    setStatus('🏢 Agregándote como socio del negocio...');
    const supabase = createClient();
    
    try {
      // Para socios: usar el user.id real de la invitación
      const userId = invitation.invited_user_id; // Este es el UUID real del usuario
      
      if (!userId) {
        throw new Error('ID de usuario no encontrado en la invitación');
      }
      
      // Obtener datos del perfil del socio
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', userId)
        .single();
      
      // Crear entrada en business_collaborators con user_id REAL
      const { error: collaboratorError } = await supabase
        .from('business_collaborators')
        .insert([{
          business_id: invitation.business_id,
          user_id: userId, // ✅ UUID real del usuario
          role: 'partner',
          permissions: invitation.permissions,
          status: 'active',
          invited_by: invitation.invited_by,
          full_name: profile?.full_name || 'Socio',
          phone: invitation.phone
        }]);

      if (collaboratorError) {
        throw new Error(`Error agregando como socio: ${collaboratorError.message}`);
      }
      
      // Actualizar invitación
      await supabase
        .from('business_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
      
      setStep('success');
      setStatus('🎉 ¡Agregado como socio exitosamente!');
      
      // Redirigir al negocio
      setTimeout(() => {
        window.location.href = `/business/${invitation.business_id}`;
      }, 3000);
      
    } catch (err) {
      console.error('Error agregando socio:', err);
      setError(`💥 Error: ${err instanceof Error ? err.message : 'Desconocido'}`);
    }
  };

  const completeProfile = async () => {
    if (!profileData.full_name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    
    if (!invitation) {
      setError('❌ No hay datos de invitación disponibles');
      return;
    }
    
    setError('');
    setStatus('👤 Registrando colaborador...');
    const supabase = createClient();
    
    try {
      // COLABORADORES: user_id = NULL (sin cuenta)
      const { error: collaboratorError } = await supabase
        .from('business_collaborators')
        .insert([{
          business_id: invitation.business_id,
          user_id: null, // ✅ NULL porque no tiene cuenta
          role: invitation.role,
          permissions: invitation.permissions,
          status: 'active',
          invited_by: invitation.invited_by,
          full_name: profileData.full_name.trim(),
          job_title: profileData.job_title.trim() || null,
          phone: invitation.phone
        }]);

      if (collaboratorError) {
        throw new Error(`Error registrando colaborador: ${collaboratorError.message}`);
      }
      
      // Actualizar invitación
      await supabase
        .from('business_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
      
      setStep('success');
      setStatus('✅ ¡Registro completado exitosamente!');
      
    } catch (err) {
      console.error('Error completeProfile:', err);
      setError(`💥 Error: ${err instanceof Error ? err.message : 'Desconocido'}`);
    }
  };

  const testConnection = async () => {
    setStatus('🔍 Probando conexión a Supabase...');
    const supabase = createClient();
    
    try {
      // Test 1: Conexión básica
      setStatus('📡 Test 1: Conexión básica...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Usuario actual:', user?.email || 'No logueado');
      
      // Test 2: Leer invitaciones sin filtros
      setStatus('📊 Test 2: Leyendo invitaciones...');
      const { data: allInvitations, error: allError } = await supabase
        .from('business_invitations')
        .select('id, token, phone, verification_pin, status')
        .limit(3);
      
      console.log('Todas las invitaciones:', allInvitations);
      console.log('Error al leer todas:', allError);
      
      if (allError) {
        setStatus(`❌ Error RLS: ${allError.message}`);
        return;
      }
      
      // Test 3: Buscar invitación específica
      setStatus('🎯 Test 3: Buscando invitación específica...');
      const { data: specificInvitation, error: specificError } = await supabase
        .from('business_invitations')
        .select('*')
        .eq('token', token)
        .single();
      
      console.log('Invitación específica:', specificInvitation);
      console.log('Error específico:', specificError);
      
      if (specificError) {
        setStatus(`❌ Error buscando invitación: ${specificError.message}`);
        return;
      }
      
      if (!specificInvitation) {
        setStatus('❌ Invitación no encontrada');
        return;
      }
      
      setInvitation(specificInvitation);
      setStatus('✅ ¡Invitación encontrada! Puedes ingresar el PIN.');
      setStep('pin');
      
    } catch (err) {
      console.error('Error general:', err);
      setStatus(`💥 Error inesperado: ${err instanceof Error ? err.message : 'Desconocido'}`);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif' 
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        
        <h1 style={{ 
          textAlign: 'center', 
          color: '#152241',
          marginBottom: '30px' 
        }}>
          🎯 Aceptar Invitación
        </h1>
        
        {/* Estado actual */}
        <div style={{
          backgroundColor: '#e7f3ff',
          border: '1px solid #007bff',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Estado:</h3>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            {status}
          </p>
        </div>

        {/* Info del token */}
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Información:</h3>
          <p><strong>Token:</strong> {token}</p>
          <p><strong>Teléfono:</strong> {invitation?.phone || 'Cargando...'}</p>
          <p><strong>PIN en DB:</strong> {invitation?.verification_pin || 'Cargando...'}</p>
          <p><strong>Estado DB:</strong> {invitation?.status || 'Cargando...'}</p>
        </div>

        {/* Formulario PIN */}
        {step === 'pin' && invitation && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Ingresa el PIN de 6 dígitos:
            </label>
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="934406"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '4px',
                fontFamily: 'monospace',
                border: '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            />
            
            <button
              onClick={verifyPin}
              disabled={pin.length !== 6}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: pin.length === 6 ? '#007bff' : '#ccc',
                border: 'none',
                borderRadius: '8px',
                cursor: pin.length === 6 ? 'pointer' : 'not-allowed'
              }}
            >
              Verificar PIN
            </button>
          </div>
        )}

        {/* Formulario de registro */}
        {step === 'register' && invitation && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              Crea tu cuenta como {invitation.role === 'partner' ? 'Socio' : 'Colaborador'}
            </h3>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Tu número {invitation.phone} ya está verificado ✅
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nombre completo *
              </label>
              <input
                type="text"
                value={registrationData.full_name}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Juan Pérez"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Cargo/Función (opcional)
              </label>
              <input
                type="text"
                value={registrationData.job_title}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="Contador, Vendedor, etc."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Contraseña *
              </label>
              <input
                type="password"
                value={registrationData.password}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Confirmar contraseña *
              </label>
              <input
                type="password"
                value={registrationData.confirmPassword}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repite la contraseña"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email (opcional, para login alternativo)
              </label>
              <input
                type="email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="socio@empresa.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Si no ingresas email, usarás tu teléfono para iniciar sesión
              </small>
            </div>
            
            <button
              onClick={completeProfile}
              disabled={!registrationData.full_name.trim() || !registrationData.password || registrationData.password !== registrationData.confirmPassword}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: (registrationData.full_name.trim() && registrationData.password && registrationData.password === registrationData.confirmPassword) ? '#007bff' : '#ccc',
                border: 'none',
                borderRadius: '8px',
                cursor: (registrationData.full_name.trim() && registrationData.password && registrationData.password === registrationData.confirmPassword) ? 'pointer' : 'not-allowed'
              }}
            >
              Crear Cuenta y Unirse
            </button>
          </div>
        )}

        {/* Formulario de perfil */}
        {step === 'profile' && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              Completa tu información
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nombre completo *
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Juan Pérez"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Cargo/Función (opcional)
              </label>
              <input
                type="text"
                value={profileData.job_title}
                onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="Contador, Vendedor, etc."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <button
              onClick={completeProfile}
              disabled={!profileData.full_name.trim()}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: profileData.full_name.trim() ? '#007bff' : '#ccc',
                border: 'none',
                borderRadius: '8px',
                cursor: profileData.full_name.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Completar Registro
            </button>
          </div>
        )}

        {/* Errores */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#721c24'
          }}>
            {error}
          </div>
        )}

        {/* Botón de prueba */}
        <button
          onClick={testConnection}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Volver a probar conexión
        </button>

        {/* Debug info */}
        {invitation && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f1f3f4',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <h4>🐛 Debug Info:</h4>
            <p><strong>Rol:</strong> {invitation.role}</p>
            <p><strong>Step actual:</strong> {step}</p>
            <p><strong>¿Es socio?:</strong> {invitation.role === 'partner' ? 'SÍ' : 'NO'}</p>
            {invitation.role === 'partner' && (
              <p style={{ color: 'green', fontWeight: 'bold' }}>
                ✅ Debería mostrar formulario de REGISTRO (con contraseña)
              </p>
            )}
            {invitation.role !== 'partner' && (
              <p style={{ color: 'blue', fontWeight: 'bold' }}>
                ℹ️ Debería mostrar formulario de PERFIL (sin contraseña)
              </p>
            )}
          </div>
        )}

        {/* Popup/Notificación de éxito */}
        {step === 'success' && invitation && (
          <>
            {/* Overlay de fondo */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Popup container */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '0',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                animation: 'slideIn 0.3s ease-out'
              }}>
                
                {invitation.role === 'partner' ? (
                  // Popup para SOCIOS
                  <div>
                    {/* Header del popup */}
                    <div style={{
                      background: 'linear-gradient(135deg, #28a745, #20c997)',
                      padding: '30px 20px',
                      borderRadius: '16px 16px 0 0',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎉</div>
                      <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
                        ¡Bienvenido como Socio!
                      </h2>
                      <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                        Tienes acceso completo a la plataforma
                      </p>
                    </div>

                    {/* Contenido del popup */}
                    <div style={{ padding: '30px 20px' }}>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '25px'
                      }}>
                        <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>
                          🚀 Como socio puedes:
                        </h3>
                        <ul style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: 0, 
                          color: '#666', 
                          lineHeight: '1.8' 
                        }}>
                          <li style={{ marginBottom: '8px' }}>✅ Acceder al dashboard completo</li>
                          <li style={{ marginBottom: '8px' }}>✅ Ver todos los reportes y estadísticas</li>
                          <li style={{ marginBottom: '8px' }}>✅ Gestionar ingresos y gastos</li>
                          <li style={{ marginBottom: '8px' }}>✅ Invitar y gestionar colaboradores</li>
                          <li style={{ marginBottom: '8px' }}>✅ Configurar el negocio</li>
                        </ul>
                      </div>

                      {/* Información personal */}
                      <div style={{
                        backgroundColor: '#e8f5e8',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '25px'
                      }}>
                        <h4 style={{ color: '#155724', marginBottom: '10px', fontSize: '16px' }}>
                          📋 Tu información:
                        </h4>
                        <p style={{ color: '#155724', margin: '5px 0', fontSize: '14px' }}>
                          <strong>Nombre:</strong> {registrationData.full_name || profileData.full_name}
                        </p>
                        {(registrationData.job_title || profileData.job_title) && (
                          <p style={{ color: '#155724', margin: '5px 0', fontSize: '14px' }}>
                            <strong>Cargo:</strong> {registrationData.job_title || profileData.job_title}
                          </p>
                        )}
                        <p style={{ color: '#155724', margin: '5px 0', fontSize: '14px' }}>
                          <strong>Teléfono:</strong> {invitation.phone}
                        </p>
                      </div>

                      {/* Contador de redirección */}
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}>
                        <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
                          🔄 Serás redirigido al dashboard en unos segundos...
                        </p>
                      </div>

                      {/* Botón manual */}
                      <button
                        onClick={() => window.location.href = `/business/${invitation.business_id}`}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: 'linear-gradient(135deg, #28a745, #20c997)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Ir al Dashboard Ahora
                      </button>
                    </div>
                  </div>
                ) : invitation.role === 'manager' ? (
                  // Popup para ADMINISTRADORES
                  <div>
                    <div style={{
                      background: 'linear-gradient(135deg, #007bff, #0056b3)',
                      padding: '30px 20px',
                      borderRadius: '16px 16px 0 0',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '15px' }}>⚙️</div>
                      <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
                        ¡Registrado como Administrador!
                      </h2>
                      <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                        Ya puedes registrar información del negocio
                      </p>
                    </div>

                    <div style={{ padding: '30px 20px' }}>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '25px'
                      }}>
                        <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>
                          📊 Tus responsabilidades:
                        </h3>
                        <ul style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: 0, 
                          color: '#666', 
                          lineHeight: '1.8' 
                        }}>
                          <li style={{ marginBottom: '8px' }}>💰 Registrar todos los ingresos del negocio</li>
                          <li style={{ marginBottom: '8px' }}>📊 Registrar todos los gastos del negocio</li>
                          <li style={{ marginBottom: '8px' }}>📈 Mantener actualizada la información financiera</li>
                          <li style={{ marginBottom: '8px' }}>🔄 Editar registros cuando sea necesario</li>
                        </ul>
                      </div>

                      <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '25px',
                        textAlign: 'center'
                      }}>
                        <h4 style={{ color: '#856404', marginBottom: '10px' }}>📱 Próximos pasos</h4>
                        <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
                          Te contactaremos pronto con las instrucciones para acceder al sistema de registro.
                        </p>
                      </div>

                      {/* Info personal */}
                      <div style={{
                        backgroundColor: '#e7f3ff',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '25px'
                      }}>
                        <h4 style={{ color: '#004085', marginBottom: '10px', fontSize: '16px' }}>
                          📋 Tu información:
                        </h4>
                        <p style={{ color: '#004085', margin: '5px 0', fontSize: '14px' }}>
                          <strong>Nombre:</strong> {profileData.full_name}
                        </p>
                        {profileData.job_title && (
                          <p style={{ color: '#004085', margin: '5px 0', fontSize: '14px' }}>
                            <strong>Cargo:</strong> {profileData.job_title}
                          </p>
                        )}
                        <p style={{ color: '#004085', margin: '5px 0', fontSize: '14px' }}>
                          <strong>Teléfono:</strong> {invitation.phone}
                        </p>
                      </div>

                      {/* Botones */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setStep('loading')}
                          style={{
                            flex: 1,
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#6c757d',
                            backgroundColor: 'white',
                            border: '2px solid #6c757d',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Volver
                        </button>
                        <button
                          onClick={() => window.close()}
                          style={{
                            flex: 1,
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white',
                            background: 'linear-gradient(135deg, #007bff, #0056b3)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Popup para TRABAJADORES
                  <div>
                    <div style={{
                      background: 'linear-gradient(135deg, #6c757d, #495057)',
                      padding: '30px 20px',
                      borderRadius: '16px 16px 0 0',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '15px' }}>👷</div>
                      <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
                        ¡Registrado como Trabajador!
                      </h2>
                      <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                        Ya puedes registrar información en tus verticales
                      </p>
                    </div>

                    <div style={{ padding: '30px 20px' }}>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '25px'
                      }}>
                        <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>
                          📍 Verticales asignadas:
                        </h3>
                        {invitation.permissions?.verticals?.allowedVerticals && invitation.permissions.verticals.allowedVerticals.length > 0 ? (
                          <ul style={{ 
                            listStyle: 'none', 
                            padding: 0, 
                            margin: 0, 
                            color: '#666', 
                            lineHeight: '1.8' 
                          }}>
                            {invitation.permissions.verticals.allowedVerticals.map((verticalId: string, index: number) => (
                              <li key={verticalId} style={{ marginBottom: '8px' }}>
                                📌 Vertical {index + 1}: {verticalId}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ color: '#666', fontStyle: 'italic' }}>
                            Se especificarán tus verticales asignadas próximamente
                          </p>
                        )}
                      </div>

                      <div style={{
                        backgroundColor: '#d1ecf1',
                        border: '1px solid #bee5eb',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '25px',
                        textAlign: 'center'
                      }}>
                        <h4 style={{ color: '#0c5460', marginBottom: '10px' }}>📱 Próximos pasos</h4>
                        <p style={{ color: '#0c5460', margin: 0, fontSize: '14px' }}>
                          Te contactaremos con las instrucciones para acceder al sistema de registro de tus verticales.
                        </p>
                      </div>

                      {/* Info personal */}
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '25px'
                      }}>
                        <h4 style={{ color: '#495057', marginBottom: '10px', fontSize: '16px' }}>
                          📋 Tu información:
                        </h4>
                        <p style={{ color: '#495057', margin: '5px 0', fontSize: '14px' }}>
                          <strong>Nombre:</strong> {profileData.full_name}
                        </p>
                        {profileData.job_title && (
                          <p style={{ color: '#495057', margin: '5px 0', fontSize: '14px' }}>
                            <strong>Cargo:</strong> {profileData.job_title}
                          </p>
                        )}
                        <p style={{ color: '#495057', margin: '5px 0', fontSize: '14px' }}>
                          <strong>Teléfono:</strong> {invitation.phone}
                        </p>
                      </div>

                      {/* Botones */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setStep('loading')}
                          style={{
                            flex: 1,
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#6c757d',
                            backgroundColor: 'white',
                            border: '2px solid #6c757d',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Volver
                        </button>
                        <button
                          onClick={() => window.close()}
                          style={{
                            flex: 1,
                            padding: '12px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white',
                            backgroundColor: '#6c757d',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CSS Animation */
            /* <style jsx>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: scale(0.8) translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
            `}</style> */}
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>Cargando...</p>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}