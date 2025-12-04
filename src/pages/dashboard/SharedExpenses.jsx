// =====================================================
// PÁGINA: Gastos Compartidos
// =====================================================
// Vista completa de gastos compartidos con funcionalidad real
// =====================================================

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Filter, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  MoreHorizontal,
  Receipt,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFamilyGroups } from '@/hooks/useFamilyGroups';
import { useSharedExpenses } from '@/hooks/useSharedExpenses';
import CreateSharedExpenseModal from '@/components/modals/CreateSharedExpenseModal';

const ExpenseTimelineItem = ({ expense, splits, members, userId, onSettle, index }) => {
  const paidByUser = expense.paid_by || members.find(m => m.user_id === expense.paid_by_user_id);
  const paidByName = paidByUser?.user?.raw_user_meta_data?.full_name || 
                     paidByUser?.user?.email?.split('@')[0] || 
                     'Usuario';
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const participantUsers = splits
    ?.map(split => {
      const member = members.find(m => m.user_id === split.user_id);
      return member ? {
        ...member,
        amount: split.amount,
        is_settled: split.is_settled,
      } : null;
    })
    .filter(Boolean) || [];

  const totalAmount = parseFloat(expense.amount || 0);
  const userSplit = splits?.find(s => s.user_id === userId);
  const userAmount = userSplit ? parseFloat(userSplit.amount || 0) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 pb-8 border-l-2 border-gray-100 dark:border-white/10 last:border-0 last:pb-0"
    >
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-[#1C8FA0]" />
      
      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
              {paidByUser?.user?.raw_user_meta_data?.avatar_url ? (
                <img 
                  src={paidByUser.user.raw_user_meta_data.avatar_url} 
                  alt={paidByName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-sm font-bold text-[#6E6E73] dark:text-gray-400">
                  {paidByName[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-[#1a1a1a] dark:text-white text-sm">{expense.title}</h4>
              <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                Pagado por <span className="font-medium text-[#1a1a1a] dark:text-white">{paidByName}</span> • {formatDate(expense.expense_date)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#1a1a1a] dark:text-white">${totalAmount.toFixed(2)}</p>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
              expense.status === 'settled' 
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
            )}>
              {expense.status === 'settled' ? 'Pagado' : 'Pendiente'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-white/5">
          <div className="flex -space-x-2">
            {participantUsers.slice(0, 3).map((participant, i) => {
              const userName = participant.user?.raw_user_meta_data?.full_name || 
                             participant.user?.email?.split('@')[0] || 
                             'Usuario';
              return (
                <div 
                  key={participant.user_id} 
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a1a1a] bg-gray-200 dark:bg-white/20 overflow-hidden" 
                  title={userName}
                >
                  {participant.user?.raw_user_meta_data?.avatar_url ? (
                    <img 
                      src={participant.user.raw_user_meta_data.avatar_url} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1C8FA0] text-white text-[8px] font-bold">
                      {userName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
            {participantUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a1a1a] bg-gray-50 dark:bg-white/10 flex items-center justify-center text-[10px] text-[#6E6E73] dark:text-gray-400 font-bold">
                +{participantUsers.length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {userSplit && !userSplit.is_settled && expense.status !== 'settled' && (
              <button
                onClick={() => onSettle(expense.id, userId)}
                className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1"
              >
                Marcar como pagado
              </button>
            )}
            <span className="text-xs text-[#6E6E73] dark:text-gray-400">
              Tu parte: ${userAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SharedExpenses = () => {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar grupos del usuario
  const { groups, members: allMembers, loading: groupsLoading } = useFamilyGroups(user?.id);

  // Seleccionar el primer grupo por defecto
  React.useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Cargar gastos del grupo seleccionado
  const { 
    expenses, 
    splits, 
    balance, 
    loading: expensesLoading,
    createExpense,
    settleSplit,
  } = useSharedExpenses(selectedGroupId, user?.id);

  // Obtener miembros del grupo seleccionado
  const currentGroupMembers = useMemo(() => {
    if (!selectedGroupId || !allMembers[selectedGroupId]) return [];
    return allMembers[selectedGroupId];
  }, [selectedGroupId, allMembers]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.expense_date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    const totalMonth = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const userBalance = balance[user?.id] || 0;
    
    // Calcular deudas pendientes (negativas)
    const debts = Object.entries(balance)
      .filter(([_, amount]) => amount < 0)
      .reduce((sum, [_, amount]) => sum + Math.abs(amount), 0);

    const avgPerPerson = currentGroupMembers.length > 0 
      ? totalMonth / currentGroupMembers.length 
      : 0;

    return {
      totalMonth,
      userBalance,
      debts,
      avgPerPerson,
    };
  }, [expenses, balance, user?.id, currentGroupMembers]);

  const handleCreateExpense = async (expenseData) => {
    const result = await createExpense(expenseData);
    if (!result.error) {
      setShowCreateModal(false);
    }
  };

  const handleSettle = async (expenseId, userIdToSettle) => {
    await settleSplit(expenseId, userIdToSettle);
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Gastos Compartidos</h1>
            <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Historial completo de gastos divididos</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-12 border border-gray-100 dark:border-white/5 text-center">
          <Icon component={Users} size="md" color="default" className="mx-auto mb-4  dark:" />
          <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">
            No tienes grupos familiares
          </h3>
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
            Crea un grupo familiar en la sección "Mi Familia" para comenzar a compartir gastos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Gastos Compartidos</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Historial completo de gastos divididos</p>
        </div>
        {selectedGroupId && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-6 py-6 h-auto rounded-xl shadow-lg transition-transform hover:-translate-y-1"
          >
            <Icon component={Plus} size="md" color="default" className="mr-2" />
            Nuevo Gasto
          </Button>
        )}
      </div>

      {/* Selector de grupo */}
      {groups.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={cn(
                "px-4 py-2 rounded-xl whitespace-nowrap transition-all",
                selectedGroupId === group.id
                  ? "bg-[#1C8FA0] text-white"
                  : "bg-gray-100 dark:bg-white/5 text-[#1a1a1a] dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
              )}
            >
              {group.name}
            </button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] rounded-[22px] p-6 text-white shadow-lg shadow-[#1C8FA0]/20"
        >
          <p className="text-white/80 text-sm font-medium mb-1">Total Compartido (Mes)</p>
          <p className="text-3xl font-bold font-['Inter_Tight']">${stats.totalMonth.toFixed(2)}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className="text-[#6E6E73] dark:text-gray-400 text-sm font-medium mb-1">Tu Balance</p>
          <p className={cn(
            "text-3xl font-bold font-['Inter_Tight']",
            stats.userBalance >= 0 ? "text-green-600" : "text-red-500"
          )}>
            {stats.userBalance >= 0 ? '+' : ''}${stats.userBalance.toFixed(2)}
          </p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
            {stats.userBalance >= 0 ? 'Te deben dinero' : 'Debes dinero'}
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className="text-[#6E6E73] dark:text-gray-400 text-sm font-medium mb-1">Deudas Pendientes</p>
          <p className="text-3xl font-bold text-red-500 font-['Inter_Tight']">-${stats.debts.toFixed(2)}</p>
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-1">
            {stats.debts > 0 ? 'Debes dinero' : 'Sin deudas'}
          </p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Timeline Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white text-lg">Actividad Reciente</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-[#6E6E73] dark:text-gray-400 transition-colors">
                <Icon component={Filter} size="sm" color="default" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-[#6E6E73] dark:text-gray-400 transition-colors">
                <Icon component={Calendar} size="sm" color="default" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
            {expensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <Icon component={Receipt} size="md" color="default" className="mx-auto mb-4  dark:" />
                <p className="text-[#6E6E73] dark:text-gray-400">No hay gastos compartidos aún</p>
              </div>
            ) : (
              expenses.map((expense, index) => (
                <ExpenseTimelineItem
                  key={expense.id}
                  expense={expense}
                  splits={splits[expense.id]}
                  members={currentGroupMembers}
                  userId={user?.id}
                  onSettle={handleSettle}
                  index={index}
                />
              ))
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-6">Estadísticas Rápidas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <span className="text-sm text-[#6E6E73] dark:text-gray-400">Promedio por persona</span>
                <span className="font-bold text-[#1a1a1a] dark:text-white">${stats.avgPerPerson.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {selectedGroupId && (
            <div className="bg-[#1C8FA0]/5 rounded-[26px] p-6 border border-[#1C8FA0]/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
                  <Icon component={Users} size="md" color="primary" />
                </div>
                <h3 className="font-bold text-[#1a1a1a] dark:text-white">
                  {groups.find(g => g.id === selectedGroupId)?.name || 'Grupo Familiar'}
                </h3>
              </div>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">
                {expenses.filter(e => e.status === 'pending').length} gastos pendientes de liquidación
              </p>
              <Button 
                variant="outline" 
                className="w-full border-[#1C8FA0] text-[#1C8FA0] hover:bg-[#1C8FA0]/10"
                onClick={() => window.location.href = '/dashboard/family'}
              >
                Ver Grupo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear gasto */}
      {selectedGroupId && (
        <CreateSharedExpenseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          groupId={selectedGroupId}
          members={currentGroupMembers}
          onCreateExpense={handleCreateExpense}
        />
      )}
    </div>
  );
};

export default SharedExpenses;
