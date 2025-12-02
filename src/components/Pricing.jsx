import React, { useState } from 'react';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';

// ✅ CHECKOUT FUNCIONAL CON STRIPE
// NOTA: Configurar STRIPE_SECRET_KEY en Supabase Edge Functions
// NOTA: Crear productos y precios en Stripe Dashboard
const PRICE_IDS = {
  starter: null, // Free plan
  pro: 'price_xxxxxxxxxxxxx', // ⚠️ Reemplazar con Price ID real de Stripe
  family: 'price_yyyyyyyyyyyyy' // ⚠️ Reemplazar con Price ID real de Stripe
};

const Pricing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  const handlePlanClick = async (planId) => {
    setLoading(planId);

    try {
      // Si no está autenticado, redirigir a auth con el plan seleccionado
      if (!user) {
        navigate('/auth', { state: { selectedPlan: planId } });
        setLoading(null);
        return;
      }

      // Si es plan starter (free), ir directo a onboarding/dashboard
      if (planId === 'starter') {
        navigate('/dashboard');
        toast({
          title: "¡Bienvenido a Finantel!",
          description: "Plan Starter activado. Comienza a registrar tus gastos.",
        });
        setLoading(null);
        return;
      }

      // Crear checkout session (Mercado Pago o Stripe)
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId: planId.toLowerCase(),
          provider: 'mercadopago' // Cambiar a 'stripe' cuando esté configurado
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirigir a checkout (Mercado Pago o Stripe)
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }

    } catch (error) {
      console.error('Error al procesar checkout:', error);
      toast({
        title: "Error al procesar pago",
        description: error.message || "No pudimos iniciar el proceso de pago. Por favor intenta nuevamente.",
        variant: "destructive"
      });
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-32 bg-[#F9FAFB] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-[#1a1a1a] mb-4">Precios simples</h2>
          <p className="text-xl text-[#6E6E73]">Comienza gratis. Actualiza cuando lo necesites.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Free Plan */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-sm hover:border-[#1C8FA0]/30 hover:shadow-[0_20px_40px_-12px_rgba(28,143,160,0.15)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C8FA0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#1C8FA0] transition-colors">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-[#1a1a1a] group-hover:text-[#1C8FA0] transition-colors">$0</span>
                <span className="text-[#6E6E73]">/mes</span>
              </div>
              <p className="text-[#6E6E73] mb-8 text-sm">Para empezar a ordenar tus finanzas.</p>
              <Button
                onClick={() => handlePlanClick('Starter')}
                disabled={loading === 'Starter'}
                variant="outline"
                className="w-full rounded-full py-6 border-2 border-gray-200 hover:border-[#1C8FA0] hover:bg-[#1C8FA0] hover:text-white text-[#1a1a1a] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#1C8FA0]/20"
              >
                {loading === 'Starter' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Comenzar Gratis'
                )}
              </Button>
              <ul className="mt-8 space-y-4">
                {['Gastos ilimitados', '5 categorías', 'Exportación básica'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#6E6E73] group-hover:text-[#1a1a1a] transition-colors">
                    <Check className="w-4 h-4 text-[#1C8FA0] group-hover:scale-110 transition-transform" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Pro Plan - Highlighted with Premium Hover */}
          <motion.div 
            whileHover={{ scale: 1.08, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#1a1a1a] p-10 rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] relative transform scale-105 z-10 border-2 border-transparent hover:border-[#1C8FA0] hover:shadow-[0_30px_60px_-12px_rgba(28,143,160,0.4)] transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            {/* Animated background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C8FA0]/10 via-[#1C8FA0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Sparkle effect on hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-[#1C8FA0]" />
              </motion.div>
            </div>

            <div className="absolute top-0 right-0 bg-[#1C8FA0] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-[32px] group-hover:bg-[#167a8a] transition-colors">
              POPULAR
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#1C8FA0] transition-colors">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold text-white group-hover:text-[#1C8FA0] transition-colors">$9</span>
                <span className="text-gray-400">/mes</span>
              </div>
              <p className="text-gray-400 mb-8 text-sm group-hover:text-gray-300 transition-colors">Para quienes quieren análisis más profundos.</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handlePlanClick('Pro')}
                  disabled={loading === 'Pro'}
                  className="w-full bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full py-6 shadow-lg shadow-[#1C8FA0]/25 group-hover:shadow-[#1C8FA0]/40 group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {loading === 'Pro' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Procesando...
                      </>
                    ) : (
                      'Obtener Pro'
                    )}
                  </span>
                  {!loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </Button>
              </motion.div>
              <ul className="mt-8 space-y-4">
                {['Todo en Starter', 'Categorías ilimitadas', 'IA Predictiva', 'Sincronización multi-dispositivo', 'Soporte prioritario'].map((item, index) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 1 }}
                    whileHover={{ x: 4, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="w-4 h-4 text-[#1C8FA0] group-hover:text-[#1C8FA0]" />
                    </motion.div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Family Plan */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-sm hover:border-[#E47B45]/30 hover:shadow-[0_20px_40px_-12px_rgba(228,123,69,0.15)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E47B45]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#E47B45] transition-colors">Family</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-[#1a1a1a] group-hover:text-[#E47B45] transition-colors">$19</span>
                <span className="text-[#6E6E73]">/mes</span>
              </div>
              <p className="text-[#6E6E73] mb-8 text-sm">Para familias que quieren gestionar gastos juntos.</p>
              <Button
                onClick={() => handlePlanClick('Family')}
                disabled={loading === 'Family'}
                variant="outline"
                className="w-full rounded-full py-6 border-2 border-gray-200 hover:border-[#E47B45] hover:bg-[#E47B45] hover:text-white text-[#1a1a1a] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#E47B45]/20"
              >
                {loading === 'Family' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Obtener Family'
                )}
              </Button>
              <ul className="mt-8 space-y-4">
                {['Todo en Pro', 'Hasta 5 miembros', 'Presupuestos compartidos', 'Roles y permisos', 'Asesor financiero IA'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#6E6E73] group-hover:text-[#1a1a1a] transition-colors">
                    <Check className="w-4 h-4 text-[#1C8FA0] group-hover:scale-110 transition-transform" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;