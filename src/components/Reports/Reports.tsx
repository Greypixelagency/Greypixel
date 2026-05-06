import { FC, useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, DownloadCloud, AlertTriangle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Filters, 
  ReportTable, 
  type FilterState, 
  type ReportData, 
  type AggregatedStats,
  type DownloadFormat
} from '.';
import { Invoice, Contract, Quotation, Client, ExpenseGroup, Hosting, PipelineClient, MonthSection } from '../../types';


const Reports: FC<{ data: ReportData }> = ({ data }) => {
  const [filters, setFilters] = useState<FilterState>({ search: '', dateFrom: '', dateTo: '', module: 'all' });
  const [loading, setLoading] = useState(false);
  const [activeModule, setActiveModule] = useState<'summary' | 'invoices' | 'contracts' | 'quotations' | 'clients' | 'expenses' | 'hosting' | 'pipeline'>('summary');

  useEffect(() => {
    if (filters.module === 'all') {
      setActiveModule('summary');
    } else {
      setActiveModule(filters.module as any);
    }
  }, [filters.module]);

  const filteredData = useMemo(() => {
    const { search, dateFrom, dateTo, module } = filters;
    const now = new Date().toISOString().split('T')[0];

    const filterItem = (item: any, dateField: string, clientField?: string): boolean => {
      // Date filter
      if (dateFrom && item[dateField] < dateFrom) return false;
      if (dateTo && item[dateField] > dateTo) return false;
      
      // Search filter
      if (search) {
        const searchable = [
          item[clientField || 'name']?.toLowerCase(),
          item.scope?.toLowerCase(),
          item.service?.toLowerCase()
        ].filter(Boolean).join(' ');
        if (!searchable.includes(search.toLowerCase())) return false;
      }
      
      return true;
    };

    return {
      invoices: data.invoices.filter(i => module === 'all' || module === 'invoices')?.filter(i => filterItem(i, 'createdAt', 'clientName')) || [],
      contracts: data.contracts.filter(c => module === 'all' || module === 'contracts')?.filter(c => filterItem(c, 'contractDate', 'clientName')) || [],
      quotations: data.quotations.filter(q => module === 'all' || module === 'quotations')?.filter(q => filterItem(q, 'date', 'clientName')) || [],
      clients: data.clients.filter(cl => module === 'all' || module === 'clients')?.filter(cl => filterItem(cl, 'date', 'name')) || [],
      expenseGroups: data.expenseGroups.filter(eg => module === 'all' || module === 'expenses') || [],
      hosting: data.hosting.filter(h => module === 'all' || module === 'hosting')?.filter(h => filterItem(h, 'createdDate')) || [],
      pipelineClients: data.pipelineClients.filter(p => module === 'all' || module === 'pipeline')?.filter(p => filterItem(p, 'createdAt', 'name')) || [],
      months: data.months
    };
  }, [data, filters]);

  const stats: AggregatedStats = useMemo(() => {
    const totalRevenue = filteredData.invoices.reduce((sum, i) => sum + i.dueAmount, 0) +
                        filteredData.contracts.reduce((sum, c) => sum + c.amount, 0) +
                        filteredData.quotations.reduce((sum, q) => sum + q.totalCost, 0) +
                        filteredData.clients.reduce((sum, cl) => sum + cl.amount, 0) +
                        filteredData.hosting.reduce((sum, h) => sum + h.amount, 0);

    const totalOutstanding = filteredData.invoices.reduce((sum, i) => {
      const paid = i.payments?.reduce((pSum, p) => pSum + p.amount, 0) || 0;
      return sum + (i.dueAmount - paid);
    }, 0);

    return {
      totalInvoices: filteredData.invoices.length,
      totalContracts: filteredData.contracts.length,
      totalQuotations: filteredData.quotations.length,
      totalClients: filteredData.clients.length,
      totalExpenses: filteredData.expenseGroups.reduce((sum, g) => sum + g.expenses.length, 0),
      totalHosting: filteredData.hosting.length,
      totalRevenue,
      totalOutstanding
    };
  }, [filteredData]);

  const handleDownload = useCallback(async (format: DownloadFormat) => {
    setLoading(true);
    try {
      if (format === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text('Greypixel Agency - Report', 14, 20);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Type: ${activeModule.toUpperCase()}`, 14, 37);
        
        const exportModules = activeModule === 'summary' 
          ? ['invoices', 'contracts', 'quotations', 'clients', 'expenses', 'hosting', 'pipeline'] as const
          : [activeModule] as const;

        let lastY = 45;

        for (const mod of exportModules) {
          const data = mod === 'expenses' ? flattenExpenses(filteredData.expenseGroups) : (filteredData as any)[mod === 'pipeline' ? 'pipelineClients' : mod];
          if (!data || data.length === 0) continue;

          if (lastY > 230) {
            doc.addPage();
            lastY = 20;
          }

          doc.setFontSize(16);
          doc.setTextColor(0);
          doc.text(mod.charAt(0).toUpperCase() + mod.slice(1), 14, lastY);
          
          (autoTable as any)(doc, {
            startY: lastY + 5,
            head: [getColumns(mod)],
            body: data.map((item: any) => getRowCellsPlain(item, mod)),
            theme: 'striped',
            headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
          });
          
          lastY = (doc as any).lastAutoTable.finalY + 15;
        }
        
        doc.save(`greypixel-${activeModule}-report-${new Date().toISOString().slice(0,10)}.pdf`);
      } else if (format === 'csv') {
        const { default: Papa } = await import('papaparse');
        let data: any[] = [];
        
        if (activeModule === 'summary') {
          data = [
            ...filteredData.invoices.map(i => ({ ...i, type: 'Invoice' })),
            ...filteredData.contracts.map(c => ({ ...c, type: 'Contract' })),
            ...filteredData.quotations.map(q => ({ ...q, type: 'Quotation' })),
            ...filteredData.clients.map(cl => ({ ...cl, type: 'Client' })),
            ...flattenExpenses(filteredData.expenseGroups).map(e => ({ ...e, type: 'Expense' })),
            ...filteredData.hosting.map(h => ({ ...h, type: 'Hosting' })),
            ...filteredData.pipelineClients.map(p => ({ ...p, type: 'Pipeline' }))
          ];
        } else {
          data = activeModule === 'expenses' ? flattenExpenses(filteredData.expenseGroups) : (filteredData as any)[activeModule === 'pipeline' ? 'pipelineClients' : activeModule];
        }
        
        const csv = Papa.unparse(data);
        downloadFile(csv, `greypixel-${activeModule}-report.csv`, 'text/csv');
      } else if (format === 'excel') {
        const { utils, writeFile } = await import('xlsx');
        const wb = utils.book_new();
        
        if (activeModule === 'summary') {
          const modules = ['invoices', 'contracts', 'quotations', 'clients', 'expenses', 'hosting', 'pipeline'] as const;
          modules.forEach(mod => {
            const data = mod === 'expenses' ? flattenExpenses(filteredData.expenseGroups) : (filteredData as any)[mod === 'pipeline' ? 'pipelineClients' : mod];
            if (data && data.length > 0) {
              const ws = utils.json_to_sheet(data);
              utils.book_append_sheet(wb, ws, mod.charAt(0).toUpperCase() + mod.slice(1));
            }
          });
        } else {
          const data = activeModule === 'expenses' ? flattenExpenses(filteredData.expenseGroups) : (filteredData as any)[activeModule === 'pipeline' ? 'pipelineClients' : activeModule];
          if (data && data.length > 0) {
            const ws = utils.json_to_sheet(data);
            utils.book_append_sheet(wb, ws, activeModule.charAt(0).toUpperCase() + activeModule.slice(1));
          }
        }
        
        writeFile(wb, `greypixel-${activeModule}-report-${new Date().toISOString().slice(0,10)}.xlsx`);
      }
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch (error) {
      toast.error('Download failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filteredData, filters, stats, activeModule]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Reports</h1>
          <p className="text-gray-400 font-medium mt-1">Comprehensive overview of all modules with filtering and export options</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={loading}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
          >
            <DownloadCloud size={18} />
            {loading ? 'Generating...' : 'PDF'}
          </button>
          <button
            onClick={() => handleDownload('csv')}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
          >
            <Download size={18} />
            CSV
          </button>
          <button
            onClick={() => handleDownload('excel')}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
          >
            <Download size={18} />
            Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <Filters filters={filters} onFilterChange={setFilters} />

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <SummaryCard title="Total Revenue" value={`PKR ${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-8 h-8" />} />
        <SummaryCard title="Outstanding" value={`PKR ${stats.totalOutstanding.toLocaleString()}`} icon={<AlertTriangle className="w-8 h-8 text-amber-500" />} />
        <SummaryCard title="Invoices" value={stats.totalInvoices.toString()} icon={<FileText className="w-8 h-8" />} />
        <SummaryCard title="Contracts" value={stats.totalContracts.toString()} icon={<FileText className="w-8 h-8" />} />
      </motion.div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100">
        {[
          { key: 'summary' as const, label: 'Summary', icon: '📊' },
          { key: 'invoices' as const, label: 'Invoices', icon: '💰' },
          { key: 'contracts' as const, label: 'Contracts', icon: '📄' },
          { key: 'quotations' as const, label: 'Quotations', icon: '📋' },
          { key: 'clients' as const, label: 'Clients', icon: '👥' },
          { key: 'expenses' as const, label: 'Expenses', icon: '💸' },
          { key: 'hosting' as const, label: 'Hosting', icon: '🌐' },
          { key: 'pipeline' as const, label: 'Pipeline', icon: '🚀' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveModule(key);
              setFilters(prev => ({ ...prev, module: key === 'summary' ? 'all' : (key as any) }));
            }}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all shadow-sm ${
              activeModule === key
                ? 'bg-gray-900 text-white shadow-gray-300'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-100'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeModule === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <ReportTable title="Invoices" data={filteredData.invoices} type="invoices" />
            <ReportTable title="Contracts" data={filteredData.contracts} type="contracts" />
          </motion.div>
        )}
        {activeModule === 'invoices' && (
          <motion.div key="invoices" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ReportTable title="Invoices" data={filteredData.invoices} type="invoices" />
          </motion.div>
        )}
        {/* Add similar for other modules */}
        {activeModule === 'contracts' && (
          <motion.div key="contracts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ReportTable title="Contracts" data={filteredData.contracts} type="contracts" />
          </motion.div>
        )}
        {activeModule === 'quotations' && (
          <motion.div key="quotations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ReportTable title="Quotations" data={filteredData.quotations} type="quotations" />
          </motion.div>
        )}
        {activeModule === 'clients' && (
          <motion.div key="clients" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ReportTable title="Clients" data={filteredData.clients} type="clients" />
          </motion.div>
        )}
        {activeModule === 'expenses' && (
          <motion.div key="expenses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ReportTable title="Expenses" data={flattenExpenses(filteredData.expenseGroups)} type="expenses" />
          </motion.div>
        )}
        {activeModule === 'hosting' && (
          <motion.div key="hosting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ReportTable title="Hosting" data={filteredData.hosting} type="hosting" />
          </motion.div>
        )}
        {activeModule === 'pipeline' && (
          <motion.div key="pipeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ReportTable title="Pipeline Clients" data={filteredData.pipelineClients} type="pipeline" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

const SummaryCard = ({ title, value, icon }: SummaryCardProps) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-gray-900 rounded-xl text-white group-hover:scale-105 transition-transform">
        {icon}
      </div>
    </div>
    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
    <p className="text-3xl font-black text-gray-900">{value}</p>
  </motion.div>
);

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const flattenExpenses = (groups: ExpenseGroup[]): any[] => 
  groups.flatMap(g => g.expenses.map(e => ({ ...e, group: g.name })));

const getColumns = (type: string) => {
  const columns = {
    invoices: ['Invoice #', 'Client', 'Date', 'Amount', 'Due', 'Status'],
    contracts: ['Client', 'Date', 'Amount', 'Status'],
    quotations: ['Client', 'Date', 'Total', 'Upfront %', 'Status'],
    clients: ['Client', 'Status', 'Amount', 'Due Date'],
    expenses: ['Group', 'Expense', 'Amount'],
    hosting: ['Domain', 'Amount', 'Due Date', 'Status'],
    pipeline: ['Client', 'Status', 'Follow-up']
  };
  return (columns as any)[type] || [];
};

const getRowCellsPlain = (item: any, type: string) => {
  switch (type) {
    case 'invoices':
      return [
        item.invoiceNumber, 
        item.clientName, 
        item.createdAt?.split('T')[0] || '-', 
        `${item.currency || 'PKR'} ${item.dueAmount?.toLocaleString() || '0'}`, 
        `${item.currency || 'PKR'} ${(item.dueAmount - (item.payments?.reduce((s:any, p:any) => s + p.amount, 0) || 0)).toLocaleString()}`, 
        item.status || 'Pending'
      ];
    case 'contracts':
      return [item.clientName, item.contractDate, `${item.currency} ${item.amount.toLocaleString()}`, item.status];
    case 'quotations':
      return [item.clientName, item.date, `${item.currency || 'PKR'} ${item.totalCost.toLocaleString()}`, `${item.upfrontPercentage}%`, 'Pending'];
    case 'clients':
      return [item.name, item.status, `${item.currency || 'PKR'} ${item.amount.toLocaleString()}`, item.dueDate];
    case 'expenses':
      return [item.group, item.name, `${item.amount?.toLocaleString()} PKR`];
    case 'hosting':
      return [item.domain, `${item.amount.toLocaleString()} PKR`, item.dueDate, item.paymentStatus];
    case 'pipeline':
      return [item.name, item.status, `${item.followUpPeriod} days`];
    default:
      return [];
  }
};

export default Reports;

