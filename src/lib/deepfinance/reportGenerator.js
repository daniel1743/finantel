// =====================================================
// GENERADOR: ReportGenerator
// =====================================================
// Genera PDFs profesionales del análisis DeepFinance
// =====================================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BRAND_COLOR = '#1C8FA0';
const PRIMARY_COLOR = { r: 28, g: 143, b: 160 };
const WATERMARK_OPACITY = 0.08;

export class ReportGenerator {
  constructor(analysis, userName, userEmail = '') {
    this.analysis = analysis;
    this.userName = userName || 'Usuario';
    this.userEmail = userEmail;
    this.doc = null;
    this.currentY = 0;
    this.pageHeight = 0;
    this.pageWidth = 0;
  }

  /**
   * Genera el PDF completo del análisis
   * @returns {jsPDF} Documento PDF
   */
  generate() {
    // Crear documento
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = 20;

    // 1. Portada
    this.addCoverPage();

    // 2. Resumen Ejecutivo
    this.addExecutiveSummary();

    // 3. Puntaje Financiero
    this.addFinancialScore();

    // 4. Diagnóstico por Área
    this.addAreaDiagnosis();

    // 5. Fugas y Riesgos
    this.addLeakagesAndRisks();

    // 6. Ahorro Potencial
    this.addSavingsPotential();

    // 7. Patrones Detectados
    this.addPatterns();

    // 8. Recomendaciones
    this.addRecommendations();

    // 9. Plan de Acción
    this.addActionPlan();

    // 10. Agregar marca de agua y pie de página
    this.addWatermark();
    this.addFooter();

    return this.doc;
  }

  /**
   * Portada del reporte
   */
  addCoverPage() {
    // Fondo degradado
    this.doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Logo/Título
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FINANTEL', this.pageWidth / 2, 60, { align: 'center' });

    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('DeepFinance™', this.pageWidth / 2, 75, { align: 'center' });

    // Subtítulo
    this.doc.setFontSize(14);
    this.doc.text('Reporte de Análisis Financiero Avanzado', this.pageWidth / 2, 90, { align: 'center' });

    // Información del usuario
    this.doc.setFontSize(12);
    this.doc.text(`Cliente: ${this.userName}`, this.pageWidth / 2, 120, { align: 'center' });
    
    if (this.userEmail) {
      this.doc.text(this.userEmail, this.pageWidth / 2, 130, { align: 'center' });
    }

    // Fecha del reporte
    const reportDate = this.analysis.analysisDate 
      ? new Date(this.analysis.analysisDate).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

    this.doc.text(`Fecha del análisis: ${reportDate}`, this.pageWidth / 2, 145, { align: 'center' });

    // Período analizado
    if (this.analysis.period) {
      const startDate = new Date(this.analysis.period.start).toLocaleDateString('es-ES');
      const endDate = new Date(this.analysis.period.end).toLocaleDateString('es-ES');
      this.doc.setFontSize(10);
      this.doc.text(`Período analizado: ${startDate} - ${endDate}`, this.pageWidth / 2, 160, { align: 'center' });
    }

    // Nota confidencial
    this.doc.setFontSize(8);
    this.doc.setTextColor(255, 255, 255, 0.7);
    this.doc.text('Documento confidencial - Uso exclusivo del cliente', this.pageWidth / 2, 270, { align: 'center' });

    // Nueva página
    this.doc.addPage();
    this.currentY = 20;
  }

