import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Zap, ShoppingBag, Clock, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useABTest } from '@/contexts/ABTestContext';

const Hero = () => {
  const navigate = useNavigate();
  const { trackConversion } = useABTest();
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);

  // Transacciones disponibles para rotación
  const allTransactions = [
    { name: "Netflix", cat: "Suscripciones", amount: "-$15.99", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", icon: Zap },
    { name: "Freelance Project", cat: "Ingresos", amount: "+$850.00", positive: true, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", icon: DollarSign },
    { name: "Compras", cat: "Compras", amount: "-$45.00", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", icon: ShoppingBag },
    { name: "Reloj Inteligente", cat: "Gadgets", amount: "-$120.00", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
    { name: "Laptop", cat: "Equipo de trabajo", amount: "-$1,050.00", color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400", icon: Laptop },
  ];

  // Rotar transacciones cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransactionIndex((prev) => (prev + 1) % allTransactions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    const timer = setTimeout(() => {
      setAnimatedChartData(chartData);
    }, 500);

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
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-white to-white -z-20 dark:from-primary-500/10 dark:via-[#0f0f11] dark:to-[#0f0f11]" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:gap-16">
          
          {/* Text Content - Bloque Superior Completo */}
          <div className="w-full space-y-8 relative z-10 text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-[72px] font-bold text-neutral-900 dark:text-white leading-[1.1] tracking-tight"
            >
              Tu dinero, claro y bajo tu control.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-neutral-500 dark:text-gray-400 max-w-3xl mx-auto lg:mx-0 leading-relaxed"
            >
              Gestiona tus gastos sin entregar tus claves bancarias. IA financiera privada, moderna y hecha para personas reales.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start"
            >
              <Button
                variant="default"
                size="cta-full"
                onClick={handleCTAClick}
                className="shadow-primary-lg hover:-translate-y-1"
              >
                Comenzar Gratis
                <Icon component={ArrowRight} size="md" color="default" className="ml-2" />
              </Button>
            </motion.div>
          </div>

          {/* Visual Content - Interactive Dashboard Mockup - Ancho Completo */}
          <div className="w-full relative flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-full"
            >
              {/* Dashboard Mockup Card - Ancho Completo */}
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-card-lg p-6 lg:p-8 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] dark:shadow-black/50 border border-white/50 dark:border-white/10 relative overflow-hidden w-full"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />
                
                {/* Horizontal Layout: Balance + Chart on left, Transactions on right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Left Side: Balance & Chart */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-neutral-500 dark:text-gray-400 font-medium">Balance Total</p>
                        <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">$12,450.00</h3>
                      </div>
                    </div>

                    {/* Animated Chart Area */}
                    <div className="h-32 w-full bg-gradient-to-b from-primary-500/5 to-transparent rounded-2xl relative border border-primary-500/10 overflow-hidden">
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
                            className="w-2.5 bg-primary-500 rounded-t-full opacity-80"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Recent Transactions */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-neutral-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Transacciones Recientes
                    </p>
                    <div className="space-y-2">
                      {getDisplayTransactions().map((tx, i) => (
                        <motion.div
                          key={`${currentTransactionIndex}-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                          style={{ minHeight: '60px' }}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.color}`}>
                              {tx.icon && React.createElement(tx.icon, { className: "w-4 h-4" })}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{tx.name}</p>
                              <p className="text-xs text-neutral-500 dark:text-gray-400">{tx.cat}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${tx.positive ? 'text-primary-500' : 'text-neutral-900 dark:text-white'}`}>
                            {tx.amount}
                          </span>
                        </motion.div>
                      ))}
                    </div>
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
