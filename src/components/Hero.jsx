
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, ShieldCheck, TrendingUp, PieChart, ShoppingBag, ArrowUpRight, Film, Music, Ticket, Coffee, Car, Plane, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useABTest } from '@/contexts/ABTestContext';
import RecentUsersCounter from '@/components/RecentUsersCounter';

const Hero = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { experiments, trackConversion } = useABTest();
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);

  // A/B Test Logic
  const ctaText = experiments['hero_cta_text'] === 'variant_b' ? 'Prueba Ahora' : 'Comenzar Gratis';

  // Transacciones disponibles para rotación
  const allTransactions = [
    { name: "Supermercado", cat: "Alimentación", amount: "-$124.50", Icon: ShoppingBag, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    { name: "Freelance Project", cat: "Ingresos", amount: "+$850.00", Icon: ArrowUpRight, positive: true, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { name: "Netflix", cat: "Suscripciones", amount: "-$15.99", Icon: Film, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { name: "Spotify Premium", cat: "Suscripciones", amount: "-$9.99", Icon: Music, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { name: "Bono Extra", cat: "Ingresos", amount: "+$500.00", Icon: Zap, positive: true, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { name: "Cine", cat: "Entretenimiento", amount: "-$8.50", Icon: Ticket, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
    { name: "Café", cat: "Alimentación", amount: "-$4.50", Icon: Coffee, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { name: "Uber", cat: "Transporte", amount: "-$12.30", Icon: Car, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  ];

  // Rotar transacciones cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransactionIndex((prev) => (prev + 1) % allTransactions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Obtener 3 transacciones para mostrar (siempre incluye la actual)
  const getDisplayTransactions = () => {
    const transactions = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentTransactionIndex + i) % allTransactions.length;
      transactions.push(allTransactions[index]);
    }
    return transactions;
  };

  // Datos del gráfico con animación
  const chartData = [40, 65, 45, 80, 55, 70, 60];
  const [animatedChartData, setAnimatedChartData] = useState(chartData.map(() => 0));

  useEffect(() => {
    // Animar el gráfico al cargar
    const timer = setTimeout(() => {
      setAnimatedChartData(chartData);
    }, 500);

    // Animar cambios periódicos
    const interval = setInterval(() => {
      const newData = chartData.map(() => Math.random() * 80 + 20);
      setAnimatedChartData(newData);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

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
          </div>

          {/* Visual Content - Interactive Dashboard Mockup */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-full"
            >
              {/* Recent Users Counter - Positioned absolutely */}
              <div className="absolute -top-4 -right-4 z-20 hidden lg:block">
                <RecentUsersCounter />
              </div>

              {/* Dashboard Mockup Card - Horizontal Layout */}
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] dark:shadow-black/50 border border-white/50 dark:border-white/10 relative overflow-hidden w-full max-w-2xl mx-auto"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1C8FA0] to-[#E47B45]" />
                
                {/* Horizontal Layout: Balance + Chart on left, Transactions on right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Side: Balance & Chart */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[#6E6E73] dark:text-gray-400 font-medium">Balance Total</p>
                        <h3 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mt-1">$12,450.00</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#1C8FA0]" />
                      </div>
                    </div>

                    {/* Animated Chart Area */}
                    <div className="h-32 w-full bg-gradient-to-b from-[#1C8FA0]/5 to-transparent rounded-2xl relative border border-[#1C8FA0]/10 overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-between px-3 pb-2">
                        {animatedChartData.map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ 
                              duration: 0.8, 
                              delay: i * 0.1,
                              ease: "easeOut"
                            }}
                            className="w-2.5 bg-[#1C8FA0] rounded-t-full opacity-80 hover:opacity-100 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Recent Transactions */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider mb-2">
                      Transacciones Recientes
                    </p>
                    <AnimatePresence mode="wait">
                      {getDisplayTransactions().map((tx, i) => (
                        <motion.div
                          key={`${currentTransactionIndex}-${i}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-default group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ${tx.color}`}>
                              <tx.Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white truncate">{tx.name}</p>
                              <p className="text-xs text-[#6E6E73] dark:text-gray-400 truncate">{tx.cat}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${tx.positive ? 'text-[#1C8FA0]' : 'text-[#1a1a1a] dark:text-white'}`}>
                            {tx.amount}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