  /**
   * Resumen ejecutivo
   */
  addExecutiveSummary() {
    this.addSectionTitle('RESUMEN EJECUTIVO');

    const summary = this.analysis.summary || {};
    const summaryText = summary.message || summary.text || 
      `Este análisis evalúa tu situación financiera basándose en ${this.analysis.totalTransactions || 0} transacciones ` +
      `registradas durante el período analizado. Tu puntaje financiero general es de ${this.analysis.score || 0}/100.`;

    // Puntaje destacado
    this.doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
    this.doc.roundedRect(20, this.currentY, this.pageWidth - 40, 30, 3, 3, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Puntaje Financiero Global', this.pageWidth / 2, this.currentY + 10, { align: 'center' });
    
    this.doc.setFontSize(36);
    this.doc.text(`${this.analysis.score || 0}`, this.pageWidth / 2, this.currentY + 25, { align: 'center' });
    this.doc.setFontSize(12);
    this.doc.text('de 100 puntos', this.pageWidth / 2, this.currentY + 30, { align: 'center' });

    this.currentY += 40;

    // Interpretación del puntaje
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Interpretación:', 20, this.currentY);
    this.currentY += 6;

    const scoreInterpretation = this.getScoreInterpretation(this.analysis.score);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(scoreInterpretation, this.pageWidth - 40);
    this.doc.text(lines, 20, this.currentY);
    this.currentY += lines.length * 5 + 5;

    // Resumen textual
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Resumen:', 20, this.currentY);
    this.currentY += 6;

    this.doc.setFont('helvetica', 'normal');
    const summaryLines = this.doc.splitTextToSize(summaryText, this.pageWidth - 40);
    this.doc.text(summaryLines, 20, this.currentY);
    this.currentY += summaryLines.length * 5 + 10;

    // Métricas clave
    this.addKeyMetrics();

    this.newPageIfNeeded(30);
  }

  /**
   * Métricas clave
   */
  addKeyMetrics() {
    const metrics = [
      {
        label: 'Ingresos Totales',
        value: this.formatCurrency(this.analysis.totalIncome || 0),
        color: [76, 175, 80]
      },
      {
        label: 'Gastos Totales',
        value: this.formatCurrency(this.analysis.totalExpenses || 0),
        color: [244, 67, 54]
      },
      {
        label: 'Ahorro Neto',
        value: this.formatCurrency(this.analysis.netSavings || 0),
        color: this.analysis.netSavings >= 0 ? [76, 175, 80] : [244, 67, 54]
      },
      {
        label: 'Tasa de Ahorro',
        value: `${(this.analysis.savingsRate || 0).toFixed(1)}%`,
        color: [33, 150, 243]
      }
    ];

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');

    metrics.forEach((metric, index) => {
      const x = 20 + (index % 2) * ((this.pageWidth - 40) / 2);
      const y = this.currentY + Math.floor(index / 2) * 20;

      // Caja de métrica
      this.doc.setFillColor(...metric.color);
      this.doc.roundedRect(x, y, (this.pageWidth - 50) / 2, 15, 2, 2, 'F');

      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.text(metric.label, x + 5, y + 6);
      this.doc.setFontSize(10);
      this.doc.text(metric.value, x + 5, y + 12);
    });

    this.currentY += 40;
  }

  /**
   * Puntaje financiero detallado
   */
  addFinancialScore() {
    this.addSectionTitle('PUNTAJE FINANCIERO DETALLADO');

    // Componentes del puntaje
    const scoreBreakdown = this.analysis.scoreBreakdown || {};
    const components = [
      { name: 'Cumplimiento de Presupuesto', value: scoreBreakdown.budgetCompliance || 0 },
      { name: 'Tasa de Ahorro', value: scoreBreakdown.savingsRate || 0 },
      { name: 'Disciplina de Gasto', value: scoreBreakdown.spendingDiscipline || 0 },
      { name: 'Nivel de Riesgo', value: scoreBreakdown.riskLevel || 0 },
      { name: 'Salud de Patrones', value: scoreBreakdown.patternHealth || 0 },
      { name: 'Progreso de Metas', value: scoreBreakdown.goalProgress || 0 },
      { name: 'Control Emocional', value: scoreBreakdown.emotionalControl || 0 }
    ];

    // Tabla de componentes
    const tableData = components.map(comp => [
      comp.name,
      comp.value.toFixed(1),
      this.getScoreBar(comp.value)
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Componente', 'Puntaje', 'Visualización']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 80 }
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
    this.newPageIfNeeded(30);
  }

  /**
   * Diagnóstico por área
   */
  addAreaDiagnosis() {
    this.addSectionTitle('DIAGNÓSTICO POR ÁREA');

    // Áreas a analizar
    const areas = [];

    // Análisis emocional
    if (this.analysis.emotional) {
      const emotional = this.analysis.emotional;
      areas.push({
        area: 'Gastos Emocionales',
        status: emotional.percentage > 30 ? 'ALERTA' : emotional.percentage > 15 ? 'ATENCIÓN' : 'ESTABLE',
        description: `El ${(emotional.percentage || 0).toFixed(1)}% de tus gastos son emocionales. ` +
          `${emotional.count || 0} transacciones identificadas con un total de ${this.formatCurrency(emotional.total || 0)}.`
      });
    }

    // Análisis de riesgo
    if (this.analysis.risk) {
      const risk = this.analysis.risk;
      areas.push({
        area: 'Riesgo Financiero',
        status: risk.level?.toUpperCase() || 'MEDIO',
        description: risk.factors?.length 
          ? `Factores de riesgo detectados: ${risk.factors.join(', ')}.`
          : 'Nivel de riesgo evaluado según tus patrones de gasto e ingresos.'
      });
    }

    // Análisis de patrones
    if (this.analysis.patterns && this.analysis.patterns.length > 0) {
      areas.push({
        area: 'Patrones de Gasto',
        status: 'ANALIZADO',
        description: `${this.analysis.patterns.length} patrones detectados en tus transacciones. ` +
          'Revisa la sección de patrones para más detalles.'
      });
    }

    // Añadir cada área
    areas.forEach((area, index) => {
      if (this.currentY > this.pageHeight - 40) {
        this.doc.addPage();
        this.currentY = 20;
      }

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}. ${area.area}`, 20, this.currentY);
      
      this.currentY += 6;
      
      const statusColor = this.getStatusColor(area.status);
      this.doc.setFillColor(...statusColor);
      this.doc.roundedRect(20, this.currentY, 40, 8, 2, 2, 'F');
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.text(area.status, 40, this.currentY + 5.5, { align: 'center' });
      
      this.currentY += 10;
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      const descLines = this.doc.splitTextToSize(area.description, this.pageWidth - 40);
      this.doc.text(descLines, 20, this.currentY);
      this.currentY += descLines.length * 5 + 10;
    });

    this.newPageIfNeeded(30);
  }

  /**
   * Fugas y riesgos
   */
  addLeakagesAndRisks() {
    this.addSectionTitle('FUGAS FINANCIERAS Y RIESGOS');

    // Fugas
    const leakages = this.analysis.leakages || [];
    
    if (leakages.length > 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Fugas Detectadas:', 20, this.currentY);
      this.currentY += 8;

      const leakageData = leakages.slice(0, 10).map(leak => [
        leak.type || leak.name || 'Fuga',
        leak.description || 'Sin descripción',
        this.formatCurrency(leak.monthly_impact || leak.monthlyImpact || 0),
        this.formatCurrency((leak.monthly_impact || leak.monthlyImpact || 0) * 12)
      ]);

      this.doc.autoTable({
        startY: this.currentY,
        head: [['Tipo', 'Descripción', 'Impacto Mensual', 'Impacto Anual']],
        body: leakageData,
        theme: 'striped',
        headStyles: {
          fillColor: [244, 67, 54],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 70 },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });

      this.currentY = this.doc.lastAutoTable.finalY + 10;
    } else {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No se detectaron fugas financieras significativas.', 20, this.currentY);
      this.currentY += 10;
    }

    // Factores de riesgo
    if (this.analysis.risk && this.analysis.risk.factors && this.analysis.risk.factors.length > 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Factores de Riesgo:', 20, this.currentY);
      this.currentY += 8;

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.analysis.risk.factors.forEach((factor, index) => {
        this.doc.text(`${index + 1}. ${factor}`, 25, this.currentY);
        this.currentY += 6;
      });
    }

    this.newPageIfNeeded(30);
  }

  /**
   * Ahorro potencial
   */
  addSavingsPotential() {
    this.addSectionTitle('AHORRO POTENCIAL');

    const projections = this.analysis.savingsProjections || {};

    if (Object.keys(projections).length === 0) {
      this.doc.setFontSize(9);
      this.doc.text('No hay proyecciones de ahorro disponibles.', 20, this.currentY);
      this.currentY += 10;
      return;
    }

    // Proyecciones por período
    const periods = [
      { key: '30days', label: '30 días' },
      { key: '90days', label: '90 días' },
      { key: '180days', label: '180 días' }
    ];

    const projectionData = periods
      .filter(p => projections[p.key])
      .map(p => [
        p.label,
        this.formatCurrency(projections[p.key].potential || 0),
        projections[p.key].description || 'Ahorro potencial optimizando finanzas'
      ]);

    if (projectionData.length > 0) {
      this.doc.autoTable({
        startY: this.currentY,
        head: [['Período', 'Ahorro Potencial', 'Descripción']],
        body: projectionData,
        theme: 'striped',
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 45, halign: 'right' },
          2: { cellWidth: 105 }
        }
      });

      this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    // Escenarios específicos
    if (projections.eliminate_leakages) {
      const leak = projections.eliminate_leakages;
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Escenario: Eliminando Fugas', 20, this.currentY);
      this.currentY += 8;

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Ahorro mensual: ${this.formatCurrency(leak.monthly || 0)}`, 25, this.currentY);
      this.currentY += 6;
      this.doc.text(`Ahorro anual: ${this.formatCurrency(leak.annual || leak.potential || 0)}`, 25, this.currentY);
      this.currentY += 10;
    }

    this.newPageIfNeeded(30);
  }

  /**
   * Patrones detectados
   */
  addPatterns() {
    this.addSectionTitle('PATRONES DETECTADOS');

    const patterns = this.analysis.patterns || [];

    if (patterns.length === 0) {
      this.doc.setFontSize(9);
      this.doc.text('No se detectaron patrones significativos.', 20, this.currentY);
      this.currentY += 10;
      return;
    }

    patterns.slice(0, 10).forEach((pattern, index) => {
      if (this.currentY > this.pageHeight - 40) {
        this.doc.addPage();
        this.currentY = 20;
      }

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}. ${pattern.type || pattern.name || 'Patrón'}`, 20, this.currentY);
      this.currentY += 6;

      this.doc.setFont('helvetica', 'normal');
      if (pattern.description) {
        const descLines = this.doc.splitTextToSize(pattern.description, this.pageWidth - 40);
        this.doc.text(descLines, 25, this.currentY);
        this.currentY += descLines.length * 5;
      }
      this.currentY += 5;
    });

    this.newPageIfNeeded(30);
  }

  /**
   * Recomendaciones
   */
  addRecommendations() {
    this.addSectionTitle('RECOMENDACIONES PERSONALIZADAS');

    const recommendations = this.analysis.recommendations || [];

    if (recommendations.length === 0) {
      this.doc.setFontSize(9);
      this.doc.text('No hay recomendaciones disponibles.', 20, this.currentY);
      this.currentY += 10;
      return;
    }

    recommendations.slice(0, 15).forEach((rec, index) => {
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = 20;
      }

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}. ${rec.title || 'Recomendación'}`, 20, this.currentY);
      this.currentY += 6;

      // Badge de impacto
      const impactColor = this.getImpactColor(rec.impact);
      this.doc.setFillColor(...impactColor);
      this.doc.roundedRect(20, this.currentY, 30, 6, 2, 2, 'F');
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(7);
      this.doc.text((rec.impact || 'MEDIO').toUpperCase(), 35, this.currentY + 4, { align: 'center' });
      
      this.currentY += 8;

      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      const descLines = this.doc.splitTextToSize(rec.description || 'Sin descripción', this.pageWidth - 40);
      this.doc.text(descLines, 25, this.currentY);
      this.currentY += descLines.length * 5 + 8;
    });

    this.newPageIfNeeded(30);
  }

