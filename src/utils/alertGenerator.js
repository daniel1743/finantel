/**
 * Generador de alertas basado en métricas y umbrales
 */

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Verificar y generar alertas del sistema
 */
export const checkSystemAlerts = async () => {
  try {
    const alerts = [];

    // Verificar salud del sistema
    const { data: healthData } = await supabase
      .from('system_health')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(5);

    if (healthData && healthData.length > 0) {
      healthData.forEach(health => {
        if (health.status === 'down') {
          alerts.push({
            alert_type: 'system',
            severity: 'critical',
            title: `🚨 ${health.check_type.toUpperCase()} está caído`,
            message: `El servicio ${health.check_type} no está respondiendo`,
            action_url: '/dashboard/admin/analytics',
            action_label: 'Ver detalles',
            metadata: { check_type: health.check_type, details: health.details },
          });
        } else if (health.status === 'degraded' || (health.latency_ms && health.latency_ms > 1000)) {
          alerts.push({
            alert_type: 'system',
            severity: 'warning',
            title: `⚠️ Latencia alta en ${health.check_type}`,
            message: `La latencia es de ${health.latency_ms}ms (umbral: 1000ms)`,
            action_url: '/dashboard/admin/analytics',
            action_label: 'Ver detalles',
            metadata: { check_type: health.check_type, latency: health.latency_ms },
          });
        }
      });
    }

    // Verificar tasa de error
    const { data: recentErrors } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('result', 'error')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora
      .limit(100);

    if (recentErrors && recentErrors.length > 10) {
      alerts.push({
        alert_type: 'system',
        severity: 'warning',
        title: '⚠️ Alta tasa de errores',
        message: `${recentErrors.length} errores en la última hora`,
        action_url: '/dashboard/admin/analytics',
        action_label: 'Ver logs',
        metadata: { error_count: recentErrors.length },
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error checking system alerts:', error);
    return [];
  }
};

/**
 * Verificar alertas de revenue
 */
export const checkRevenueAlerts = async () => {
  try {
    const alerts = [];

    // Obtener revenue de hoy vs promedio
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayRevenue } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')
      .gte('date', today.toISOString().split('T')[0]);

    const todayTotal = todayRevenue?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

    // Calcular promedio de últimos 7 días
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: weekRevenue } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .lt('date', today.toISOString().split('T')[0]);

    const weekTotal = weekRevenue?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;
    const dailyAverage = weekTotal / 7;

    if (dailyAverage > 0) {
      const change = ((todayTotal - dailyAverage) / dailyAverage) * 100;
      
      if (change < -30) {
        alerts.push({
          alert_type: 'revenue',
          severity: 'warning',
          title: '📉 Revenue cae significativamente',
          message: `Revenue de hoy es ${Math.abs(change).toFixed(1)}% menor que el promedio diario`,
          action_url: '/dashboard/admin/analytics',
          action_label: 'Investigar',
          metadata: { todayRevenue: todayTotal, average: dailyAverage, change },
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking revenue alerts:', error);
    return [];
  }
};

/**
 * Verificar alertas de usuarios
 */
export const checkUserAlerts = async () => {
  try {
    const alerts = [];

    // Verificar intentos fallidos de login
    const { data: failedLogins } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', 'login')
      .eq('result', 'error')
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Últimos 10 minutos
      .limit(100);

    if (failedLogins && failedLogins.length > 10) {
      // Agrupar por IP
      const ipCounts = {};
      failedLogins.forEach(log => {
        const ip = log.ip_address || 'unknown';
        ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      });

      const suspiciousIPs = Object.entries(ipCounts)
        .filter(([ip, count]) => count > 5)
        .map(([ip]) => ip);

      if (suspiciousIPs.length > 0) {
        alerts.push({
          alert_type: 'user',
          severity: 'warning',
          title: '⚠️ Intentos fallidos de login sospechosos',
          message: `${failedLogins.length} intentos fallidos en 10 minutos desde ${suspiciousIPs.length} IP(s)`,
          action_url: '/dashboard/admin/analytics',
          action_label: 'Ver usuarios',
          metadata: { failed_count: failedLogins.length, suspicious_ips: suspiciousIPs },
        });
      }
    }

    // Verificar churn rate
    const { data: churnData } = await supabase.rpc('get_admin_metrics_overview', {
      p_period: '7d'
    });

    if (churnData && churnData.churnRate > 10) {
      alerts.push({
        alert_type: 'user',
        severity: 'warning',
        title: '📊 Tasa de churn alta',
        message: `Churn rate semanal: ${churnData.churnRate}% (umbral: 10%)`,
        action_url: '/dashboard/admin/analytics',
        action_label: 'Analizar',
        metadata: { churn_rate: churnData.churnRate },
      });
    }

    return alerts;
  } catch (error) {
    console.error('Error checking user alerts:', error);
    return [];
  }
};

/**
 * Generar todas las alertas
 */
export const generateAllAlerts = async () => {
  try {
    const [systemAlerts, revenueAlerts, userAlerts] = await Promise.all([
      checkSystemAlerts(),
      checkRevenueAlerts(),
      checkUserAlerts(),
    ]);

    const allAlerts = [...systemAlerts, ...revenueAlerts, ...userAlerts];

    // Guardar alertas en la base de datos
    if (allAlerts.length > 0) {
      const { error } = await supabase.from('admin_alerts').insert(
        allAlerts.map(alert => ({
          ...alert,
          is_resolved: false,
        }))
      );

      if (error) {
        console.error('Error saving alerts:', error);
      }
    }

    return allAlerts;
  } catch (error) {
    console.error('Error generating alerts:', error);
    return [];
  }
};


