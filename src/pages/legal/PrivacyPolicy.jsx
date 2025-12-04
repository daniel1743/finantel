import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { Shield, Database, Lock, Eye, Trash2, Mail, AlertCircle, CheckCircle, XCircle, FileText, Globe, Cookie, Users, CreditCard, Bell, Ban, Zap, BarChart3 } from 'lucide-react';

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
              <Icon component={Shield} size="xl" color="primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white">
                Política de Privacidad
              </h1>
            </div>
            <div className="text-sm text-[#6E6E73] dark:text-gray-400 space-y-1">
              <p><strong>Última actualización:</strong> Diciembre 2025</p>
              <p><strong>Vigencia:</strong> A partir de la publicación en el sitio web</p>
            </div>
          </motion.div>

          {/* Tabla de Contenidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10 mb-12"
          >
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">Tabla de Contenidos</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[#6E6E73] dark:text-gray-400">
              {[
                { id: 'introduccion-y-alcance', title: '1. Introducción y Alcance' },
                { id: 'recopilacion-de-datos', title: '2. Recopilación de Datos' },
                { id: 'base-legal', title: '3. Base Legal para el Procesamiento' },
                { id: 'finalidades', title: '4. Finalidades del Procesamiento' },
                { id: 'comparticion', title: '5. Compartición de Datos' },
                { id: 'retencion', title: '6. Retención de Datos' },
                { id: 'proteccion-seguridad', title: '7. Protección y Seguridad' },
                { id: 'derechos-usuario', title: '8. Derechos del Usuario' },
                { id: 'usuarios-ue', title: '9. Información para Usuarios de la UE' },
                { id: 'usuarios-california', title: '10. Información para Usuarios de California' },
                { id: 'cambios-politica', title: '11. Cambios a esta Política' },
                { id: 'contacto', title: '12. Contacto y Soporte' },
                { id: 'anexos', title: '13. Anexos y Referencias' },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="hover:text-[#1C8FA0] transition-colors"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="space-y-12">
            {/* Sección 1: Introducción y Alcance */}
            <motion.section
              id="introduccion-y-alcance"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">1. Introducción y Alcance</h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">1.1 Identidad del Responsable</h3>
              <ul className="space-y-3 mb-6">
                {[
                  "Nombre de la Plataforma: Finantel",
                  "Tipo de Servicio: Plataforma de Análisis Financiero y Gestión de Suscripciones Asistida por IA",
                  "Jurisdicción Principal: Chile",
                  "Cumplimiento normativo: LOPDGDD (Chile), GDPR (UE si aplica), CCPA (California si aplica)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={CheckCircle} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">1.2 Definición de Datos Personales</h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Se consideran datos personales cualquier información que identifique, localice o permita contactar a una persona física, incluyendo:
              </p>
              <ul className="space-y-3">
                {[
                  "Datos de identificación: nombre, correo, teléfono, documento de identidad",
                  "Datos de ubicación: país, región, dirección IP",
                  "Datos financieros: número de cuenta, movimientos bancarios, ingresos, gastos",
                  "Datos de dispositivo: tipo de navegador, sistema operativo, ID de sesión",
                  "Datos de comportamiento: historial de uso, preferencias, interacciones",
                  "Datos de conexión: logs de acceso, timestamps, información de sesión",
                  "Datos biométricos: si en futuro se implementan (datos de voz, huella dactilar)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Database} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Sección 2: Recopilación de Datos */}
            <motion.section
              id="recopilacion-de-datos"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">2. Recopilación de Datos</h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">2.1 Datos que Recopilamos Directamente (Proporcionados por el Usuario)</h3>
              
              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">A) Registro e Identificación</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Nombre completo",
                  "Correo electrónico",
                  "Contraseña (hasheada, nunca almacenada en texto plano)",
                  "Número de teléfono (opcional)",
                  "Fotografía de perfil (opcional)",
                  "Datos de verificación de identidad (si aplica)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={CheckCircle} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">B) Datos Financieros</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Bancos conectados (mediante conexión segura con agregador financiero)",
                  "Extractos y movimientos de cuenta",
                  "Transacciones (solo las compartidas por el usuario)",
                  "Información de suscripciones detectadas",
                  "Historial de pagos y facturas",
                  "Presupuestos y metas financieras establecidas",
                  "Datos de ingresos y gastos (declarados o importados)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={CreditCard} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">C) Datos de Suscripción y Pago</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Información de facturación (nombre, dirección)",
                  "Datos de pago (procesados por Mercado Pago, no almacenamos números de tarjeta)",
                  "Historial de transacciones",
                  "Plan de suscripción actual",
                  "Fecha de renovación",
                  "Métodos de pago registrados"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={CreditCard} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">D) Datos de Preferencias y Configuración</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Idioma preferido",
                  "Zona horaria",
                  "Preferencias de notificación",
                  "Temas visuales (claro/oscuro)",
                  "Datos de autenticación (Google OAuth, etc.)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Zap} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">E) Contenido Generado por el Usuario</h4>
              <ul className="space-y-2 mb-6">
                {[
                  "Mensajes enviados a soporte",
                  "Retroalimentación y encuestas",
                  "Notas y anotaciones personales",
                  "Reportes descargados",
                  "Documentos adjuntos"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={FileText} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">2.2 Datos Recopilados Automáticamente</h3>
              
              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">A) Información de Dispositivo</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Tipo de navegador y versión",
                  "Sistema operativo",
                  "Idioma del dispositivo",
                  "Resolución de pantalla",
                  "Tipo de conexión (WiFi, móvil, etc.)",
                  "Identificadores únicos del navegador"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Eye} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">B) Datos de Sesión y Acceso</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Dirección IP (anonimizada después de procesamiento)",
                  "Timestamp de acceso",
                  "URL referente",
                  "Páginas visitadas y duración",
                  "Acciones realizadas",
                  "Errores ocurridos",
                  "Logs de inicio de sesión"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Database} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">C) Datos de Uso y Comportamiento</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Funciones utilizadas (transcripción de voz, análisis IA, descarga de reportes, etc.)",
                  "Frecuencia de uso",
                  "Tiempo de sesión",
                  "Interacciones con IA",
                  "Búsquedas realizadas",
                  "Categorías consultadas"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={BarChart3} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">2.3 Cookies, Pixels y Tecnologías de Rastreo</h3>
              
              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">Cookies Esenciales (OBLIGATORIAS)</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "session_id: Mantiene tu sesión activa",
                  "auth_token: Autentica tu acceso",
                  "csrf_token: Protege contra ataques CSRF",
                  "preferences: Tus preferencias (idioma, tema)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Lock} size="sm" color="default" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 text-sm mb-4">
                <strong>Duración:</strong> Hasta que cierres sesión (sesión) o 30 días (persistentes)<br/>
                <strong>Consentimiento:</strong> NO REQUIERE (son esenciales para funcionamiento)
              </p>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">Cookies Analíticas (REQUIERE CONSENTIMIENTO)</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Google Analytics: Rastreo de uso agregado",
                  "Mixpanel: Análisis de comportamiento",
                  "Sentry: Monitoreo de errores"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Cookie} size="sm" color="default" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 text-sm mb-4">
                <strong>Propósito:</strong> Entender cómo usas la plataforma, mejorar rendimiento<br/>
                <strong>Duración:</strong> 24 meses<br/>
                <strong>Consentimiento:</strong> REQUERIDO (banner en primera visita)
              </p>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">Cookies de Marketing (REQUIERE CONSENTIMIENTO)</h4>
              <ul className="space-y-2 mb-4">
                {[
                  "Facebook Pixel: Remarketing en redes",
                  "LinkedIn Insight: Seguimiento B2B",
                  "Cookies de terceros asociados"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Bell} size="sm" color="default" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 text-sm mb-4">
                <strong>Propósito:</strong> Mostrar anuncios relevantes, medir efectividad de campañas<br/>
                <strong>Duración:</strong> 12 meses<br/>
                <strong>Consentimiento:</strong> REQUERIDO (rechazo por defecto)
              </p>

              <h4 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-2 mt-4">Gestión de Cookies</h4>
              <ul className="space-y-2">
                {[
                  "Banner de consentimiento en primera visita",
                  "Centro de preferencias: /privacidad/cookies",
                  "Opción de rechazar todas (excepto esenciales)",
                  "Cambiar preferencias en cualquier momento",
                  "Aceptación implícita de cookies esenciales"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={Shield} size="sm" color="primary" className="mt-1 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
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
                    <Icon component={Lock} size="md" color="primary" className="flex-shrink-0" />
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
                <Icon component={Mail} size="md" color="primary" />
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
                    <Icon component={Trash2} size="md" color="default" className="flex-shrink-0" />
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