  /**
   * Plan de acción
   */
  addActionPlan() {
    this.addSectionTitle('PLAN DE ACCIÓN 7/30/90 DÍAS');

    const plans = [
      {
        period: '7 DÍAS',
        actions: [
          'Revisar y cancelar suscripciones innecesarias',
          'Identificar las 3 categorías de mayor gasto',
          'Establecer límites diarios para gastos no esenciales'
        ]
      },
      {
        period: '30 DÍAS',
        actions: [
          'Implementar las recomendaciones prioritarias',
          'Reducir gastos emocionales en un 30%',
          'Establecer un fondo de emergencia mínimo',
          'Optimizar las categorías de mayor impacto'
        ]
      },
      {
        period: '90 DÍAS',
        actions: [
          'Alcanzar una tasa de ahorro del 10%',
          'Eliminar todas las fugas financieras detectadas',
          'Aumentar el puntaje financiero en 20 puntos',
          'Establecer metas financieras a largo plazo'
        ]
      }
    ];

    plans.forEach((plan, planIndex) => {
      if (this.currentY > this.pageHeight - 60) {
        this.doc.addPage();
        this.currentY = 20;
      }

      this.doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
      this.doc.roundedRect(20, this.currentY, this.pageWidth - 40, 10, 2, 2, 'F');
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(plan.period, 25, this.currentY + 7);
      
      this.currentY += 12;

      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');

      plan.actions.forEach((action, actionIndex) => {
        this.doc.text(`• ${action}`, 25, this.currentY);
        this.currentY += 6;
      });

      this.currentY += 5;
    });

    this.newPageIfNeeded(30);
  }

