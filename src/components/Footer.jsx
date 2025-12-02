
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Twitter, Instagram, Linkedin, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Guardar en Supabase
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          source: 'landing_footer',
          confirmed: false
        })
        .select()
        .single();

      if (error) {
        // Error de email duplicado
        if (error.code === '23505') {
          toast({
            title: "Ya estás suscrito",
            description: "Este email ya está en nuestra lista de suscriptores.",
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      // Éxito
      setSubscribed(true);
      toast({
        title: "¡Suscrito exitosamente!",
        description: "Revisa tu email para confirmar tu suscripción.",
      });
      setEmail('');

    } catch (error) {
      console.error('Error al suscribir:', error);
      toast({
        title: "Error",
        description: "No pudimos suscribirte. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <img
                src="/finantel-logo.png"
                alt="Finantel Logo"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-[#6E6E73] max-w-sm leading-relaxed">
              Finanzas personales simples y privadas. Hecho para personas reales.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#6E6E73] hover:bg-[#1C8FA0] hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-[#1a1a1a] dark:text-white mb-6">Producto</h4>
            <ul className="space-y-4 text-sm text-[#6E6E73]">
              <li><Link to="/caracteristicas" className="hover:text-[#1C8FA0] transition-colors">Características</Link></li>
              <li><Link to="/seguridad" className="hover:text-[#1C8FA0] transition-colors">Seguridad</Link></li>
              <li><Link to="/precios" className="hover:text-[#1C8FA0] transition-colors">Precios</Link></li>
              <li><Link to="/roadmap" className="hover:text-[#1C8FA0] transition-colors">Roadmap</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-bold text-[#1a1a1a] dark:text-white mb-6">Compañía</h4>
            <ul className="space-y-4 text-sm text-[#6E6E73]">
              <li><Link to="/sobre-nosotros" className="hover:text-[#1C8FA0] transition-colors">Sobre nosotros</Link></li>
              <li><Link to="/carreras" className="hover:text-[#1C8FA0] transition-colors">Carreras</Link></li>
              <li><Link to="/blog" className="hover:text-[#1C8FA0] transition-colors">Blog</Link></li>
              <li><Link to="/contacto" className="hover:text-[#1C8FA0] transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-bold text-[#1a1a1a] dark:text-white mb-6">Mantente al día</h4>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
              Recibe consejos de finanzas personales, actualizaciones de IA y nuevas funciones antes que nadie.
            </p>
            <p className="text-xs text-[#6E6E73] dark:text-gray-500 mb-4 italic">
              Enviamos máximo 1 correo por semana.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading || subscribed}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f11] border-none focus:ring-2 focus:ring-[#1C8FA0]/20 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button
                type="submit"
                disabled={loading || subscribed}
                className="w-full bg-[#1a1a1a] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-[#1a1a1a] rounded-xl py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Suscribiendo...
                  </>
                ) : subscribed ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    ¡Suscrito!
                  </>
                ) : (
                  'Suscribirse'
                )}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#6E6E73] dark:text-gray-400">
          <div className="text-center md:text-left">
            <p className="font-semibold text-[#1a1a1a] dark:text-white mb-1">
              Finanzas personales simples y privadas.
            </p>
            <p className="mb-2">Hecho para personas reales.</p>
            <p>© 2025 Finantel. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-8">
            <Link to="/legal/privacy-policy" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Política de Privacidad</Link>
            <Link to="/legal/terms" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Términos de Servicio</Link>
            <Link to="/legal/cookies" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
