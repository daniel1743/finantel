
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const NewsletterSignup = ({ variant = 'default' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      toast({
        title: "¡Bienvenido a la comunidad!",
        description: "Revisa tu correo para confirmar tu suscripción.",
      });
      setEmail('');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-2xl p-6 text-center"
      >
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-[#1a1a1a] dark:text-white">¡Suscripción Confirmada!</h3>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">Gracias por unirte a Finantel.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-xs font-bold text-green-600 dark:text-green-400 mt-4 hover:underline"
        >
          Suscribir otro correo
        </button>
      </motion.div>
    );
  }

  return (
    <div className={`relative ${variant === 'card' ? 'bg-white dark:bg-[#1a1a1a] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm' : ''}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1C8FA0]/10 flex items-center justify-center text-[#1C8FA0]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1a1a1a] dark:text-white">
              {variant === 'financial' ? 'Consejos Financieros Inteligentes' : 'Newsletter Exclusiva'}
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
              {variant === 'financial' 
                ? 'Alertas de ahorro personalizadas y oportunidades detectadas por IA cada semana.'
                : 'Tips de ahorro y actualizaciones semanales.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <input 
              type="email" 
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#1C8FA0]/30 focus:bg-white dark:focus:bg-black outline-none transition-all text-sm"
            />
          </div>
          <Button 
            type="submit" 
            disabled={status === 'loading'}
            className="h-12 w-12 rounded-xl bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:opacity-90 p-0 flex items-center justify-center"
          >
            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>
        
        <p className="text-[10px] text-[#6E6E73] dark:text-gray-500 px-1">
          Al suscribirte aceptas recibir correos de marketing. Puedes darte de baja en cualquier momento.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSignup;