  // =====================================================
  // HELPERS
  // =====================================================

  addSectionTitle(title) {
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
    this.doc.roundedRect(20, this.currentY - 5, this.pageWidth - 40, 10, 2, 2, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 25, this.currentY + 2);
    
    this.currentY += 12;
  }

  newPageIfNeeded(minSpace = 30) {
    if (this.currentY > this.pageHeight - minSpace) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  }

  getScoreInterpretation(score) {
    if (score >= 80) return 'Excelente. Tu situación financiera es muy sólida. Continúa manteniendo estos hábitos.';
    if (score >= 60) return 'Buena. Tienes una base sólida, pero hay áreas de mejora identificadas.';
    if (score >= 40) return 'Regular. Tu situación financiera requiere atención en varias áreas.';
    return 'Crítica. Es importante tomar acción inmediata para mejorar tu salud financiera.';
  }

  getStatusColor(status) {
    const upperStatus = status.toUpperCase();
    if (upperStatus.includes('ALERTA') || upperStatus.includes('CRÍTICO')) return [244, 67, 54];
    if (upperStatus.includes('ATENCIÓN')) return [255, 152, 0];
    if (upperStatus.includes('ESTABLE') || upperStatus.includes('BUENO')) return [76, 175, 80];
    return [33, 150, 243];
  }

