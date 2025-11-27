// =====================================================
// PANEL DE DIAGNÓSTICO - Verificar Funcionalidad
// =====================================================
// Componente para verificar que budgets y IA funcionan
// =====================================================

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { sendMessageToAI } from '@/lib/ai-service';

const DiagnosticPanel = () => {
  const { user } = useAuth();
  const { transactions, categories, budgets, goals, loading } = useFinance(user?.id);
  const [diagnostics, setDiagnostics] = useState({
    budgets: { status: 'checking', message: 'Verificando...' },
    ai: { status: 'checking', message: 'Verificando...' },
    database: { status: 'checking', message: 'Verificando...' },
    api: { status: 'checking', message: 'Verificando...' }
  });

  useEffect(() => {
    runDiagnostics();
  }, [transactions, categories, budgets, goals, loading, user]);

  const runDiagnostics = async () => {
    // 1. Verificar Database/Budgets
    const budgetCheck = {
      status: 'success',
      message: 'Budgets funcionando correctamente'
    };

    if (loading) {
      budgetCheck.status = 'checking';
      budgetCheck.message = 'Cargando datos...';
    } else if (!budgets || budgets.length === 0) {
      budgetCheck.status = 'warning';
      budgetCheck.message = 'No hay presupuestos creados (esto es normal si acabas de empezar)';
    } else {
      // Verificar que los budgets tienen datos válidos
      const invalidBudgets = budgets.filter(b => !b.amount || b.amount <= 0);
      if (invalidBudgets.length > 0) {
        budgetCheck.status = 'error';
        budgetCheck.message = `${invalidBudgets.length} presupuesto(s) con datos inválidos`;
      }
    }

    // 2. Verificar Database/Transacciones
    const databaseCheck = {
      status: 'success',
      message: 'Base de datos conectada correctamente'
    };

    if (loading) {
      databaseCheck.status = 'checking';
      databaseCheck.message = 'Cargando...';
    } else if (!transactions) {
      databaseCheck.status = 'error';
      databaseCheck.message = 'No se pueden cargar transacciones';
    } else {
      databaseCheck.message = `${transactions.length} transacciones cargadas, ${categories?.length || 0} categorías, ${budgets?.length || 0} presupuestos`;
    }

    // 3. Verificar API Keys de IA
    const apiCheck = {
      status: 'success',
      message: 'API Keys configuradas'
    };

    const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    const qwenKey = import.meta.env.VITE_QWEN_API_KEY;

    if (!deepseekKey && !qwenKey) {
      apiCheck.status = 'error';
      apiCheck.message = 'No se encontraron API Keys de IA';
    } else if (!deepseekKey) {
      apiCheck.status = 'warning';
      apiCheck.message = 'Solo Qwen API Key configurada';
    } else if (!qwenKey) {
      apiCheck.status = 'warning';
      apiCheck.message = 'Solo DeepSeek API Key configurada';
    }

    // 4. Verificar IA (hacer prueba real)
    const aiCheck = {
      status: 'checking',
      message: 'Probando conexión con IA...'
    };

    try {
      const testResponse = await sendMessageToAI([
        { role: 'user', content: 'Responde solo con "OK" si me escuchas' }
      ]);

      if (testResponse && testResponse.trim().toLowerCase().includes('ok')) {
        aiCheck.status = 'success';
        aiCheck.message = 'IA respondiendo correctamente';
      } else {
        aiCheck.status = 'warning';
        aiCheck.message = 'IA responde pero puede tener problemas';
      }
    } catch (error) {
      aiCheck.status = 'error';
      aiCheck.message = `Error al conectar con IA: ${error.message}`;
    }

    setDiagnostics({
      budgets: budgetCheck,
      database: databaseCheck,
      api: apiCheck,
      ai: aiCheck
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'checking':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-[#1C8FA0]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Diagnóstico del Sistema</h3>
          <p className="text-sm text-[#6E6E73] dark:text-gray-400">Verificación de funcionalidad</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Database Check */}
        <div className={`p-4 rounded-xl border ${getStatusColor(diagnostics.database.status)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.database.status)}
            <div className="flex-1">
              <h4 className="font-semibold text-[#1a1a1a] dark:text-white">Base de Datos</h4>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400">{diagnostics.database.message}</p>
            </div>
          </div>
        </div>

        {/* Budgets Check */}
        <div className={`p-4 rounded-xl border ${getStatusColor(diagnostics.budgets.status)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.budgets.status)}
            <div className="flex-1">
              <h4 className="font-semibold text-[#1a1a1a] dark:text-white">Presupuestos (Budgets)</h4>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400">{diagnostics.budgets.message}</p>
            </div>
          </div>
        </div>

        {/* API Keys Check */}
        <div className={`p-4 rounded-xl border ${getStatusColor(diagnostics.api.status)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.api.status)}
            <div className="flex-1">
              <h4 className="font-semibold text-[#1a1a1a] dark:text-white">API Keys de IA</h4>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400">{diagnostics.api.message}</p>
            </div>
          </div>
        </div>

        {/* AI Check */}
        <div className={`p-4 rounded-xl border ${getStatusColor(diagnostics.ai.status)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.ai.status)}
            <div className="flex-1">
              <h4 className="font-semibold text-[#1a1a1a] dark:text-white">Asistente IA</h4>
              <p className="text-sm text-[#6E6E73] dark:text-gray-400">{diagnostics.ai.message}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={runDiagnostics}
        className="mt-6 w-full px-4 py-2 bg-[#1C8FA0] text-white rounded-xl font-medium hover:bg-[#1a7a8a] transition-colors"
      >
        Re-ejecutar Diagnóstico
      </button>
    </div>
  );
};

export default DiagnosticPanel;

