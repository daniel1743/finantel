import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle2, AlertCircle, Loader2, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const TwoFactorAuthModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('info'); // 'info', 'setup', 'verify', 'enabled'

  useEffect(() => {
    if (isOpen && user?.id) {
      check2FAStatus();
    }
  }, [isOpen, user?.id]);

  const check2FAStatus = async () => {
    setLoading(true);
    try {
      // Verificar si el usuario tiene 2FA habilitado
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Supabase almacena el estado de 2FA en factors
      const { data: { factors }, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;

      const totpFactor = factors?.find(factor => factor.factor_type === 'totp' && factor.status === 'verified');
      setIsEnabled(!!totpFactor);
      setStep(totpFactor ? 'enabled' : 'info');
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setEnabling(true);
    try {
      // Crear factor TOTP
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `${user?.email} - Finantel`,
      });

      if (error) throw error;

      setQrCode(data.qr_code);
      setSecret(data.secret);
      setStep('verify');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo habilitar la autenticación en 2 pasos",
      });
    } finally {
      setEnabling(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "Por favor ingresa un código de 6 dígitos",
      });
      return;
    }

    setVerifying(true);
    try {
      // Obtener el factor TOTP recién creado
      const { data: { factors } } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.find(factor => factor.factor_type === 'totp' && factor.status === 'unverified');

      if (!totpFactor) {
        throw new Error('No se encontró el factor TOTP');
      }

      // Verificar el código
      const { error } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        code: verificationCode,
      });

      if (error) throw error;

      // Confirmar el factor
      const { error: confirmError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (confirmError) throw confirmError;

      setIsEnabled(true);
      setStep('enabled');
      toast({
        title: "¡Activado!",
        description: "La autenticación en 2 pasos ha sido habilitada exitosamente",
      });
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "El código de verificación es incorrecto",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    setEnabling(true);
    try {
      const { data: { factors } } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.find(factor => factor.factor_type === 'totp' && factor.status === 'verified');

      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id,
        });

        if (error) throw error;

        setIsEnabled(false);
        setStep('info');
        toast({
          title: "Desactivado",
          description: "La autenticación en 2 pasos ha sido desactivada",
        });
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo desactivar la autenticación en 2 pasos",
      });
    } finally {
      setEnabling(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copiado",
      description: "Código secreto copiado al portapapeles",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Autenticación en 2 Pasos</h2>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
              Mayor seguridad para tu cuenta
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={enabling || verifying}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <Icon component={X} size="md" color="default" className="dark:" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
          </div>
        ) : step === 'info' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
              <Icon component={Shield} size="lg" color="default" className="dark:" />
              <div>
                <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">
                  Protege tu cuenta
                </p>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                  Requiere un código adicional además de tu contraseña
                </p>
              </div>
            </div>

            <Button
              onClick={handleEnable2FA}
              disabled={enabling}
              className="w-full bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
            >
              {enabling ? (
                <>
                  <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                  Habilitando...
                </>
              ) : (
                <>
                  <Icon component={Shield} size="sm" color="default" className="mr-2" />
                  Habilitar Autenticación en 2 Pasos
                </>
              )}
            </Button>
          </div>
        ) : step === 'verify' ? (
          <div className="space-y-6">
            <div className="text-center">
              <Icon component={QrCode} size="md" color="primary" className="mx-auto mb-4" />
              <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-2">
                Escanea el código QR
              </h3>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                Usa una app como Google Authenticator o Authy
              </p>
            </div>

            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-xl border border-gray-200">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                Código Secreto (si no puedes escanear)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secret}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-mono text-sm"
                />
                <Button
                  onClick={copySecret}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Icon component={Copy} size="sm" color="default" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                Código de Verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep('info');
                  setVerificationCode('');
                  setQrCode(null);
                  setSecret('');
                }}
                variant="outline"
                disabled={verifying}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verifying || verificationCode.length !== 6}
                className="flex-1 bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
              >
                {verifying ? (
                  <>
                    <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar y Activar'
                )}
              </Button>
            </div>
          </div>
        ) : step === 'enabled' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
              <Icon component={CheckCircle2} size="lg" color="success" className="dark:" />
              <div>
                <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">
                  Autenticación en 2 Pasos Activada
                </p>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
                  Tu cuenta está protegida
                </p>
              </div>
            </div>

            <Button
              onClick={handleDisable2FA}
              disabled={enabling}
              variant="outline"
              className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
              {enabling ? (
                <>
                  <Icon component={Loader2} size="sm" color="default" className="mr-2 animate-spin" />
                  Desactivando...
                </>
              ) : (
                'Desactivar Autenticación en 2 Pasos'
              )}
            </Button>
          </div>
        ) : null}

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={enabling || verifying}
            className="w-full"
          >
            Cerrar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorAuthModal;

