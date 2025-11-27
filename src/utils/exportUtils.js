import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// Excel export - usando una alternativa si xlsx no está disponible
let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.warn('xlsx no está instalado. La exportación a Excel no estará disponible.');
}

const BRAND_COLOR = '#1C8FA0';
const WATERMARK_OPACITY = 0.1;

// Función para agregar marca de agua a PDF
const addWatermark = (doc, text = 'FINANTEL - CONFIDENCIAL') => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Marca de agua diagonal
    doc.saveGraphicsState();
    doc.setGState(doc.GState({ opacity: WATERMARK_OPACITY }));
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    
    // Rotar texto diagonalmente
    const angle = -45;
    const x = pageWidth / 2;
    const y = pageHeight / 2;
    
    doc.text(text, x, y, {
      angle: angle,
      align: 'center',
      baseline: 'middle'
    });
    
    doc.restoreGraphicsState();
  }
};

// Función para agregar advertencia legal
const addLegalWarning = (doc, userName, yPosition) => {
  doc.setFontSize(8);
  doc.setTextColor(150, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('ADVERTENCIA LEGAL - USO RESTRINGIDO', 14, yPosition);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  
  const warningText = [
    `Este documento es una exportación generada por Finantel para uso personal y control financiero de ${userName}.`,
    'Cualquier divulgación, distribución o uso de esta información con fines distintos a los personales',
    'está estrictamente prohibido y puede acarrear sanciones legales según las leyes de protección de datos.',
    'Este documento contiene información financiera confidencial y privada.',
    'Finantel se reserva el derecho de tomar acciones legales contra cualquier uso indebido de esta información.'
  ];
  
  let currentY = yPosition + 5;
  warningText.forEach((line, index) => {
    doc.text(line, 14, currentY, { maxWidth: 182 });
    currentY += 4;
  });
  
  return currentY;
};

// --- CSV Export con estructura detallada ---
export const exportTransactionsCSV = (transactions, userName) => {
  const csvData = transactions.map(t => ({
    'ID Transacción': t.id,
    'Fecha': new Date(t.date).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }),
    'Hora': t.created_at ? new Date(t.created_at).toLocaleTimeString('es-ES') : 'N/A',
    'Descripción': t.description || 'Sin descripción',
    'Categoría': t.categories?.name || 'Sin categoría',
    'Tipo': t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Transferencia',
    'Monto': parseFloat(t.amount).toFixed(2),
    'Moneda': t.currency || 'USD',
    'Método de Pago': t.payment_method || 'No especificado',
    'Número de Referencia': t.reference_number || 'N/A',
    'Es Recurrente': t.is_recurring ? 'Sí' : 'No',
    'Frecuencia': t.recurring_frequency || 'N/A',
    'Etiquetas': t.tags?.join(', ') || 'Ninguna',
    'Fecha de Creación': t.created_at ? new Date(t.created_at).toLocaleString('es-ES') : 'N/A',
    'Última Actualización': t.updated_at ? new Date(t.updated_at).toLocaleString('es-ES') : 'N/A'
  }));

  // Agregar encabezado con información de Finantel
  const header = [
    '═══════════════════════════════════════════════════════════════════════════════',
    '                    EXPORTACIÓN FINANCIERA - FINANTEL',
    '═══════════════════════════════════════════════════════════════════════════════',
    '',
    `Usuario: ${userName}`,
    `Fecha de Exportación: ${new Date().toLocaleString('es-ES')}`,
    `Total de Transacciones: ${transactions.length}`,
    '',
    'ADVERTENCIA LEGAL:',
    'Este archivo es una exportación generada por Finantel para uso personal y control financiero.',
    'Cualquier divulgación, distribución o uso de esta información con fines distintos a los personales',
    'está estrictamente prohibido y puede acarrear sanciones legales.',
    'Este documento contiene información financiera confidencial y privada.',
    '',
    '═══════════════════════════════════════════════════════════════════════════════',
    ''
  ];

  const csv = Papa.unparse(csvData);
  const fullCsv = header.join('\n') + '\n' + csv;
  const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `Finantel_Transacciones_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
};

// --- PDF Export con marca de agua y estructura elegante ---
export const exportTransactionsPDF = (transactions, userName, userEmail) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === PORTADA ===
  // Header con gradiente
  doc.setFillColor(28, 143, 160); // Finantel Teal
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANTEL', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte Financiero Detallado', pageWidth / 2, 35, { align: 'center' });
  doc.text('Exportación de Datos Personales', pageWidth / 2, 42, { align: 'center' });

  // Información del usuario
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL USUARIO', 14, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${userName}`, 14, 75);
  doc.text(`Correo Electrónico: ${userEmail}`, 14, 82);
  doc.text(`Fecha de Exportación: ${new Date().toLocaleString('es-ES')}`, 14, 89);
  doc.text(`Total de Transacciones: ${transactions.length}`, 14, 96);

  // Resumen financiero
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RESUMEN FINANCIERO', 14, 110);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total Ingresos: $${totalIncome.toFixed(2)}`, 14, 120);
  doc.text(`Total Gastos: $${totalExpense.toFixed(2)}`, 14, 127);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 143, 160);
  doc.text(`Balance Neto: $${balance.toFixed(2)}`, 14, 134);

  // Advertencia legal
  const warningY = addLegalWarning(doc, userName, 150);

  // Footer de portada
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generado por Finantel - finantel.app', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Documento confidencial - Uso personal exclusivo', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Agregar marca de agua a la portada
  addWatermark(doc, 'FINANTEL - CONFIDENCIAL');

  // === PÁGINAS DE TRANSACCIONES ===
  if (transactions.length > 0) {
    doc.addPage();
    
    // Agrupar por mes
    const transactionsByMonth = {};
    transactions.forEach(t => {
      const monthKey = new Date(t.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      if (!transactionsByMonth[monthKey]) {
        transactionsByMonth[monthKey] = [];
      }
      transactionsByMonth[monthKey].push(t);
    });

    Object.keys(transactionsByMonth).sort().forEach((month, monthIndex) => {
      if (monthIndex > 0) {
        doc.addPage();
      }

      const monthTransactions = transactionsByMonth[month];
      
      // Header del mes
      doc.setFillColor(28, 143, 160);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(month.toUpperCase(), pageWidth / 2, 12, { align: 'center' });
      
      const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
      const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
      doc.setFontSize(10);
      doc.text(`Ingresos: $${monthIncome.toFixed(2)} | Gastos: $${monthExpense.toFixed(2)} | Balance: $${(monthIncome - monthExpense).toFixed(2)}`, pageWidth / 2, 18, { align: 'center' });

      // Tabla de transacciones del mes
      const tableColumn = ["Fecha", "Descripción", "Categoría", "Tipo", "Monto", "Método"];
      const tableRows = [];

      monthTransactions.forEach(t => {
        const transactionData = [
          new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
          (t.description || 'Sin descripción').substring(0, 30),
          (t.categories?.name || 'N/A').substring(0, 20),
          t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Transferencia',
          `$${parseFloat(t.amount).toFixed(2)}`,
          (t.payment_method || 'N/A').substring(0, 15)
        ];
        tableRows.push(transactionData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        theme: 'grid',
        headStyles: { 
          fillColor: [28, 143, 160],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 247, 249] },
        styles: { fontSize: 8 },
        margin: { top: 25, right: 14, bottom: 30, left: 14 }
      });

      // Agregar marca de agua
      addWatermark(doc, 'FINANTEL - CONFIDENCIAL');

      // Footer en cada página
      const finalY = doc.lastAutoTable.finalY || 250;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Usuario: ${userName} | Página ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('Finantel - finantel.app | Documento confidencial', pageWidth / 2, pageHeight - 5, { align: 'center' });
    });
  }

  // Agregar marca de agua a todas las páginas
  addWatermark(doc, 'FINANTEL - CONFIDENCIAL');

  doc.save(`Finantel_Reporte_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// --- Excel Export ---
export const exportTransactionsExcel = (transactions, userName) => {
  if (!XLSX) {
    throw new Error('La exportación a Excel requiere la librería xlsx. Por favor instala: npm install xlsx');
  }
  
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Información y Resumen
  const summaryData = [
    ['════════════════════════════════════════════════════════════════'],
    ['                    EXPORTACIÓN FINANCIERA - FINANTEL'],
    ['════════════════════════════════════════════════════════════════'],
    [''],
    ['INFORMACIÓN DEL USUARIO'],
    [`Nombre: ${userName}`],
    [`Fecha de Exportación: ${new Date().toLocaleString('es-ES')}`],
    [`Total de Transacciones: ${transactions.length}`],
    [''],
    ['RESUMEN FINANCIERO'],
    [`Total Ingresos: $${transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0).toFixed(2)}`],
    [`Total Gastos: $${transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0).toFixed(2)}`],
    [`Balance Neto: $${(transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) - transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)).toFixed(2)}`],
    [''],
    ['ADVERTENCIA LEGAL'],
    ['Este archivo es una exportación generada por Finantel para uso personal y control financiero.'],
    ['Cualquier divulgación, distribución o uso de esta información con fines distintos a los personales'],
    ['está estrictamente prohibido y puede acarrear sanciones legales.'],
    ['Este documento contiene información financiera confidencial y privada.'],
    [''],
    ['════════════════════════════════════════════════════════════════']
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Información');

  // Hoja 2: Transacciones Detalladas
  const transactionsData = transactions.map(t => ({
    'ID': t.id,
    'Fecha': new Date(t.date).toLocaleDateString('es-ES'),
    'Hora': t.created_at ? new Date(t.created_at).toLocaleTimeString('es-ES') : 'N/A',
    'Descripción': t.description || 'Sin descripción',
    'Categoría': t.categories?.name || 'Sin categoría',
    'Tipo': t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Transferencia',
    'Monto': parseFloat(t.amount),
    'Moneda': t.currency || 'USD',
    'Método de Pago': t.payment_method || 'No especificado',
    'Referencia': t.reference_number || 'N/A',
    'Recurrente': t.is_recurring ? 'Sí' : 'No',
    'Frecuencia': t.recurring_frequency || 'N/A',
    'Etiquetas': t.tags?.join(', ') || 'Ninguna',
    'Creado': t.created_at ? new Date(t.created_at).toLocaleString('es-ES') : 'N/A',
    'Actualizado': t.updated_at ? new Date(t.updated_at).toLocaleString('es-ES') : 'N/A'
  }));

  const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transacciones');

  // Guardar
  XLSX.writeFile(workbook, `Finantel_Transacciones_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// --- Presupuestos PDF ---
