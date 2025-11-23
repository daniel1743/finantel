
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

const BRAND_COLOR = '#1C8FA0';

// --- CSV Export ---
export const exportTransactionsCSV = (transactions) => {
  const csvData = transactions.map(t => ({
    Date: new Date(t.date).toLocaleDateString(),
    Description: t.description,
    Amount: t.amount,
    Type: t.type,
    Category: t.categories?.name || 'Uncategorized',
    PaymentMethod: t.payment_method || 'Cash'
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `finantel_transactions_${new Date().toISOString().split('T')[0]}.csv`);
};

// --- PDF Export ---
export const exportTransactionsPDF = (transactions, userEmail) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(28, 143, 160); // Finantel Teal
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("FINANTEL", 14, 20);
  doc.setFontSize(10);
  doc.text("Reporte Financiero Detallado", 14, 28);
  doc.text(`Generado para: ${userEmail}`, 14, 34);

  // Summary
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.text(`Total Ingresos: $${totalIncome.toFixed(2)}`, 14, 55);
  doc.text(`Total Gastos: $${totalExpense.toFixed(2)}`, 80, 55);
  doc.text(`Balance Neto: $${(totalIncome - totalExpense).toFixed(2)}`, 150, 55);

  // Table
  const tableColumn = ["Fecha", "Descripción", "Categoría", "Tipo", "Monto"];
  const tableRows = [];

  transactions.forEach(t => {
    const transactionData = [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.categories?.name || 'N/A',
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      `$${t.amount}`
    ];
    tableRows.push(transactionData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 65,
    theme: 'grid',
    headStyles: { fillColor: [28, 143, 160] },
  });

  // Footer Watermark
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Generado por Finantel AI - finantel.app', 14, 285);
  }

  doc.save(`finantel_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// --- ZIP Export ---
export const exportAllDataZIP = async (transactions, budgets, goals) => {
  const zip = new JSZip();

  // Add CSVs
  const txCsv = Papa.unparse(transactions);
  zip.file("transactions.csv", txCsv);

  const budgetCsv = Papa.unparse(budgets);
  zip.file("budgets.csv", budgetCsv);

  // Generate Zip
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "finantel_full_backup.zip");
};
