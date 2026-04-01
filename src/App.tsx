import { useState, useEffect, ReactNode, FC, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { supabase } from './lib/supabase';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  X,
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  Search,
  Settings,
  Bell,
  User,
  UserPlus,
  Edit,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  Menu,
  ChevronLeft,
  MessageSquare,
  Send,
  Globe,
  DollarSign,
  FileText,
  LogOut,
  Bold,
  List,
  Users,
  Lock,
  ClipboardList,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { Project, Task, Status, DaySection, User as UserType, ProjectStatus, PaymentStatus, MonthSection, Hosting, HostingPeriod, InvoiceStatus, Contract, PipelineClient, PipelineStatus, FollowUpStatus, UserRole, Quotation, QuotationItem, Client, Reminder, Invoice, InvoiceService, Expense, ExpenseGroup } from './types';

const STORAGE_KEY = 'greypixel_dashboard_v2';
const DAYS_STORAGE_KEY = 'greypixel_days_v1';
const USERS_STORAGE_KEY = 'greypixel_users_v2'; // Bumped version for password support
const PIPELINE_STORAGE_KEY = 'greypixel_pipeline_v1';
const CURRENT_USER_KEY = 'greypixel_current_user_v1';
const QUOTATIONS_STORAGE_KEY = 'greypixel_quotations_v1';
const CLIENTS_STORAGE_KEY = 'greypixel_clients_v1';
const REMINDERS_STORAGE_KEY = 'greypixel_reminders_v1';
const INVOICES_STORAGE_KEY = 'greypixel_invoices_v1';
const PAYMENT_METHODS_STORAGE_KEY = 'greypixel_payment_methods_v1';
const EXPENSES_STORAGE_KEY = 'greypixel_expenses_v1';

const DEFAULT_CONTRACT_TEMPLATE = `CONTRACT AGREEMENT (Version: {{version}})

This agreement is made between:

COMPANY DETAILS:
{{companyName}}
{{companyAddress}}

{{note}}

AND

CLIENT DETAILS:
{{clientName}}
{{clientAddress}}

CONTACT PERSON:
{{contactPerson}}
{{contactRole}}
({{contactEmail}})

{{howWeWork}}

DATE: {{contractDate}}
AMOUNT: {{currency}} {{amount}}

TERMS AND CONDITIONS:
{{terms}}

SIGNED:

__________________________
{{companyName}}

__________________________
{{clientName}}
`;

export default function App() {
  // Debug environment variables
  console.log('Environment check:', {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
    nodeEnv: import.meta.env.MODE
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'projects' | 'hosting' | 'contracts' | 'pipeline' | 'quotations' | 'clients' | 'invoices' | 'expenses'>('dashboard');
  const [revenueCurrency, setRevenueCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 1024 : true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(CURRENT_USER_KEY) : null;
    return saved ? JSON.parse(saved) : null;
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Data states
  const [pipelineClients, setPipelineClients] = useState<PipelineClient[]>([]);
  const [users, setUsers] = useState<UserType[]>([
    { id: '1', name: 'Anas Kamran', email: 'Anaskamran89@gmail.com', password: '1830', role: 'Admin' }
  ]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<{ id: string, method: string }[]>([
    { id: '1', method: 'Bank Transfer / JazzCash' }
  ]);
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([]);
  const [messages, setMessages] = useState<{ id: string, text: string, sender: string, timestamp: string, category?: 'hosting' | 'pipeline' | 'clients' }[]>([
    { id: '1', text: 'Welcome to your personal chat room!', sender: 'System', timestamp: new Date().toISOString() }
  ]);
  const [hosting, setHosting] = useState<Hosting[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [days, setDays] = useState<DaySection[]>([]);
  const [months, setMonths] = useState<MonthSection[]>([]);

  // Fetch all data from Supabase on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [
          { data: pipelineData },
          { data: usersData },
          { data: quotationsData },
          { data: invoicesData },
          { data: paymentMethodsData },
          { data: expensesData },
          { data: messagesData },
          { data: hostingData },
          { data: contractsData },
          { data: clientsData },
          { data: daysData },
          { data: monthsData }
        ] = await Promise.all([
          supabase.from('pipeline_clients').select('*'),
          supabase.from('users').select('*'),
          supabase.from('quotations').select('*'),
          supabase.from('invoices').select('*'),
          supabase.from('payment_methods').select('*'),
          supabase.from('expense_groups').select('*'),
          supabase.from('messages').select('*'),
          supabase.from('hosting').select('*'),
          supabase.from('contracts').select('*'),
          supabase.from('clients').select('*'),
          supabase.from('days').select('*'),
          supabase.from('months').select('*')
        ]);

        if (pipelineData) setPipelineClients(pipelineData);
        if (usersData && usersData.length > 0) setUsers(usersData);
        if (quotationsData) setQuotations(quotationsData);
        if (invoicesData) setInvoices(invoicesData);
        if (paymentMethodsData && paymentMethodsData.length > 0) setSavedPaymentMethods(paymentMethodsData);
        if (expensesData) setExpenseGroups(expensesData);
        if (messagesData && messagesData.length > 0) setMessages(messagesData);
        if (hostingData) setHosting(hostingData);
        if (contractsData) setContracts(contractsData);
        if (clientsData) setClients(clientsData);
        if (daysData) setDays(daysData);
        if (monthsData) setMonths(monthsData);
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast.error('Failed to load data from cloud storage');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper to save data to Supabase
  const saveToSupabase = async (table: string, data: any[]) => {
    try {
      console.log(`Saving ${data.length} items to ${table}`);
      // First delete all existing records, then insert the current state
      // This ensures deletions are properly reflected in the database
      const { error: deleteError } = await supabase.from(table).delete().neq('id', ''); // Delete all records
      if (deleteError) {
        console.error(`Delete error for ${table}:`, deleteError);
        throw deleteError;
      }

      if (data.length > 0) {
        const { error: insertError } = await supabase.from(table).insert(data);
        if (insertError) {
          console.error(`Insert error for ${table}:`, insertError);
          throw insertError;
        }
      }
      console.log(`Successfully saved ${data.length} items to ${table}`);
    } catch (error) {
      console.error(`Error saving to ${table}:`, error);
      toast.error(`Failed to save ${table} to cloud`);
    }
  };

  // Sync states to Supabase
  useEffect(() => {
    if (!isLoading) saveToSupabase('invoices', invoices);
  }, [invoices, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('payment_methods', savedPaymentMethods);
  }, [savedPaymentMethods, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('expense_groups', expenseGroups);
  }, [expenseGroups, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('quotations', quotations);
  }, [quotations, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('messages', messages);
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('hosting', hosting);
  }, [hosting, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('contracts', contracts);
  }, [contracts, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('clients', clients);
  }, [clients, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('days', days);
  }, [days, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('months', months);
  }, [months, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('users', users);
  }, [users, isLoading]);

  useEffect(() => {
    if (!isLoading) saveToSupabase('pipeline_clients', pipelineClients);
  }, [pipelineClients, isLoading]);

  const [showAddPipeline, setShowAddPipeline] = useState(false);
  const [newPipelineClient, setNewPipelineClient] = useState<Partial<PipelineClient>>({
    name: '',
    scope: '',
    status: 'Pending',
    followUpPeriod: 1,
    followUpStatus: 'Pending'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddContract, setShowAddContract] = useState(false);
  const [showAddQuotation, setShowAddQuotation] = useState(false);
  const [showEditQuotation, setShowEditQuotation] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showEditInvoice, setShowEditInvoice] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [showEditContract, setShowEditContract] = useState(false);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Tasks' as UserRole });
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    companyName: 'Greypixel Agency',
    companyAddress: '123 Tech Avenue, Digital City',
    contactPerson: 'Anas Kamran',
    contactRole: 'CEO',
    contactEmail: 'Anaskamran89@gmail.com',
    contractDate: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: 'PKR',
    howWeWork: 'We provide high-quality digital solutions including web development, UI/UX design, and digital marketing. Our process involves discovery, design, development, and deployment phases.',
    terms: '1. The company agrees to provide services as discussed.\n2. All intellectual property will be transferred to the client upon full payment.\n3. Any revisions will be handled as per the agreed schedule.',
    note: 'NOTE: Please review the terms carefully before signing.',
    version: 1,
    status: 'Draft'
  });

  const [newQuotation, setNewQuotation] = useState<Partial<Quotation>>({
    clientName: '',
    clientBusinessName: '',
    clientAddress: '',
    companyName: 'Greypixel Agency',
    companyAddress: '301 Hunza Block, Allama Iqbal Town, Lahore, Pakistan',
    items: [{ id: '1', scope: '', cost: 0 }],
    upfrontPercentage: 50,
    currency: 'PKR',
    notes: '',
    paymentMethod: 'Bank Transfer / JazzCash',
    date: new Date().toISOString().split('T')[0]
  });

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientBusinessName: '',
    clientAddress: '',
    companyName: 'Greypixel Agency',
    companyAddress: '301 Hunza Block, Allama Iqbal Town, Lahore, Pakistan',
    services: [{ id: '1', service: '', cost: 0 }],
    upfrontPercentage: 0,
    currency: 'PKR',
    notes: '',
    paymentMethod: savedPaymentMethods[0]?.method || ''
  });

  const filteredMessages = messages.filter(msg => {
    if (!currentUser) return false;
    if (currentUser.role === 'Tasks') return false;
    if (currentUser.role === 'Admin') return true;
    if (msg.sender !== 'System') return true;
    if (!msg.category) return true;
    if (currentUser.role === 'Pipeline' && msg.category === 'pipeline') return true;
    if (currentUser.role === 'Admin' && msg.category === 'clients') return true;
    if (currentUser.role === 'Projects' && msg.category === 'hosting') return true;
    return false;
  });

  const [chatInput, setChatInput] = useState('');

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.error('Failed to play sound', e));
  };

  useEffect(() => {
    if (!currentUser) return;
    
    // Determine the "home" tab for the user to show notifications
    const isHomeTab = (currentUser.role === 'Admin' && activeTab === 'dashboard') ||
                     (currentUser.role === 'Pipeline' && activeTab === 'pipeline') ||
                     (currentUser.role === 'Projects' && activeTab === 'projects') ||
                     (currentUser.role === 'Tasks' && activeTab === 'tasks');

    if (isHomeTab && filteredMessages.length > 0) {
      playNotificationSound();
      toast.info(`You have ${filteredMessages.length} unread notes!`, {
        description: 'Click the message icon to view your reminders.',
        action: {
          label: 'Open Notes',
          onClick: () => {
            setShowChat(true);
          }
        },
        duration: 5000,
        icon: <Bell className="text-indigo-500" size={18} />
      });
    }
  }, [activeTab, filteredMessages.length, currentUser]);

  const handleCloseChat = () => {
    setShowChat(false);
    setMessages([]);
  };

  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    status: 'Active',
    scope: '',
    amount: 0,
    currency: 'PKR',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    isAutoCycle: true
  });

  const calculateDueDate = (createdDate: string, period: HostingPeriod): string => {
    if (period === 'Custom') return createdDate; // Placeholder, will be manually set
    const date = new Date(createdDate);
    if (period === 'None') {
      date.setDate(date.getDate() + 7); // Default next week
    } else if (period === '1 Month') {
      date.setMonth(date.getMonth() + 1);
    } else if (period === '3 Months') {
      date.setMonth(date.getMonth() + 3);
    } else if (period === '6 Months') {
      date.setMonth(date.getMonth() + 6);
    } else if (period === '1 Year') {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Projects') return;

    const today = new Date();
    const reminders = hosting.filter(h => {
      const dueDate = new Date(h.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return h.paymentStatus === 'Pending' && diffDays <= 7 && diffDays >= 0; // Remind if within 7 days and pending
    });

    if (reminders.length > 0) {
      const reminderMessages = reminders.map(h => ({
        id: `reminder-${h.id}-${h.dueDate}`,
        text: `Reminder: Hosting for ${h.domain} is due on ${h.dueDate}`,
        sender: 'System',
        timestamp: new Date().toISOString(),
        category: 'hosting' as const
      }));

      setMessages(prev => {
        // Filter out old hosting reminders that are no longer valid (not in reminderMessages)
        const currentHostingReminderIds = new Set(reminderMessages.map(r => r.id));
        const otherMessages = prev.filter(m => m.category !== 'hosting' || currentHostingReminderIds.has(m.id));
        
        const existingIds = new Set(otherMessages.map(m => m.id));
        const newReminders = reminderMessages.filter(r => !existingIds.has(r.id));
        
        if (newReminders.length === 0 && otherMessages.length === prev.length) return prev;
        return [...otherMessages, ...newReminders];
      });
    } else {
      // Clear all hosting reminders if none are valid
      setMessages(prev => {
        const otherMessages = prev.filter(m => m.category !== 'hosting');
        if (otherMessages.length === prev.length) return prev;
        return otherMessages;
      });
    }
  }, [hosting, currentUser]);

  // Auto-cycle client due dates
  useEffect(() => {
    const now = new Date();
    const needsUpdate = clients.some(c => c.isAutoCycle && c.status === 'Active' && c.dueDate && new Date(c.dueDate) < now);
    
    if (needsUpdate) {
      setClients(prev => prev.map(client => {
        if (client.isAutoCycle && client.status === 'Active' && client.dueDate) {
          const dueDate = new Date(client.dueDate);
          if (dueDate < now) {
            const nextDueDate = new Date(dueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            return {
              ...client,
              date: client.dueDate,
              dueDate: nextDueDate.toISOString().split('T')[0]
            };
          }
        }
        return client;
      }));
    }
  }, [clients]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Admin') return;

    const today = new Date();
    const reminders = clients.filter(c => {
      if (!c.dueDate) return false;
      const dueDate = new Date(c.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return c.status === 'Active' && diffDays <= 7 && diffDays >= 0;
    });

    if (reminders.length > 0) {
      const reminderMessages = reminders.map(c => ({
        id: `client-reminder-${c.id}-${c.dueDate}`,
        text: `Reminder: Payment for client ${c.name} is due on ${c.dueDate}`,
        sender: 'System',
        timestamp: new Date().toISOString(),
        category: 'clients' as const
      }));

      setMessages(prev => {
        const currentClientReminderIds = new Set(reminderMessages.map(r => r.id));
        const otherMessages = prev.filter(m => m.category !== 'clients' || currentClientReminderIds.has(m.id));
        
        const existingIds = new Set(otherMessages.map(m => m.id));
        const newReminders = reminderMessages.filter(r => !existingIds.has(r.id));
        
        if (newReminders.length === 0 && otherMessages.length === prev.length) return prev;
        return [...otherMessages, ...newReminders];
      });
    } else {
      setMessages(prev => {
        const otherMessages = prev.filter(m => m.category !== 'clients');
        if (otherMessages.length === prev.length) return prev;
        return otherMessages;
      });
    }
  }, [clients, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Set initial tab based on role if current tab is not allowed
  useEffect(() => {
    if (currentUser && currentUser.role !== 'Admin') {
      const role = currentUser.role;
      if (role === 'Tasks' && activeTab !== 'tasks') setActiveTab('tasks');
      if (role === 'Projects' && !['projects', 'hosting', 'contracts'].includes(activeTab)) setActiveTab('projects');
      if (role === 'Pipeline' && activeTab !== 'pipeline') setActiveTab('pipeline');
    }
  }, [currentUser, activeTab]);

  const [newMonthName, setNewMonthName] = useState('');
  const [newDayName, setNewDayName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', amount: 0, groupId: '' });
  const [showAddMonth, setShowAddMonth] = useState(false);
  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddHosting, setShowAddHosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newHosting, setNewHosting] = useState({
    domain: '',
    amount: 0,
    period: 'None' as HostingPeriod,
    paymentStatus: 'Pending' as PaymentStatus,
    invoiceStatus: 'Pending' as InvoiceStatus,
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Check for 7-day follow-up reminders
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Pipeline') return;

    const checkReminders = () => {
      const now = new Date();
      let updated = false;
      const newClients = pipelineClients.map(client => {
        if (client.followUpPeriod === 7 && !client.reminderSent && client.followUpStatus === 'Pending') {
          const createdAt = new Date(client.createdAt);
          const diffTime = Math.abs(now.getTime() - createdAt.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 7) {
            // Send reminder
            const reminderText = `Reminder: 7-day follow-up period completed for client ${client.name}.`;
            setMessages(prev => [
              ...prev,
              {
                id: Math.random().toString(36).substr(2, 9),
                text: reminderText,
                sender: 'System',
                timestamp: now.toISOString(),
                category: 'pipeline' as const
              }
            ]);
            playNotificationSound();
            toast.info('New Reminder', { description: reminderText });
            updated = true;
            return { ...client, reminderSent: true };
          }
        }
        return client;
      });

      if (updated) {
        setPipelineClients(newClients);
      }
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check
    return () => clearInterval(interval);
  }, [pipelineClients, currentUser]);

  const handleLogin = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const user = users.find(u => u.name === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error('Invalid username or password');
    }
  };

  const handleLogout = () => {
    toast.success('Logged out successfully', {
      description: 'Redirecting to login...',
      duration: 2000
    });
    
    // Clear state and storage immediately to prevent race conditions
    setTimeout(() => {
      localStorage.removeItem(CURRENT_USER_KEY);
      setCurrentUser(null);
      setActiveTab('dashboard');
      window.location.reload();
    }, 2000);
  };

  // User Management Functions
  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    const user: UserType = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role as UserRole
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', password: '', role: 'Tasks' });
    setShowAddUser(false);
    toast.success('User added successfully');
  };

  const updateUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    toast.success('User updated successfully');
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      toast.error('Cannot delete the last user');
      return;
    }
    if (currentUser?.id === id) {
      toast.error('Cannot delete yourself');
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    toast.success('User deleted successfully');
  };

  // Day Section Functions
  const addDay = () => {
    if (!newDayName.trim()) return;
    const newDay: DaySection = {
      id: Math.random().toString(36).substr(2, 9),
      day: newDayName,
      tasks: [],
      isExpanded: true
    };
    setDays([...days, newDay]);
    setNewDayName('');
    setShowAddDay(false);
  };

  const deleteDay = (id: string) => {
    setDays(days.filter(d => d.id !== id));
  };

  const toggleDay = (id: string) => {
    setDays(days.map(d => d.id === id ? { ...d, isExpanded: !d.isExpanded } : d));
  };

  const addDayTask = (dayId: string, text: string) => {
    if (!text.trim()) return;
    setDays(days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          tasks: [...d.tasks, { id: Math.random().toString(36).substr(2, 9), text, status: 'Pending' }]
        };
      }
      return d;
    }));
  };

  const deleteDayTask = (dayId: string, taskId: string) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        return { ...d, tasks: d.tasks.filter(t => t.id !== taskId) };
      }
      return d;
    }));
  };

  const updateDayTaskStatus = (dayId: string, taskId: string, status: Status) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          tasks: d.tasks.map(t => t.id === taskId ? { ...t, status } : t)
        };
      }
      return d;
    }));
  };

  // Month Section Functions
  const addMonth = () => {
    if (!newMonthName.trim()) return;
    const newMonth: MonthSection = {
      id: Math.random().toString(36).substr(2, 9),
      month: newMonthName,
      projects: [],
      isExpanded: true
    };
    setMonths([...months, newMonth]);
    setNewMonthName('');
    setShowAddMonth(false);
  };

  const deleteMonth = (id: string) => {
    setMonths(months.filter(m => m.id !== id));
  };

  const toggleMonth = (id: string) => {
    setMonths(months.map(m => m.id === id ? { ...m, isExpanded: !m.isExpanded } : m));
  };

  const addMonthProject = (monthId: string, name: string) => {
    if (!name.trim()) return;
    setMonths(months.map(m => {
      if (m.id === monthId) {
        return {
          ...m,
          projects: [...m.projects, { 
            id: Math.random().toString(36).substr(2, 9), 
            name, 
            status: 'Pending',
            cost: 0,
            received: 0,
            expressExpense: 0,
            paymentStatus: 'Pending'
          }]
        };
      }
      return m;
    }));
  };

  const deleteMonthProject = (monthId: string, projectId: string) => {
    setMonths(months.map(m => {
      if (m.id === monthId) {
        return { ...m, projects: m.projects.filter(p => p.id !== projectId) };
      }
      return m;
    }));
  };

  const updateMonthProject = (monthId: string, projectId: string, updates: Partial<Project>) => {
    setMonths(months.map(m => {
      if (m.id === monthId) {
        return {
          ...m,
          projects: m.projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
        };
      }
      return m;
    }));
  };

  const addExpenseGroup = (name: string) => {
    const newGroup: ExpenseGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      expenses: [],
      isClosed: false
    };
    setExpenseGroups([...expenseGroups, newGroup]);
    toast.success('Expense group added');
  };

  const addExpense = (groupId: string, name: string, amount: number) => {
    setExpenseGroups(expenseGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          expenses: [...g.expenses, { id: Math.random().toString(36).substr(2, 9), name, amount }]
        };
      }
      return g;
    }));
    toast.success('Expense added');
  };

  const toggleExpenseGroup = (groupId: string) => {
    setExpenseGroups(expenseGroups.map(g => g.id === groupId ? { ...g, isClosed: !g.isClosed } : g));
  };

  const deleteExpenseGroup = (groupId: string) => {
    setExpenseGroups(expenseGroups.filter(g => g.id !== groupId));
    toast.success('Expense group deleted');
  };

  const deleteExpense = (groupId: string, expenseId: string) => {
    setExpenseGroups(expenseGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, expenses: g.expenses.filter(e => e.id !== expenseId) };
      }
      return g;
    }));
    toast.success('Expense deleted');
  };

  const addHosting = () => {
    if (!newHosting.domain) return;
    const createdDate = new Date().toISOString().split('T')[0];
    const dueDate = newHosting.period === 'Custom' ? newHosting.dueDate : calculateDueDate(createdDate, newHosting.period);
    const entry: Hosting = {
      id: Math.random().toString(36).substr(2, 9),
      ...newHosting,
      createdDate,
      dueDate
    };
    setHosting([...hosting, entry]);
    setNewHosting({
      domain: '',
      amount: 0,
      period: 'None',
      paymentStatus: 'Pending',
      invoiceStatus: 'Pending',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setShowAddHosting(false);
  };

  const generateContractContent = (data: Partial<Contract>) => {
    let content = DEFAULT_CONTRACT_TEMPLATE;
    content = content.replace(/{{companyName}}/g, data.companyName || '');
    content = content.replace(/{{companyAddress}}/g, data.companyAddress || '');
    content = content.replace(/{{clientName}}/g, data.clientName || '');
    content = content.replace(/{{clientAddress}}/g, data.clientAddress || '');
    content = content.replace(/{{contactPerson}}/g, data.contactPerson || '');
    content = content.replace(/{{contactRole}}/g, data.contactRole || '');
    content = content.replace(/{{contactEmail}}/g, data.contactEmail || '');
    content = content.replace(/{{contractDate}}/g, data.contractDate || '');
    content = content.replace(/{{amount}}/g, data.amount?.toLocaleString() || '0');
    content = content.replace(/{{currency}}/g, data.currency || '');
    content = content.replace(/{{howWeWork}}/g, data.howWeWork || '');
    content = content.replace(/{{terms}}/g, data.terms || '');
    content = content.replace(/{{note}}/g, data.note || '');
    content = content.replace(/{{version}}/g, data.version?.toString() || '1');
    return content;
  };

  const handleSignatureUpload = (e: ChangeEvent<HTMLInputElement>, side: 'company' | 'client') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewContract(prev => ({
          ...prev,
          [side === 'company' ? 'companySignature' : 'clientSignature']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSignatureUpload = (e: ChangeEvent<HTMLInputElement>, side: 'company' | 'client') => {
    const file = e.target.files?.[0];
    if (file && editingContract) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingContract({
          ...editingContract,
          [side === 'company' ? 'companySignature' : 'clientSignature']: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateContractStatus = (id: string, status: Contract['status']) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Status updated to ${status}`);
  };

  const downloadContractPDF = async (contract: Contract) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    const checkPageBreak = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - 30) {
        drawFooter();
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // Helper to draw footer bar on the last page
    const drawFooter = () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text('Greypixelagency.com | Hello@greypixelagency.com', pageWidth / 2, pageHeight - 12, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(93, 102, 88); // #5D6658
      doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
    };

    // --- PAGE 1 ---
    // Logo
    try {
      // Use weserv.nl as a proxy to bypass CORS and convert SVG to PNG with background removal
      const logoUrl = 'https://images.weserv.nl/?url=cloud.greypixelagency.com/greypixel/Logo.svg&output=png&bg=transparent&trim=10&w=500';
      
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = logoUrl;
      });

      const canvas = document.createElement('canvas');
      const targetWidth = 500;
      const targetHeight = (img.height / img.width) * targetWidth;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Remove white background and make logo black
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
            data[i+3] = 0;
          } else {
            data[i] = 0;
            data[i+1] = 0;
            data[i+2] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);

        const logoData = canvas.toDataURL('image/png');
        const logoHeight = (targetHeight / targetWidth) * 50;
        doc.addImage(logoData, 'PNG', pageWidth / 2 - 25, yPos, 50, logoHeight);
        yPos += logoHeight + 16; // Height of logo + ~60px spacing after logo
      }
    } catch (e) {
      console.error('Logo failed to load', e);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('GREYPIXEL', pageWidth / 2, yPos, { align: 'center' });
      yPos += 16;
    }

    // Heading
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRACT AGREEMENT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 16; // ~60px spacing after heading

    // Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This agreement is made between:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('COMPANY DETAILS:', margin, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(contract.companyName, margin, yPos);
    yPos += 4;
    doc.text(contract.companyAddress, margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('AND', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT DETAILS:', margin, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(contract.clientName, margin, yPos);
    yPos += 4;
    doc.text(contract.clientAddress, margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('CONTACT PERSON:', margin, yPos);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(contract.contactPerson, margin, yPos);
    yPos += 4;
    doc.text(contract.contactRole, margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(contract.contractDate, margin + 12, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('AMOUNT:', margin, yPos);
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`${contract.currency} ${contract.amount.toLocaleString()}`, margin + 18, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 12;

    // --- PAGE 2 ONWARD ---
    drawFooter();
    doc.addPage();
    
    yPos = 20; // Start at top of page

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const lines = contract.howWeWork.split('\n');
    lines.forEach(line => {
      if (!line.trim()) {
        yPos += 2;
        return;
      }
      checkPageBreak(5);
      if (line.trim().startsWith('*')) {
        // Bullet points: left aligned but indented
        doc.text('• ' + line.trim().substring(1).trim(), margin + 10, yPos);
        yPos += 5;
      } else if (line.trim().startsWith('#')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(line.trim().replace(/^#+\s*/, ''), margin, yPos);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPos += 6;
      } else {
        const splitLine = doc.splitTextToSize(line, pageWidth - (margin * 2));
        splitLine.forEach((l: string) => {
          doc.text(l, margin, yPos);
          yPos += 4.5;
        });
      }
    });

    yPos += 8;

    // TERMS & CONDITIONS Section
    checkPageBreak(12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(93, 102, 88);
    doc.text('TERMS & CONDITIONS', margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const termLines = doc.splitTextToSize(contract.terms, pageWidth - (margin * 2));
    termLines.forEach((line: string) => {
      checkPageBreak(4.5);
      doc.text(line, margin, yPos);
      yPos += 4.5;
    });

    yPos += 12;

    // SIGNATURE AREA
    checkPageBreak(40);
    const sigY = yPos;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SIGNED BY:', margin, sigY);
    
    // Company Side
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Company Representative:', margin, sigY + 7);
    doc.text(contract.companyName, margin, sigY + 11);
    doc.text(`Date: ${contract.contractDate}`, margin, sigY + 15);
    if (contract.companySignature) {
      try {
        doc.addImage(contract.companySignature, 'PNG', margin, sigY + 18, 30, 10);
      } catch (e) { console.error(e); }
    }
    doc.line(margin, sigY + 32, margin + 50, sigY + 32);

    // Client Side
    doc.text('Client Representative:', margin + 100, sigY + 7);
    doc.text(contract.clientName, margin + 100, sigY + 11);
    doc.text(`Date: ${contract.contractDate}`, margin + 100, sigY + 15);
    if (contract.clientSignature) {
      try {
        doc.addImage(contract.clientSignature, 'PNG', margin + 100, sigY + 18, 30, 10);
      } catch (e) { console.error(e); }
    }
    doc.line(margin + 100, sigY + 32, margin + 150, sigY + 32);

    drawFooter();
    
    doc.save(`Contract_${contract.clientName.replace(/\s+/g, '_')}_v${contract.version}.pdf`);
    toast.success('PDF downloaded successfully');
  };

  const addContract = () => {
    if (!newContract.clientName || !newContract.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const contract: Contract = {
      ...newContract as Contract,
      id: Math.random().toString(36).substr(2, 9),
      template: generateContractContent(newContract)
    };
    setContracts([...contracts, contract]);
    setShowAddContract(false);
    setNewContract({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      companyName: 'Greypixel Agency',
      companyAddress: '123 Tech Avenue, Digital City',
      contactPerson: 'Anas Kamran',
      contactRole: 'CEO',
      contactEmail: 'Anaskamran89@gmail.com',
      contractDate: new Date().toISOString().split('T')[0],
      amount: 0,
      currency: 'PKR',
      howWeWork: 'We provide high-quality digital solutions including web development, UI/UX design, and digital marketing. Our process involves discovery, design, development, and deployment phases.',
      terms: '1. The company agrees to provide services as discussed.\n2. All intellectual property will be transferred to the client upon full payment.\n3. Any revisions will be handled as per the agreed schedule.',
      note: 'NOTE: Please review the terms carefully before signing.',
      version: 1,
      status: 'Draft'
    });
    toast.success('Contract created successfully');
  };

  const updateContract = () => {
    if (!editingContract || !editingContract.clientName || !editingContract.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const updatedContract: Contract = {
      ...editingContract,
      template: generateContractContent(editingContract)
    };
    setContracts(contracts.map(c => c.id === editingContract.id ? updatedContract : c));
    setShowEditContract(false);
    setEditingContract(null);
    toast.success('Contract updated successfully');
  };

  const addPipelineClient = () => {
    if (!newPipelineClient.name || !newPipelineClient.scope) {
      toast.error('Please fill in all required fields');
      return;
    }
    const client: PipelineClient = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPipelineClient.name!,
      scope: newPipelineClient.scope!,
      status: newPipelineClient.status as PipelineStatus,
      followUpPeriod: newPipelineClient.followUpPeriod!,
      followUpStatus: newPipelineClient.followUpStatus as FollowUpStatus,
      createdAt: new Date().toISOString()
    };
    setPipelineClients(prev => [...prev, client]);
    setShowAddPipeline(false);
    setNewPipelineClient({
      name: '',
      scope: '',
      status: 'Pending',
      followUpPeriod: 1,
      followUpStatus: 'Pending'
    });
    toast.success('Client added to pipeline');
  };

  const deletePipelineClient = (id: string) => {
    setPipelineClients(prev => prev.filter(c => c.id !== id));
    toast.success('Client removed from pipeline');
  };

  const updatePipelineStatus = (id: string, status: PipelineStatus) => {
    setPipelineClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Status updated to ${status}`);
  };

  const addQuotation = () => {
    if (!newQuotation.clientName || !newQuotation.clientBusinessName) {
      toast.error('Please fill in all required fields');
      return;
    }
    const calculatedTotal = newQuotation.items?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
    const totalCost = newQuotation.totalCost || calculatedTotal;
    const upfrontAmount = (totalCost * (newQuotation.upfrontPercentage || 0)) / 100;

    const quotation: Quotation = {
      ...newQuotation as Quotation,
      id: Math.random().toString(36).substr(2, 9),
      totalCost,
      upfrontAmount,
      date: new Date().toISOString().split('T')[0]
    };

    setQuotations([...quotations, quotation]);
    setShowAddQuotation(false);
    setNewQuotation({
      clientName: '',
      clientBusinessName: '',
      clientAddress: '',
      companyName: 'Greypixel Agency',
      companyAddress: '301 Hunza Block, Allama Iqbal Town, Lahore, Pakistan',
      items: [{ id: '1', scope: '', cost: 0 }],
      upfrontPercentage: 50,
      currency: 'PKR',
      notes: '',
      paymentMethod: 'Bank Transfer / JazzCash',
      date: new Date().toISOString().split('T')[0]
    });
    toast.success('Quotation created successfully');
  };

  const deleteQuotation = (id: string) => {
    setQuotations(quotations.filter(q => q.id !== id));
    toast.success('Quotation deleted');
  };

  const updateQuotation = () => {
    if (!editingQuotation || !editingQuotation.clientName || !editingQuotation.clientBusinessName) {
      toast.error('Please fill in all required fields');
      return;
    }
    const calculatedTotal = editingQuotation.items?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
    const totalCost = editingQuotation.totalCost || calculatedTotal;
    const upfrontAmount = (totalCost * (editingQuotation.upfrontPercentage || 0)) / 100;

    const updatedQuotation: Quotation = {
      ...editingQuotation,
      totalCost,
      upfrontAmount
    };

    setQuotations(quotations.map(q => q.id === editingQuotation.id ? updatedQuotation : q));
    setShowEditQuotation(false);
    setEditingQuotation(null);
    toast.success('Quotation updated successfully');
  };

  const deleteInvoice = (id: string) => {
    console.log(`Deleting invoice with id: ${id}`);
    const updatedInvoices = invoices.filter(i => i.id !== id);
    console.log(`Invoices before: ${invoices.length}, after: ${updatedInvoices.length}`);
    setInvoices(updatedInvoices);
    toast.success('Invoice deleted');
  };

  const addInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.clientBusinessName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const subTotal = newInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
    const upfrontAmount = (subTotal * (newInvoice.upfrontPercentage || 0)) / 100;
    const dueAmount = subTotal - upfrontAmount;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: newInvoice.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      dueDate: newInvoice.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: newInvoice.clientName,
      clientBusinessName: newInvoice.clientBusinessName,
      clientAddress: newInvoice.clientAddress || '',
      companyName: newInvoice.companyName || 'Greypixel Agency',
      companyAddress: newInvoice.companyAddress || '301 Hunza Block, Allama Iqbal Town, Lahore, Pakistan',
      services: newInvoice.services as InvoiceService[],
      subTotal,
      upfrontPercentage: newInvoice.upfrontPercentage || 0,
      upfrontAmount,
      dueAmount,
      paymentMethod: newInvoice.paymentMethod || '',
      notes: newInvoice.notes,
      currency: newInvoice.currency || 'PKR',
      createdAt: new Date().toISOString()
    };

    setInvoices([...invoices, invoice]);
    
    // Save payment method if it's new
    if (newInvoice.paymentMethod && !savedPaymentMethods.some(pm => pm.method === newInvoice.paymentMethod)) {
      setSavedPaymentMethods([...savedPaymentMethods, { id: Date.now().toString(), method: newInvoice.paymentMethod }]);
    }

    setShowAddInvoice(false);
    setNewInvoice({
      invoiceNumber: `INV-${(Date.now() + 1).toString().slice(-6)}`,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: '',
      clientBusinessName: '',
      clientAddress: '',
      companyName: 'Greypixel Agency',
      companyAddress: '301 Hunza Block, Allama Iqbal Town, Lahore, Pakistan',
      services: [{ id: '1', service: '', cost: 0 }],
      upfrontPercentage: 0,
      currency: 'PKR',
      notes: '',
      paymentMethod: savedPaymentMethods[0]?.method || ''
    });
    toast.success('Invoice created successfully');
  };

  const updateInvoice = () => {
    if (!editingInvoice || !editingInvoice.clientName || !editingInvoice.clientBusinessName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const subTotal = editingInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
    const upfrontAmount = (subTotal * (editingInvoice.upfrontPercentage || 0)) / 100;
    const dueAmount = subTotal - upfrontAmount;

    const updatedInvoice: Invoice = {
      ...editingInvoice,
      subTotal,
      upfrontAmount,
      dueAmount
    };

    setInvoices(invoices.map(i => i.id === editingInvoice.id ? updatedInvoice : i));
    
    // Save payment method if it's new
    if (editingInvoice.paymentMethod && !savedPaymentMethods.some(pm => pm.method === editingInvoice.paymentMethod)) {
      setSavedPaymentMethods([...savedPaymentMethods, { id: Date.now().toString(), method: editingInvoice.paymentMethod }]);
    }

    setShowEditInvoice(false);
    setEditingInvoice(null);
    toast.success('Invoice updated successfully');
  };

  const addInvoiceService = () => {
    const services = showEditInvoice ? editingInvoice?.services : newInvoice.services;
    const setServices = showEditInvoice ? (s: InvoiceService[]) => setEditingInvoice({ ...editingInvoice!, services: s }) : (s: InvoiceService[]) => setNewInvoice({ ...newInvoice, services: s });
    
    setServices([...(services || []), { id: Date.now().toString(), service: '', cost: 0 }]);
  };

  const removeInvoiceService = (id: string) => {
    const services = showEditInvoice ? editingInvoice?.services : newInvoice.services;
    const setServices = showEditInvoice ? (s: InvoiceService[]) => setEditingInvoice({ ...editingInvoice!, services: s }) : (s: InvoiceService[]) => setNewInvoice({ ...newInvoice, services: s });
    
    if (services && services.length > 1) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const updateInvoiceService = (id: string, field: keyof InvoiceService, value: any) => {
    const services = showEditInvoice ? editingInvoice?.services : newInvoice.services;
    const setServices = showEditInvoice ? (s: InvoiceService[]) => setEditingInvoice({ ...editingInvoice!, services: s }) : (s: InvoiceService[]) => setNewInvoice({ ...newInvoice, services: s });
    
    if (services) {
      setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
    }
  };

  const downloadInvoicePDF = async (invoice: Invoice) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 0;
    const currency = invoice.currency || 'PKR';

    // Brand Colors
    const primaryColor = [93, 102, 88]; // #5D6658
    const textColor = [31, 41, 55]; // Gray-800
    const mutedTextColor = [107, 114, 128]; // Gray-500

    // Left-side border (8-10px)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 8, pageHeight, 'F');

    // Header
    yPos = 20;
    
    // Logo (Top-Left)
    try {
      const logoUrl = 'https://images.weserv.nl/?url=cloud.greypixelagency.com/greypixel/Logo.svg&output=png&bg=transparent&trim=10&w=500';
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = logoUrl;
      });
      const canvas = document.createElement('canvas');
      const targetWidth = 500;
      const targetHeight = (img.height / img.width) * targetWidth;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        // Remove background but keep original colors
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        const logoWidth = 35;
        const logoHeight = (targetHeight / targetWidth) * logoWidth;
        doc.addImage(logoData, 'PNG', margin + 8, yPos, logoWidth, logoHeight);
      }
    } catch (e) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('GREYPIXEL', margin + 8, yPos + 10);
    }

    // INVOICE (Top-Right)
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, yPos + 10, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, pageWidth - margin, yPos + 18, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - margin, yPos + 24, { align: 'right' });

    yPos += 40;

    // Divider Line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(margin + 8, yPos, pageWidth - margin, yPos);
    
    yPos += 15;

    // Body: Invoice To & Company Details
    const leftCol = margin + 8;
    const rightCol = pageWidth / 2 + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('INVOICE TO:', leftCol, yPos);
    doc.text('COMPANY DETAILS:', rightCol, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    // Client Details
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.clientName, leftCol, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientBusinessName, leftCol, yPos);
    yPos += 5;
    const clientAddrLines = doc.splitTextToSize(invoice.clientAddress, (pageWidth / 2) - margin - 10);
    doc.text(clientAddrLines, leftCol, yPos);

    // Company Details (Reset Y for right column)
    let companyY = yPos - 10;
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.companyName, rightCol, companyY);
    companyY += 5;
    doc.setFont('helvetica', 'normal');
    const companyAddrLines = doc.splitTextToSize(invoice.companyAddress, (pageWidth / 2) - margin - 10);
    doc.text(companyAddrLines, rightCol, companyY);

    yPos = Math.max(yPos + (clientAddrLines.length * 5), companyY + (companyAddrLines.length * 5)) + 15;

    // Services Table
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin + 8, yPos, pageWidth - margin - (margin + 8), 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Service', margin + 12, yPos + 6.5);
    doc.text('Cost', pageWidth - margin - 5, yPos + 6.5, { align: 'right' });

    yPos += 10;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');

    invoice.services.forEach((item, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 8, pageHeight, 'F');
        yPos = 20;
      }
      
      const serviceLines = doc.splitTextToSize(item.service, pageWidth - margin - (margin + 30));
      doc.text(serviceLines, margin + 12, yPos + 7);
      doc.text(`${currency} ${item.cost.toLocaleString()}`, pageWidth - margin - 5, yPos + 7, { align: 'right' });
      
      yPos += (serviceLines.length * 5) + 5;
      doc.setDrawColor(240, 240, 240);
      doc.line(margin + 8, yPos - 2, pageWidth - margin, yPos - 2);
    });

    yPos += 10;

    // Summary (Right Side)
    const summaryX = pageWidth - margin;
    doc.setFont('helvetica', 'bold');
    doc.text('Sub Total:', summaryX - 40, yPos, { align: 'right' });
    doc.text(`${currency} ${invoice.subTotal.toLocaleString()}`, summaryX, yPos, { align: 'right' });
    
    yPos += 7;
    doc.text(`Upfront (${invoice.upfrontPercentage}%):`, summaryX - 40, yPos, { align: 'right' });
    doc.text(`${currency} ${invoice.upfrontAmount.toLocaleString()}`, summaryX, yPos, { align: 'right' });
    
    yPos += 7;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Due Amount:', summaryX - 40, yPos, { align: 'right' });
    doc.text(`${currency} ${invoice.dueAmount.toLocaleString()}`, summaryX, yPos, { align: 'right' });

    yPos += 15;

    // Payment Details & Notes (Left Side)
    const leftSideX = margin + 8;
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS:', leftSideX, yPos);
    
    yPos += 7;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    const paymentLines = doc.splitTextToSize(invoice.paymentMethod, 80);
    doc.text(paymentLines, leftSideX, yPos);
    
    yPos += (paymentLines.length * 5) + 10;
    
    if (invoice.notes) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES:', leftSideX, yPos);
      yPos += 7;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(invoice.notes, 80);
      doc.text(noteLines, leftSideX, yPos);
    }

    // Footer
    const footerY = pageHeight - 30;
    
    // Logo in Footer (Left)
    try {
      const logoUrl = 'https://images.weserv.nl/?url=cloud.greypixelagency.com/greypixel/Logo.svg&output=png&bg=transparent&trim=10&w=500';
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = logoUrl;
      });
      const canvas = document.createElement('canvas');
      const targetWidth = 500;
      const targetHeight = (img.height / img.width) * targetWidth;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        // Remove background but keep original colors
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        const logoWidth = 20;
        const logoHeight = (targetHeight / targetWidth) * logoWidth;
        doc.addImage(logoData, 'PNG', margin + 8, footerY, logoWidth, logoHeight);
      }
    } catch (e) {}

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('GREYPIXEL AGENCY PRIVATE LIMITED', margin + 8, footerY + 15);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Greypixelagency.com', pageWidth - margin, footerY + 15, { align: 'right' });
    doc.text('Hello@greypixelagency.com', pageWidth - margin, footerY + 20, { align: 'right' });

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  const downloadQuotationPDF = async (quotation: Quotation) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const currency = quotation.currency || 'PKR';
    
    // Modern Layout Constants
    const primaryColor = [31, 41, 55]; // Gray-800
    const accentColor = [16, 185, 129]; // Emerald-500
    const textColor = [31, 41, 55]; // Gray-800
    const mutedTextColor = [107, 114, 128]; // Gray-500
    const secondaryColor = [249, 250, 251]; // Gray-50
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const drawFooter = () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
      doc.text('Greypixelagency.com | Hello@greypixelagency.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Footer Border Line
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    };

    // Logo (Top-Left)
    try {
      const logoUrl = 'https://images.weserv.nl/?url=cloud.greypixelagency.com/greypixel/Logo.svg&output=png&bg=transparent&trim=10&w=500';
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = logoUrl;
      });
      const canvas = document.createElement('canvas');
      const targetWidth = 500;
      const targetHeight = (img.height / img.width) * targetWidth;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        // Remove background but keep original colors
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', margin, 15, 45, 45 * (targetHeight / targetWidth));
      }
    } catch (error) {
      console.error('Logo failed to load:', error);
    }

    // Quotation Info (Top-Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('QUOTATION', pageWidth - margin, 30, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(`DATE: ${quotation.date}`, pageWidth - margin, 40, { align: 'right' });
    doc.text(`REF: GP-${quotation.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, 45, { align: 'right' });

    let yPos = 75;
    const colWidth = (pageWidth - margin * 2 - 10) / 2; // 10 is the gap between columns

    // Client Info Section (Left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PREPARED FOR:', margin, yPos + 10);
    
    doc.setFontSize(12);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(quotation.clientName, margin, yPos + 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    
    let clientY = yPos + 28;
    if (quotation.clientBusinessName) {
      doc.text(quotation.clientBusinessName, margin, clientY);
      clientY += 6;
    }
    if (quotation.clientAddress) {
      const clientAddressLines = doc.splitTextToSize(quotation.clientAddress, colWidth);
      doc.text(clientAddressLines, margin, clientY);
    }

    // Company Details Section (Right)
    const rightColX = margin + colWidth + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PREPARED BY:', rightColX, yPos + 10);

    doc.setFontSize(12);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(quotation.companyName || 'GREYPIXEL AGENCY', rightColX, yPos + 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    
    const companyAddressLines = doc.splitTextToSize(quotation.companyAddress || 'Greypixelagency.com | Hello@greypixelagency.com', colWidth);
    doc.text(companyAddressLines, rightColX, yPos + 28);

    yPos += 65;

    // Table Header
    const drawTableHeader = (y: number) => {
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      doc.line(margin, y + 10, pageWidth - margin, y + 10);
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PROJECT SCOPE & SERVICES', margin, y + 6.5);
      doc.text(`AMOUNT (${currency})`, pageWidth - margin, y + 6.5, { align: 'right' });
    };

    drawTableHeader(yPos);
    yPos += 15;

    // Table Content
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    quotation.items.forEach((item, index) => {
      const scopeLines = doc.splitTextToSize(item.scope, pageWidth - margin * 2 - 60);
      const rowHeight = Math.max(15, scopeLines.length * 5 + 5);

      if (yPos + rowHeight > pageHeight - 40) {
        drawFooter();
        doc.addPage();
        yPos = 20;
        drawTableHeader(yPos);
        yPos += 15;
      }

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(scopeLines, margin, yPos + 5);
      const costText = item.cost ? item.cost.toLocaleString() : '-';
      doc.text(costText, pageWidth - margin, yPos + 5, { align: 'right' });
      
      yPos += rowHeight;
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    });

    yPos += 10;

    // Totals Section (Right Side)
    const totalsX = pageWidth - margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('TOTAL PROJECT COST:', totalsX - 40, yPos, { align: 'right' });
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${currency} ${quotation.totalCost.toLocaleString()}`, totalsX, yPos, { align: 'right' });
    
    yPos += 7;
    doc.setTextColor(185, 28, 28); // Red-700
    doc.text(`UPFRONT ${quotation.upfrontPercentage}% REQUIRED:`, totalsX - 40, yPos, { align: 'right' });
    doc.text(`${currency} ${quotation.upfrontAmount.toLocaleString()}`, totalsX, yPos, { align: 'right' });

    yPos += 15;

    // Payment & Notes (Left Side)
    const leftSideX = margin;
    if (quotation.paymentMethod) {
      if (yPos > pageHeight - 50) {
        drawFooter();
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT METHOD:', leftSideX, yPos);
      
      yPos += 7;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'normal');
      const paymentLines = doc.splitTextToSize(quotation.paymentMethod, pageWidth - margin * 2);
      doc.text(paymentLines, leftSideX, yPos);
      
      yPos += (paymentLines.length * 5) + 10;
    }

    if (quotation.notes) {
      if (yPos > pageHeight - 40) {
        drawFooter();
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES & TERMS:', leftSideX, yPos);
      
      yPos += 7;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(quotation.notes, pageWidth - margin * 2);
      doc.text(noteLines, leftSideX, yPos);
    }

    drawFooter();
    doc.save(`Quotation_${quotation.clientName.replace(/\s+/g, '_')}.pdf`);
    toast.success('Quotation downloaded successfully');
  };

  const addEditQuotationItem = () => {
    if (!editingQuotation) return;
    setEditingQuotation({
      ...editingQuotation,
      items: [
        ...(editingQuotation.items || []),
        { id: Math.random().toString(36).substr(2, 9), scope: '', cost: 0 }
      ]
    });
  };

  const removeEditQuotationItem = (id: string) => {
    if (!editingQuotation || (editingQuotation.items?.length || 0) <= 1) return;
    setEditingQuotation({
      ...editingQuotation,
      items: editingQuotation.items?.filter(item => item.id !== id)
    });
  };

  const updateEditQuotationItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    if (!editingQuotation) return;
    setEditingQuotation({
      ...editingQuotation,
      items: editingQuotation.items?.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const addQuotationItem = () => {
    setNewQuotation({
      ...newQuotation,
      items: [
        ...(newQuotation.items || []),
        { id: Math.random().toString(36).substr(2, 9), scope: '', cost: 0 }
      ]
    });
  };

  const removeQuotationItem = (id: string) => {
    if ((newQuotation.items?.length || 0) <= 1) return;
    setNewQuotation({
      ...newQuotation,
      items: newQuotation.items?.filter(item => item.id !== id)
    });
  };

  const updateQuotationItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setNewQuotation({
      ...newQuotation,
      items: newQuotation.items?.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const updateFollowUpStatus = (id: string, followUpStatus: FollowUpStatus) => {
    setPipelineClients(prev => prev.map(c => c.id === id ? { ...c, followUpStatus } : c));
    toast.success(`Follow-up status updated to ${followUpStatus}`);
  };

  const updateFollowUpPeriod = (id: string, followUpPeriod: number) => {
    setPipelineClients(prev => prev.map(c => c.id === id ? { ...c, followUpPeriod, reminderSent: false } : c));
    toast.success(`Follow-up period updated to ${followUpPeriod} days`);
  };

  const deleteHosting = (id: string) => {
    setHosting(hosting.filter(h => h.id !== id));
  };

  const updateHosting = (id: string, updates: Partial<Hosting>) => {
    setHosting(hosting.map(h => {
      if (h.id === id) {
        const updated = { ...h, ...updates };
        if (updates.period || updates.createdDate) {
          if (updated.period !== 'Custom') {
            updated.dueDate = calculateDueDate(updated.createdDate, updated.period);
          }
        }
        return updated;
      }
      return h;
    }));
  };

  const allDayTasks = days.flatMap(d => d.tasks);
  
  const filteredDays = days.map(d => ({
    ...d,
    tasks: d.tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(d => d.tasks.length > 0 || d.day.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredMonths = months.map(m => ({
    ...m,
    projects: m.projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(m => m.projects.length > 0 || m.month.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredDayTasks = allDayTasks.filter(t => 
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHosting = hosting.filter(h => 
    h.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const latestMonth = months.length > 0 ? months[months.length - 1] : null;
  const latestMonthProjects = latestMonth ? latestMonth.projects.length : 0;
  const latestMonthRevenue = latestMonth ? latestMonth.projects.reduce((acc, p) => acc + p.cost, 0) : 0;
  const latestMonthName = latestMonth ? latestMonth.month : currentMonthName;

  const stats = {
    total: allDayTasks.length,
    completed: allDayTasks.filter(t => t.status === 'Completed').length,
    pending: allDayTasks.filter(t => t.status === 'Pending').length,
    inProgress: allDayTasks.filter(t => t.status === 'In Progress').length,
    projects: months.reduce((acc, m) => acc + m.projects.length, 0),
    totalRevenue: months.reduce((acc, m) => acc + m.projects.reduce((pAcc, p) => pAcc + p.cost, 0), 0),
    totalProfit: months.reduce((acc, m) => acc + m.projects.reduce((pAcc, p) => pAcc + (p.cost - p.expressExpense), 0), 0),
    latestMonthProjects,
    latestMonthRevenue,
    latestMonthName
  };

  // Check for required environment variables
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
          <p className="text-gray-600 mb-4">
            Missing required environment variables. Please check your deployment configuration.
          </p>
          <div className="text-left bg-gray-50 p-4 rounded text-sm">
            <p><strong>Status:</strong></p>
            <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    const loginUser = users.find(u => u.name.toLowerCase() === loginForm.username.toLowerCase());
    const loginHeading = !loginUser ? "Welcome Back!" : `Welcome Back, ${loginUser.name.split(' ')[0]}!`;
    const loginSubtext = !loginUser ? "Greypixel Agency Private Limited" : 
      loginUser.role === 'Admin' ? "Log in to Manage Your Agency" :
      loginUser.role === 'Tasks' ? "Log in to Manage Your Tasks" :
      loginUser.role === 'Pipeline' ? "Log in to Manage Your Leads" :
      loginUser.role === 'Projects' ? "Log in to Manage Your Hostings" : "Greypixel Agency Private Limited";

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
        <Toaster position="top-right" richColors />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src="https://images.weserv.nl/?url=cloud.greypixelagency.com/greypixel/Logo.svg&output=png&bg=transparent&trim=10" 
                alt="Greypixel Logo" 
                className="h-12 w-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{loginHeading}</h1>
              <p className="text-gray-400 font-medium">{loginSubtext}</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl pl-14 pr-6 py-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl pl-14 pr-6 py-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all shadow-sm"
                    placeholder="••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-sm hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-300 font-medium uppercase tracking-widest">
            Greypixel Agency Private Limited
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-gray-900 font-sans overflow-hidden relative">
      <Toaster position="top-right" richColors />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : -280,
          width: isSidebarOpen ? 280 : 0,
          opacity: 1
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:relative inset-y-0 left-0 bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-hidden z-50 shadow-2xl lg:shadow-none"
      >
        <div className="p-6 w-[280px]">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.weserv.nl/?url=cloud.greypixelagency.com/greypixel/Logo.svg&output=png&bg=transparent&trim=10" 
                  alt="Greypixel Logo" 
                  className="h-8 w-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

          <nav className="space-y-2">
            {(currentUser.role === 'Admin') && (
              <SidebarItem 
                icon={<LayoutDashboard size={20} />} 
                label="Dashboard" 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
                setIsSidebarOpen={setIsSidebarOpen}
              />
            )}
            {(currentUser.role === 'Admin' || currentUser.role === 'Tasks') && (
              <SidebarItem 
                icon={<CheckSquare size={20} />} 
                label="Tasks" 
                active={activeTab === 'tasks'} 
                onClick={() => setActiveTab('tasks')} 
                count={stats.total}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            )}
            {(currentUser.role === 'Admin' || currentUser.role === 'Projects') && (
              <>
                <SidebarItem 
                  icon={<Briefcase size={20} />} 
                  label="Projects" 
                  active={activeTab === 'projects'} 
                  onClick={() => setActiveTab('projects')} 
                  count={stats.projects}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                {currentUser.role === 'Admin' && (
                  <SidebarItem 
                    icon={<DollarSign size={20} />} 
                    label="Invoices" 
                    active={activeTab === 'invoices'} 
                    onClick={() => setActiveTab('invoices')} 
                    count={invoices.length}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                )}
                <SidebarItem 
                  icon={<FileText size={20} />} 
                  label="Contracts" 
                  active={activeTab === 'contracts'} 
                  onClick={() => setActiveTab('contracts')} 
                  count={contracts.length}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                {currentUser.role === 'Admin' && (
                  <SidebarItem 
                    icon={<ClipboardList size={20} />} 
                    label="Quotations" 
                    active={activeTab === 'quotations'} 
                    onClick={() => setActiveTab('quotations')} 
                    count={quotations.length}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                )}
                {currentUser.role === 'Admin' && (
                  <SidebarItem 
                    icon={<DollarSign size={20} />} 
                    label="Expenses" 
                    active={activeTab === 'expenses'} 
                    onClick={() => setActiveTab('expenses')} 
                    count={expenseGroups.length}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                )}
                <SidebarItem 
                  icon={<Users size={20} />} 
                  label="Clients" 
                  active={activeTab === 'clients'} 
                  onClick={() => setActiveTab('clients')} 
                  count={clients.length}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <SidebarItem 
                  icon={<Globe size={20} />} 
                  label="Hosting" 
                  active={activeTab === 'hosting'} 
                  onClick={() => setActiveTab('hosting')} 
                  count={hosting.length}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              </>
            )}
            {(currentUser.role === 'Admin' || currentUser.role === 'Pipeline') && (
              <SidebarItem 
                icon={<Users size={20} />} 
                label="Pipeline" 
                active={activeTab === 'pipeline'} 
                onClick={() => setActiveTab('pipeline')} 
                count={pipelineClients.length}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-50">
          <div className="flex items-center justify-between gap-3 p-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{currentUser.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 w-64 lg:w-80">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {(currentUser.role === 'Admin' || currentUser.role === 'Pipeline' || currentUser.role === 'Projects') && (
              <button 
                onClick={() => setShowChat(true)}
                className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
                title="Personal Notes"
              >
                <MessageSquare size={22} />
                {filteredMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white px-1">
                    {filteredMessages.length}
                  </span>
                )}
              </button>
            )}
            {currentUser.role === 'Admin' && (
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                title="Settings"
              >
                <Settings size={22} />
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Welcome back, {currentUser.name.split(' ')[0]}!</h2>
                    <p className="text-gray-400 font-medium mt-1">Here's what's happening with your projects today.</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Current Date</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Projects" value={stats.projects} color="bg-gray-900" />
                  <StatCard label="Total Revenue" value={stats.totalRevenue} color="bg-emerald-500" isCurrency currency={revenueCurrency} onCurrencyToggle={() => setRevenueCurrency(prev => prev === 'PKR' ? 'USD' : 'PKR')} />
                  <StatCard label={`${stats.latestMonthName} Projects`} value={stats.latestMonthProjects} color="bg-indigo-500" />
                  <StatCard label={`${stats.latestMonthName} Revenue`} value={stats.latestMonthRevenue} color="bg-emerald-500" isCurrency currency={revenueCurrency} onCurrencyToggle={() => setRevenueCurrency(prev => prev === 'PKR' ? 'USD' : 'PKR')} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black">Quick Tasks</h3>
                        <button onClick={() => setActiveTab('tasks')} className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">View All</button>
                      </div>
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                        {/* Quick Add Input */}
                        {days.length > 0 && (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Add a quick task..." 
                              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                  addDayTask(days[0].id, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {filteredDayTasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              <p className="text-sm font-bold text-gray-700 truncate">{task.text}</p>
                            </div>
                          ))}
                          {filteredDayTasks.length === 0 && <p className="text-gray-300 text-sm font-medium text-center py-4">No tasks found</p>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black">Recent Invoices</h3>
                        <button onClick={() => setActiveTab('invoices')} className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">View All</button>
                      </div>
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-4">
                          {invoices.slice(0, 5).map(invoice => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer" onClick={() => { setViewingInvoice(invoice); setActiveTab('invoices'); }}>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                  <DollarSign size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{invoice.clientName}</p>
                                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{invoice.invoiceNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-gray-900">{invoice.currency} {invoice.dueAmount.toLocaleString()}</p>
                                <p className={`text-[9px] font-black uppercase tracking-tighter ${invoice.status === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{invoice.status || 'Pending'}</p>
                              </div>
                            </div>
                          ))}
                          {invoices.length === 0 && <p className="text-gray-300 text-sm font-medium text-center py-4">No invoices found</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black">Recent Projects</h3>
                        <button onClick={() => setActiveTab('projects')} className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">View All</button>
                      </div>
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-4">
                          {months.flatMap(m => m.projects).slice(0, 5).map(project => (
                            <div key={project.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                  <Briefcase size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{project.name}</p>
                                  <p className={`text-[9px] font-black uppercase tracking-tighter ${project.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{project.status}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-gray-900">PKR {project.cost.toLocaleString()}</p>
                                <p className={`text-[9px] font-black uppercase tracking-tighter ${project.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{project.paymentStatus}</p>
                              </div>
                            </div>
                          ))}
                          {months.flatMap(m => m.projects).length === 0 && <p className="text-gray-300 text-sm font-medium text-center py-4">No projects found</p>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black">Recent Quotations</h3>
                        <button onClick={() => setActiveTab('quotations')} className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">View All</button>
                      </div>
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-4">
                          {quotations.slice(0, 5).map(quotation => (
                            <div key={quotation.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer" onClick={() => { setEditingQuotation(quotation); setShowEditQuotation(true); }}>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                  <ClipboardList size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{quotation.clientName}</p>
                                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{quotation.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-gray-900">{quotation.currency} {quotation.totalCost.toLocaleString()}</p>
                                <p className="text-[9px] font-black uppercase tracking-tighter text-gray-400">Quotation</p>
                              </div>
                            </div>
                          ))}
                          {quotations.length === 0 && <p className="text-gray-300 text-sm font-medium text-center py-4">No quotations found</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900">Tasks</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddDay(true)}
                      className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add Day
                    </button>
                    <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
                      <Filter size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredDays.map((daySection) => (
                      <DayCard
                        key={daySection.id}
                        section={daySection}
                        onToggle={() => toggleDay(daySection.id)}
                        onDelete={() => deleteDay(daySection.id)}
                        onAddTask={(text) => addDayTask(daySection.id, text)}
                        onDeleteTask={(taskId) => deleteDayTask(daySection.id, taskId)}
                        onUpdateStatus={(taskId, status) => updateDayTaskStatus(daySection.id, taskId, status)}
                      />
                    ))}
                  </AnimatePresence>

                  {filteredDays.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
                      <Calendar className="mx-auto text-gray-200 mb-6" size={64} />
                      <p className="text-gray-400 font-bold text-lg">No days added yet.</p>
                      <button 
                        onClick={() => setShowAddDay(true)}
                        className="mt-4 text-gray-900 font-black hover:underline"
                      >
                        Add your first day
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900">Projects</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddMonth(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Add Month
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredMonths.map(month => (
                    <MonthCard
                      key={month.id}
                      section={month}
                      onToggle={() => toggleMonth(month.id)}
                      onDelete={() => deleteMonth(month.id)}
                      onAddProject={(name) => addMonthProject(month.id, name)}
                      onDeleteProject={(id) => deleteMonthProject(month.id, id)}
                      onUpdateProject={(id, updates) => updateMonthProject(month.id, id, updates)}
                    />
                  ))}

                  {filteredMonths.length === 0 && (
                    <div className="bg-white rounded-[3rem] p-20 border border-dashed border-gray-200 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
                        <Briefcase size={40} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">No months added yet</h3>
                      <p className="text-gray-400 font-medium mt-2 max-w-xs">Start by adding a month to organize your projects.</p>
                      <button 
                        onClick={() => setShowAddMonth(true)}
                        className="mt-8 text-gray-900 font-black text-sm hover:underline"
                      >
                        Add your first month
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'clients' && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900">Clients</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddClient(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Add Client
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {clients.map((c) => (
                          <ClientRow 
                            key={c.id} 
                            client={c} 
                            onDelete={() => setClients(clients.filter(cl => cl.id !== c.id))}
                            onUpdate={(updates) => setClients(clients.map(cl => cl.id === c.id ? { ...cl, ...updates } : cl))}
                          />
                        ))}
                        {clients.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-bold">
                              No clients found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'hosting' && (
              <motion.div
                key="hosting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900">Hosting</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddHosting(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Add Hosting
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Domain</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created Date</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredHosting.map((h) => (
                          <HostingRow 
                            key={h.id} 
                            hosting={h} 
                            onDelete={() => deleteHosting(h.id)}
                            onUpdate={(updates) => updateHosting(h.id, updates)}
                          />
                        ))}
                        {filteredHosting.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-8 py-20 text-center text-gray-400 font-bold">
                              No hosting entries found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'contracts' && (
              <motion.div
                key="contracts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900">Contracts</h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddContract(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Create Contract
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contracts.map(contract => (
                    <div key={contract.id} className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-gray-100 transition-colors" />
                      
                      <div className="relative">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
                            <FileText size={24} />
                          </div>
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600">
                            v{contract.version}
                          </span>
                          <select 
                            value={contract.status}
                            onChange={(e) => updateContractStatus(contract.id, e.target.value as Contract['status'])}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none ${
                              contract.status === 'Signed' ? 'bg-emerald-50 text-emerald-600' :
                              contract.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                              contract.status === 'Sent' ? 'bg-blue-50 text-blue-600' :
                              'bg-gray-50 text-gray-400'
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Sent">Sent</option>
                            <option value="Signed">Signed</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 truncate">{contract.clientName}</h3>
                        <p className="text-gray-400 font-medium text-sm mt-1">{contract.companyName}</p>

                        <div className="mt-8 space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 font-medium">Amount</span>
                            <span className="font-black text-gray-900">{contract.currency} {contract.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 font-medium">Date</span>
                            <span className="font-black text-gray-900">{contract.contractDate}</span>
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                          <button 
                            onClick={() => setViewingContract(contract)}
                            className="text-gray-900 font-black text-xs hover:underline flex items-center gap-2"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => {
                              setEditingContract(contract);
                              setShowEditContract(true);
                            }}
                            className="text-gray-900 font-black text-xs hover:underline flex items-center gap-2"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              setContracts(contracts.filter(c => c.id !== contract.id));
                              toast.success('Contract deleted');
                            }}
                            className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {contracts.length === 0 && (
                    <div className="col-span-full bg-white rounded-[3rem] p-20 border border-dashed border-gray-200 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
                        <FileText size={40} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">No contracts created yet</h3>
                      <p className="text-gray-400 font-medium mt-2 max-w-xs">Generate professional contracts for your clients in seconds.</p>
                      <button 
                        onClick={() => setShowAddContract(true)}
                        className="mt-8 text-gray-900 font-black text-sm hover:underline"
                      >
                        Create your first contract
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'pipeline' && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Pipeline Clients</h2>
                    <p className="text-gray-400 font-medium mt-1">Track your potential leads and follow-up status.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddPipeline(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Add Client
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Follow-Up Period</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Follow-Up Status</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pipelineClients.map(client => (
                          <tr key={client.id} className="hover:bg-gray-50/30 transition-colors group">
                            <td className="px-8 py-6">
                              <p className="font-black text-gray-900">{client.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">Added: {new Date(client.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-sm text-gray-500 max-w-xs truncate">{client.scope}</p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <select 
                                value={client.status}
                                onChange={(e) => updatePipelineStatus(client.id, e.target.value as PipelineStatus)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none text-center min-w-[120px] ${
                                  client.status === 'Leads Closed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  client.status === 'Discuss' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                  'bg-rose-50 text-rose-600 border border-rose-100'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Discuss">Discuss</option>
                                <option value="Leads Closed">Leads Closed</option>
                              </select>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <select 
                                value={client.followUpPeriod}
                                onChange={(e) => updateFollowUpPeriod(client.id, parseInt(e.target.value))}
                                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 appearance-none cursor-pointer focus:outline-none text-center"
                              >
                                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                  <option key={day} value={day}>{day} {day === 1 ? 'Day' : 'Days'}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <select 
                                value={client.followUpStatus}
                                onChange={(e) => updateFollowUpStatus(client.id, e.target.value as FollowUpStatus)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none text-center min-w-[120px] ${
                                  client.followUpStatus === 'Followed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  'bg-rose-50 text-rose-600 border border-rose-100'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Followed">Followed</option>
                              </select>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => deletePipelineClient(client.id)}
                                className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {pipelineClients.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                                  <Users size={32} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900">No clients in pipeline</h3>
                                <p className="text-gray-400 font-medium mt-1">Start adding potential leads to track your sales pipeline.</p>
                                <button 
                                  onClick={() => setShowAddPipeline(true)}
                                  className="mt-6 text-gray-900 font-black text-sm hover:underline"
                                >
                                  Add your first lead
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quotations' && (
              <motion.div
                key="quotations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Quotations</h2>
                    <p className="text-gray-400 font-medium mt-1">Create and manage professional quotations for your clients.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddQuotation(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Create Quotation
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quotations.map(quote => (
                    <div key={quote.id} className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-gray-100 transition-colors" />
                      
                      <div className="relative">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
                            <ClipboardList size={24} />
                          </div>
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400">
                            {quote.date}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">{quote.clientName}</h3>
                        <p className="text-gray-400 font-medium text-xs sm:text-sm mt-1">{quote.clientBusinessName}</p>

                        <div className="mt-8 grid grid-cols-2 gap-3">
                          <div className="bg-rose-50/50 p-3 sm:p-4 rounded-2xl border border-rose-100/50 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Upfront</span>
                            <span className="text-rose-600 font-bold text-xs sm:text-sm">{quote.upfrontPercentage}%</span>
                          </div>
                          <div className="bg-emerald-50/50 p-3 sm:p-4 rounded-2xl border border-emerald-100/50 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Payable</span>
                            <span className="text-emerald-600 font-bold text-xs sm:text-sm">{quote.currency || 'PKR'} {quote.upfrontAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              {quote.items.length} {quote.items.length === 1 ? 'Service' : 'Services'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => downloadQuotationPDF(quote)}
                              className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-xl transition-all"
                              title="Download PDF"
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingQuotation(quote);
                                setShowEditQuotation(true);
                              }}
                              className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-xl transition-all"
                              title="Edit Quotation"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deleteQuotation(quote.id)}
                              className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete Quotation"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {quotations.length === 0 && (
                    <div className="col-span-full bg-white rounded-[3rem] p-20 border border-dashed border-gray-200 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
                        <ClipboardList size={40} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">No quotations created yet</h3>
                      <p className="text-gray-400 font-medium mt-2 max-w-xs">Generate detailed quotations with service breakdowns and upfront calculations.</p>
                      <button 
                        onClick={() => setShowAddQuotation(true)}
                        className="mt-8 text-gray-900 font-black text-sm hover:underline"
                      >
                        Create your first quotation
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'invoices' && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Invoices</h2>
                    <p className="text-gray-400 font-medium mt-1">Generate and manage professional invoices for your clients.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowAddInvoice(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Create Invoice
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-gray-100 transition-colors" />
                      
                      <div className="relative">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
                            <DollarSign size={24} />
                          </div>
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400">
                            {invoice.invoiceNumber}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">{invoice.clientName}</h3>
                        <p className="text-gray-400 font-medium text-xs sm:text-sm mt-1">{invoice.clientBusinessName}</p>

                        <div className="mt-8 grid grid-cols-2 gap-3">
                          <div className="bg-rose-50/50 p-3 sm:p-4 rounded-2xl border border-rose-100/50 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Due Date</span>
                            <span className="text-rose-600 font-bold text-xs sm:text-sm">{invoice.dueDate}</span>
                          </div>
                          <div className="bg-emerald-50/50 p-3 sm:p-4 rounded-2xl border border-emerald-100/50 flex flex-col justify-center">
                            <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Due</span>
                            <span className="text-emerald-600 font-bold text-xs sm:text-sm">{invoice.currency || 'PKR'} {invoice.dueAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              {invoice.services.length} {invoice.services.length === 1 ? 'Service' : 'Services'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => downloadInvoicePDF(invoice)}
                              className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-xl transition-all"
                              title="Download PDF"
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingInvoice(invoice);
                                setShowEditInvoice(true);
                              }}
                              className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-xl transition-all"
                              title="Edit Invoice"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deleteInvoice(invoice.id)}
                              className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete Invoice"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {invoices.length === 0 && (
                    <div className="col-span-full bg-white rounded-[3rem] p-20 border border-dashed border-gray-200 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
                        <DollarSign size={40} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">No invoices created yet</h3>
                      <p className="text-gray-400 font-medium mt-2 max-w-xs">Generate detailed invoices with service breakdowns and upfront calculations.</p>
                      <button 
                        onClick={() => setShowAddInvoice(true)}
                        className="mt-8 text-gray-900 font-black text-sm hover:underline"
                      >
                        Create your first invoice
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'expenses' && (
              <motion.div
                key="expenses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Expenses</h2>
                    <p className="text-gray-400 font-medium mt-1">Manage and track your business expenses by groups.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setAddingGroup(true)}
                      className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      New Group
                    </button>
                  </div>
                </div>

                {addingGroup && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xl text-gray-900">Create New Expense Group</h3>
                      <button onClick={() => setAddingGroup(false)} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" 
                        placeholder="Group Name (e.g., Marketing, Office Supplies)" 
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                      <button 
                        onClick={() => {
                          if (newGroupName.trim()) {
                            addExpenseGroup(newGroupName);
                            setNewGroupName('');
                            setAddingGroup(false);
                          }
                        }}
                        className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                      >
                        Create Group
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  {expenseGroups.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 border border-dashed border-gray-200 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
                        <DollarSign size={40} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">No expense groups yet</h3>
                      <p className="text-gray-400 font-medium mt-2 max-w-xs">Create your first group to start tracking expenses.</p>
                      <button 
                        onClick={() => setAddingGroup(true)}
                        className="mt-8 text-gray-900 font-black text-sm hover:underline"
                      >
                        Create your first group
                      </button>
                    </div>
                  ) : (
                    expenseGroups.map(group => {
                      const total = group.expenses.reduce((sum, e) => sum + e.amount, 0);
                      return (
                        <motion.div 
                          key={group.id}
                          layout
                          className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all ${group.isClosed ? 'opacity-90' : ''}`}
                        >
                          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg ${group.isClosed ? 'bg-gray-200 text-gray-500 shadow-none' : 'bg-gray-900 text-white shadow-gray-200'}`}>
                                <Briefcase size={24} />
                              </div>
                              <div>
                                <h3 className="font-black text-lg sm:text-xl text-gray-900">{group.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-md border border-gray-100">
                                    {group.expenses.length} {group.expenses.length === 1 ? 'Item' : 'Items'}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${group.isClosed ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                    {group.isClosed ? 'Closed' : 'Active'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <div className="text-right mr-4 hidden sm:block">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                                <p className="text-lg font-black text-gray-900">{total.toLocaleString()} PKR</p>
                              </div>
                              <button 
                                onClick={() => toggleExpenseGroup(group.id)}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${group.isClosed ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'}`}
                              >
                                {group.isClosed ? 'Reopen' : 'Close & Total'}
                              </button>
                              <button 
                                onClick={() => deleteExpenseGroup(group.id)}
                                className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>

                          {!group.isClosed ? (
                            <div className="p-6 sm:p-8 space-y-6">
                              <div className="space-y-3">
                                {group.expenses.map(expense => (
                                  <div key={expense.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl group border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-4">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors" />
                                      <span className="font-bold text-sm text-gray-700">{expense.name}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <span className="font-black text-sm text-gray-900">{expense.amount.toLocaleString()} PKR</span>
                                      <button 
                                        onClick={() => deleteExpense(group.id, expense.id)}
                                        className="p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-lg"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {group.expenses.length === 0 && (
                                  <div className="text-center py-8 text-gray-400 font-medium text-sm italic">
                                    No expenses added to this group yet.
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-50">
                                <input 
                                  type="text" 
                                  placeholder="Expense Name (e.g., Facebook Ads)" 
                                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                                  value={newExpense.groupId === group.id ? newExpense.name : ''}
                                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value, groupId: group.id })}
                                />
                                <div className="flex gap-3">
                                  <input 
                                    type="number" 
                                    placeholder="Amount" 
                                    className="w-full sm:w-32 bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                                    value={newExpense.groupId === group.id ? newExpense.amount || '' : ''}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value), groupId: group.id })}
                                  />
                                  <button 
                                    onClick={() => {
                                      if (newExpense.name.trim() && newExpense.amount > 0) {
                                        addExpense(group.id, newExpense.name, newExpense.amount);
                                        setNewExpense({ name: '', amount: 0, groupId: '' });
                                      } else {
                                        toast.error('Please enter name and amount');
                                      }
                                    }}
                                    className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-black text-xs hover:bg-gray-800 transition-all shadow-md shadow-gray-100 whitespace-nowrap"
                                  >
                                    Add Expense
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-12 flex flex-col items-center justify-center text-center bg-gray-50/10">
                              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                                <CheckCircle2 size={32} />
                              </div>
                              <div className="text-4xl font-black text-gray-900 mb-2">
                                {total.toLocaleString()} PKR
                              </div>
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                Final Total for {group.name}
                              </div>
                              <p className="text-gray-400 text-xs font-medium mt-4 max-w-xs">
                                This group is closed. Reopen it to add or modify expenses.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* View Contract Modal */}
      <AnimatePresence>
        {viewingContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingContract(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-3xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Contract Preview</h2>
                  <p className="text-gray-400 font-medium mt-1">Generated contract for {viewingContract.clientName}.</p>
                </div>
                <button onClick={() => setViewingContract(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
                <div className="bg-white shadow-sm border border-gray-200 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 max-w-2xl mx-auto min-h-[800px] flex flex-col">
                  {/* Page 1 Preview */}
                  <div className="flex flex-col items-center mb-16">
                    <img 
                      src="https://images.weserv.nl/?url=cloud.greypixelagency.com/greypixel/Logo.svg&output=png&bg=transparent&trim=10" 
                      alt="Logo" 
                      className="h-12 object-contain mb-16"
                      referrerPolicy="no-referrer"
                    />
                    <h1 className="text-xl font-black tracking-tight text-gray-900">CONTRACT AGREEMENT</h1>
                  </div>

                  <div className="space-y-6 text-sm text-gray-700">
                    <p className="font-medium">This agreement is made between:</p>
                    
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Company Details</p>
                      <p className="font-bold text-gray-900">{viewingContract.companyName}</p>
                      <p className="text-gray-500">{viewingContract.companyAddress}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-[10px] font-black text-gray-300 uppercase">AND</span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Client Details</p>
                      <p className="font-bold text-gray-900">{viewingContract.clientName}</p>
                      <p className="text-gray-500">{viewingContract.clientAddress}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Person</p>
                      <p className="font-bold text-gray-900">{viewingContract.contactPerson}</p>
                      <p className="text-gray-500">{viewingContract.contactRole}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="font-bold text-gray-900">{viewingContract.contractDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                        <p className="font-bold text-rose-600">{viewingContract.currency} {viewingContract.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 -mx-12">
                    <div className="text-center text-[8px] text-gray-400 mb-1">
                      Greypixelagency.com | Hello@greypixelagency.com
                    </div>
                    <div className="h-[10px] w-full bg-[#5D6658]" />
                  </div>
                  <div className="h-12 bg-gray-50 -mx-12 border-y border-gray-100 flex items-center justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page Break</span>
                  </div>
                  <div className="pt-12">
                    <div className="space-y-6 text-sm text-gray-700">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {viewingContract.howWeWork.split('\n').map((line, i) => {
                            if (line.trim().startsWith('#')) {
                              return <h3 key={i} className="text-lg font-black text-gray-900 mt-6 mb-3">{line.trim().replace(/^#+\s*/, '')}</h3>;
                            }
                            if (line.trim().startsWith('*')) {
                              return <div key={i} className="flex justify-start gap-2 mb-1 ml-4"><span>•</span><span>{line.trim().substring(1).trim()}</span></div>;
                            }
                            return <p key={i} className="mb-2">{line}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xs font-black text-[#5D6658] uppercase tracking-widest mb-4">Terms & Conditions</h3>
                    <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">
                      {viewingContract.terms}
                    </p>
                  </div>

                  <div className="pt-12 grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Signature</p>
                      <div className="h-24 border-b border-gray-200 flex items-end pb-2">
                        {viewingContract.companySignature && (
                          <img src={viewingContract.companySignature} alt="Company Sig" className="max-h-full object-contain" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{viewingContract.companyName}</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Signature</p>
                      <div className="h-24 border-b border-gray-200 flex items-end pb-2">
                        {viewingContract.clientSignature && (
                          <img src={viewingContract.clientSignature} alt="Client Sig" className="max-h-full object-contain" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{viewingContract.clientName}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-12 -mx-12">
                    <div className="text-center text-[8px] text-gray-400 mb-1">
                      Greypixelagency.com | Hello@greypixelagency.com
                    </div>
                    <div className="h-[10px] w-full bg-[#5D6658]" />
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4">
                <button 
                  onClick={() => downloadContractPDF(viewingContract)}
                  className="flex-1 bg-rose-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
                >
                  Download PDF
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([viewingContract.template], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Contract_${viewingContract.clientName.replace(/\s+/g, '_')}_v${viewingContract.version}.txt`;
                    a.click();
                  }}
                  className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Download TXT
                </button>
                <button 
                  onClick={() => {
                    const newV = (viewingContract.version || 1) + 1;
                    const updatedNewContract = {
                      ...viewingContract,
                      id: Math.random().toString(36).substr(2, 9),
                      version: newV,
                    };
                    const updatedTemplate = generateContractContent(updatedNewContract);
                    setContracts([...contracts, { ...updatedNewContract, template: updatedTemplate }]);
                    toast.success(`Created version ${newV}`);
                    setViewingContract(null);
                  }}
                  className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                >
                  Duplicate (v+)
                </button>
                <button 
                  onClick={() => setViewingContract(null)}
                  className="px-10 py-5 bg-white border border-gray-200 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Pipeline Client Modal */}
      <AnimatePresence>
        {showAddPipeline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPipeline(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Add Lead</h2>
                  <p className="text-gray-400 font-medium mt-1">Add a new client to your sales pipeline.</p>
                </div>
                <button onClick={() => setShowAddPipeline(false)} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 sm:p-10 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Name</label>
                    <input 
                      type="text" 
                      value={newPipelineClient.name}
                      onChange={(e) => setNewPipelineClient({ ...newPipelineClient, name: e.target.value })}
                      placeholder="Enter client or company name"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Scope of Work</label>
                    <textarea 
                      value={newPipelineClient.scope}
                      onChange={(e) => setNewPipelineClient({ ...newPipelineClient, scope: e.target.value })}
                      placeholder="Briefly describe the project scope"
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                      <select 
                        value={newPipelineClient.status}
                        onChange={(e) => setNewPipelineClient({ ...newPipelineClient, status: e.target.value as PipelineStatus })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Discuss">Discuss</option>
                        <option value="Leads Closed">Leads Closed</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Follow-Up Period</label>
                      <select 
                        value={newPipelineClient.followUpPeriod}
                        onChange={(e) => setNewPipelineClient({ ...newPipelineClient, followUpPeriod: parseInt(e.target.value) })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                          <option key={day} value={day}>{day} {day === 1 ? 'Day' : 'Days'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Follow-Up Status</label>
                    <select 
                      value={newPipelineClient.followUpStatus}
                      onChange={(e) => setNewPipelineClient({ ...newPipelineClient, followUpStatus: e.target.value as FollowUpStatus })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Followed">Followed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4">
                <button 
                  onClick={addPipelineClient}
                  className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Add to Pipeline
                </button>
                <button 
                  onClick={() => setShowAddPipeline(false)}
                  className="px-10 py-5 bg-white border border-gray-200 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddContract(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Create Contract</h2>
                  <p className="text-gray-400 font-medium mt-1">Fill in the details to generate a contract.</p>
                </div>
                <button onClick={() => setShowAddContract(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Client Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Client Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={newContract.clientName}
                        onChange={(e) => setNewContract({...newContract, clientName: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Email</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        value={newContract.clientEmail}
                        onChange={(e) => setNewContract({...newContract, clientEmail: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Address</label>
                    <input 
                      type="text" 
                      placeholder="456 Client St, City, Country"
                      value={newContract.clientAddress}
                      onChange={(e) => setNewContract({...newContract, clientAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Company Details</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Name</label>
                    <input 
                      type="text" 
                      value={newContract.companyName}
                      onChange={(e) => setNewContract({...newContract, companyName: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Address</label>
                    <input 
                      type="text" 
                      value={newContract.companyAddress}
                      onChange={(e) => setNewContract({...newContract, companyAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Important Note (Red)</label>
                    <textarea 
                      value={newContract.note}
                      onChange={(e) => setNewContract({...newContract, note: e.target.value})}
                      placeholder="e.g. NOTE: Please review the terms carefully..."
                      className="w-full px-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all min-h-[100px] text-rose-900"
                    />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contact Person</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Name</label>
                      <input 
                        type="text" 
                        value={newContract.contactPerson}
                        onChange={(e) => setNewContract({...newContract, contactPerson: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Role</label>
                      <input 
                        type="text" 
                        placeholder="CEO"
                        value={newContract.contactRole}
                        onChange={(e) => setNewContract({...newContract, contactRole: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email</label>
                      <input 
                        type="email" 
                        value={newContract.contactEmail}
                        onChange={(e) => setNewContract({...newContract, contactEmail: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Contract Content */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contract Content</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">How We Work</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setNewContract({...newContract, howWeWork: newContract.howWeWork + '\n# '})}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                          title="Add Heading"
                        >
                          <Bold size={12} /> Heading
                        </button>
                        <button 
                          type="button"
                          onClick={() => setNewContract({...newContract, howWeWork: newContract.howWeWork + '\n* '})}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                          title="Add Bullet"
                        >
                          <List size={12} /> Bullet
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={newContract.howWeWork}
                      onChange={(e) => setNewContract({...newContract, howWeWork: e.target.value})}
                      placeholder="Describe how you work, process, etc. (Use # for headings, * for bullets)"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all min-h-[150px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Terms & Conditions</label>
                    <textarea 
                      value={newContract.terms}
                      onChange={(e) => setNewContract({...newContract, terms: e.target.value})}
                      placeholder="Enter the terms and conditions..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all min-h-[150px]"
                    />
                  </div>
                </div>

                {/* Contract Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contract Info</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Currency</label>
                      <select 
                        value={newContract.currency}
                        onChange={(e) => setNewContract({...newContract, currency: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                      >
                        <option value="PKR">PKR</option>
                        <option value="EUR">EURO</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Amount</label>
                      <input 
                        type="number" 
                        value={newContract.amount}
                        onChange={(e) => setNewContract({...newContract, amount: Number(e.target.value)})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date</label>
                      <input 
                        type="date" 
                        value={newContract.contractDate}
                        onChange={(e) => setNewContract({...newContract, contractDate: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Document Version</label>
                    <input 
                      type="number" 
                      value={newContract.version}
                      onChange={(e) => setNewContract({...newContract, version: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                </div>

                {/* Digital Signatures Upload */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Digital Signatures</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Signature</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSignatureUpload(e, 'company')}
                          className="hidden"
                          id="company-sig-upload"
                        />
                        <label 
                          htmlFor="company-sig-upload"
                          className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
                        >
                          {newContract.companySignature ? (
                            <img src={newContract.companySignature} alt="Company Sig" className="h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <Plus size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest mt-2">Upload Sig</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Signature</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSignatureUpload(e, 'client')}
                          className="hidden"
                          id="client-sig-upload"
                        />
                        <label 
                          htmlFor="client-sig-upload"
                          className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
                        >
                          {newContract.clientSignature ? (
                            <img src={newContract.clientSignature} alt="Client Sig" className="h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <Plus size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest mt-2">Upload Sig</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50 shrink-0">
                <button 
                  onClick={addContract}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Generate Contract
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Edit Contract Modal */}
      <AnimatePresence>
        {showEditContract && editingContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditContract(false);
                setEditingContract(null);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Edit Contract</h2>
                  <p className="text-gray-400 font-medium mt-1">Update the details of this contract.</p>
                </div>
                <button onClick={() => {
                  setShowEditContract(false);
                  setEditingContract(null);
                }} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Client Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Client Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Name</label>
                      <input 
                        type="text" 
                        value={editingContract.clientName}
                        onChange={(e) => setEditingContract({...editingContract, clientName: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Email</label>
                      <input 
                        type="email" 
                        value={editingContract.clientEmail}
                        onChange={(e) => setEditingContract({...editingContract, clientEmail: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Address</label>
                    <input 
                      type="text" 
                      value={editingContract.clientAddress}
                      onChange={(e) => setEditingContract({...editingContract, clientAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Company Details</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Name</label>
                    <input 
                      type="text" 
                      value={editingContract.companyName}
                      onChange={(e) => setEditingContract({...editingContract, companyName: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Address</label>
                    <input 
                      type="text" 
                      value={editingContract.companyAddress}
                      onChange={(e) => setEditingContract({...editingContract, companyAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Important Note (Red)</label>
                    <textarea 
                      value={editingContract.note}
                      onChange={(e) => setEditingContract({...editingContract, note: e.target.value})}
                      className="w-full px-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all min-h-[100px] text-rose-900"
                    />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contact Person</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Name</label>
                      <input 
                        type="text" 
                        value={editingContract.contactPerson}
                        onChange={(e) => setEditingContract({...editingContract, contactPerson: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Role</label>
                      <input 
                        type="text" 
                        value={editingContract.contactRole}
                        onChange={(e) => setEditingContract({...editingContract, contactRole: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email</label>
                      <input 
                        type="email" 
                        value={editingContract.contactEmail}
                        onChange={(e) => setEditingContract({...editingContract, contactEmail: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Contract Content */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contract Content</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">How We Work</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setEditingContract({...editingContract, howWeWork: editingContract.howWeWork + '\n# '})}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                          title="Add Heading"
                        >
                          <Bold size={12} /> Heading
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditingContract({...editingContract, howWeWork: editingContract.howWeWork + '\n* '})}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                          title="Add Bullet"
                        >
                          <List size={12} /> Bullet
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={editingContract.howWeWork}
                      onChange={(e) => setEditingContract({...editingContract, howWeWork: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all min-h-[150px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Terms & Conditions</label>
                    <textarea 
                      value={editingContract.terms}
                      onChange={(e) => setEditingContract({...editingContract, terms: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all min-h-[150px]"
                    />
                  </div>
                </div>

                {/* Contract Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contract Info</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Currency</label>
                      <select 
                        value={editingContract.currency}
                        onChange={(e) => setEditingContract({...editingContract, currency: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                      >
                        <option value="PKR">PKR</option>
                        <option value="EUR">EURO</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Amount</label>
                      <input 
                        type="number" 
                        value={editingContract.amount}
                        onChange={(e) => setEditingContract({...editingContract, amount: Number(e.target.value)})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date</label>
                      <input 
                        type="date" 
                        value={editingContract.contractDate}
                        onChange={(e) => setEditingContract({...editingContract, contractDate: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Document Version</label>
                    <input 
                      type="number" 
                      value={editingContract.version}
                      onChange={(e) => setEditingContract({...editingContract, version: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                </div>

                {/* Digital Signatures Upload */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Digital Signatures</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Signature</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleEditSignatureUpload(e, 'company')}
                          className="hidden"
                          id="edit-company-sig-upload"
                        />
                        <label 
                          htmlFor="edit-company-sig-upload"
                          className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
                        >
                          {editingContract.companySignature ? (
                            <img src={editingContract.companySignature} alt="Company Sig" className="h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <Plus size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest mt-2">Upload Sig</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Signature</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleEditSignatureUpload(e, 'client')}
                          className="hidden"
                          id="edit-client-sig-upload"
                        />
                        <label 
                          htmlFor="edit-client-sig-upload"
                          className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
                        >
                          {editingContract.clientSignature ? (
                            <img src={editingContract.clientSignature} alt="Client Sig" className="h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <Plus size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest mt-2">Upload Sig</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50 shrink-0">
                <button 
                  onClick={updateContract}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Update Contract
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddClient(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Add New Client</h3>
                    <p className="text-gray-400 font-medium mt-1">Manage a new client relationship.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddClient(false)}
                    className="self-end sm:self-auto p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client Name</label>
                    <input 
                      type="text" 
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                    <select 
                      value={newClient.status}
                      onChange={(e) => setNewClient({ ...newClient, status: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Currency</label>
                    <select 
                      value={newClient.currency}
                      onChange={(e) => setNewClient({ ...newClient, currency: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Scope</label>
                    <input 
                      type="text" 
                      value={newClient.scope}
                      onChange={(e) => setNewClient({ ...newClient, scope: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      placeholder="e.g. Monthly SEO & Content"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Amount</label>
                    <input 
                      type="number" 
                      value={newClient.amount}
                      onChange={(e) => setNewClient({ ...newClient, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Handling</label>
                    <div className="flex items-center gap-3 h-[52px]">
                      <button 
                        onClick={() => setNewClient({ ...newClient, isAutoCycle: !newClient.isAutoCycle })}
                        className={`flex-1 h-full rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs ${newClient.isAutoCycle ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                      >
                        {newClient.isAutoCycle ? <RefreshCw size={14} className="animate-spin-slow" /> : <Calendar size={14} />}
                        {newClient.isAutoCycle ? 'Auto Monthly' : 'Manual Date'}
                      </button>
                    </div>
                  </div>
                  {!newClient.isAutoCycle && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Start Date</label>
                        <input 
                          type="date" 
                          value={newClient.date}
                          onChange={(e) => setNewClient({ ...newClient, date: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Due Date</label>
                        <input 
                          type="date" 
                          value={newClient.dueDate}
                          onChange={(e) => setNewClient({ ...newClient, dueDate: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setShowAddClient(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (!newClient.name) {
                        toast.error('Please enter a client name');
                        return;
                      }
                      
                      let finalDate = newClient.date;
                      let finalDueDate = newClient.dueDate;
                      
                      if (newClient.isAutoCycle) {
                        const now = new Date();
                        finalDate = now.toISOString().split('T')[0];
                        const nextMonth = new Date(now);
                        nextMonth.setMonth(now.getMonth() + 1);
                        finalDueDate = nextMonth.toISOString().split('T')[0];
                      }

                      const clientEntry: Client = {
                        ...newClient,
                        id: Math.random().toString(36).substr(2, 9),
                        date: finalDate,
                        dueDate: finalDueDate
                      };
                      setClients([...clients, clientEntry]);
                      setShowAddClient(false);
                      setNewClient({
                        id: '',
                        name: '',
                        status: 'Active',
                        scope: '',
                        amount: 0,
                        currency: 'PKR',
                        date: new Date().toISOString().split('T')[0],
                        dueDate: '',
                        isAutoCycle: true
                      });
                      toast.success('Client added successfully');
                    }}
                    className="flex-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                  >
                    Add Client
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Hosting Modal */}
      <AnimatePresence>
        {showAddHosting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddHosting(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Add Hosting</h2>
                  <p className="text-gray-400 font-medium mt-1">Register a new domain or hosting service.</p>
                </div>
                <button onClick={() => setShowAddHosting(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Domain Name</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="example.com"
                      value={newHosting.domain}
                      onChange={(e) => setNewHosting({...newHosting, domain: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">PKR</span>
                      <input 
                        type="number" 
                        value={newHosting.amount}
                        onChange={(e) => setNewHosting({...newHosting, amount: Number(e.target.value)})}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Period</label>
                    <select 
                      value={newHosting.period}
                      onChange={(e) => setNewHosting({...newHosting, period: e.target.value as HostingPeriod})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none"
                    >
                      <option value="None">Default (1 Week)</option>
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="Custom">Custom (Manual Date)</option>
                    </select>
                  </div>
                </div>

                {newHosting.period === 'Custom' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Due Date (Manual)</label>
                    <input 
                      type="date" 
                      value={newHosting.dueDate}
                      onChange={(e) => setNewHosting({...newHosting, dueDate: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    />
                  </div>
                )}

                <button 
                  onClick={addHosting}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 mt-4"
                >
                  Create Hosting Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-end px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseChat}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="relative bg-white w-full max-w-md h-[90vh] sm:h-[80vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900">Personal Notes</h2>
                  <p className="text-gray-400 font-medium text-xs mt-1">Your private workspace notes.</p>
                </div>
                <button onClick={handleCloseChat} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'System' ? 'items-center' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold ${msg.sender === 'System' ? 'bg-gray-50 text-gray-400 italic text-center' : 'bg-gray-900 text-white shadow-lg shadow-gray-200'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest mt-2 px-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Type a note..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        setMessages([...messages, { id: Math.random().toString(36).substr(2, 9), text: chatInput, sender: 'User', timestamp: new Date().toISOString() }]);
                        setChatInput('');
                      }
                    }}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  />
                  <button 
                    onClick={() => {
                      if (chatInput.trim()) {
                        setMessages([...messages, { id: Math.random().toString(36).substr(2, 9), text: chatInput, sender: 'User', timestamp: new Date().toISOString() }]);
                        setChatInput('');
                      }
                    }}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Settings</h2>
                  <p className="text-gray-400 font-medium mt-1">Manage your team and account preferences.</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                <div className="space-y-10">
                  {/* User Management Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black">User Management</h3>
                      <button 
                        onClick={() => setShowAddUser(true)}
                        className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2"
                      >
                        <UserPlus size={18} />
                        Add New User
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden">
                      <div className="grid grid-cols-12 px-8 py-4 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <div className="col-span-5">User</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-1 text-right">Actions</div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {users.map(user => (
                          <div key={user.id} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-white transition-colors group">
                            <div className="col-span-5 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User size={18} />}
                              </div>
                              <span className="font-bold text-gray-900">{user.name}</span>
                            </div>
                            <div className="col-span-4">
                              <span className="text-sm font-medium text-gray-500">{user.email}</span>
                            </div>
                            <div className="col-span-2">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'Admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                {user.role}
                              </span>
                            </div>
                            <div className="col-span-1 text-right flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setEditingUser(user)}
                                className="p-2 text-gray-300 hover:text-gray-900 transition-all"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => deleteUser(user.id)}
                                className="p-2 text-gray-300 hover:text-rose-500 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showAddQuotation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddQuotation(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Create Quotation</h2>
                  <p className="text-gray-400 font-medium mt-1">Fill in the details to generate a new quotation.</p>
                </div>
                <button onClick={() => setShowAddQuotation(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <User size={20} />
                      Client Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Name</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newQuotation.clientName}
                          onChange={(e) => setNewQuotation({ ...newQuotation, clientName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Business Name</label>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={newQuotation.clientBusinessName}
                          onChange={(e) => setNewQuotation({ ...newQuotation, clientBusinessName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Address</label>
                        <textarea
                          placeholder="Office Address"
                          value={newQuotation.clientAddress}
                          onChange={(e) => setNewQuotation({ ...newQuotation, clientAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Briefcase size={20} />
                      Company Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Name</label>
                        <input
                          type="text"
                          value={newQuotation.companyName}
                          onChange={(e) => setNewQuotation({ ...newQuotation, companyName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Address</label>
                        <textarea
                          value={newQuotation.companyAddress}
                          onChange={(e) => setNewQuotation({ ...newQuotation, companyAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <ClipboardList size={20} />
                      Quotation Scope
                    </h3>
                    <button 
                      onClick={addQuotationItem}
                      className="text-gray-900 font-black text-xs hover:underline flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Service
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-12 px-8 py-4 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <div className="col-span-8">Scope / Service Description</div>
                      <div className="col-span-3">Cost (PKR)</div>
                      <div className="col-span-1 text-right"></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {newQuotation.items?.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 px-8 py-5 items-center gap-4 bg-white">
                          <div className="col-span-8">
                            <input
                              type="text"
                              placeholder="e.g. AI Chatbot Development"
                              value={item.scope}
                              onChange={(e) => updateQuotationItem(item.id, 'scope', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              placeholder="0"
                              value={item.cost || ''}
                              onChange={(e) => updateQuotationItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              onClick={() => removeQuotationItem(item.id)}
                              className="p-2 text-gray-300 hover:text-rose-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6">
                    <div>
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Notes / Terms</span>
                      <textarea
                        placeholder="Enter any additional notes or terms..."
                        value={newQuotation.notes}
                        onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm min-h-[100px] resize-none"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Payment Method</span>
                      <textarea
                        placeholder="e.g. Bank Transfer / JazzCash"
                        value={newQuotation.paymentMethod}
                        onChange={(e) => setNewQuotation({ ...newQuotation, paymentMethod: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-4 pt-6">
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Currency</span>
                        <select
                          value={newQuotation.currency}
                          onChange={(e) => setNewQuotation({ ...newQuotation, currency: e.target.value })}
                          className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                        >
                          <option value="PKR">PKR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="AED">AED</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Cost</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{newQuotation.currency}</span>
                          <div className="relative group">
                            <input
                              type="number"
                              placeholder={newQuotation.items?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0).toString()}
                              value={newQuotation.totalCost || ''}
                              onChange={(e) => setNewQuotation({ ...newQuotation, totalCost: parseFloat(e.target.value) || 0 })}
                              className="w-32 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-black text-lg"
                            />
                            {newQuotation.totalCost !== undefined && newQuotation.totalCost !== 0 && (
                              <button 
                                onClick={() => setNewQuotation({ ...newQuotation, totalCost: undefined })}
                                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-900 transition-all"
                                title="Reset to calculated total"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-red-600 uppercase tracking-widest">Upfront {newQuotation.upfrontPercentage}% Required</span>
                        <div className="relative w-24">
                          <input
                            type="number"
                            value={newQuotation.upfrontPercentage}
                            onChange={(e) => setNewQuotation({ ...newQuotation, upfrontPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-4 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payable</span>
                        <span className="text-2xl font-black text-emerald-600">
                          {newQuotation.currency} {((newQuotation.items?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0) * (newQuotation.upfrontPercentage || 0) / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setShowAddQuotation(false)}
                  className="px-8 py-4 rounded-2xl font-black text-sm text-gray-400 hover:text-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={addQuotation}
                  className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Create Quotation
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showAddInvoice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddInvoice(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Create Invoice</h2>
                  <p className="text-gray-400 font-medium mt-1">Fill in the details to generate a new invoice.</p>
                </div>
                <button onClick={() => setShowAddInvoice(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Calendar size={20} />
                      Invoice Details
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Invoice Number</label>
                        <input
                          type="text"
                          value={newInvoice.invoiceNumber}
                          onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Due Date</label>
                        <input
                          type="date"
                          value={newInvoice.dueDate}
                          onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 pt-4">
                      <User size={20} />
                      Invoice To
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Name</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newInvoice.clientName}
                          onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Business Name</label>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={newInvoice.clientBusinessName}
                          onChange={(e) => setNewInvoice({ ...newInvoice, clientBusinessName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Address</label>
                        <textarea
                          placeholder="Office Address"
                          value={newInvoice.clientAddress}
                          onChange={(e) => setNewInvoice({ ...newInvoice, clientAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Briefcase size={20} />
                      Company Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Name</label>
                        <input
                          type="text"
                          value={newInvoice.companyName}
                          onChange={(e) => setNewInvoice({ ...newInvoice, companyName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Address</label>
                        <textarea
                          value={newInvoice.companyAddress}
                          onChange={(e) => setNewInvoice({ ...newInvoice, companyAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <List size={20} />
                      Services Row
                    </h3>
                    <button 
                      onClick={addInvoiceService}
                      className="text-gray-900 font-black text-xs hover:underline flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Service
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-12 px-8 py-4 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <div className="col-span-8">Service</div>
                      <div className="col-span-3">Cost</div>
                      <div className="col-span-1 text-right"></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {newInvoice.services?.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 px-8 py-5 items-center gap-4 bg-white">
                          <div className="col-span-8">
                            <input
                              type="text"
                              placeholder="e.g. Web Development"
                              value={item.service}
                              onChange={(e) => updateInvoiceService(item.id, 'service', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              placeholder="0"
                              value={item.cost || ''}
                              onChange={(e) => updateInvoiceService(item.id, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              onClick={() => removeInvoiceService(item.id)}
                              className="p-2 text-gray-300 hover:text-rose-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 pt-6">
                    <div className="space-y-8">
                      <div>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Payment Method</span>
                        <div className="relative">
                          <input
                            type="text"
                            list="payment-methods"
                            placeholder="e.g. Bank Transfer / JazzCash"
                            value={newInvoice.paymentMethod}
                            onChange={(e) => setNewInvoice({ ...newInvoice, paymentMethod: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          />
                          <datalist id="payment-methods">
                            {savedPaymentMethods.map(pm => (
                              <option key={pm.id} value={pm.method} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Notes</span>
                        <textarea
                          placeholder="Enter any additional notes..."
                          value={newInvoice.notes}
                          onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Currency</span>
                          <select
                            value={newInvoice.currency}
                            onChange={(e) => setNewInvoice({ ...newInvoice, currency: e.target.value })}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          >
                            <option value="PKR">PKR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="AED">AED</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Sub Total</span>
                        <span className="text-lg font-black text-gray-900">
                          {newInvoice.currency} {(newInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Upfront (%)</span>
                          <input
                            type="number"
                            value={newInvoice.upfrontPercentage}
                            onChange={(e) => setNewInvoice({ ...newInvoice, upfrontPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-3 py-1 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          />
                        </div>
                        <span className="text-lg font-black text-gray-900">
                          {newInvoice.currency} {((newInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0) * (newInvoice.upfrontPercentage || 0) / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">Due Balance</span>
                        <span className="text-3xl font-black text-emerald-600">
                          {newInvoice.currency} {((newInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0) * (1 - (newInvoice.upfrontPercentage || 0) / 100)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setShowAddInvoice(false)}
                  className="px-8 py-4 rounded-2xl font-black text-sm text-gray-400 hover:text-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={addInvoice}
                  className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Create Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showEditInvoice && editingInvoice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditInvoice(false);
                setEditingInvoice(null);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Edit Invoice</h2>
                  <p className="text-gray-400 font-medium mt-1">Update the details of this invoice.</p>
                </div>
                <button onClick={() => {
                  setShowEditInvoice(false);
                  setEditingInvoice(null);
                }} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Calendar size={20} />
                      Invoice Details
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Invoice Number</label>
                        <input
                          type="text"
                          value={editingInvoice.invoiceNumber}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, invoiceNumber: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Due Date</label>
                        <input
                          type="date"
                          value={editingInvoice.dueDate}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 pt-4">
                      <User size={20} />
                      Invoice To
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Name</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={editingInvoice.clientName}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, clientName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Business Name</label>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={editingInvoice.clientBusinessName}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, clientBusinessName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Address</label>
                        <textarea
                          placeholder="Office Address"
                          value={editingInvoice.clientAddress}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, clientAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Briefcase size={20} />
                      Company Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Name</label>
                        <input
                          type="text"
                          value={editingInvoice.companyName}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, companyName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Address</label>
                        <textarea
                          value={editingInvoice.companyAddress}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, companyAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <List size={20} />
                      Services Row
                    </h3>
                    <button 
                      onClick={addInvoiceService}
                      className="text-gray-900 font-black text-xs hover:underline flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Service
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-12 px-8 py-4 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <div className="col-span-8">Service</div>
                      <div className="col-span-3">Cost</div>
                      <div className="col-span-1 text-right"></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {editingInvoice.services?.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 px-8 py-5 items-center gap-4 bg-white">
                          <div className="col-span-8">
                            <input
                              type="text"
                              placeholder="e.g. Web Development"
                              value={item.service}
                              onChange={(e) => updateInvoiceService(item.id, 'service', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              placeholder="0"
                              value={item.cost || ''}
                              onChange={(e) => updateInvoiceService(item.id, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              onClick={() => removeInvoiceService(item.id)}
                              className="p-2 text-gray-300 hover:text-rose-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 pt-6">
                    <div className="space-y-8">
                      <div>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Payment Method</span>
                        <div className="relative">
                          <input
                            type="text"
                            list="payment-methods"
                            placeholder="e.g. Bank Transfer / JazzCash"
                            value={editingInvoice.paymentMethod}
                            onChange={(e) => setEditingInvoice({ ...editingInvoice, paymentMethod: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          />
                          <datalist id="payment-methods">
                            {savedPaymentMethods.map(pm => (
                              <option key={pm.id} value={pm.method} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Notes</span>
                        <textarea
                          placeholder="Enter any additional notes..."
                          value={editingInvoice.notes}
                          onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Currency</span>
                          <select
                            value={editingInvoice.currency}
                            onChange={(e) => setEditingInvoice({ ...editingInvoice, currency: e.target.value })}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          >
                            <option value="PKR">PKR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="AED">AED</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Sub Total</span>
                        <span className="text-lg font-black text-gray-900">
                          {editingInvoice.currency} {(editingInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Upfront (%)</span>
                          <input
                            type="number"
                            value={editingInvoice.upfrontPercentage}
                            onChange={(e) => setEditingInvoice({ ...editingInvoice, upfrontPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-3 py-1 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          />
                        </div>
                        <span className="text-lg font-black text-gray-900">
                          {editingInvoice.currency} {((editingInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0) * (editingInvoice.upfrontPercentage || 0) / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">Due Balance</span>
                        <span className="text-3xl font-black text-emerald-600">
                          {editingInvoice.currency} {((editingInvoice.services?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0) * (1 - (editingInvoice.upfrontPercentage || 0) / 100)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => {
                    setShowEditInvoice(false);
                    setEditingInvoice(null);
                  }}
                  className="px-8 py-4 rounded-2xl font-black text-sm text-gray-400 hover:text-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateInvoice}
                  className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Update Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showEditQuotation && editingQuotation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditQuotation(false);
                setEditingQuotation(null);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Edit Quotation</h2>
                  <p className="text-gray-400 font-medium mt-1">Update the details of this quotation.</p>
                </div>
                <button onClick={() => {
                  setShowEditQuotation(false);
                  setEditingQuotation(null);
                }} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <User size={20} />
                      Client Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Name</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={editingQuotation.clientName}
                          onChange={(e) => setEditingQuotation({ ...editingQuotation, clientName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Business Name</label>
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={editingQuotation.clientBusinessName}
                          onChange={(e) => setEditingQuotation({ ...editingQuotation, clientBusinessName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Client Address</label>
                        <textarea
                          placeholder="Office Address"
                          value={editingQuotation.clientAddress}
                          onChange={(e) => setEditingQuotation({ ...editingQuotation, clientAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Briefcase size={20} />
                      Company Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Name</label>
                        <input
                          type="text"
                          value={editingQuotation.companyName}
                          onChange={(e) => setEditingQuotation({ ...editingQuotation, companyName: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Address</label>
                        <textarea
                          value={editingQuotation.companyAddress}
                          onChange={(e) => setEditingQuotation({ ...editingQuotation, companyAddress: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <ClipboardList size={20} />
                      Quotation Scope
                    </h3>
                    <button 
                      onClick={addEditQuotationItem}
                      className="text-gray-900 font-black text-xs hover:underline flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Service
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-12 px-8 py-4 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <div className="col-span-8">Scope / Service Description</div>
                      <div className="col-span-3">Cost (PKR)</div>
                      <div className="col-span-1 text-right"></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {editingQuotation.items?.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 px-8 py-5 items-center gap-4 bg-white">
                          <div className="col-span-8">
                            <input
                              type="text"
                              placeholder="e.g. AI Chatbot Development"
                              value={item.scope}
                              onChange={(e) => updateEditQuotationItem(item.id, 'scope', e.target.value)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              placeholder="0"
                              value={item.cost || ''}
                              onChange={(e) => updateEditQuotationItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:border-gray-200 focus:outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              onClick={() => removeEditQuotationItem(item.id)}
                              className="p-2 text-gray-300 hover:text-rose-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6">
                    <div>
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Notes / Terms</span>
                      <textarea
                        placeholder="Enter any additional notes or terms..."
                        value={editingQuotation.notes}
                        onChange={(e) => setEditingQuotation({ ...editingQuotation, notes: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm min-h-[100px] resize-none"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">Payment Method</span>
                      <textarea
                        placeholder="e.g. Bank Transfer / JazzCash"
                        value={editingQuotation.paymentMethod}
                        onChange={(e) => setEditingQuotation({ ...editingQuotation, paymentMethod: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-4 pt-6">
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Currency</span>
                        <select
                          value={editingQuotation.currency}
                          onChange={(e) => setEditingQuotation({ ...editingQuotation, currency: e.target.value })}
                          className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                        >
                          <option value="PKR">PKR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="AED">AED</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Cost</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{editingQuotation.currency}</span>
                          <div className="relative group">
                            <input
                              type="number"
                              placeholder={editingQuotation.items?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0).toString()}
                              value={editingQuotation.totalCost || ''}
                              onChange={(e) => setEditingQuotation({ ...editingQuotation, totalCost: parseFloat(e.target.value) || 0 })}
                              className="w-32 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-black text-lg"
                            />
                            {editingQuotation.totalCost !== undefined && editingQuotation.totalCost !== 0 && (
                              <button 
                                onClick={() => setEditingQuotation({ ...editingQuotation, totalCost: undefined })}
                                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-900 transition-all"
                                title="Reset to calculated total"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-red-600 uppercase tracking-widest">Upfront {editingQuotation.upfrontPercentage}% Required</span>
                        <div className="relative w-24">
                          <input
                            type="number"
                            value={editingQuotation.upfrontPercentage}
                            onChange={(e) => setEditingQuotation({ ...editingQuotation, upfrontPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-4 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold text-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payable</span>
                        <span className="text-2xl font-black text-emerald-600">
                          {editingQuotation.currency} {((editingQuotation.items?.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0) * (editingQuotation.upfrontPercentage || 0) / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => {
                    setShowEditQuotation(false);
                    setEditingQuotation(null);
                  }}
                  className="px-8 py-4 rounded-2xl font-black text-sm text-gray-400 hover:text-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateQuotation}
                  className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Update Quotation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddUser(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Add New User</h2>
                <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold appearance-none"
                    >
                      <option value="Tasks">Tasks</option>
                      <option value="Projects">Projects</option>
                      <option value="Pipeline">Pipeline</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addUser}
                    className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Edit User</h2>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="••••"
                      value={editingUser.password}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold appearance-none"
                    >
                      <option value="Tasks">Tasks</option>
                      <option value="Projects">Projects</option>
                      <option value="Pipeline">Pipeline</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateUser}
                    className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Month Modal */}
      <AnimatePresence>
        {showAddMonth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMonth(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Add New Month</h2>
                <button onClick={() => setShowAddMonth(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Month Name</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. March 2024"
                      value={newMonthName}
                      onChange={(e) => setNewMonthName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addMonth()}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAddMonth(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMonth}
                    className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                  >
                    Create Month
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Day Modal */}
      <AnimatePresence>
        {showAddDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDay(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Add Day</h2>
                <button onClick={() => setShowAddDay(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Day/Section Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Monday"
                    value={newDayName}
                    onChange={(e) => setNewDayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDay()}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-bold"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAddDay(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addDay}
                    className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                  >
                    Add Day
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProjectRowProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onDelete: () => void;
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'Pending': return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'In Progress': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'Client Review': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Revisions': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const ProjectRow: FC<ProjectRowProps> = ({ 
  project, 
  onUpdate, 
  onDelete 
}) => {
  const pendingAmount = project.cost - project.received;
  const trade5 = project.cost * 0.05;
  const profit = project.cost - project.expressExpense;
  const statusColor = getStatusColor(project.status);

  return (
    <div className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0">
      <div className="col-span-3">
        <input 
          type="text" 
          value={project.name} 
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full bg-transparent font-bold text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 rounded px-1"
        />
      </div>
      <div className="col-span-1">
        <div className={`rounded-lg border px-2 py-1 ${statusColor} transition-colors`}>
          <select 
            value={project.status} 
            onChange={(e) => onUpdate({ status: e.target.value as ProjectStatus })}
            className="w-full bg-transparent text-[10px] font-black uppercase tracking-tighter focus:outline-none cursor-pointer appearance-none"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Client Review">Review</option>
            <option value="Revisions">Revisions</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="col-span-1">
        <input 
          type="number" 
          value={project.cost || ''} 
          placeholder="Cost"
          onChange={(e) => onUpdate({ cost: Number(e.target.value) })}
          className="w-full bg-transparent text-sm font-medium focus:outline-none"
        />
      </div>
      <div className="col-span-1">
        <input 
          type="number" 
          value={project.received || ''} 
          placeholder="Rec"
          onChange={(e) => onUpdate({ received: Number(e.target.value) })}
          className="w-full bg-transparent text-sm font-medium focus:outline-none"
        />
      </div>
      <div className="col-span-1 text-sm font-bold text-gray-400">
        {pendingAmount}
      </div>
      <div className="col-span-1 text-sm font-bold text-blue-500">
        {trade5.toFixed(0)}
      </div>
      <div className="col-span-1">
        <input 
          type="number" 
          value={project.expressExpense || ''} 
          placeholder="Urgent"
          onChange={(e) => onUpdate({ expressExpense: Number(e.target.value) })}
          className="w-full bg-transparent text-sm font-medium focus:outline-none"
        />
      </div>
      <div className={`col-span-1 text-sm font-black ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {profit.toFixed(0)}
      </div>
      <div className="col-span-1">
        <select 
          value={project.paymentStatus} 
          onChange={(e) => onUpdate({ paymentStatus: e.target.value as PaymentStatus })}
          className={`w-full bg-transparent text-[10px] font-black uppercase tracking-wider focus:outline-none cursor-pointer ${project.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>
      <div className="col-span-1 text-right">
        <button onClick={onDelete} className="p-2 text-gray-300 hover:text-rose-500 transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

interface MonthCardProps {
  section: MonthSection;
  onToggle: () => void;
  onDelete: () => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

const MonthCard: FC<MonthCardProps> = ({ 
  section, 
  onToggle, 
  onDelete, 
  onAddProject, 
  onDeleteProject, 
  onUpdateProject 
}) => {
  const [projectName, setProjectName] = useState('');

  const handleAdd = () => {
    if (projectName.trim()) {
      onAddProject(projectName);
      setProjectName('');
    }
  };

  const totals = section.projects.reduce((acc, p) => ({
    cost: acc.cost + p.cost,
    rec: acc.rec + p.received,
    pending: acc.pending + (p.cost - p.received),
    trade5: acc.trade5 + (p.cost * 0.05),
    express: acc.express + p.expressExpense,
    profit: acc.profit + (p.cost - p.expressExpense)
  }), { cost: 0, rec: 0, pending: 0, trade5: 0, express: 0, profit: 0 });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 sm:p-8 flex items-center justify-between">
        <button onClick={onToggle} className="flex items-center gap-4 sm:gap-6 group flex-1 text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] sm:rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all shrink-0">
            {section.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">{section.month}</h3>
              {!section.isExpanded && (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex h-1.5 rounded-full overflow-hidden bg-gray-100 w-32">
                    {['Pending', 'In Progress', 'Client Review', 'Revisions', 'Completed'].map(status => {
                      const count = section.projects.filter(p => p.status === status).length;
                      if (count === 0) return null;
                      const percentage = (count / section.projects.length) * 100;
                      const color = getStatusColor(status as ProjectStatus).split(' ')[0];
                      return (
                        <div 
                          key={status} 
                          style={{ width: `${percentage}%` }} 
                          className={color}
                          title={`${status}: ${count}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-1">
                    {section.projects.slice(0, 5).map(p => (
                      <div 
                        key={p.id} 
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(p.status).split(' ')[0]}`} 
                      />
                    ))}
                    {section.projects.length > 5 && <span className="text-[8px] font-bold text-gray-400">+{section.projects.length - 5}</span>}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {section.projects.length} {section.projects.length === 1 ? 'Project' : 'Projects'}
              </p>
              
              {!section.isExpanded ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase">Cost:</span>
                    <span className="text-[10px] font-black text-gray-700">{totals.cost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-xl border border-blue-100">
                    <span className="text-[9px] font-black text-blue-400 uppercase">Rec:</span>
                    <span className="text-[10px] font-black text-blue-700">{totals.rec.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-xl border border-rose-100">
                    <span className="text-[9px] font-black text-rose-400 uppercase">Pend:</span>
                    <span className="text-[10px] font-black text-rose-700">{totals.pending.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-xl border border-indigo-100">
                    <span className="text-[9px] font-black text-indigo-400 uppercase">5%:</span>
                    <span className="text-[10px] font-black text-indigo-700">{totals.trade5.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
                    <span className="text-[9px] font-black text-amber-400 uppercase">Exp:</span>
                    <span className="text-[10px] font-black text-amber-700">{totals.express.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100">
                    <span className="text-[9px] font-black text-emerald-400 uppercase">Profit:</span>
                    <span className="text-[10px] font-black text-emerald-700">PKR {totals.profit.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-700">Total Profit: PKR {totals.profit.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </button>
        <button onClick={onDelete} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
          <Trash2 size={20} />
        </button>
      </div>

      <AnimatePresence>
        {section.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="pb-10">
              <div className="bg-gray-50/50 border-y border-gray-100 grid grid-cols-12 gap-4 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="col-span-3">Project Name</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Cost</div>
                <div className="col-span-1">Received</div>
                <div className="col-span-1">Pending</div>
                <div className="col-span-1">5% Trade</div>
                <div className="col-span-1">Express</div>
                <div className="col-span-1">Profit</div>
                <div className="col-span-1">Payment</div>
                <div className="col-span-1 text-right"></div>
              </div>
              
              <div className="divide-y divide-gray-50">
                {section.projects.map(project => (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    onUpdate={(updates) => onUpdateProject(project.id, updates)}
                    onDelete={() => onDeleteProject(project.id)}
                  />
                ))}
              </div>

              <div className="px-8 mt-6 flex gap-3">
                <input
                  type="text"
                  placeholder="What's the project name?"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                <button
                  onClick={handleAdd}
                  className="px-6 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-2"
                >
                  <Plus size={20} />
                  <span className="text-sm font-bold">Add Project</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface DayCardProps {
  section: DaySection;
  onToggle: () => void;
  onDelete: () => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

const DayCard: FC<DayCardProps> = ({ section, onToggle, onDelete, onAddTask, onDeleteTask, onUpdateStatus }) => {
  const [taskInput, setTaskInput] = useState('');

  const handleAddTask = () => {
    if (taskInput.trim()) {
      onAddTask(taskInput);
      setTaskInput('');
    }
  };

  const statusCounts = section.tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 sm:p-8 flex items-center justify-between">
        <button 
          onClick={onToggle}
          className="flex items-center gap-4 sm:gap-6 group flex-1 text-left"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] sm:rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
            {section.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-black text-gray-900">{section.day}</h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {section.tasks.length} {section.tasks.length === 1 ? 'Task' : 'Tasks'}
              </p>
              
              {!section.isExpanded && section.tasks.length > 0 && (
                <div className="flex gap-2">
                  {statusCounts['Pending'] > 0 && (
                    <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-xl border border-rose-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-black text-rose-700">{statusCounts['Pending']}</span>
                    </div>
                  )}
                  {statusCounts['In Progress'] > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black text-amber-700">{statusCounts['In Progress']}</span>
                    </div>
                  )}
                  {statusCounts['Completed'] > 0 && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-700">{statusCounts['Completed']}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
            title="Delete Day"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {section.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-8 pb-10 space-y-6">
              {/* Task List */}
              <div className="space-y-3">
                {section.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={() => onDeleteTask(task.id)}
                    onUpdateStatus={(status) => onUpdateStatus(task.id, status)}
                  />
                ))}
              </div>

              {/* Add Task Input */}
              <div className="flex gap-3 pt-2">
                <input
                  type="text"
                  placeholder="What's the next step?"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                <button
                  onClick={handleAddTask}
                  className="px-6 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-2"
                >
                  <Plus size={20} />
                  <span className="text-sm font-bold">Add Task</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const SidebarItem: FC<{ icon: ReactNode, label: string, active?: boolean, onClick?: () => void, count?: number, setIsSidebarOpen?: (open: boolean) => void }> = ({ icon, label, active = false, onClick, count, setIsSidebarOpen }) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (window.innerWidth < 1024 && setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group ${active ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'} transition-colors`}>
          {icon}
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

const StatCard: FC<{ label: string, value: number, color: string, isCurrency?: boolean, currency?: 'PKR' | 'USD', onCurrencyToggle?: () => void }> = ({ label, value, color, isCurrency, currency = 'PKR', onCurrencyToggle }) => {
  const displayValue = isCurrency && currency === 'USD' ? value / 280 : value;
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-32 sm:h-40 group hover:shadow-xl hover:shadow-gray-100 transition-all relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        <div className="flex items-center gap-2">
          {isCurrency && onCurrencyToggle && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCurrencyToggle();
              }}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
              title={`Switch to ${currency === 'PKR' ? 'USD' : 'PKR'}`}
            >
              <DollarSign size={12} className={currency === 'USD' ? 'text-emerald-500' : ''} />
            </button>
          )}
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${color}`} />
        </div>
      </div>
      <p className="text-2xl sm:text-4xl font-black text-gray-900 relative z-10">
        {isCurrency ? `${currency} ${displayValue.toLocaleString(undefined, { maximumFractionDigits: currency === 'USD' ? 2 : 0 })}` : value}
      </p>
    </div>
  );
}

interface ProjectPreviewCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectPreviewCard: FC<ProjectPreviewCardProps> = ({ project, onClick }) => {
  const completed = project.tasks.filter(t => t.status === 'Completed').length;
  const total = project.tasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left group hover:shadow-xl hover:shadow-gray-100 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
          <Briefcase size={18} />
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{progress}% Done</span>
      </div>
      <h4 className="font-black text-gray-900 mb-1 truncate">{project.name}</h4>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{total} Tasks</p>
      
      <div className="mt-4 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gray-900"
        />
      </div>
    </button>
  );
}

interface ProjectCardProps {
  project: Project;
  onToggle: () => void;
  onDelete: () => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

const ProjectCard: FC<ProjectCardProps> = ({ project, onToggle, onDelete, onAddTask, onDeleteTask, onUpdateStatus }) => {
  const [taskInput, setTaskInput] = useState('');

  const handleAddTask = () => {
    if (taskInput.trim()) {
      onAddTask(taskInput);
      setTaskInput('');
    }
  };

  const statusCounts = project.tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 sm:p-8 flex items-center justify-between">
        <button 
          onClick={onToggle}
          className="flex items-center gap-4 sm:gap-6 group flex-1 text-left"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] sm:rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
            {project.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-black text-gray-900">{project.name}</h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {project.tasks.length} {project.tasks.length === 1 ? 'Task' : 'Tasks'}
              </p>
              
              {!project.isExpanded && project.tasks.length > 0 && (
                <div className="flex gap-2">
                  {statusCounts['Pending'] > 0 && (
                    <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-xl border border-rose-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-black text-rose-700">{statusCounts['Pending']}</span>
                    </div>
                  )}
                  {statusCounts['In Progress'] > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black text-amber-700">{statusCounts['In Progress']}</span>
                    </div>
                  )}
                  {statusCounts['Completed'] > 0 && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-700">{statusCounts['Completed']}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
            title="Delete Project"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {project.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-8 pb-10 space-y-6">
              {/* Task List */}
              <div className="space-y-3">
                {project.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={() => onDeleteTask(task.id)}
                    onUpdateStatus={(status) => onUpdateStatus(task.id, status)}
                  />
                ))}
              </div>

              {/* Add Task Input */}
              <div className="flex gap-3 pt-2">
                <input
                  type="text"
                  placeholder="What's the next step?"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                <button
                  onClick={handleAddTask}
                  className="px-6 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center gap-2"
                >
                  <Plus size={20} />
                  <span className="text-sm font-bold">Add Task</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface TaskItemProps {
  task: Task;
  onDelete: () => void;
  onUpdateStatus: (status: Status) => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onDelete, onUpdateStatus }) => {
  const statusConfig = {
    'Completed': { color: 'bg-emerald-500', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700' },
    'Pending': { color: 'bg-rose-500', icon: AlertCircle, bg: 'bg-rose-50', text: 'text-rose-700' },
    'In Progress': { color: 'bg-amber-500', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700' }
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[1.5rem] group hover:border-gray-300 transition-all"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-2xl ${config.bg} ${config.text} flex items-center justify-center`}>
          <StatusIcon size={20} />
        </div>
        <span className="text-sm font-bold text-gray-700">
          {task.text}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(e.target.value as Status)}
            className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all cursor-pointer ${config.bg} ${config.text}`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <ChevronDown size={14} />
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-2.5 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}

interface ClientRowProps {
  client: Client;
  onDelete: () => void;
  onUpdate: (updates: Partial<Client>) => void;
}

const ClientRow: FC<ClientRowProps> = ({ client, onDelete, onUpdate }) => {
  return (
    <tr className="hover:bg-gray-50/50 transition-all group">
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
            <User size={14} />
          </div>
          <span className="text-sm font-bold text-gray-900">{client.name}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="relative inline-block">
          <select
            value={client.status}
            onChange={(e) => onUpdate({ status: e.target.value as any })}
            className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all cursor-pointer ${
              client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 
              client.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 
              'bg-gray-50 text-gray-400'
            }`}
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <ChevronDown size={14} />
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className="text-sm text-gray-500 max-w-xs truncate block">{client.scope}</span>
      </td>
      <td className="px-8 py-6">
        <span className="text-sm font-black text-gray-900">{client.currency} {client.amount.toLocaleString()}</span>
      </td>
      <td className="px-8 py-6">
        <span className="text-xs font-bold text-gray-400">{client.date}</span>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2">
          {client.isAutoCycle && <RefreshCw size={12} className="text-indigo-400" />}
          <span className={`text-xs font-black ${new Date(client.dueDate) < new Date() ? 'text-rose-500' : 'text-gray-900'}`}>
            {client.dueDate}
          </span>
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <button
          onClick={onDelete}
          className="p-2.5 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}

interface HostingRowProps {
  hosting: Hosting;
  onDelete: () => void;
  onUpdate: (updates: Partial<Hosting>) => void;
}

const HostingRow: FC<HostingRowProps> = ({ hosting, onDelete, onUpdate }) => {
  return (
    <tr className="hover:bg-gray-50/50 transition-all group border-b border-gray-50 last:border-0 md:border-0">
      <td className="px-4 sm:px-8 py-4 sm:py-6 block md:table-cell">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Globe size={14} />
            </div>
            <span className="text-sm font-bold text-gray-900">{hosting.domain}</span>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-2 text-rose-400 hover:text-rose-600 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-2 md:py-6 block md:table-cell">
        <div className="flex items-center justify-between md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Amount</span>
          <span className="text-sm font-black text-gray-900">PKR {hosting.amount.toLocaleString()}</span>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-2 md:py-6 block md:table-cell">
        <div className="flex items-center justify-between md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Created</span>
          <span className="text-xs font-bold text-gray-400">{hosting.createdDate}</span>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-2 md:py-6 block md:table-cell">
        <div className="flex items-center justify-between md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Period</span>
          <div className="relative inline-block">
            <select
              value={hosting.period}
              onChange={(e) => onUpdate({ period: e.target.value as HostingPeriod })}
              className="appearance-none bg-gray-50 border-none text-[10px] font-black uppercase tracking-widest rounded-lg pl-3 pr-8 py-1.5 focus:ring-0 cursor-pointer"
            >
              <option value="None">None</option>
              <option value="1 Month">1 Month</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
              <option value="1 Year">1 Year</option>
              <option value="Custom">Custom</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <ChevronDown size={12} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-2 md:py-6 block md:table-cell">
        <div className="flex items-center justify-between md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Due Date</span>
          {hosting.period === 'Custom' ? (
            <input
              type="date"
              value={hosting.dueDate}
              onChange={(e) => onUpdate({ dueDate: e.target.value })}
              className="bg-gray-50 border-none text-xs font-black rounded-lg px-2 py-1 focus:ring-0 cursor-pointer"
            />
          ) : (
            <span className={`text-xs font-black ${new Date(hosting.dueDate) < new Date() ? 'text-rose-500' : 'text-gray-900'}`}>
              {hosting.dueDate}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 sm:px-8 py-2 md:py-6 block md:table-cell">
        <div className="flex items-center justify-between md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Payment</span>
          <div className="relative inline-block">
            <select
              value={hosting.paymentStatus}
              onChange={(e) => onUpdate({ paymentStatus: e.target.value as PaymentStatus })}
              className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all cursor-pointer ${
                hosting.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-2 md:py-6 block md:table-cell">
        <div className="flex items-center justify-between md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:hidden">Invoice</span>
          <div className="relative inline-block">
            <select
              value={hosting.invoiceStatus}
              onChange={(e) => onUpdate({ invoiceStatus: e.target.value as InvoiceStatus })}
              className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all cursor-pointer ${
                hosting.invoiceStatus === 'Completed' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-4 md:py-6 hidden md:table-cell">
        <button
          onClick={onDelete}
          className="p-2.5 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}
