import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Eye, Lock, FileCheck, Users, Sparkles, CheckCircle2 } from 'lucide-react';

const commitments = [
  {
    icon: ShieldCheck,
    title: 'Nunca tocamos tu dinero',
    description: 'Finantel solo registra y visualiza tus movimientos. Tus fondos permanecen siempre en tus cuentas bancarias o billeteras.'
  },
  {
    icon: Eye,
    title: 'Cero comisiones ocultas',
    description: 'No cobramos cargos sorpresa. Los planes publicados son el costo final y puedes cancelarlos cuando quieras.'
  },
  {
    icon: Lock,
    title: 'Privacidad blindada',
    description: 'Tus datos se almacenan en Supabase con cifrado de extremo a extremo. No vendemos ni compartimos tu información.'
  },
  {
    icon: FileCheck,
    title: 'Auditoría en un clic',
    description: 'Puedes revisar el historial de cambios, exportar tus datos y saber quién modificó cada registro.'
  },
];

const faqs = [
  {
    question: '¿Finantel puede bloquear mis fondos?',
    answer: 'No. Finantel no es un banco ni maneja dinero. Solo registra información que tú conectas o importas.'
  },
  {
    question: '¿Qué ocurre con mis datos si cancelo?',
    answer: 'Puedes descargar toda tu información antes de salir. También puedes solicitar su eliminación definitiva.'
  },
  {
    question: '¿Venden mis datos a terceros?',
    answer: 'No. No hacemos publicidad invasiva ni vendemos tu información a bancos, aseguradoras ni comercios.'
  },
];

