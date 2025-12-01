import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Shield, Database, Lock, Eye, Trash2, Mail, AlertCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <SeoHead
        title="Política de Privacidad - Finantel"
        description="Política de privacidad de Finantel. Aprende cómo protegemos tus datos y qué información recopilamos."
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
              <Shield className="w-8 h-8 text-[#1C8FA0]" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white">
                Política de Privacidad
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
                Finantel se compromete a proteger tu privacidad.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-3">
                Esta Política describe cómo recopilamos, usamos, almacenamos y protegemos tu información.
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
                2. Qué Datos Recopilamos
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#1C8FA0]" />
                  Datos proporcionados por el usuario
                </h3>
                <ul className="space-y-2 ml-7">
                  {[
                    "Correo electrónico",
                    "Nombre (opcional)",
                    "Categorías y descripciones ingresadas manualmente",
                    "Gastos e ingresos solo registrados por ti"
                  ].map((item, index) => (
                    <li key={index} className="text-[#6E6E73] dark:text-gray-400">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#1C8FA0]" />
                  Datos técnicos
                </h3>
                <ul className="space-y-2 ml-7">
                  {[
                    "Dirección IP",
                    "Tipo de dispositivo",
                    "Navegador",
                    "País (geolocalización aproximada)",
                    "Eventos de uso (por ejemplo, \"creó una categoría\", \"añadió un gasto\")"
                  ].map((item, index) => (
                    <li key={index} className="text-[#6E6E73] dark:text-gray-400">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-3">
                  Datos que NO recopilamos
                </h3>
                <ul className="space-y-2">
                  {[
                    "Claves bancarias",
                    "Acceso a bancos",
                    "Tokens financieros",
                    "Movimientos reales del banco",
                    "Saldo real"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-[#6E6E73] dark:text-gray-400">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* Sección 3 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                3. Finalidad del Tratamiento
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Usamos la información para:
              </p>
              <ul className="space-y-2">
                {[
                  "Operar la plataforma",
                  "Mejorar el rendimiento",
                  "Generar análisis financieros personalizados",
                  "Prevenir abusos, fraude y ataques",
                  "Enviar notificaciones del servicio"
                ].map((item, index) => (
                  <li key={index} className="text-[#6E6E73] dark:text-gray-400 ml-4">• {item}</li>
                ))}
              </ul>
            </motion.section>

            {/* Sección 4 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                4. Base Legal
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                El tratamiento se realiza bajo:
              </p>
              <ul className="space-y-2">
                {[
                  "Consentimiento explícito del usuario",
                  "Interés legítimo de mejorar la plataforma",
                  "Cumplimiento de obligaciones legales aplicables"
                ].map((item, index) => (
                  <li key={index} className="text-[#6E6E73] dark:text-gray-400 ml-4">• {item}</li>
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
                5. Acceso de Terceros
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Finantel puede usar servicios externos para:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Hosting",
                  "Bases de datos",
                  "IA",
                  "Analítica",
                  "Envío de correos"
                ].map((item, index) => (
                  <li key={index} className="text-[#6E6E73] dark:text-gray-400 ml-4">• {item}</li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Estos proveedores cumplen estándares internacionales de privacidad (GDPR / SOC2 / ISO27001).
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-3">
                No venden tus datos.
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
                6. Conservación de Datos
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Los datos se conservan mientras exista la cuenta o hasta que solicites su eliminación.
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
                7. Seguridad
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Implementamos:
              </p>
              <ul className="space-y-2">
                {[
                  "Cifrado SSL",
                  "Aislamiento de sesiones",
                  "Tokens encriptados",
                  "Auditorías internas periódicas",
                  "Algoritmos anti-abuso"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#1C8FA0] flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Sección 8 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                8. Derechos del Usuario
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Puedes solicitar:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Acceso a tus datos",
                  "Corrección",
                  "Eliminación",
                  "Exportación",
                  "Revocación de consentimiento"
                ].map((item, index) => (
                  <li key={index} className="text-[#6E6E73] dark:text-gray-400 ml-4">• {item}</li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-3">
                Envía un correo a:
              </p>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1C8FA0]" />
                <a
                  href="mailto:privacy@finantel.net"
                  className="text-[#1C8FA0] hover:underline font-medium"
                >
                  privacy@finantel.net
                </a>
              </div>
            </motion.section>

            {/* Sección 9 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                9. Eliminación Total
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Puedes solicitar eliminación completa y permanente.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Este proceso borra:
              </p>
              <ul className="space-y-2">
                {[
                  "Cuenta",
                  "Gastos",
                  "Categorías",
                  "IA asociada",
                  "Backups relacionados"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Sección 10 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                10. Cambios en la Política
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Actualizaremos esta política cuando sea necesario.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-3">
                Continuar usando el servicio implica aceptación.
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