export const exportBudgetsPDF = (budgets, userName, userEmail) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(28, 143, 160);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANTEL', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Presupuestos', pageWidth / 2, 30, { align: 'center' });

  // Información del usuario
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.text(`Usuario: ${userName}`, 14, 50);
  doc.text(`Correo: ${userEmail}`, 14, 57);
  doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 14, 64);

  // Tabla de presupuestos
  const tableColumn = ["Categoría", "Límite", "Gastado", "Disponible", "Estado"];
  const tableRows = budgets.map(b => [
    b.categories?.name || 'N/A',
    `$${parseFloat(b.limit_amount).toFixed(2)}`,
    `$${parseFloat(b.spent_amount || 0).toFixed(2)}`,
    `$${(parseFloat(b.limit_amount) - parseFloat(b.spent_amount || 0)).toFixed(2)}`,
    parseFloat(b.spent_amount || 0) > parseFloat(b.limit_amount) ? 'Excedido' : 'Dentro del límite'
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 75,
    theme: 'grid',
    headStyles: { fillColor: [28, 143, 160] }
  });

  addLegalWarning(doc, userName, doc.lastAutoTable.finalY + 10);
  addWatermark(doc, 'FINANTEL - CONFIDENCIAL');

  doc.save(`Finantel_Presupuestos_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// --- ZIP Backup Completo ---
export const exportAllDataZIP = async (transactions, budgets, goals, categories, userName) => {
  const zip = new JSZip();

  // Crear README con advertencia legal
  const readme = `════════════════════════════════════════════════════════════════
                    EXPORTACIÓN COMPLETA - FINANTEL
════════════════════════════════════════════════════════════════

Usuario: ${userName}
Fecha de Exportación: ${new Date().toLocaleString('es-ES')}

ADVERTENCIA LEGAL:
Este archivo es una exportación generada por Finantel para uso personal y control financiero.
Cualquier divulgación, distribución o uso de esta información con fines distintos a los personales
está estrictamente prohibido y puede acarrear sanciones legales según las leyes de protección de datos.
Este documento contiene información financiera confidencial y privada.
Finantel se reserva el derecho de tomar acciones legales contra cualquier uso indebido.

CONTENIDO DEL BACKUP:
- transactions.csv: Todas las transacciones financieras
- budgets.csv: Presupuestos y límites de gasto
- goals.csv: Metas financieras
- categories.csv: Categorías personalizadas

════════════════════════════════════════════════════════════════
Generado por Finantel - finantel.app
Documento confidencial - Uso personal exclusivo
════════════════════════════════════════════════════════════════
`;

  zip.file('README.txt', readme);

  // Agregar CSVs
  if (transactions.length > 0) {
    const txCsv = Papa.unparse(transactions);
    zip.file('transactions.csv', txCsv);
  }

  if (budgets.length > 0) {
    const budgetCsv = Papa.unparse(budgets);
    zip.file('budgets.csv', budgetCsv);
  }

  if (goals.length > 0) {
    const goalsCsv = Papa.unparse(goals);
    zip.file('goals.csv', goalsCsv);
  }

  if (categories.length > 0) {
    const categoriesCsv = Papa.unparse(categories);
    zip.file('categories.csv', categoriesCsv);
  }

  // Generar ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `Finantel_Backup_Completo_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`);
};

// --- JSON Export ---
export const exportAllDataJSON = (transactions, budgets, goals, categories, userName) => {
  const data = {
    metadata: {
      exportDate: new Date().toISOString(),
      userName: userName,
      generatedBy: 'Finantel',
      version: '2.1',
      warning: 'Este archivo es una exportación generada por Finantel para uso personal y control financiero. Cualquier divulgación, distribución o uso de esta información con fines distintos a los personales está estrictamente prohibido y puede acarrear sanciones legales.'
    },
    data: {
      transactions: transactions,
      budgets: budgets,
      goals: goals,
      categories: categories
    }
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, `Finantel_Backup_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
};
