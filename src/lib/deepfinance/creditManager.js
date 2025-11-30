// =====================================================
// MANAGER: CreditManager
// =====================================================
// Maneja validación, deducción y actualización de créditos
// =====================================================

import { supabase } from '@/lib/customSupabaseClient';

export class CreditManager {
  constructor(userId) {
    this.userId = userId;
  }

  /**
   * Verifica si el usuario puede ejecutar un análisis
   * @returns {Promise<{can: boolean, reason: string, credits: Object|null}>}
   */
  async checkCanAnalyze() {
    if (!this.userId) {
      return {
        can: false,
        reason: 'Usuario no identificado',
        credits: null,
      };
    }

    try {
      // Obtener créditos del usuario
      let { data: credits, error } = await supabase
        .from('deepfinance_credits')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      // Si no existe, inicializar
      if (error && error.code === 'PGRST116') {
        const { data: newCredits, error: initError } = await supabase
          .from('deepfinance_credits')
          .insert({
            user_id: this.userId,
            credits_remaining: 0,
            free_analyses_limit: 4,
            free_analyses_used: 0,
            analyses_this_week: 0,
            analyses_this_month: 0,
          })
          .select()
          .single();

        if (initError) throw initError;
        credits = newCredits;
      } else if (error) {
        throw error;
      }

      // Resetear contadores si es nuevo mes/semana
      credits = await this.resetCountersIfNeeded(credits);

      // Verificar si tiene créditos pagados
      const hasCredits = (credits.credits_remaining || 0) > 0;

      // Verificar límite semanal (1 análisis por semana gratis)
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const lastAnalysisDate = credits.last_analysis_date 
        ? new Date(credits.last_analysis_date)
        : null;

      const hasAnalyzedThisWeek = lastAnalysisDate && lastAnalysisDate >= weekStart;
      const weeklyLimitReached = (credits.analyses_this_week || 0) >= 1 && !hasCredits;

      // Verificar límite mensual (4 análisis gratis al mes)
      const freeUsed = credits.free_analyses_used || 0;
      const freeLimit = credits.free_analyses_limit || 4;
      const monthlyLimitReached = freeUsed >= freeLimit && !hasCredits;

      // Determinar si puede analizar
      if (hasCredits) {
        return {
          can: true,
          reason: 'Tienes créditos disponibles',
          credits,
        };
      }

      if (weeklyLimitReached) {
        return {
          can: false,
          reason: 'Ya realizaste tu evaluación de esta semana. DeepFinance™ requiere muchísimo procesamiento y solo puedes usarlo 1 vez por semana. Para usarlo nuevamente hoy, debes tener un acceso Premium.',
          credits,
        };
      }

      if (monthlyLimitReached) {
        return {
          can: false,
          reason: `Has alcanzado tu límite mensual de ${freeLimit} análisis gratuitos. Compra créditos para continuar usando DeepFinance™.`,
          credits,
        };
      }

      return {
        can: true,
        reason: 'OK',
        credits,
      };

    } catch (error) {
      console.error('[CreditManager] Error checking credits:', error);
      // En desarrollo, permitir análisis
      if (process.env.NODE_ENV === 'development') {
        return {
          can: true,
          reason: 'Modo desarrollo - créditos deshabilitados',
          credits: null,
        };
      }
      return {
        can: false,
        reason: 'Error al verificar créditos. Por favor, intenta nuevamente.',
        credits: null,
      };
    }
  }

