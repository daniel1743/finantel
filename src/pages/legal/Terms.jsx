import React from 'react';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { FileText, CheckCircle, XCircle, Shield, AlertCircle, Mail } from 'lucide-react';

const Terms = () => {
  return (
    <>
      <SeoHead
        title="Términos y Condiciones - Finantel"
        description="Términos y condiciones de uso de Finantel. Lee nuestros términos legales antes de usar la plataforma."
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
              <FileText className="w-8 h-8 text-[#1C8FA0]" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white">
                Términos y Condiciones
              </h1>
            </div>
            <div className="text-sm text-[#6E6E73] dark:text-gray-400 space-y-1">
              <p><strong>Versión:</strong> 1.0</p>
              <p><strong>Fecha:</strong> 2025-12-01</p>
              <p><strong>Sitio:</strong> <a href="https://finantel.net" className="text-[#1C8FA0] hover:underline">https://finantel.net</a></p>
              <p><strong>Propietario:</strong> Finantel (Daniel Falcón)</p>
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
                1. Aceptación de los Términos
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Al acceder, navegar o utilizar Finantel, aceptas quedar legalmente vinculado por estos Términos y Condiciones.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-3">
                Si no estás de acuerdo, debes dejar de usar la plataforma inmediatamente.
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
                2. Naturaleza del Servicio
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Finantel es una plataforma de gestión financiera personal que permite:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Registrar gastos e ingresos manualmente",
                  "Organizar el presupuesto",
                  "Generar análisis financieros mediante IA",
                  "Obtener tendencias y reportes",
                  "Administrar finanzas familiares"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#1C8FA0] mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 border-l-4 border-[#1C8FA0] p-4 rounded-r-lg">
                <p className="text-[#1a1a1a] dark:text-white font-semibold">
                  Finantel <strong>NO es un banco</strong>, <strong>NO ofrece servicios de inversión</strong>, y <strong>NO solicita claves bancarias ni accesos a cuentas</strong>.
                </p>
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
                3. Registro y Cuenta
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Para utilizar Finantel, debes:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Proporcionar un correo electrónico válido",
                  "Crear una contraseña segura",
                  "Mantener esta información actualizada"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#1C8FA0] mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Eres responsable de la actividad que ocurra en tu cuenta. Finantel no se hace responsable por accesos indebidos ocasionados por negligencia del usuario.
              </p>
            </motion.section>

            {/* Sección 4 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                4. Uso Aceptable
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                No puedes usar Finantel para:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Actividades ilícitas",
                  "Transferencia o manejo de dinero real (Finantel no opera fondos)",
                  "Automatizaciones maliciosas, bots o scraping",
                  "Intentos de manipular el sistema o vulnerarlo"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                El uso indebido puede resultar en suspensión o eliminación de la cuenta.
              </p>
            </motion.section>

            {/* Sección 5 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                5. Propiedad Intelectual
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Todo el contenido, diseño, algoritmos, textos, logotipos, gráficos y software de Finantel son propiedad exclusiva de Finantel.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Queda prohibido:
              </p>
              <ul className="space-y-2">
                {[
                  "Copiar",
                  "Distribuir",
                  "Modificar",
                  "Reproducir",
                  "Vender"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-4">
                sin consentimiento por escrito.
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
                6. IA y Contenido Generado
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Las recomendaciones proporcionadas por IA son:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Informativas",
                  "Educativas",
                  "No constituyen asesoría financiera profesional",
                  "No sustituyen decisiones personales ni asesoría certificada"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Finantel no se responsabiliza por decisiones tomadas usando estas recomendaciones.
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
                7. Limitación de Responsabilidad
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Finantel NO se hace responsable por:
              </p>
              <ul className="space-y-3">
                {[
                  "Pérdidas económicas derivadas de decisiones personales",
                  "Errores imputables al usuario",
                  "Caídas temporales del servicio",
                  "Interrupciones por mantenimiento",
                  "Fallos de terceros proveedores (hosting, servicios de IA, email, etc.)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
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
                8. Eliminación de Cuenta y Datos
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Puedes solicitar la eliminación total de tu cuenta y datos en cualquier momento.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-3">
                La eliminación es irreversible.
              </p>
            </motion.section>

            {/* Sección 9 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                9. Cambios en los Términos
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Finantel puede actualizar estos términos y publicará la nueva fecha de vigencia.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-3">
                El uso continuado significa aceptación de los cambios.
              </p>
            </motion.section>

            {/* Sección 10 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                10. Contacto Legal
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Para dudas legales:
              </p>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1C8FA0]" />
                <a
                  href="mailto:legal@finantel.net"
                  className="text-[#1C8FA0] hover:underline font-medium"
                >
                  legal@finantel.net
                </a>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;