  getImpactColor(impact) {
    const upperImpact = (impact || 'medio').toUpperCase();
    if (upperImpact.includes('CRÍTICO') || upperImpact.includes('CRITICO')) return [244, 67, 54];
    if (upperImpact.includes('ALTO') || upperImpact.includes('HIGH')) return [255, 152, 0];
    return [255, 235, 59];
  }

  getScoreBar(score) {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  addWatermark() {
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      const pageWidth = this.doc.internal.pageSize.getWidth();
      const pageHeight = this.doc.internal.pageSize.getHeight();
      
      this.doc.saveGraphicsState();
      this.doc.setGState(this.doc.GState({ opacity: WATERMARK_OPACITY }));
      this.doc.setTextColor(200, 200, 200);
      this.doc.setFontSize(50);
      this.doc.setFont('helvetica', 'bold');
      
      const angle = -45;
      const x = pageWidth / 2;
      const y = pageHeight / 2;
      
      this.doc.text('FINANTEL', x, y, {
        angle: angle,
        align: 'center',
        baseline: 'middle'
      });
      
      this.doc.restoreGraphicsState();
    }
  }

  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(
        `Página ${i} de ${pageCount} - Finantel DeepFinance™ - Documento confidencial`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  /**
   * Genera y descarga el PDF
   * @param {string} fileName - Nombre del archivo (opcional)
   */
  generateAndDownload(fileName = null) {
    this.generate();
    const defaultFileName = fileName || 
      `Finantel_DeepFinance_${this.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(defaultFileName);
  }
}

export { ReportGenerator };
export default ReportGenerator;

