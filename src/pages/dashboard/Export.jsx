
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Table, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Clock,
  FileArchive,
  ShieldCheck,
  Users,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import {
  exportTransactionsCSV,
  exportTransactionsPDF,
  exportTransactionsExcel,
  exportBudgetsPDF,
  exportAllDataZIP,
  exportAllDataJSON
} from '@/utils/exportUtils';

const ExportCard = ({ title, desc, icon: Icon, formats, delay, onExport, loading }) => {
  const [selectedFormat, setSelectedFormat] = useState(null);

  const handleExport = (format) => {
    setSelectedFormat(format);
    onExport(format);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-[#1C8FA0]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-[#1C8FA0]" />
      </div>
      <h3 className="font-bold text-[#1a1a1a] dark:text-white text-lg mb-2">{title}</h3>
      <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-6 min-h-[40px]">{desc}</p>
      
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {formats.map(fmt => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={loading}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold border transition-all",
                selectedFormat === fmt
                  ? "bg-[#1C8FA0] text-white border-[#1C8FA0]"
                  : "bg-gray-50 dark:bg-white/5 text-[#6E6E73] dark:text-gray-400 border-gray-100 dark:border-white/10 hover:bg-[#1C8FA0]/10 hover:border-[#1C8FA0]/30",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {fmt}
            </button>
          ))}
        </div>
        <Button 
          onClick={() => handleExport(formats[0])}
          disabled={loading}
          className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#1a1a1a] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const Export = () => {
  const { user } = useAuth();
  const { transactions, budgets, goals, categories, loading: dataLoading } = useFinance(user?.id);
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || '';

  const handleExport = async (type, format) => {
    if (dataLoading) {
      toast({
        variant: "destructive",
        title: "Cargando datos",
        description: "Por favor espera a que se carguen todos los datos."
      });
      return;
    }

    setExporting(true);
    try {
      switch (type) {
        case 'transactions':
          if (transactions.length === 0) {
            toast({
              variant: "destructive",
              title: "Sin datos",
              description: "No tienes transacciones para exportar."
            });
            break;
          }
          if (format === 'CSV') {
            exportTransactionsCSV(transactions, userName);
          } else if (format === 'PDF') {
            exportTransactionsPDF(transactions, userName, userEmail);
          } else if (format === 'Excel') {
            exportTransactionsExcel(transactions, userName);
          }
          toast({
            title: "Exportación exitosa",
            description: "Las transacciones se han exportado correctamente."
          });
          break;

        case 'budgets':
          if (budgets.length === 0) {
            toast({
              variant: "destructive",
              title: "Sin datos",
              description: "No tienes presupuestos para exportar."
            });
            break;
          }
          if (format === 'PDF') {
            exportBudgetsPDF(budgets, userName, userEmail);
          } else if (format === 'CSV') {
            const csv = Papa.unparse(budgets);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `Finantel_Presupuestos_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
          }
          toast({
            title: "Exportación exitosa",
            description: "Los presupuestos se han exportado correctamente."
          });
          break;

        case 'backup':
          if (format === 'ZIP') {
            await exportAllDataZIP(transactions, budgets, goals, categories, userName);
          } else if (format === 'JSON') {
            exportAllDataJSON(transactions, budgets, goals, categories, userName);
          }
          toast({
            title: "Exportación exitosa",
            description: "La copia de seguridad se ha generado correctamente."
          });
          break;

        default:
          toast({
            variant: "destructive",
            title: "Error",
            description: "Tipo de exportación no válido."
          });
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        variant: "destructive",
        title: "Error al exportar",
        description: "Hubo un problema al generar el archivo. Por favor intenta de nuevo."
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white font-['Inter_Tight']">Exportar Datos</h1>
          <p className="text-[#6E6E73] dark:text-gray-400 mt-1 text-lg">Descarga tus finanzas en múltiples formatos</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ExportCard 
          title="Transacciones" 
          desc="Historial completo de movimientos con detalles de categoría y fecha." 
          icon={Table} 
          formats={['CSV', 'PDF', 'Excel']} 
          delay={0}
          onExport={(format) => handleExport('transactions', format)}
          loading={exporting}
        />
        <ExportCard 
          title="Presupuestos" 
          desc="Resumen de límites de gasto y ejecución mensual." 
          icon={FileText} 
          formats={['PDF', 'CSV']} 
          delay={0.1}
          onExport={(format) => handleExport('budgets', format)}
          loading={exporting}
        />
        <ExportCard 
          title="Análisis Completo" 
          desc="Reporte detallado con gráficos, tendencias y proyecciones." 
          icon={FileText} 
          formats={['PDF']} 
          delay={0.2}
          onExport={(format) => handleExport('transactions', 'PDF')}
          loading={exporting}
        />
        <ExportCard 
          title="Gastos Compartidos" 
          desc="Liquidaciones y deudas pendientes con tu grupo." 
          icon={Users} 
          formats={['CSV', 'PDF']} 
          delay={0.3}
          onExport={(format) => handleExport('transactions', format)}
          loading={exporting}
        />
        <ExportCard 
          title="Copia de Seguridad" 
          desc="Archivo completo con toda tu información financiera." 
          icon={FileArchive} 
          formats={['ZIP', 'JSON']} 
          delay={0.4}
          onExport={(format) => handleExport('backup', format)}
          loading={exporting}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
          <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-6">Historial de Exportaciones</h3>
          <div className="space-y-4">
            {[
              { name: "Reporte_Mensual_Oct.pdf", date: "21 Oct, 2023", size: "2.4 MB" },
              { name: "Transacciones_2023.csv", date: "15 Oct, 2023", size: "156 KB" },
              { name: "Backup_Full.zip", date: "01 Oct, 2023", size: "12 MB" },
            ].map((file, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[#6E6E73] dark:text-gray-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">{file.name}</p>
                    <p className="text-xs text-[#6E6E73] dark:text-gray-400">{file.date} • {file.size}</p>
                  </div>
                </div>
                <button className="text-sm font-bold text-[#1C8FA0] hover:underline">Descargar</button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1C8FA0]/5 rounded-[26px] p-6 border border-[#1C8FA0]/10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-[#1C8FA0]" />
              <h3 className="font-bold text-[#1a1a1a] dark:text-white">Privacidad y Seguridad</h3>
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4 leading-relaxed">
              Tus datos se exportan de forma segura y encriptada. Finantel no comparte tu información financiera con terceros bajo ninguna circunstancia.
            </p>
            <a href="#" className="text-xs font-bold text-[#1C8FA0] hover:underline">Leer política de privacidad</a>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="font-bold text-[#1a1a1a] dark:text-white mb-4">Exportación Automática</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#6E6E73] dark:text-gray-400">Reporte Mensual (PDF)</span>
              <div className="w-10 h-6 bg-[#1C8FA0] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
              Recibirás un resumen completo en tu correo el día 1 de cada mes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
