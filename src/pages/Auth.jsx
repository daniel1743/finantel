
import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

const Auth = () => {
  // Los hooks deben ser llamados incondicionalmente
  // Si hay un error, React mostrará el error boundary
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const offerParam = searchParams.get('offer');
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // Por defecto mantener sesión
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const from = location.state?.from?.pathname || "/dashboard";
  const handleExitToLanding = () => navigate('/', { replace: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Pasar el parámetro rememberMe al signIn
        const { error } = await signIn(formData.email, formData.password, rememberMe);
        if (error) throw error;
        navigate(from, { replace: true });
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
        const { error } = await signUp(formData.email, formData.password, {
          data: { full_name: formData.fullName }
        });
        if (error) throw error;
        
        toast({
          title: "¡Cuenta creada!",
          description: "Por favor verifica tu correo electrónico para continuar.",
        });
        setIsLogin(true);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F9] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#1C8FA0]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#E47B45]/5 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_40px_80px_-12px_rgba(0,0,0,0.12)] border border-white p-8 relative z-10"
      >
        <button
          type="button"
          onClick={handleExitToLanding}
          className="absolute right-4 top-4 p-2 text-[#6E6E73] hover:text-[#1a1a1a] hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C8FA0]/30"
          aria-label="Cerrar y volver a la landing"
        >
          <Icon component={X} size="md" color="default" />
        </button>

        <div className="text-center mb-8">
          <img
            src="/finantel-logo.png"
            alt="Finantel Logo"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <p className="text-[#6E6E73] mt-2 text-sm">
            {isLogin ? 'Ingresa a tu panel financiero inteligente' : 'Comienza a controlar tus finanzas hoy'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  required={!isLogin}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  icon={User}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            type="email"
            placeholder="Correo electrónico"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            icon={Mail}
          />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            icon={Lock}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#6E6E73] hover:text-[#1C8FA0] transition-colors focus:outline-none"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <Icon component={EyeOff} size="sm" color="default" /> : <Icon component={Eye} size="sm" color="default" />}
              </button>
            }
          />

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  icon={CheckCircle2}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#6E6E73] hover:text-[#1C8FA0] transition-colors focus:outline-none"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? <Icon component={EyeOff} size="sm" color="default" /> : <Icon component={Eye} size="sm" color="default" />}
                    </button>
                  }
                />
                <div className="flex items-start gap-2 px-1">
                  <input type="checkbox" required className="mt-1 w-3.5 h-3.5 rounded border-gray-300 text-[#1C8FA0] focus:ring-[#1C8FA0] cursor-pointer" />
                  <span className="text-xs text-[#6E6E73]">
                    Acepto los <a href="#" className="text-[#1C8FA0] hover:underline">Términos de Servicio</a> y la <a href="#" className="text-[#1C8FA0] hover:underline">Política de Privacidad</a>.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setRememberMe(newValue);
                    // Mostrar feedback visual
                    console.log(`✅ Mantener sesión: ${newValue ? 'ACTIVADO (no pedirá credenciales al volver)' : 'DESACTIVADO (pedirá credenciales al cerrar navegador)'}`);
                  }}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#1C8FA0] focus:ring-[#1C8FA0] cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs font-medium text-[#6E6E73] cursor-pointer select-none">
                  Mantener sesión iniciada
                </label>
              </div>
              <button type="button" className="text-xs font-medium text-[#1C8FA0] hover:text-[#167a8a] transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                <Icon component={ArrowRight} size="sm" color="default" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="mb-6">
            <button
              type="button"
              onClick={async () => {
                setIsGoogleLoading(true);
                try {
                  // Mostrar la URL de redirección en consola para debugging
                  const redirectUrl = `${window.location.origin}/auth/callback`;
                  console.log('🔗 URL de redirección que se usará:', redirectUrl);
                  console.log('📝 Asegúrate de agregar esta URL en Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs');

                  const { error } = await signInWithGoogle(rememberMe);
                  if (error) {
                    // Si es error de redirect_uri_mismatch, dar instrucciones más claras
                    if (error.message?.includes('redirect_uri_mismatch') || error.message?.includes('redirect')) {
                      toast({
                        variant: "destructive",
                        title: "Error de configuración",
                        description: `URL de redirección no autorizada. Agrega "${redirectUrl}" en Google Cloud Console. Ver consola para más detalles.`,
                      });
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: error.message || "No se pudo iniciar sesión con Google",
                      });
                    }
                  }
                  // La redirección se manejará automáticamente
                } catch (err) {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Ocurrió un error al intentar iniciar sesión con Google",
                  });
                } finally {
                  setIsGoogleLoading(false);
                }
              }}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#6E6E73] hover:bg-gray-50 hover:text-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
              ) : (
                <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
                </>
              )}
            </button>
          </div>

          <p className="text-center text-sm text-[#6E6E73]">
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-[#1C8FA0] hover:text-[#167a8a] transition-colors"
            >
              {isLogin ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
