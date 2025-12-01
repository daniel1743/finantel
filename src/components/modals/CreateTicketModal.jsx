import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'dato', label: 'Datos & privacidad' },
  { value: 'bug', label: 'Error en la app' },
  { value: 'sugerencia', label: 'Sugerencia' },
];

const CreateTicketModal = ({ isOpen, onClose, defaultSubject = '', defaultMessage = '' }) => {
  const { user } = useAuth();
  const { createTicket, creating } = useSupportTickets(user?.id);
  const { toast } = useToast();
  const [form, setForm] = useState({
    subject: defaultSubject || '',
    category: 'general',
    priority: 'normal',
    message: defaultMessage || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para enviar un mensaje al equipo.',
      });
      return;
    }

    if (!form.subject.trim() || !form.message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor completa el asunto y el mensaje.',
      });
      return;
    }

    try {
      await createTicket({
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        message: form.message.trim(),
        ai_context: { source: 'transparency_page' },
      });

      toast({
        title: 'Mensaje enviado',
        description: 'Nuestro equipo te contactará pronto. Revisa tu correo para confirmación.',
      });

      // Reset form
      setForm({
        subject: '',
        category: 'general',
        priority: 'normal',
        message: '',
      });

      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-gray-100 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[101]"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-white/10 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1C8FA0]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#1C8FA0]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">Escribir al equipo</h2>
                <p className="text-sm text-[#6E6E73] dark:text-gray-400">Envíanos tu consulta y te responderemos pronto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                Asunto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Ej. Consulta sobre transparencia y privacidad"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Prioridad
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                rows={6}
                placeholder="Describe tu consulta, duda o solicitud. Nuestro equipo te responderá lo antes posible."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 resize-none text-[#1a1a1a] dark:text-white"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="flex-1 bg-[#1C8FA0] hover:bg-[#167a8a] text-white gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTicketModal;

