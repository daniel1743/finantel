// ============================================================================
// COMPONENTE: Formulario de Registro con Detección de Abuso
// ============================================================================
// Integra la verificación de riesgo de IP en el formulario de registro
// ============================================================================

import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { registerWithRiskCheck } from '../lib/registrationFlow';
import { BlockedRegistrationMessage } from './BlockedRegistrationMessage';

interface RegistrationFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskInfo, setRiskInfo] = useState<{
    level: string;
    message: string;
  } | null>(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState<{
    riskLevel: string;
    reason: string;
    eventId?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRiskInfo(null);
    setLoading(true);

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Registrar con verificación de riesgo
      const result = await registerWithRiskCheck(
        supabase,
        email,
        password,
        {
          registration_source: 'web',
          registration_date: new Date().toISOString(),
        }
      );

      if (result.success) {
        setRequiresVerification(result.requiresVerification);
        
        // Mostrar información de riesgo si es relevante
        if (result.riskLevel !== 'normal') {
          setRiskInfo({
            level: result.riskLevel,
            message: result.reason || 'Se detectó actividad inusual',
          });
        }

        // Si requiere verificación, mostrar mensaje
        if (result.requiresVerification) {
          setError(
            'Por seguridad, necesitamos verificar tu correo electrónico. ' +
            'Por favor revisa tu bandeja de entrada.'
          );
        }

        onSuccess?.(result.user);
      } else {
        // Si está bloqueado, mostrar componente de apelación
        if (result.error === 'REGISTRATION_BLOCKED') {
          setBlockedInfo({
            riskLevel: result.riskLevel,
            reason: result.reason || 'Registro bloqueado',
            eventId: result.eventId,
            ipAddress: result.ipAddress,
            deviceFingerprint: result.deviceFingerprint,
          });
          setError(null); // Limpiar error para mostrar componente de bloqueo
        } else {
          setError(result.error || result.reason || 'Error al crear la cuenta');
        }
        onError?.(result.error || result.reason || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'very_high':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Repite tu contraseña"
        />
      </div>

      {/* Mostrar información de riesgo */}
      {riskInfo && (
        <div className={`rounded-md p-3 ${getRiskBadgeColor(riskInfo.level)}`}>
          <p className="text-sm font-medium">
            Nivel de riesgo: {riskInfo.level.toUpperCase()}
          </p>
          <p className="text-xs mt-1">{riskInfo.message}</p>
        </div>
      )}

      {/* Mostrar mensaje de verificación requerida */}
      {requiresVerification && (
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            Por seguridad, necesitamos verificar tu correo electrónico.
            Revisa tu bandeja de entrada.
          </p>
        </div>
      )}

      {/* Mostrar mensaje de bloqueo con opción de apelar */}
      {blockedInfo && (
        <BlockedRegistrationMessage
          riskLevel={blockedInfo.riskLevel}
          reason={blockedInfo.reason}
          eventId={blockedInfo.eventId}
          email={email}
          ipAddress={blockedInfo.ipAddress}
          deviceFingerprint={blockedInfo.deviceFingerprint}
          onAppealSubmitted={(appealId) => {
            console.log('Apelación enviada:', appealId);
            setBlockedInfo(null);
            setError('Tu apelación ha sido enviada. Te contactaremos pronto.');
          }}
        />
      )}

      {/* Mostrar errores (solo si no hay bloqueo) */}
      {error && !blockedInfo && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
        Utilizamos medidas de seguridad para prevenir abusos.
      </p>
    </form>
  );
}

