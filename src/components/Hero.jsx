
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, ShieldCheck, TrendingUp, PieChart, ShoppingBag, ArrowUpRight, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useABTest } from '@/contexts/ABTestContext';
import NewsletterSignup from '@/components/NewsletterSignup';
import RecentUsersCounter from '@/components/RecentUsersCounter';

const Hero = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { experiments, trackConversion } = useABTest();

  // A/B Test Logic
  const ctaText = experiments['hero_cta_text'] === 'variant_b' ? 'Prueba Ahora' : 'Comenzar Gratis';
  const showNewsletter = experiments['pricing_plans'] === 'variant_b'; // Example usage of another test

  const handleCTAClick = () => {
    trackConversion('hero_cta_text');
    navigate('/auth');
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C8FA0]/5 via-white to-white -z-20 dark:from-[#1C8FA0]/10 dark:via-[#0f0f11] dark:to-[#0f0f11]" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1C8FA0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C8FA0]/10 text-[#1C8FA0] text-sm font-medium mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1C8FA0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1C8FA0]"></span>
              </span>
              Nueva versión 2.0 disponible
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-[72px] font-bold text-[#1a1a1a] dark:text-white leading-[1.1] tracking-tight"
            >
              Controla tus finanzas <span className="text-[#1C8FA0]">SIN conectar</span> tu banco
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-[#6E6E73] dark:text-gray-400 max-w-xl leading-relaxed font-medium"
            >
              Tu dinero, tu privacidad, tu claridad. IA financiera moderna que entiende tus gastos sin comprometer tu seguridad bancaria.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button 
                onClick={handleCTAClick}
                className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white text-lg px-8 py-7 h-auto rounded-full shadow-xl shadow-[#1C8FA0]/20 transition-all hover:shadow-[#1C8FA0]/30 hover:-translate-y-1"
              >
                {ctaText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>

            {showNewsletter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-8 max-w-md"
              >
                <NewsletterSignup variant="card" />
              </motion.div>
            )}
          </div>

          {/* Visual Content - Kept same as before but ensuring dark mode classes */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10"
            >
              {/* Recent Users Counter - Positioned absolutely */}
              <div className="absolute -top-4 -right-4 z-20 hidden lg:block">
                <RecentUsersCounter />
              </div>

              {/* Main Card */}
              <div className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] dark:shadow-black/50 border border-white/50 dark:border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1C8FA0] to-[#E47B45]" />
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-sm text-[#6E6E73] dark:text-gray-400 font-medium">Balance Total</p>
                    <h3 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mt-1">$12,450.00</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#1C8FA0]" />
                  </div>
                </div>

                {/* Chart Area Mockup */}
                <div className="h-40 w-full bg-gradient-to-b from-[#1C8FA0]/5 to-transparent rounded-2xl mb-6 relative border border-[#1C8FA0]/10 overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-between px-4 pb-2">
                    {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-[#1C8FA0] rounded-t-full opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-4">
                  {[
                    { name: "Supermercado", cat: "Alimentación", amount: "-$124.50", Icon: ShoppingBag, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
                    { name: "Freelance Project", cat: "Ingresos", amount: "+$850.00", Icon: ArrowUpRight, positive: true, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
                    { name: "Netflix", cat: "Suscripciones", amount: "-$15.99", Icon: Film, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" }
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-default group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${tx.color}`}>
                          <tx.Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">{tx.name}</p>
                          <p className="text-xs text-[#6E6E73] dark:text-gray-400">{tx.cat}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${tx.positive ? 'text-[#1C8FA0]' : 'text-[#1a1a1a] dark:text-white'}`}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
