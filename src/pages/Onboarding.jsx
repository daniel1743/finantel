
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Check, Plus, Wallet, ShoppingBag, Coffee, Home, Car, Plane, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    income: '',
    goal: '',
    categories: ['Alimentación', 'Transporte', 'Hogar']
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.",
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);

    try {
      // Convertir valores a números
      const monthlyIncome = parseFloat(formData.income) || 0;
      const savingsGoal = parseFloat(formData.goal) || 0;

      // Llamar a la función de Supabase para completar el onboarding
      const { data, error } = await supabase.rpc('complete_user_onboarding', {
        user_uuid: user.id,
        monthly_income: monthlyIncome > 0 ? monthlyIncome : null,
        savings_goal: savingsGoal > 0 ? savingsGoal : null,
        generate_samples: monthlyIncome > 0 // Solo generar muestras si hay ingreso
      });

      if (error) {
        console.error('Error en onboarding:', error);
        throw error;
      }

      // Si hay meta de ahorro, crear una meta (goal)
      if (savingsGoal > 0) {
        const { error: goalError } = await supabase.from('goals').insert({
          user_id: user.id,
          name: 'Meta de Ahorro Inicial',
          description: 'Meta de ahorro establecida durante el onboarding',
          target_amount: savingsGoal,
          current_amount: 0,
          priority: 'high',
          status: 'active'
        });

        if (goalError) {
          console.error('Error creando meta:', goalError);
          // No lanzar error, solo registrar
        }
      }

      toast({
        title: "¡Bienvenido a Finantel!",
        description: "Tu cuenta ha sido configurada exitosamente.",
      });

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completando onboarding:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo completar la configuración. Intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Header */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gray-50 z-50">
        <motion.div 
          className="h-full bg-[#1C8FA0]"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1C8FA0]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E47B45]/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

        <div className="w-full max-w-6xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: BUDGET */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-16 items-center"
              >
                <div className="space-y-8">
                  <div>
                    <span className="text-[#1C8FA0] font-bold tracking-wider text-sm uppercase mb-2 block">Paso 1 de 3</span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-[#1a1a1a] font-['Inter_Tight'] leading-tight">
                      Diseñemos tu <br/>
                      <span className="text-[#1C8FA0]">presupuesto ideal</span>
                    </h2>
                    <p className="text-lg text-[#6E6E73] mt-4 max-w-md">
                      Para que nuestra IA pueda ayudarte, necesitamos entender tu punto de partida. Todo es privado.
                    </p>
                  <div className="bg-white/80 dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl p-4 flex gap-3 items-start shadow-sm mt-6">
                    <div className="w-10 h-10 rounded-xl bg-[#1C8FA0]/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-[#1C8FA0]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">Transparencia total</p>
                      <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-2">
                        Finantel solo registra tus movimientos. Nunca tocamos tu dinero ni cobramos comisiones ocultas.
                      </p>
                      <Link 
                        to="/legal/transparencia"
                        target="_blank"
                        className="text-sm font-semibold text-[#1C8FA0] hover:text-[#167a8a]"
                      >
                        Conoce nuestro compromiso →
                      </Link>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#1a1a1a]">Ingreso Mensual Estimado</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]">$</span>
                        <input 
                          type="number" 
                          value={formData.income}
                          onChange={(e) => setFormData({...formData, income: e.target.value})}
                          className="w-full pl-8 pr-4 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#1C8FA0]/30 focus:ring-4 focus:ring-[#1C8FA0]/10 transition-all outline-none text-lg font-medium"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#1a1a1a]">Meta de Ahorro Mensual</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]">$</span>
                        <input 
                          type="number" 
                          value={formData.goal}
                          onChange={(e) => setFormData({...formData, goal: e.target.value})}
                          className="w-full pl-8 pr-4 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#1C8FA0]/30 focus:ring-4 focus:ring-[#1C8FA0]/10 transition-all outline-none text-lg font-medium"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={nextStep} className="bg-[#1a1a1a] hover:bg-black text-white px-8 py-6 rounded-full text-lg shadow-xl shadow-black/5">
                    Continuar <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>

                <div className="hidden lg:block relative">
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-white/60 backdrop-blur-2xl rounded-[40px] p-8 border border-white shadow-[0_40px_80px_-12px_rgba(0,0,0,0.12)] relative z-10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-[40px] pointer-events-none" />
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#1C8FA0]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1a1a1a]">Análisis IA</h3>
                        <p className="text-xs text-[#6E6E73]">Procesando datos en local...</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-24 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-50 animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-50 rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-gray-50 rounded w-1/2 animate-pulse" />
                        </div>
                      </div>
                      <div className="h-24 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 opacity-60">
                        <div className="w-12 h-12 rounded-full bg-gray-50" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-50 rounded w-2/3" />
                          <div className="h-3 bg-gray-50 rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CATEGORIES */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-12">
                  <span className="text-[#1C8FA0] font-bold tracking-wider text-sm uppercase mb-2 block">Paso 2 de 3</span>
                  <h2 className="text-4xl font-bold text-[#1a1a1a] font-['Inter_Tight'] mb-4">
                    Personaliza tus categorías
                  </h2>
                  <p className="text-[#6E6E73] text-lg">
                    Selecciona las que más usas. Podrás agregar más después.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {[
                    { name: 'Alimentación', icon: ShoppingBag },
                    { name: 'Transporte', icon: Car },
                    { name: 'Hogar', icon: Home },
                    { name: 'Ocio', icon: Coffee },
                    { name: 'Viajes', icon: Plane },
                    { name: 'Salud', icon: Sparkles },
                    { name: 'Servicios', icon: Wallet },
                    { name: 'Otros', icon: Plus }
                  ].map((cat, i) => {
                    const isSelected = formData.categories.includes(cat.name);
                    const Icon = cat.icon;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({...formData, categories: formData.categories.filter(c => c !== cat.name)});
                          } else {
                            setFormData({...formData, categories: [...formData.categories, cat.name]});
                          }
                        }}
                        className={`
                          cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border transition-all duration-300
                          ${isSelected 
                            ? 'bg-[#1C8FA0]/5 border-[#1C8FA0] shadow-lg shadow-[#1C8FA0]/10' 
                            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'}
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-[#1C8FA0] text-white' : 'bg-gray-50 text-[#6E6E73]'}
                        `}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-[#1C8FA0]' : 'text-[#6E6E73]'}`}>
                          {cat.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-[#1C8FA0] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-4">
                  <Button onClick={prevStep} variant="ghost" className="text-[#6E6E73] hover:text-[#1a1a1a]">
                    Atrás
                  </Button>
                  <Button onClick={nextStep} className="bg-[#1a1a1a] hover:bg-black text-white px-10 py-6 rounded-full text-lg shadow-xl shadow-black/5">
                    Continuar <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUMMARY */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="mb-8">
                  <div className="w-20 h-20 bg-[#1C8FA0]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-[#1C8FA0]" />
                  </div>
                  <h2 className="text-4xl font-bold text-[#1a1a1a] font-['Inter_Tight'] mb-4">
                    ¡Todo listo!
                  </h2>
                  <p className="text-[#6E6E73] text-lg">
                    Finantel ha preparado un plan inicial basado en tus datos.
                  </p>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border border-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] mb-10 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1C8FA0] to-[#E47B45]" />
                  
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-sm text-[#6E6E73] uppercase tracking-wider font-semibold mb-1">Presupuesto Disponible</p>
                      <p className="text-3xl font-bold text-[#1a1a1a]">${formData.income || '0.00'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#6E6E73] mb-1">Meta de Ahorro</p>
                      <p className="text-xl font-bold text-[#1C8FA0]">${formData.goal || '0.00'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#1a1a1a]">Categorías activas:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((cat, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-50 rounded-full text-sm text-[#6E6E73] border border-gray-100">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleFinish} 
                  disabled={isLoading}
                  className="w-full bg-[#1C8FA0] hover:bg-[#167a8a] text-white py-7 rounded-2xl text-xl font-medium shadow-xl shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                      Configurando tu cuenta...
                    </>
                  ) : (
                    'Ir a mi Dashboard'
                  )}
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
