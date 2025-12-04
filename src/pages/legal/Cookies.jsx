import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Cookie, Shield, BarChart3, Settings, AlertCircle, Mail } from 'lucide-react';

const Cookies = () => {
  const cookieTypes = [
    {
      type: "Esenciales",
      purpose: "Permiten el funcionamiento del sitio",
      examples: "Sesión, autenticación",
      icon: Shield,
      color: "text-[#1C8FA0]"
    },
    {
      type: "Preferencias",
      purpose: "Recordar idioma y configuraciones",
      examples: "Tema claro/oscuro",
      icon: Settings,
      color: "text-[#1C8FA0]"
    },
    {
      type: "Analíticas",
      purpose: "Medición de uso y rendimiento",
      examples: "Supabase Analytics, GA4",
      icon: BarChart3,
      color: "text-[#1C8FA0]"
    },
    {
      type: "Seguridad",
      purpose: "Detectar actividad inusual",
      examples: "Anti-abuso, protección CSRF",
      icon: Shield,
      color: "text-[#1C8FA0]"
    },
    {
      type: "PWA",
      purpose: "Funcionamiento sin conexión",
      examples: "Cache del Service Worker",
      icon: Cookie,
      color: "text-[#1C8FA0]"
    }
  ];

  const notUsed = [
    "Tracking invasivo",
    "Publicidad personalizada",
    "Identificación avanzada",
    "Recolección de datos bancarios"
  ];

  return (
    <>
      <SeoHead
        title="Política de Cookies - Finantel"
        description="Política de cookies de Finantel. Aprende qué cookies usamos y para qué propósito."
      />
      <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Icon component={Cookie} size="xl" color="primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white">
                Política de Cookies
              </h1>
            </div>
            <div className="text-sm text-[#6E6E73] dark:text-gray-400">
              <p><strong>Última actualización:</strong> 2025-12-01</p>
            </div>
          </motion.div>

          <div className="space-y-12">
            {/* Sección 1 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                1. Introducción
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Finantel utiliza cookies para mejorar tu experiencia y ofrecer un servicio seguro.
              </p>
            </motion.section>

            {/* Sección 2 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                2. Qué son las Cookies
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Son archivos pequeños almacenados en tu dispositivo que permiten recordar configuraciones y preferencias.
              </p>
            </motion.section>

            {/* Sección 3 - Tabla de Cookies */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">
                3. Tipos de Cookies que Usamos
              </h2>
              
              {/* Tabla responsive */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-left py-3 px-4 font-semibold text-[#1a1a1a] dark:text-white">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#1a1a1a] dark:text-white">Propósito</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#1a1a1a] dark:text-white">Ejemplos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTypes.map((cookie, index) => {
                      const Icon = cookie.icon;
                      return (
                        <tr key={index} className="border-b border-gray-100 dark:border-white/5">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-5 h-5 ${cookie.color}`} />
                              <span className="font-medium text-[#1a1a1a] dark:text-white">{cookie.type}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[#6E6E73] dark:text-gray-400">{cookie.purpose}</td>
                          <td className="py-4 px-4 text-[#6E6E73] dark:text-gray-400">{cookie.examples}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.section>

            {/* Sección 4 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                4. Cookies que NO usamos
              </h2>
              <ul className="space-y-3">
                {notUsed.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Icon component={AlertCircle} size="md" color="default" className="flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Sección 5 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                5. Consentimiento
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Al usar Finantel, aceptas el uso de cookies según esta política.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-3">
                Puedes desactivarlas en tu navegador, pero algunas funciones podrían dejar de funcionar.
              </p>
            </motion.section>

            {/* Sección 6 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                6. Eliminación de Cookies
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Puedes borrar cookies en cualquier momento desde tu navegador.
              </p>
            </motion.section>

            {/* Sección 7 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                7. Contacto
              </h2>
              <div className="flex items-center gap-3">
                <Icon component={Mail} size="md" color="primary" />
                <a
                  href="mailto:privacy@finantel.net"
                  className="text-[#1C8FA0] hover:underline font-medium"
                >
                  privacy@finantel.net
                </a>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cookies;