  /**
   * Deduce un crédito o marca uso gratuito después de ejecutar análisis
   * @returns {Promise<{success: boolean, creditsRemaining: number, error: string|null}>}
   */
  async deductCredit() {
    if (!this.userId) {
      return {
        success: false,
        creditsRemaining: 0,
        error: 'Usuario no identificado',
      };
    }

    try {
      // Obtener créditos actuales
      const { data: credits, error: fetchError } = await supabase
        .from('deepfinance_credits')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (fetchError) throw fetchError;

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Resetear contadores si es necesario
      let updatedCredits = await this.resetCountersIfNeeded(credits);

      const hasCredits = (updatedCredits.credits_remaining || 0) > 0;
      let newCreditsRemaining = updatedCredits.credits_remaining || 0;
      let newFreeUsed = updatedCredits.free_analyses_used || 0;
      let newWeekCount = updatedCredits.analyses_this_week || 0;
      let newMonthCount = updatedCredits.analyses_this_month || 0;

      // Si tiene créditos pagados, usar uno
      if (hasCredits) {
        newCreditsRemaining = Math.max(0, newCreditsRemaining - 1);
      } else {
        // Usar análisis gratis
        newFreeUsed = (newFreeUsed || 0) + 1;
        newWeekCount = (newWeekCount || 0) + 1;
      }

      newMonthCount = (newMonthCount || 0) + 1;

      // Actualizar créditos
      const { data: updated, error: updateError } = await supabase
        .from('deepfinance_credits')
        .update({
          credits_remaining: newCreditsRemaining,
          free_analyses_used: newFreeUsed,
          analyses_this_week: newWeekCount,
          analyses_this_month: newMonthCount,
          last_analysis_date: now.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', this.userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        success: true,
        creditsRemaining: updated.credits_remaining,
        usedFreeAnalysis: !hasCredits,
        error: null,
      };

    } catch (error) {
      console.error('[CreditManager] Error deducting credit:', error);
      return {
        success: false,
        creditsRemaining: 0,
        error: error.message || 'Error al actualizar créditos',
      };
    }
  }

  /**
   * Resetea contadores si es un nuevo mes o semana
   * @param {Object} credits
   * @returns {Promise<Object>}
   */
  async resetCountersIfNeeded(credits) {
    if (!credits) return credits;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastAnalysisDate = credits.last_analysis_date
      ? new Date(credits.last_analysis_date)
      : null;

    let needsUpdate = false;
    const updates = {};

    // Resetear contador semanal si es nueva semana
    if (!lastAnalysisDate || lastAnalysisDate < weekStart) {
      if ((credits.analyses_this_week || 0) > 0) {
        updates.analyses_this_week = 0;
        needsUpdate = true;
      }
    }

    // Resetear contador mensual si es nuevo mes
    if (!lastAnalysisDate || lastAnalysisDate < monthStart) {
      if ((credits.free_analyses_used || 0) > 0 || (credits.analyses_this_month || 0) > 0) {
        updates.free_analyses_used = 0;
        updates.analyses_this_month = 0;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      const { data: updated, error } = await supabase
        .from('deepfinance_credits')
        .update(updates)
        .eq('user_id', this.userId)
        .select()
        .single();

      if (error) {
        console.error('[CreditManager] Error resetting counters:', error);
        return credits;
      }

      return { ...credits, ...updated };
    }

    return credits;
  }

  /**
   * Acredita créditos después de una compra
   * @param {number} creditsAmount
   * @param {string} purchaseId
   * @returns {Promise<{success: boolean, creditsRemaining: number, error: string|null}>}
   */
  async creditPurchase(creditsAmount, purchaseId = null) {
    if (!this.userId) {
      return {
        success: false,
        creditsRemaining: 0,
        error: 'Usuario no identificado',
      };
    }

    try {
      // Obtener créditos actuales
      const { data: credits, error: fetchError } = await supabase
        .from('deepfinance_credits')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const currentCredits = credits?.credits_remaining || 0;
      const newCredits = currentCredits + creditsAmount;

      // Si no existe registro, crearlo
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newCreditsData, error: createError } = await supabase
          .from('deepfinance_credits')
          .insert({
            user_id: this.userId,
            credits_remaining: creditsAmount,
            free_analyses_limit: 4,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Registrar la compra
        if (purchaseId) {
          await this.recordPurchase(creditsAmount, purchaseId);
        }

        return {
          success: true,
          creditsRemaining: newCreditsData.credits_remaining,
          error: null,
        };
      }

      // Actualizar créditos existentes
      const { data: updated, error: updateError } = await supabase
        .from('deepfinance_credits')
        .update({
          credits_remaining: newCredits,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', this.userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Registrar la compra
      if (purchaseId) {
        await this.recordPurchase(creditsAmount, purchaseId);
      }

      return {
        success: true,
        creditsRemaining: updated.credits_remaining,
        error: null,
      };

    } catch (error) {
      console.error('[CreditManager] Error crediting purchase:', error);
      return {
        success: false,
        creditsRemaining: 0,
        error: error.message || 'Error al acreditar créditos',
      };
    }
  }

  /**
   * Registra una compra de créditos
   * @param {number} creditsAmount
   * @param {string} purchaseId
   * @returns {Promise<void>}
   */
  async recordPurchase(creditsAmount, purchaseId) {
    try {
      // Calcular monto pagado (asumiendo $5 USD por 10 créditos)
      const amountPerCredit = 5 / 10; // $0.50 por crédito
      const amountPaid = creditsAmount * amountPerCredit;

      await supabase
        .from('deepfinance_credit_purchases')
        .insert({
          user_id: this.userId,
          credits_purchased: creditsAmount,
          amount_paid: amountPaid,
          currency: 'USD',
          payment_id: purchaseId,
          status: 'completed',
        });
    } catch (error) {
      console.error('[CreditManager] Error recording purchase:', error);
      // No lanzar error, solo loguear
    }
  }
}

