import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, Lock, FileCheck, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import CreateTicketModal from '@/components/modals/CreateTicketModal';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showTicketModal, setShowTicketModal] = useState(false);

  const handleWriteToTeam = (e) => {
    e.preventDefault();
    if (!user) {
      // Si no está autenticado, redirigir al login
      navigate('/auth?redirect=/legal/transparencia');
      return;
    }
    setShowTicketModal(true);
  };

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
            <h2 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mt-2">Lo que siempre podrás exigirnos</h2>
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
            <button
              onClick={handleWriteToTeam}
              className="px-6 py-3 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Escribir al equipo
            </button>
          </div>
        </div>
      </div>

      {/* Modal para crear ticket */}
      <CreateTicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        defaultSubject="Consulta sobre transparencia"
        defaultMessage=""
      />
    </div>
  );
};

export default Transparency;