const Transparency = () => {
  return (
    <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] py-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#1C8FA0]/10 via-transparent to-[#E47B45]/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C8FA0]/10 text-[#1C8FA0] text-xs font-semibold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              Política de Transparencia
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight'] leading-tight">
              Tu información es tuya. <span className="text-[#1C8FA0]">Nosotros solo la protegemos.</span>
            </h1>
            <p className="mt-4 text-lg text-[#6E6E73] dark:text-gray-400 max-w-3xl">
              Finantel no toca tu dinero, no vende tus datos y no esconde comisiones. Operamos con transparencia radical porque creemos que la confianza se demuestra con hechos.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Comisiones ocultas', value: '0' },
                { label: 'Retenciones', value: 'Nunca' },
                { label: 'Venta de datos', value: 'Prohibida' },
              ].map((item) => (
                <div key={item.label} className="bg-white/70 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-center">
                  <p className="text-sm text-[#6E6E73] dark:text-gray-400 uppercase tracking-wide">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#1a1a1a] dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commitments */}
        <section className="space-y-6">
          <div>
            <p className="text-sm font-bold text-[#1C8FA0] uppercase tracking-wide">Nuestro compromiso</p>
            <h2 classint="text-3xl font-bold text-[#1a1a1a] dark:text-white mt-2">Lo que siempre podrás exigirnos</h2>
            <p className="text-[#6E6E73] dark:text-gray-400 mt-2 max-w-2xl">
              Estos principios están integrados en el producto y en nuestros procesos internos. Si alguno se rompe, te lo diremos de inmediato.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {commitments.map((item) => (
              <div key={item.title} className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#1C8FA0]/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#1C8FA0]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">{item.title}</h3>
                  <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How we keep it transparent */}
        <section className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-[28px] p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#E47B45]" />
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Cómo lo garantizamos</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">Dentro del producto</h3>
              <ul className="space-y-3 text-sm text-[#6E6E73] dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1C8FA0] mt-0.5" />
                  Banner permanente en Dashboard explicando que Finantel no retiene fondos.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1C8FA0] mt-0.5" />
                  Onboarding con recordatorios claros de privacidad y uso de datos.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1C8FA0] mt-0.5" />
                  Botón directo para exportar tus datos y revisar auditorías.
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">A nivel operativo</h3>
              <ul className="space-y-3 text-sm text-[#6E6E73] dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1C8FA0] mt-0.5" />
                  Contratos y términos públicos sin letras chicas.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1C8FA0] mt-0.5" />
                  Infraestructura en Supabase + Vercel con cifrado y monitoreo continuo.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1C8FA0] mt-0.5" />
                  Equipo de soporte humano con SLA público y registro de solicitudes.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#1C8FA0]" />
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Preguntas clave</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                <summary className="cursor-pointer list-none flex items-center justify-between text-lg font-semibold text-[#1a1a1a] dark:text-white">
                  {faq.question}
                  <span className="text-[#1C8FA0] group-open:text-[#E47B45]">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#6E6E73] dark:text-gray-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#1C8FA0] rounded-[28px] p-8 text-white flex flex-col md:flex-row items-start md:items-center gap-6 shadow-2xl">
          <div className="flex-1 space-y-2">
            <p className="text-sm uppercase tracking-widest text-white/80">Seguimiento claro</p>
            <h3 className="text-3xl font-bold font-['Inter_Tight']">¿Tienes dudas? Hablemos en serio.</h3>
            <p className="text-white/80">
              Nuestro equipo de soporte está disponible para resolver cualquier inquietud sobre datos, planes o seguridad.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-white text-[#1C8FA0] font-semibold hover:bg-gray-100 transition-colors"
            >
              Volver al Dashboard
            </Link>
            <a
              href="mailto:soporte@finantel.app?subject=Consulta%20sobre%20transparencia"
              className="px-6 py-3 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Escribir al equipo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transparency;
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Eye, Lock, FileSearch, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const commitments = [
  {
    title: 'No tocamos tu dinero',
    description: 'Finantel solo registra y analiza tus finanzas. Los fondos siempre permanecen en tus cuentas y bancos.',
    icon: ShieldCheck,
    bullet: 'Operamos 100% en modo lectura.'
  },
  {
    title: 'Cero comisiones ocultas',
    description: 'No cobramos cargos sorpresa, ni hacemos venta cruzada de créditos o seguros.',
    icon: Eye,
    bullet: 'Todo el modelo de negocio es visible dentro de la app.'
  },
  {
    title: 'Privacidad blindada',
    description: 'Tus datos nunca se venden a terceros. Solo se usan para darte métricas y alertas.',
    icon: Lock,
    bullet: 'Puedes solicitar la eliminación completa cuando quieras.'
  },
  {
    title: 'Auditoría permanente',
    description: 'Cada cambio queda registrado y puedes consultarlo desde tu panel.',
    icon: FileSearch,
    bullet: 'Política “explica este dato” en construcción.'
  }
];

const Transparency = () => {
  return (
    <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-[#1C8FA0]">
            <ShieldCheck className="w-4 h-4" />
            Compromiso de Transparencia
          </div>
          <h1 className="text-4xl font-bold text-[#0f172a] dark:text-white font-['Inter_Tight']">
            Finantel no toca tu dinero. Punto.
          </h1>
          <p className="text-lg text-[#475569] dark:text-gray-400 max-w-3xl mx-auto">
            Nuestra única función es ayudarte a tomar decisiones. No retenemos fondos, no vendemos tus datos
            y no aplicamos cargos sorpresa. Este documento deja por escrito cómo operamos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {commitments.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-[24px] p-6 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1C8FA0]/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-[#1C8FA0]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a] dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#475569] dark:text-gray-400 mb-3">{item.description}</p>
              <div className="flex items-center gap-2 text-sm text-[#1C8FA0] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                {item.bullet}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-[28px] p-8 space-y-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white">Cómo protegemos tus datos</h2>
          <ul className="space-y-4 text-sm text-[#475569] dark:text-gray-400">
            <li className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-[#1C8FA0] mt-2" />
              Encriptamos todo lo que se envía y almacenamos solo lo necesario para generar métricas.
            </li>
            <li className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-[#1C8FA0] mt-2" />
              Puedes descargar o borrar tus datos desde el panel de perfil cuando quieras.
            </li>
            <li className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-[#1C8FA0] mt-2" />
              Nadie del equipo tiene acceso directo a tu información sin tu autorización explícita.
            </li>
          </ul>
        </div>

        <div className="bg-[#0f172a] text-white rounded-[28px] p-8 space-y-6">
          <h2 className="text-2xl font-bold font-['Inter_Tight']">Auditoría y trazabilidad</h2>
          <p className="text-sm text-white/80">
            Cada vez que importas datos o cambias un presupuesto, creamos un registro en Supabase (`audit_logs`).
            Muy pronto podrás abrir cualquier número en el dashboard y ver “por qué existe” con un clic.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/70">
            <span className="px-3 py-1 rounded-full bg-white/10">Registros inmutables</span>
            <span className="px-3 py-1 rounded-full bg-white/10">Explicabilidad de datos</span>
            <span className="px-3 py-1 rounded-full bg-white/10">Alertas auditables</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="text-sm text-[#475569] dark:text-gray-400">
            ¿Dudas? Escríbenos a <a href="mailto:transparencia@finantel.app" className="text-[#1C8FA0] font-semibold">transparencia@finantel.app</a>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-[#1C8FA0] font-semibold">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <Button asChild className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white">
              <Link to="/dashboard">Ir al dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transparency;

