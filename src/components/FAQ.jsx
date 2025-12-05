import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "¿Por qué Finantel NO conecta con mi banco?",
      answer: "Porque tu privacidad es lo primero. No necesitamos acceso a tus cuentas bancarias para ayudarte a gestionar tu dinero. Tú registras tus transacciones manualmente o con voz, y nuestra IA hace el resto. Esto te da control total y elimina riesgos de seguridad."
    },
    {
      question: "¿Cómo funciona la IA predictiva sin acceso a mi banco?",
      answer: "Nuestra IA analiza los patrones en las transacciones que TÚ registras. Con el tiempo, aprende tus hábitos de gasto e ingreso para predecir tu flujo de caja a 30 días, detectar suscripciones olvidadas y sugerir oportunidades de ahorro. Todo esto sin necesidad de conectar tu banco."
    },
    {
      question: "¿Es realmente gratis el plan Starter?",
      answer: "Sí, completamente gratis. El plan Starter te permite registrar gastos ilimitados, usar 5 categorías y exportar tus datos en formato básico. Sin tarjeta de crédito requerida. Puedes quedarte en el plan gratis para siempre."
    },
    {
      question: "¿Qué pasa si cancelo mi suscripción Pro o Family?",
      answer: "Puedes cancelar en cualquier momento. Volverás automáticamente al plan Starter gratuito, conservando todos tus datos históricos. Solo perderás acceso a las funciones premium como IA predictiva, categorías ilimitadas y sincronización multi-dispositivo."
    },
    {
      question: "¿Mis datos están seguros?",
      answer: "Absolutamente. Usamos cifrado de grado bancario (AES-256) tanto en tránsito como en reposo. Tus datos se almacenan en Supabase (infraestructura de PostgreSQL con respaldo automático). No vendemos ni compartimos tu información con terceros. Nunca."
    },
    {
      question: "¿Funciona en varios dispositivos?",
      answer: "Sí. Con el plan Pro o Family, tus datos se sincronizan automáticamente en todos tus dispositivos (móvil, tablet, desktop). El plan Starter funciona en cualquier dispositivo, pero los datos se guardan localmente en cada uno."
    },
    {
      question: "¿Puedo usar Finantel con varias monedas?",
      answer: "Sí. Finantel soporta múltiples monedas: CLP (Chile), MXN (México), ARS (Argentina), COP (Colombia), EUR (España), USD (EE.UU.) y más de 20 monedas adicionales. Ideal si viajas o manejas ingresos en diferentes divisas."
    },
    {
      question: "¿Cómo registro transacciones rápidamente?",
      answer: "Tienes 3 opciones: 1) Formulario manual (30 segundos), 2) Entrada por voz con IA (5 segundos, solo en planes Pro/Family), 3) Importación masiva desde CSV/Excel. Elige la que mejor se adapte a tu estilo."
    },
    {
      question: "¿Qué es el 'Asesor financiero IA' del plan Family?",
      answer: "Es un chatbot inteligente que analiza tus datos y responde preguntas como: '¿Cuánto gasté en restaurantes este mes?', '¿Puedo permitirme unas vacaciones de $2000?', 'Sugiere un presupuesto para ahorrar $500 al mes'. Disponible solo en el plan Family."
    },
    {
      question: "¿Necesito conocimientos técnicos o financieros?",
      answer: "Para nada. Finantel está diseñado para personas reales, no para expertos. La interfaz es simple, los reportes son visuales y claros, y evitamos jerga técnica. Si sabes enviar un WhatsApp, sabes usar Finantel."
    },
    {
      question: "¿Ofrecen soporte al cliente?",
      answer: "Sí. Todos los planes (incluso el gratuito) tienen acceso a soporte por email. Los planes Pro y Family reciben soporte prioritario con respuesta en menos de 24 horas. También tenemos documentación detallada y tutoriales en video."
    },
    {
      question: "¿Puedo exportar mis datos si decido irme?",
      answer: "Por supuesto. Tus datos son TUYOS. Puedes exportarlos en cualquier momento en formato CSV o Excel. No te retenemos ni hacemos difícil la salida. Creemos en la libertad del usuario."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-[#0f0f11]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-500/10 mb-6">
            <Icon component={HelpCircle} size="lg" color="primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-neutral-500 dark:text-gray-400">
            Todo lo que necesitas saber sobre Finantel
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/10 rounded-card overflow-hidden hover:border-primary-500/30 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="text-base md:text-lg font-semibold text-neutral-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <Icon component={ChevronDown} size="md" color="primary" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-neutral-500 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA después del FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center p-8 bg-gradient-to-br from-primary-500/5 to-transparent rounded-3xl border border-primary-500/20"
        >
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
            ¿Aún tienes dudas?
          </h3>
          <p className="text-neutral-500 dark:text-gray-400 mb-6">
            Estamos aquí para ayudarte. Escríbenos a{' '}
            <a href="mailto:soporte@finantel.net" className="text-primary-500 hover:underline font-medium">
              soporte@finantel.net
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
