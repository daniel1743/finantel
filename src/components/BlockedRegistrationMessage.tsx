// ============================================================================
// COMPONENTE: Mensaje de Registro Bloqueado con Opción de Apelar
// ============================================================================

import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface BlockedRegistrationMessageProps {
  riskLevel: string;
  reason: string;
  ipAddress?: string;
  eventId?: string;
  email?: string;
  deviceFingerprint?: string;
  onAppealSubmitted?: (appealId: string) => void;
}

export function BlockedRegistrationMessage({
  riskLevel,
  reason,
  ipAddress,
  eventId,
  email,
  deviceFingerprint,
  onAppealSubmitted,
}: BlockedRegistrationMessageProps) {
  const supabase = useSupabaseClient();
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealEmail, setAppealEmail] = useState(email || '');
  const [submitting, setSubmitting] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!appealEmail || !appealEmail.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido');
      setSubmitting(false);
      return;
    }

    if (appealReason.length < 10) {
      setError('Por favor explica tu situación en al menos 10 caracteres');
      setSubmitting(false);
      return;
    }

    try {
      // Llamar a Edge Function para crear apelación
      const { data, error: appealError } = await supabase.functions.invoke('create-appeal', {
        body: {
          email: appealEmail,
          ip_address: ipAddress,
          device_fingerprint: deviceFingerprint,
          event_id: eventId,
          appeal_reason: appealReason,
        },
      });

      if (appealError) throw appealError;

      if (data?.success && data?.appeal_id) {
        setAppealSubmitted(true);
        onAppealSubmitted?.(data.appeal_id);
      } else {
        throw new Error(data?.error || 'Error al enviar apelación');
      }
    } catch (err: any) {
      console.error('Error al enviar apelación:', err);
      setError(err.message || 'Error al enviar la apelación. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (appealSubmitted) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-green-800">Apelación Enviada</h3>
            <p className="mt-2 text-sm text-green-700">
              Tu solicitud de apelación ha sido enviada exitosamente. Nuestro equipo la revisará 
              y te contactará en el correo proporcionado en un plazo de 24-48 horas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800">
            Registro No Permitido
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="font-medium">Razón:</p>
            <p className="mt-1">{reason}</p>
            <p className="mt-3 text-xs text-red-600">
              Nivel de riesgo: <span className="font-semibold">{riskLevel.toUpperCase()}</span>
            </p>
          </div>

          {!showAppealForm ? (
            <div className="mt-4">
              <button
                onClick={() => setShowAppealForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ¿Crees que esto es un error? Solicitar revisión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitAppeal} className="mt-4 space-y-4">
              <div>
                <label htmlFor="appeal-email" className="block text-sm font-medium text-red-800">
                  Correo electrónico
                </label>
                <input
                  id="appeal-email"
                  type="email"
                  value={appealEmail}
                  onChange={(e) => setAppealEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="appeal-reason" className="block text-sm font-medium text-red-800">
                  Explica tu situación
                </label>
                <textarea
                  id="appeal-reason"
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  required
                  minLength={10}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Por favor explica por qué crees que esto es un error. Incluye cualquier información relevante que pueda ayudar a revisar tu caso."
                />
                <p className="mt-1 text-xs text-red-600">
                  Mínimo 10 caracteres. Sé específico para ayudar a nuestra revisión.
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-100 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Enviando...' : 'Enviar Apelación'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAppealForm(false);
                    setError(null);
                    setAppealReason('');
                  }}
                  className="px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  Cancelar
                </button>
              </div>

              <p className="text-xs text-red-600">
                Nuestro equipo revisará tu solicitud en un plazo de 24-48 horas. 
                Te contactaremos en el correo proporcionado.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

