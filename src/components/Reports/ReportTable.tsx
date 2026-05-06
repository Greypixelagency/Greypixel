import { FC, ReactNode } from 'react';
import { 
  DollarSign, 
  FileText, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Download 
} from 'lucide-react';
import { Invoice, Contract, Quotation, Client, ExpenseGroup, Hosting, PipelineClient } from '../../types';

interface ReportTableProps {
  title: string;
  data: any[];
  type: 'invoices' | 'contracts' | 'quotations' | 'clients' | 'expenses' | 'hosting' | 'pipeline';
  onRowClick?: (item: any) => void;
}

const getColumns = (type: ReportTableProps['type']) => {
  const columns = {
    invoices: ['Invoice #', 'Client', 'Date', 'Amount', 'Due', 'Status'],
    contracts: ['Client', 'Date', 'Amount', 'Status'],
    quotations: ['Client', 'Date', 'Total', 'Upfront %', 'Status'],
    clients: ['Client', 'Status', 'Amount', 'Due Date'],
    expenses: ['Group', 'Expense', 'Amount'],
    hosting: ['Domain', 'Amount', 'Due Date', 'Status'],
    pipeline: ['Client', 'Status', 'Follow-up']
  };
  return columns[type] || [];
};

const getStatusColor = (status: string, type: ReportTableProps['type']) => {
  const colors: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700',
    Paid: 'bg-emerald-50 text-emerald-700',
    Signed: 'bg-emerald-50 text-emerald-700',
    Active: 'bg-emerald-50 text-emerald-700',
    'Leads Closed': 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
    Draft: 'bg-gray-50 text-gray-500',
    'In Progress': 'bg-blue-50 text-blue-700'
  };
  return colors[status] || 'bg-gray-50 text-gray-500';
};

export const ReportTable: FC<ReportTableProps> = ({ title, data, type, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-12 border border-dashed border-gray-200 text-center">
        <AlertCircle className="mx-auto text-gray-300 mb-4 w-12 h-12" />
        <p className="text-gray-400 font-bold text-lg">No {title.toLowerCase()} found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
          {getIconForType(type)}
          {title}
          <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full">
            {data.length}
          </span>
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              {getColumns(type).map((col, i) => (
                <th 
                  key={i} 
                  className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-left"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.slice(0, 10).map((item, i) => (
              <tr 
                key={item.id || i} 
                className="hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 group"
                onClick={() => onRowClick?.(item)}
              >
                {getRowCells(item, type).map((cell, j) => (
                  <td key={j} className="px-6 py-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length > 10 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500">Showing first 10 of {data.length} {title.toLowerCase()}...</p>
        </div>
      )}
    </div>
  );
};

const getIconForType = (type: ReportTableProps['type']) => {
  const icons = {
    invoices: <DollarSign className="w-5 h-5" />,
    contracts: <FileText className="w-5 h-5" />,
    quotations: <FileText className="w-5 h-5" />,
    clients: <User className="w-5 h-5" />,
    expenses: <DollarSign className="w-5 h-5" />,
    hosting: <DollarSign className="w-5 h-5" />,
    pipeline: <User className="w-5 h-5" />
  };
  return icons[type];
};

const getRowCells = (item: any, type: ReportTableProps['type']) => {
  const cells: (string | JSX.Element)[] = [];
  
  switch (type) {
    case 'invoices':
      cells.push(item.invoiceNumber, item.clientName, item.createdAt?.split('T')[0] || '-', 
                 `${item.currency || 'PKR'} ${item.dueAmount?.toLocaleString() || '0'}`, 
                 <span key="status" className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status || 'Pending', type)}`}>
                   {item.status || 'Pending'}
                 </span>);
      break;
    case 'contracts':
      cells.push(item.clientName, item.contractDate, 
                 `${item.currency} ${item.amount.toLocaleString()}`, 
                 <span key="status" className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status, type)}`}>
                   {item.status}
                 </span>);
      break;
    case 'quotations':
      cells.push(item.clientName, item.date, 
                 `${item.currency || 'PKR'} ${item.totalCost.toLocaleString()}`, 
                 `${item.upfrontPercentage}%`,
                 <span key="status" className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor('Pending', type)}`}>
                   Quote
                 </span>);
      break;
    case 'clients':
      cells.push(item.name, 
                 <span key="status" className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status, type)}`}>
                   {item.status}
                 </span>,
                 `${item.currency || 'PKR'} ${item.amount.toLocaleString()}`, item.dueDate);
      break;
    case 'expenses':
      cells.push(item.name || 'Unnamed Group', '-', `${item.amount?.toLocaleString()} PKR`);
      break;
    case 'hosting':
      cells.push(item.domain, `${item.amount.toLocaleString()} PKR`, item.dueDate,
                 <span key="status" className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item.paymentStatus || 'Pending', type)}`}>
                   {item.paymentStatus}
                 </span>);
      break;
    case 'pipeline':
      cells.push(item.name, item.status, `${item.followUpPeriod} days`);
      break;
  }
  
  return cells;
};

