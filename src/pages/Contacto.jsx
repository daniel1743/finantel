import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Mail, MessageSquare, Handshake, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Contacto = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Mensaje enviado",
      description: "Te responderemos pronto.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: MessageSquare,
      title: "Soporte",
      email: "support@finantel.net",
      description: "Para ayuda técnica o preguntas sobre la plataforma."
    },
    {
      icon: Handshake,
      title: "Alianzas",
      email: "partners@finantel.net",
      description: "Para propuestas comerciales y colaboraciones."
    },
    {
      icon: Newspaper,
      title: "Prensa",
      email: "press@finantel.net",
      description: "Para medios de comunicación y entrevistas."
    }
  ];

  return (
    <>
      <SeoHead
        title="Contacto - Finantel"
        description="¿Necesitas ayuda? Escríbenos. También puedes enviar propuestas, soporte o alianzas comerciales."
      />
      <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] dark:text-white mb-6">
              Contáctanos
            </h1>
            <p className="text-xl text-[#6E6E73] dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Estamos aquí para ayudarte.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Métodos de contacto */}
            <div className="space-y-6">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[24px] border border-gray-100 dark:border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#1C8FA0]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-2">
                          {method.title}
                        </h3>
                        <a
                          href={`mailto:${method.email}`}
                          className="text-[#1C8FA0] hover:underline block mb-2"
                        >
                          {method.email}
                        </a>
                        <p className="text-sm text-[#6E6E73] dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">
                Mensaje directo
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f11] border-none focus:ring-2 focus:ring-[#1C8FA0]/20 text-sm outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f11] border-none focus:ring-2 focus:ring-[#1C8FA0]/20 text-sm outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Asunto"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f11] border-none focus:ring-2 focus:ring-[#1C8FA0]/20 text-sm outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Tu mensaje"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f11] border-none focus:ring-2 focus:ring-[#1C8FA0]/20 text-sm outline-none transition-all resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-xl py-6"
                >
                  Enviar Mensaje
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contacto;

