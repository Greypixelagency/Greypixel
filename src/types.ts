export type Status = 'Completed' | 'Pending' | 'In Progress';
export type ProjectStatus = 'Pending' | 'In Progress' | 'Client Review' | 'Revisions' | 'Completed';
export type PaymentStatus = 'Pending' | 'Paid';
export type InvoiceStatus = 'Pending' | 'Completed';
export type HostingPeriod = '1 Month' | '3 Months' | '6 Months' | '1 Year' | 'None' | 'Custom';

export interface Task {
  id: string;
  text: string;
  status: Status;
}

export type UserRole = 'Admin' | 'Tasks' | 'Projects' | 'Pipeline';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

export interface DaySection {
  id: string;
  day: string;
  tasks: Task[];
  isExpanded: boolean;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  cost: number;
  received: number;
  expressExpense: number;
  paymentStatus: PaymentStatus;
}

export interface MonthSection {
  id: string;
  month: string;
  projects: Project[];
  isExpanded: boolean;
}

export interface Hosting {
  id: string;
  domain: string;
  amount: number;
  createdDate: string;
  dueDate: string;
  period: HostingPeriod;
  paymentStatus: PaymentStatus;
  invoiceStatus: InvoiceStatus;
}

export type PipelineStatus = 'Pending' | 'Discuss' | 'Leads Closed';
export type FollowUpStatus = 'Followed' | 'Pending';

export interface PipelineClient {
  id: string;
  name: string;
  scope: string;
  status: PipelineStatus;
  followUpPeriod: number; // 1 to 7 days
  followUpStatus: FollowUpStatus;
  createdAt: string;
  reminderSent?: boolean;
}

export interface QuotationItem {
  id: string;
  scope: string;
  cost?: number; // Make cost optional for flexible pricing
}

export interface Quotation {
  id: string;
  clientName: string;
  clientBusinessName: string;
  clientAddress: string;
  companyName: string;
  companyAddress: string;
  items: QuotationItem[];
  totalCost: number;
  upfrontPercentage: number;
  upfrontAmount: number;
  currency: string;
  notes?: string;
  paymentMethod?: string; // New field
  date: string;
}

export interface Contract {
  id: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  contactRole: string;
  contactEmail: string;
  contractDate: string;
  amount: number;
  currency: string;
  howWeWork: string;
  terms: string;
  note?: string;
  version: number;
  status: 'Draft' | 'Sent' | 'Signed' | 'Expired' | 'Pending';
  companySignature?: string;
  clientSignature?: string;
  template: string;
}

export interface Client {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  scope: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  isAutoCycle: boolean;
}

export interface Reminder {
  id: string;
  clientId: string;
  clientName: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface InvoiceService {
  id: string;
  service: string;
  cost: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  clientName: string;
  clientBusinessName: string;
  clientAddress: string;
  companyName: string;
  companyAddress: string;
  services: InvoiceService[];
  subTotal: number;
  upfrontPercentage: number;
  upfrontAmount: number;
  dueAmount: number;
  paymentMethod: string;
  notes?: string;
  currency: string;
  createdAt: string;
}

export interface SavedPaymentMethod {
  id: string;
  method: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  expenses: Expense[];
  isClosed: boolean;
}
