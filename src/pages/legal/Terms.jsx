import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import SeoHead from '@/components/SeoHead';
import { FileText, CheckCircle, XCircle, Shield, AlertCircle, Mail, CreditCard, DollarSign, Lock, Users, Zap, TrendingUp, BarChart3, Bell, Eye, Ban } from 'lucide-react';

const Terms = () => {
  return (
    <>
      <SeoHead
        title="Términos de Servicio - Finantel"
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
              <Icon component={FileText} size="xl" color="primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white">
                Términos de Servicio
              </h1>
            </div>
            <div className="text-sm text-[#6E6E73] dark:text-gray-400 space-y-1">
              <p><strong>Versión:</strong> 1.0</p>
              <p><strong>Última Actualización:</strong> Diciembre 2025</p>
              <p><strong>Vigencia:</strong> A partir de la publicación</p>
              <p><strong>Sitio:</strong> <a href="https://finantel.net" className="text-[#1C8FA0] hover:underline">https://finantel.net</a></p>
            </div>
          </motion.div>

          {/* Tabla de Contenidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[24px] border border-gray-100 dark:border-white/10 mb-8"
          >
            <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-4">Tabla de Contenidos</h2>
            <ol className="list-decimal list-inside space-y-2 text-[#6E6E73] dark:text-gray-400">
              {[
                'Aceptación de Términos',
                'Descripción del Servicio',
                'Condiciones de Uso',
                'Cuentas de Usuario',
                'Suscripciones y Pagos',
                'Limitaciones de Responsabilidad',
                'Exclusión de Garantías',
                'Propiedad Intelectual',
                'Terminación de Servicio',
                'Cambios en los Términos',
                'Jurisdicción y Ley Aplicable',
                'Contacto'
              ].map((item, index) => (
                <li key={index}>
                  <a href={`#section-${index + 1}`} className="hover:text-[#1C8FA0] hover:underline transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ol>
          </motion.div>

          <div className="space-y-8">
            {/* Sección 1: Aceptación de Términos */}
            <motion.section
              id="section-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                1. Aceptación de Términos
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Al acceder y utilizar Finantel (en adelante, "el Servicio"), usted acepta estar vinculado por estos Términos de Servicio en su totalidad. Si no está de acuerdo con alguna parte de estos términos, le pedimos que no utilice el Servicio.
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                <strong>Finantel</strong> (en adelante, "la Empresa" o "nosotros") proporciona el Servicio bajo los términos y condiciones establecidos en este documento. El uso continuado del Servicio implica la aceptación total y sin reservas de estos términos.
              </p>
            </motion.section>

            {/* Sección 2: Descripción del Servicio */}
            <motion.section
              id="section-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                2. Descripción del Servicio
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                2.1 ¿Qué es Finantel?
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-6">
                Finantel es una plataforma digital de gestión financiera personal que ofrece análisis automático de transacciones, detección de anomalías de gasto, asesoramiento financiero personalizado mediante inteligencia artificial, y herramientas de seguimiento presupuestario.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                2.2 Funcionalidades Principales
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                El Servicio incluye, pero no se limita a:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: BarChart3, text: 'Dashboard de transacciones: Visualización y categorización automática de movimientos bancarios' },
                  { icon: TrendingUp, text: 'Análisis de gastos: Desgloses por categoría, período y patrones de consumo' },
                  { icon: Zap, text: 'Detección de fugas: Identificación automática de suscripciones olvidadas, servicios duplicados, gasto excesivo' },
                  { icon: Shield, text: 'Asesoramiento de IA: Recomendaciones personalizadas basadas en análisis de comportamiento financiero' },
                  { icon: Bell, text: 'Notificaciones en tiempo real: Alertas sobre anomalías y oportunidades de ahorro' },
                  { icon: Users, text: 'Panel de administración: Para usuarios con acceso de staff (gestión de tickets y notificaciones)' }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-[#1C8FA0] mt-0.5 flex-shrink-0" />
                      <span className="text-[#6E6E73] dark:text-gray-400">{item.text}</span>
                    </li>
                  );
                })}
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                2.3 Limitaciones del Servicio
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                <p className="text-[#1a1a1a] dark:text-white font-semibold mb-2">
                  <strong>Finantel NO es:</strong>
                </p>
                <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400">
                  <li>• Una institución financiera regulada</li>
                  <li>• Un banco o intermediario de pagos</li>
                  <li>• Un servicio de asesoramiento financiero profesional regulado</li>
                  <li>• Una herramienta de trading o inversión</li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-[#1a1a1a] dark:text-white font-semibold mb-2">
                  <strong>Limitaciones técnicas:</strong>
                </p>
                <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400">
                  <li>• La disponibilidad del Servicio está sujeta a interrupciones y mantenimiento programado</li>
                  <li>• El servicio depende de conexión a internet funcional</li>
                  <li>• La precisión del análisis depende de la calidad de los datos proporcionados</li>
                </ul>
              </div>
            </motion.section>

            {/* Sección 3: Condiciones de Uso */}
            <motion.section
              id="section-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                3. Condiciones de Uso
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                3.1 Uso Legítimo
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Usted acepta utilizar Finantel solo para fines legales y legítimos. Específicamente, se compromete a:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Utilizar el Servicio con sus propios datos financieros o con autorización explícita',
                  'Respetar todos los derechos de propiedad intelectual',
                  'No interferir con la operación normal del Servicio',
                  'No intentar acceder a áreas no autorizadas',
                  'Cumplir todas las leyes aplicables'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={CheckCircle} size="md" color="default" className="mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                3.2 Conducta Prohibida
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Está estrictamente prohibido:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Usar el Servicio con datos de terceros sin autorización',
                  'Recolectar información de otros usuarios sin consentimiento',
                  'Intentar acceso no autorizado (hacking, inyección SQL, etc.)',
                  'Crear múltiples cuentas para evadir limitaciones',
                  'Compartir credenciales de acceso',
                  'Usar el Servicio para actividades ilícitas, fraude o lavado de dinero',
                  'Publicar contenido ofensivo, racista, sexista o discriminatorio',
                  'Difundir malware o código malicioso',
                  'Realizar scraping o extracción masiva de datos',
                  'Spam, phishing o suplantación de identidad',
                  'Eludir medidas de seguridad'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={XCircle} size="md" color="default" className="mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                3.3 Suspensión por Incumplimiento
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Nos reservamos el derecho de suspender o terminar su cuenta inmediatamente si detectamos:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400">
                <li>• Violación de estos términos</li>
                <li>• Actividad fraudulenta</li>
                <li>• Comportamiento abusivo</li>
                <li>• Incumplimiento legal</li>
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mt-4">
                Se notificará al usuario de la razón de la suspensión, salvo en casos de delitos graves.
              </p>
            </motion.section>

            {/* Sección 4: Cuentas de Usuario */}
            <motion.section
              id="section-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                4. Cuentas de Usuario
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                4.1 Creación de Cuenta
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Para usar Finantel, debe:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>Crear una cuenta con información verificable</li>
                <li>Proporcionar una dirección de correo electrónico válida</li>
                <li>Establecer una contraseña segura</li>
                <li>Aceptar estos términos y la Política de Privacidad</li>
              </ol>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                4.2 Información de Cuenta
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Usted es responsable de:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Mantener la confidencialidad de su contraseña</li>
                <li>• Mantener actualizada su información de perfil</li>
                <li>• Notificarnos inmediatamente de acceso no autorizado</li>
                <li>• No compartir credenciales con terceros</li>
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Finantel no será responsable de cualquier pérdida o daño resultante del uso no autorizado de su cuenta debido a negligencia de su parte.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                4.3 Verificación de Identidad
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-6">
                Nos reservamos el derecho de solicitar verificación adicional de identidad en cualquier momento, especialmente para operaciones de pago o cambios de información crítica.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                4.4 Datos de Conexión Bancaria
              </h3>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400">
                <li>• Los datos de acceso bancario se encriptan y almacenan de forma segura</li>
                <li>• Nunca almacenamos números de tarjeta completos</li>
                <li>• Usted puede revocar el acceso en cualquier momento desde su panel de control</li>
                <li>• Somos responsables de proteger estos datos bajo nuestras políticas de seguridad</li>
              </ul>
            </motion.section>

            {/* Sección 5: Suscripciones y Pagos */}
            <motion.section
              id="section-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                5. Suscripciones y Pagos
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                5.1 Planes de Suscripción
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Finantel ofrece los siguientes planes:
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-200 dark:border-white/10">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5">
                      <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-[#1a1a1a] dark:text-white">Plan</th>
                      <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-[#1a1a1a] dark:text-white">Precio Mensual</th>
                      <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-[#1a1a1a] dark:text-white">Precio Anual</th>
                      <th className="border border-gray-200 dark:border-white/10 p-3 text-left text-sm font-semibold text-[#1a1a1a] dark:text-white">Características</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400"><strong>Gratuito</strong></td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">$0</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">N/A</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">Acceso básico, análisis limitado</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400"><strong>Premium</strong></td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">$5 USD</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">Disponible</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">Análisis completo, IA básica</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400"><strong>Professional</strong></td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">$12 USD</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">Disponible</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">IA avanzada, soporte prioritario</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400"><strong>Enterprise</strong></td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">$22 USD</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">Disponible</td>
                      <td className="border border-gray-200 dark:border-white/10 p-3 text-sm text-[#6E6E73] dark:text-gray-400">Todas las funciones, API personalizada</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                5.2 Facturación
              </h3>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• La facturación es mensual o anual según su selección</li>
                <li>• Se cobra automáticamente en la fecha de renovación</li>
                <li>• Usted recibirá una factura antes de cada cargo</li>
                <li>• Las facturas se envían por correo electrónico</li>
                <li>• Conservamos historial de pagos en su cuenta</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                5.3 Métodos de Pago
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Aceptamos:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Tarjetas de crédito (Visa, Mastercard, American Express)</li>
                <li>• Transferencia bancaria (para ciertas regiones)</li>
                <li>• Billeteras digitales a través de Mercado Pago</li>
              </ul>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                El procesamiento de pagos se realiza a través de Mercado Pago, que cumple con estándares PCI-DSS.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                5.4 Política de Cancelación
              </h3>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Puede cancelar su suscripción en cualquier momento desde su panel</li>
                <li>• La cancelación efectúa al final del período de facturación actual</li>
                <li>• No se otorgan reembolsos por períodos ya pagados, excepto según ley</li>
                <li>• Después de la cancelación, perderá acceso a funciones premium al finalizar el período</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                5.5 Cambios de Precio
              </h3>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Nos reservamos el derecho de cambiar precios con 30 días de notificación previo</li>
                <li>• Los cambios entran en vigor en la próxima renovación de suscripción</li>
                <li>• Si no acepta el nuevo precio, puede cancelar sin penalización</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                5.6 Reembolsos
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                <p className="text-[#1a1a1a] dark:text-white font-semibold mb-2">
                  <strong>Política general de no reembolsos:</strong>
                </p>
                <ul className="space-y-1 text-[#6E6E73] dark:text-gray-400">
                  <li>• No se otorgan reembolsos por cambio de parecer</li>
                  <li>• No se otorgan reembolsos por servicios ya utilizados</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg mb-4">
                <p className="text-[#1a1a1a] dark:text-white font-semibold mb-2">
                  <strong>Excepciones:</strong>
                </p>
                <ul className="space-y-1 text-[#6E6E73] dark:text-gray-400">
                  <li>• Error de facturación (doble cobro)</li>
                  <li>• Servicio no disponible por más de 24 horas consecutivas sin causa del usuario</li>
                  <li>• Según lo requiera la ley local aplicable</li>
                </ul>
              </div>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Las solicitudes de reembolso deben presentarse dentro de 30 días del cargo original.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                5.7 Impuestos
              </h3>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400">
                <li>• Los precios mostrados pueden no incluir impuestos locales</li>
                <li>• Usted es responsable de cualquier impuesto sobre la renta o retención de impuestos</li>
                <li>• Finantel cumple con las regulaciones fiscales locales y emite facturas correspondientes</li>
                <li>• Para usuarios dentro de la UE, se aplica IVA según la jurisdicción</li>
              </ul>
            </motion.section>

            {/* Sección 6: Limitaciones de Responsabilidad */}
            <motion.section
              id="section-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                6. Limitaciones de Responsabilidad
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                6.1 Limitación General
              </h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
                <p className="text-[#1a1a1a] dark:text-white font-semibold mb-2">
                  <strong>Finantel actúa como proveedor de herramientas, NO como asesor financiero regulado.</strong>
                </p>
              </div>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                En la máxima medida permitida por la ley, Finantel NO será responsable por:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Decisiones financieras que usted tome basadas en el Servicio',
                  'Pérdidas económicas, lucro cesante o daño emergente',
                  'Daños indirectos, incidentales o punitivos',
                  'Precisión, exactitud o plenitud del análisis proporcionado',
                  'Datos perdidos, corrompidos o robados (excepto por negligencia directa de Finantel)',
                  'Disponibilidad intermitente del Servicio',
                  'Errores o defectos del software',
                  'Cualquier contenido de terceros'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon component={XCircle} size="md" color="default" className="mt-0.5 flex-shrink-0" />
                    <span className="text-[#6E6E73] dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                6.2 Responsabilidad Máxima
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-6">
                La responsabilidad total de Finantel hacia usted no excederá el monto total pagado por usted en los últimos 12 meses. En caso de que usted nunca haya pagado (plan gratuito), la responsabilidad máxima es $0 USD.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                6.3 Exclusiones Legales
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Ciertos países no permiten la limitación de responsabilidad. Si corresponde en su jurisdicción, la responsabilidad máxima será la menor de: (a) el monto que pagó, o (b) el monto máximo permitido por ley.
              </p>
            </motion.section>

            {/* Sección 7: Exclusión de Garantías */}
            <motion.section
              id="section-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                7. Exclusión de Garantías
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                7.1 "Como está"
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                <p className="text-[#1a1a1a] dark:text-white font-semibold mb-2">
                  <strong>Finantel se proporciona "como está" sin garantías de ningún tipo</strong>, expresas o implícitas.
                </p>
              </div>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Específicamente, no garantizamos:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Que el Servicio cumplirá con sus requisitos específicos</li>
                <li>• Que el Servicio será ininterrumpido, seguro o libre de errores</li>
                <li>• Que los resultados serán exactos, completos o confiables</li>
                <li>• Que los defectos se corregirán</li>
                <li>• Que el Servicio permanecerá disponible indefinidamente</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                7.2 Renuncia de Garantías Implícitas
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Renunciamos expresamente a todas las garantías implícitas, incluyendo:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Comerciabilidad</li>
                <li>• Idoneidad para un propósito particular</li>
                <li>• No infracción de derechos de terceros</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                7.3 Reconocimiento
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Usted reconoce que:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400">
                <li>• Usa Finantel bajo su propio riesgo</li>
                <li>• Toda la responsabilidad por la precisión de decisiones financieras recae en usted</li>
                <li>• Debería verificar la información importante mediante fuentes independientes</li>
                <li>• No debería hacer cambios financieros significativos basado únicamente en el Servicio</li>
              </ul>
            </motion.section>

            {/* Sección 8: Propiedad Intelectual */}
            <motion.section
              id="section-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                8. Propiedad Intelectual
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                8.1 Propiedad de Finantel
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Todos los derechos de propiedad intelectual sobre Finantel son propiedad de la Empresa, incluyendo:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Código fuente y binarios</li>
                <li>• Interfaces de usuario</li>
                <li>• Algoritmos y modelos de IA</li>
                <li>• Bases de datos y recopilaciones de datos</li>
                <li>• Marcas registradas y logotipos</li>
                <li>• Documentación</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                8.2 Licencia de Uso
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Le otorgamos una licencia limitada, personal, no transferible y revocable para usar Finantel de acuerdo con estos términos. Esta licencia NO le permite:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Copiar, modificar o derivar</li>
                <li>• Redistribuir, sublicenciar o vender</li>
                <li>• Usar para fines comerciales (salvo si está explícitamente autorizado)</li>
                <li>• Revertir ingenierización o extracción de código</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                8.3 Contenido de Usuario
              </h3>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Los datos que proporciona (transacciones, perfil) son suyos</li>
                <li>• Nos otorga licencia para usar estos datos para mejorar Finantel</li>
                <li>• No compartiremos ni venderemos sus datos personales a terceros (ver Política de Privacidad)</li>
                <li>• Puede solicitar la eliminación de sus datos en cualquier momento</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                8.4 Retroalimentación
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Si nos proporciona sugerencias, comentarios o ideas sobre Finantel, nos otorga derecho a usarlas libremente sin compensación.
              </p>
            </motion.section>

            {/* Sección 9: Terminación de Servicio */}
            <motion.section
              id="section-9"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                9. Terminación de Servicio
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                9.1 Terminación por el Usuario
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Puede terminar su cuenta en cualquier momento:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>Accediendo a Configuración → Cuenta</li>
                <li>Haciendo clic en "Eliminar Cuenta"</li>
                <li>Confirmar la acción (irreversible)</li>
              </ol>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Después de la eliminación:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Perderá acceso a todos los datos y análisis</li>
                <li>• Los datos se conservarán 30 días antes de eliminación permanente</li>
                <li>• No se procesa reembolso excepto según ley</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                9.2 Terminación por Finantel
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Podemos terminar su cuenta o servicio si:
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                <p className="text-[#1a1a1a] dark:text-white font-semibold mb-2">
                  <strong>Causas legítimas:</strong>
                </p>
                <ul className="space-y-1 text-[#6E6E73] dark:text-gray-400">
                  <li>• Violación grave y continua de estos términos</li>
                  <li>• Actividad fraudulenta confirmada</li>
                  <li>• Incumplimiento legal</li>
                  <li>• Solicitud de autoridad legal</li>
                  <li>• Falta de actividad por 2 años (notificación previa)</li>
                </ul>
              </div>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                <strong>Procedimiento:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>Le notificaremos por correo electrónico de la causa</li>
                <li>Tendrá 30 días para corregir la situación (si es posible)</li>
                <li>Si no se resuelve, procederemos a la terminación</li>
                <li>Tendrá 30 días para descargar sus datos después de la terminación</li>
              </ol>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                9.3 Efectos de la Terminación
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Cuando termina el servicio:
              </p>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Pierde acceso inmediatamente</li>
                <li>• Las cuentas Premium se pierden</li>
                <li>• No se procesan reembolsos</li>
                <li>• Podemos retener datos según lo requiere la ley</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                9.4 Sobrevivencia
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Las secciones 6 (Limitaciones de Responsabilidad), 7 (Exclusión de Garantías), 8 (Propiedad Intelectual) y 11 (Jurisdicción) sobreviven a la terminación de estos términos.
              </p>
            </motion.section>

            {/* Sección 10: Cambios en los Términos */}
            <motion.section
              id="section-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                10. Cambios en los Términos
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                10.1 Derecho a Modificar
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-6">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigencia inmediatamente después de ser publicados.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                10.2 Notificación de Cambios
              </h3>
              <ul className="space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>• Notificaremos cambios significativos por correo electrónico</li>
                <li>• Los cambios menores se notificarán publicando una versión actualizada</li>
                <li>• Su continuación del uso del Servicio implica aceptación de los cambios</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                10.3 Oposición a Cambios
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Si se opone a un cambio significativo, puede cancelar su suscripción dentro de 30 días sin penalización.
              </p>
            </motion.section>

            {/* Sección 11: Jurisdicción y Ley Aplicable */}
            <motion.section
              id="section-11"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                11. Jurisdicción y Ley Aplicable
              </h2>
              
              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                11.1 Ley Aplicable
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-6">
                Estos términos se rigen por las leyes de <strong>Chile</strong>, sin referencia a sus disposiciones sobre conflicto de leyes.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                11.2 Jurisdicción
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-6">
                Los tribunales competentes son los de la <strong>Región Metropolitana de Santiago, Chile</strong>, para cualquier disputa.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3">
                11.3 Resolución de Disputas
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-4">
                Antes de litigación:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#6E6E73] dark:text-gray-400 mb-6">
                <li>Contacte a nuestro equipo legal a legal@finantel.com</li>
                <li>Proporcione descripción detallada de la disputa</li>
                <li>Nos comunicaremos dentro de 30 días</li>
                <li>Intentaremos resolver mutuamente</li>
              </ol>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Si no se resuelve, puede proceder con acciones legales.
              </p>

              <h3 className="text-xl font-semibold text-[#1a1a1a] dark:text-white mb-3 mt-6">
                11.4 Arbitraje (Opcional)
              </h3>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed">
                Si ambas partes están de acuerdo, aceptamos sometimiento a arbitraje bajo las reglas de la Cámara de Comercio. Esto es opcional y debe acordarse por escrito.
              </p>
            </motion.section>

            {/* Sección 12: Contacto */}
            <motion.section
              id="section-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[24px] border border-gray-100 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">
                12. Contacto
              </h2>
              <p className="text-[#6E6E73] dark:text-gray-400 leading-relaxed mb-6">
                Para preguntas sobre estos Términos de Servicio:
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Icon component={Mail} size="md" color="primary" />
                  <a
                    href="mailto:legal@finantel.com"
                    className="text-[#1C8FA0] hover:underline font-medium"
                  >
                    legal@finantel.com
                  </a>
                </div>
                <div className="text-[#6E6E73] dark:text-gray-400">
                  <p><strong>Dirección:</strong> Providencia, Región Metropolitana, Chile</p>
                  <p><strong>Teléfono:</strong> Disponible en el sitio web</p>
                </div>
              </div>
            </motion.section>

            {/* Aceptación Final */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-[#1C8FA0]/10 dark:bg-[#1C8FA0]/20 border-l-4 border-[#1C8FA0] p-6 rounded-r-lg"
            >
              <p className="text-[#1a1a1a] dark:text-white font-semibold">
                <strong>Última actualización:</strong> Diciembre 2025
              </p>
              <p className="text-[#6E6E73] dark:text-gray-400 mt-2">
                <strong>Aceptación:</strong> Al usar Finantel, usted acepta estos términos en su totalidad.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
