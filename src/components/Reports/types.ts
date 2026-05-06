import type { 
  Invoice, 
  Contract, 
  Quotation, 
  Client, 
  ExpenseGroup, 
  Hosting, 
  MonthSection,
  PipelineClient 
} from '../../types';

export interface ReportData {
  invoices: Invoice[];
  contracts: Contract[];
  quotations: Quotation[];
  clients: Client[];
  expenseGroups: ExpenseGroup[];
  hosting: Hosting[];
  months: MonthSection[];
  pipelineClients: PipelineClient[];
}

export interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  module: 'all' | 'invoices' | 'contracts' | 'quotations' | 'clients' | 'expenses' | 'hosting' | 'pipeline';
}

export interface AggregatedStats {
  totalInvoices: number;
  totalContracts: number;
  totalQuotations: number;
  totalClients: number;
  totalExpenses: number;
  totalHosting: number;
  totalRevenue: number; // Sum of relevant amounts
  totalOutstanding: number; // Pending due amounts
}

export type DownloadFormat = 'pdf' | 'csv' | 'excel';

