// =====================================================
// MODAL: Crear/Editar Gasto Compartido
// =====================================================
// Modal completo con todos los campos y tipos de división
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, FileText, Users, Percent, Equal, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useFinance } from '@/hooks/useFinance';
import { cn } from '@/lib/utils';

const CreateSharedExpenseModal = ({ 
  isOpen, 
  onClose, 
  groupId, 
  members = [], 
  onCreateExpense,
  expense = null // Si existe, es modo edición
}) => {
  const { toast } = useToast();
  const { categories } = useFinance();
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [paidByUserId, setPaidByUserId] = useState('');
  const [splitType, setSplitType] = useState('equal'); // 'equal', 'percentage', 'amounts'
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Estados para división por porcentaje
  const [percentages, setPercentages] = useState({}); // { userId: percentage }

  // Estados para división por montos específicos
  const [amounts, setAmounts] = useState({}); // { userId: amount }

  useEffect(() => {
    if (expense) {
      // Modo edición - cargar datos del gasto
      setTitle(expense.title || '');
      setAmount(expense.amount?.toString() || '');
      setExpenseDate(expense.expense_date || new Date().toISOString().split('T')[0]);
      setCategoryId(expense.category_id || '');
      setDescription(expense.description || '');
      setPaidByUserId(expense.paid_by_user_id || '');
      // TODO: Cargar splits y participantes
    } else {
      // Modo creación - valores por defecto
      if (members.length > 0) {
        setPaidByUserId(members[0].user_id);
        setSelectedParticipants(members.map(m => m.user_id));
      }
    }
  }, [expense, members]);

  // Calcular total de porcentajes
  const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + parseFloat(p || 0), 0);
  const totalAmounts = Object.values(amounts).reduce((sum, a) => sum + parseFloat(a || 0), 0);

  // Manejar selección de participantes
  const toggleParticipant = (userId) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
      // Limpiar datos de división para este usuario
      setPercentages(prev => {
        const newPerc = { ...prev };
        delete newPerc[userId];
        return newPerc;
      });
      setAmounts(prev => {
        const newAmt = { ...prev };
        delete newAmt[userId];
        return newAmt;
      });
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
      // Inicializar valores según el tipo de división
      if (splitType === 'equal') {
        // Se calculará automáticamente
      } else if (splitType === 'percentage') {
        const equalPerc = (100 / (selectedParticipants.length + 1)).toFixed(2);
        setPercentages(prev => ({ ...prev, [userId]: equalPerc }));
      } else if (splitType === 'amounts') {
        const equalAmount = parseFloat(amount) / (selectedParticipants.length + 1);
        setAmounts(prev => ({ ...prev, [userId]: equalAmount.toFixed(2) }));
      }
    }
  };

  // Manejar cambio de tipo de división
  const handleSplitTypeChange = (newType) => {
    setSplitType(newType);
    
    // Reinicializar valores según el nuevo tipo
    if (newType === 'equal') {
      setPercentages({});
      setAmounts({});
    } else if (newType === 'percentage') {
      const equalPerc = selectedParticipants.length > 0 
        ? (100 / selectedParticipants.length).toFixed(2)
        : 0;
      const newPerc = {};
      selectedParticipants.forEach(userId => {
        newPerc[userId] = equalPerc;
      });
      setPercentages(newPerc);
      setAmounts({});
    } else if (newType === 'amounts') {
      const equalAmount = selectedParticipants.length > 0 && amount
        ? (parseFloat(amount) / selectedParticipants.length).toFixed(2)
        : 0;
      const newAmt = {};
      selectedParticipants.forEach(userId => {
        newAmt[userId] = equalAmount;
      });
      setAmounts(newAmt);
      setPercentages({});
    }
  };

  // Validar y enviar
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El nombre del gasto es requerido',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El monto debe ser mayor a 0',
      });
      return;
    }

    if (selectedParticipants.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debe seleccionar al menos un participante',
      });
      return;
    }

    if (splitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Los porcentajes deben sumar 100% (actual: ${totalPercentage.toFixed(2)}%)`,
      });
      return;
    }

    if (splitType === 'amounts' && Math.abs(totalAmounts - parseFloat(amount)) > 0.01) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Los montos deben sumar el total del gasto (${amount})`,
      });
      return;
    }

    setLoading(true);

    try {
      // Preparar participantes con datos de división
      const participants = selectedParticipants.map(userId => ({
        user_id: userId,
        percentage: splitType === 'percentage' ? parseFloat(percentages[userId] || 0) : null,
        amount: splitType === 'amounts' ? parseFloat(amounts[userId] || 0) : null,
      }));

      await onCreateExpense({
        title: title.trim(),
        amount: parseFloat(amount),
        expense_date: expenseDate,
        category_id: categoryId || null,
        description: description.trim() || null,
        paid_by_user_id: paidByUserId,
        split_type: splitType,
        participants,
      });

      // Resetear formulario
      setTitle('');
      setAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setCategoryId('');
      setDescription('');
      setSelectedParticipants(members.length > 0 ? [members[0].user_id] : []);
      setSplitType('equal');
      setPercentages({});
      setAmounts({});

      onClose();
    } catch (error) {
      console.error('Error creating expense:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedMembers = members.filter(m => selectedParticipants.includes(m.user_id));
  const expenseAmount = parseFloat(amount) || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
              {expense ? 'Editar Gasto' : 'Nuevo Gasto Compartido'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del gasto */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                Nombre del gasto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Cena fin de semana"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
              />
            </div>

            {/* Monto y Fecha */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Monto total *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    // Recalcular montos equitativos si cambia el total
                    if (splitType === 'amounts' && selectedParticipants.length > 0) {
                      const newAmount = parseFloat(e.target.value) || 0;
                      const equalAmount = newAmount / selectedParticipants.length;
                      const newAmt = {};
                      selectedParticipants.forEach(userId => {
                        newAmt[userId] = equalAmount.toFixed(2);
                      });
                      setAmounts(newAmt);
                    }
                  }}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha *
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                />
              </div>
            </div>

            {/* Categoría y Quién paga */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                >
                  <option value="">Sin categoría</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Quién pagó *
                </label>
                <select
                  value={paidByUserId}
                  onChange={(e) => setPaidByUserId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                >
                  {members.map(member => {
                    const userName = member.user?.raw_user_meta_data?.full_name || 
                                   member.user?.email?.split('@')[0] || 
                                   'Usuario';
                    return (
                      <option key={member.user_id} value={member.user_id}>
                        {userName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Nota opcional */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Nota (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Agrega una nota sobre este gasto..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 resize-none text-[#1a1a1a] dark:text-white"
              />
            </div>

            {/* Miembros que participan */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-3">
                <Users className="w-4 h-4 inline mr-1" />
                Miembros que participan *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {members.map(member => {
                  const userName = member.user?.raw_user_meta_data?.full_name || 
                                 member.user?.email?.split('@')[0] || 
                                 'Usuario';
                  const isSelected = selectedParticipants.includes(member.user_id);
                  
                  return (
                    <button
                      key={member.user_id}
                      type="button"
                      onClick={() => toggleParticipant(member.user_id)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-left",
                        isSelected
                          ? "border-[#1C8FA0] bg-[#1C8FA0]/10"
                          : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1C8FA0]/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center",
                          isSelected
                            ? "border-[#1C8FA0] bg-[#1C8FA0]"
                            : "border-gray-300 dark:border-gray-600"
                        )}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">
                          {userName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tipo de división */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-3">
                Tipo de división *
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleSplitTypeChange('equal')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    splitType === 'equal'
                      ? "border-[#1C8FA0] bg-[#1C8FA0]/10"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1C8FA0]/50"
                  )}
                >
                  <Equal className="w-5 h-5 mx-auto mb-2 text-[#1C8FA0]" />
                  <span className="text-xs font-semibold text-[#1a1a1a] dark:text-white">Equitativa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSplitTypeChange('percentage')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    splitType === 'percentage'
                      ? "border-[#1C8FA0] bg-[#1C8FA0]/10"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1C8FA0]/50"
                  )}
                >
                  <Percent className="w-5 h-5 mx-auto mb-2 text-[#1C8FA0]" />
                  <span className="text-xs font-semibold text-[#1a1a1a] dark:text-white">Por %</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSplitTypeChange('amounts')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    splitType === 'amounts'
                      ? "border-[#1C8FA0] bg-[#1C8FA0]/10"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1C8FA0]/50"
                  )}
                >
                  <Coins className="w-5 h-5 mx-auto mb-2 text-[#1C8FA0]" />
                  <span className="text-xs font-semibold text-[#1a1a1a] dark:text-white">Montos</span>
                </button>
              </div>

              {/* Detalles de división según el tipo */}
              {splitType === 'equal' && selectedMembers.length > 0 && (
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-2">
                    Cada persona pagará:
                  </p>
                  <p className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    ${(expenseAmount / selectedMembers.length).toFixed(2)}
                  </p>
                </div>
              )}

              {splitType === 'percentage' && selectedMembers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#6E6E73] dark:text-gray-400">Total:</span>
                    <span className={cn(
                      "font-bold",
                      Math.abs(totalPercentage - 100) < 0.01
                        ? "text-green-600"
                        : "text-red-500"
                    )}>
                      {totalPercentage.toFixed(2)}%
                    </span>
                  </div>
                  {selectedMembers.map(member => {
                    const userId = member.user_id;
                    const userName = member.user?.raw_user_meta_data?.full_name || 
                                   member.user?.email?.split('@')[0] || 
                                   'Usuario';
                    return (
                      <div key={userId} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#1a1a1a] dark:text-white w-24 truncate">
                          {userName}:
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={percentages[userId] || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPercentages(prev => ({ ...prev, [userId]: val }));
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                        />
                        <span className="text-sm text-[#6E6E73] dark:text-gray-400 w-16 text-right">
                          = ${((expenseAmount * (percentages[userId] || 0)) / 100).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {splitType === 'amounts' && selectedMembers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#6E6E73] dark:text-gray-400">Total:</span>
                    <span className={cn(
                      "font-bold",
                      Math.abs(totalAmounts - expenseAmount) < 0.01
                        ? "text-green-600"
                        : "text-red-500"
                    )}>
                      ${totalAmounts.toFixed(2)} / ${expenseAmount.toFixed(2)}
                    </span>
                  </div>
                  {selectedMembers.map(member => {
                    const userId = member.user_id;
                    const userName = member.user?.raw_user_meta_data?.full_name || 
                                   member.user?.email?.split('@')[0] || 
                                   'Usuario';
                    return (
                      <div key={userId} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#1a1a1a] dark:text-white w-24 truncate">
                          {userName}:
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={amounts[userId] || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setAmounts(prev => ({ ...prev, [userId]: val }));
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/30 text-[#1a1a1a] dark:text-white"
                        />
                        <span className="text-sm text-[#6E6E73] dark:text-gray-400 w-16 text-right">
                          {expenseAmount > 0 && (
                            <span>
                              ({(((amounts[userId] || 0) / expenseAmount) * 100).toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
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
                {loading ? 'Guardando...' : expense ? 'Actualizar' : 'Crear Gasto'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateSharedExpenseModal;


