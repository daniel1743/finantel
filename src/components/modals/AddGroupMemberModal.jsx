// =====================================================
// MODAL: Agregar Miembro al Grupo
// =====================================================
// Modal para invitar/agregar miembros al grupo familiar
// =====================================================

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const AddGroupMemberModal = ({ 
  isOpen, 
  onClose, 
  groupId,
  onAddMember,
  existingMembers = [] // Para evitar agregar miembros duplicados
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member'); // 'admin' o 'member'

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El email es requerido',
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El email no es válido',
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar usuario por email
      // Nota: En Supabase, necesitarías una función Edge o buscar en auth.users
      // Por ahora, asumimos que el email corresponde a un usuario existente
      
      // TODO: Implementar búsqueda de usuario por email
      // Por ahora, el hook useFamilyGroups manejará esto

      await onAddMember(email.trim(), role);

      // Resetear formulario
      setEmail('');
      setRole('member');
      onClose();
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-white/10 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                <Icon component={UserPlus} size="md" color="primary" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                Agregar Miembro
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Icon component={X} size="md" color="default" className="dark:" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                <Icon component={Mail} size="sm" color="default" className="inline mr-1" />
                Email del usuario *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
              />
              <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-2">
                El usuario debe tener una cuenta en Finantel con este email
              </p>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                <Icon component={User} size="sm" color="default" className="inline mr-1" />
                Rol *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    role === 'member'
                      ? "border-[#1C8FA0] bg-[#1C8FA0]/10"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1C8FA0]/50"
                  )}
                >
                  <div className="font-semibold text-[#1a1a1a] dark:text-white mb-1">Miembro</div>
                  <div className="text-xs text-[#6E6E73] dark:text-gray-400">
                    Puede ver y agregar gastos
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    role === 'admin'
                      ? "border-[#1C8FA0] bg-[#1C8FA0]/10"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1C8FA0]/50"
                  )}
                >
                  <div className="font-semibold text-[#1a1a1a] dark:text-white mb-1">Administrador</div>
                  <div className="text-xs text-[#6E6E73] dark:text-gray-400">
                    Puede gestionar el grupo
                  </div>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> Se enviará una notificación al usuario cuando sea agregado al grupo.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1C8FA0] hover:bg-[#167a8a] text-white"
                disabled={loading}
              >
                {loading ? 'Agregando...' : 'Agregar Miembro'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddGroupMemberModal;


