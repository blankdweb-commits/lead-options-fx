import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  Search, 
  MoreVertical, 
  LogOut, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Database,
  Zap,
  Check,
  X,
  Power,
  Lock,
  MessageSquare,
  Bell,
  ArrowRight,
  Loader2,
  Send,
  Edit,
  Trash2,
  Settings,
  CreditCard,
  Wallet,
  DollarSign,
  Save,
  Banknote,
  Headset,
  Clock,
  Bot,
  BookOpen,
  Plus,
  FileText,
  ScrollText,
  UserCog,
  Filter,
  TrendingDown
} from 'lucide-react';
import { ChatSession } from '../types';
import { SystemSettings } from '../App';

interface AdminPanelProps {
  onLogout: () => void;
  chatSessions: ChatSession[];
  onAdminSendMessage: (userId: string, text: string) => void;
  systemSettings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onCrashTrades: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  lastLogin: string;
}

interface Request {
  id: number;
  type: string;
  user: string;
  amount: number;
  method: string;
  time: string;
}

interface TrainingItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
  type: 'security' | 'financial' | 'admin' | 'system';
}

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Alex Morgan', email: 'alex.morgan@leadoptions.fx', role: 'Trader', status: 'Active', balance: 250500.00, lastLogin: 'Today, 09:41 AM' },
  { id: 2, name: 'Sarah Connor', email: 's.connor@sky.net', role: 'Trader', status: 'Suspended', balance: 12450.00, lastLogin: 'Yesterday, 2:00 PM' },
  { id: 3, name: 'John Doe', email: 'j.doe@example.com', role: 'Trader', status: 'Pending', balance: 0.00, lastLogin: 'Never' },
  { id: 4, name: 'Admin User', email: 'admin@leadoptions.fx', role: 'Administrator', status: 'Active', balance: 0.00, lastLogin: 'Just now' },
  { id: 5, name: 'Michael Burry', email: 'bigshort@fund.com', role: 'VIP Trader', status: 'Active', balance: 1500000.00, lastLogin: 'Oct 24, 2023' },
];

const INITIAL_REQUESTS: Request[] = [
    { id: 101, type: 'Deposit', user: 'Alex Morgan', amount: 5000, method: 'Bitcoin', time: '10 mins ago' },
    { id: 102, type: 'Withdrawal', user: 'Sarah Connor', amount: 1200, method: 'USDT', time: '1 hour ago' },
    { id: 103, type: 'KYC', user: 'John Doe', amount: 0, method: 'ID Verification', time: '2 hours ago' },
];

const INITIAL_TRAINING_DATA: TrainingItem[] = [
    { id: 1, category: 'Account Security', question: 'How do I reset my password?', answer: 'You can reset your password by clicking "Forgot Password" on the login page. An email with reset instructions will be sent to your registered address.' },
    { id: 2, category: 'Withdrawals', question: 'How long do withdrawals take?', answer: 'Standard withdrawals are processed within 24 hours. VIP withdrawals are instant.' },
    { id: 3, category: 'Trading', question: 'What is the minimum trade amount?', answer: 'The minimum trade amount on our platform is $1.00 USD.' },
    { id: 4, category: 'Verification', question: 'Why is my KYC pending?', answer: 'KYC verification typically takes 24-48 hours. Ensure your documents are clear and valid.' },
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, chatSessions, onAdminSendMessage, systemSettings, onUpdateSettings, onCrashTrades }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'actions' | 'users' | 'finance' | 'system' | 'support' | 'training'>('actions');
  
  // Data State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [pendingRequests, setPendingRequests] = useState<Request[]>(INITIAL_REQUESTS);
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Audit Log State
  const [viewingLogsUser, setViewingLogsUser] = useState<User | null>(null);

  // Training Data State
  const [trainingData, setTrainingData] = useState<TrainingItem[]>(INITIAL_TRAINING_DATA);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [trainingForm, setTrainingForm] = useState<Partial<TrainingItem>>({});
  const [trainingFilter, setTrainingFilter] = useState('All');

  // Support Chat State
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminChatInput, setAdminChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // System Config State
  const [systemConfig, setSystemConfig] = useState({
      maintenance: false,
      withdrawalsPaused: false,
      registrationsOpen: true
  });

  // Local state for wallets to allow editing before saving
  const [tempSettings, setTempSettings] = useState(systemSettings);

  // Sync temp settings if props change
  useEffect(() => {
    setTempSettings(systemSettings);
  }, [systemSettings]);

  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'support' && selectedChatUserId) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, selectedChatUserId, chatSessions]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestAction = (id: number, action: 'approve' | 'reject') => {
      // Animate removal
      const element = document.getElementById(`request-${id}`);
      if (element) {
          element.style.transform = action === 'approve' ? 'translateX(100px)' : 'translateX(-100px)';
          element.style.opacity = '0';
      }
      
      setTimeout(() => {
          setPendingRequests(prev => prev.filter(req => req.id !== id));
      }, 300);
  };

  const toggleSystemSetting = (key: keyof typeof systemConfig) => {
      setSystemConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendBroadcast = () => {
      if (!broadcastMsg.trim()) return;
      setBroadcastStatus('sending');
      setTimeout(() => {
          setBroadcastStatus('success');
          setBroadcastMsg('');
          setTimeout(() => setBroadcastStatus('idle'), 3000);
      }, 1500);
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedChatUserId || !adminChatInput.trim()) return;
      
      onAdminSendMessage(selectedChatUserId, adminChatInput);
      setAdminChatInput('');
  };

  const handleSaveSystemSettings = () => {
    onUpdateSettings(tempSettings);
  };

  const handleCrashClick = () => {
      if(window.confirm("CRITICAL WARNING: This will simulate a market crash for the active user session. Their balance and profit will be decimated. Are you sure?")) {
          onCrashTrades();
      }
  }

  // User Management Handlers
  const handleEditUser = (user: User) => {
      setEditingUser({ ...user });
  };

  const handleSaveUser = () => {
      if (!editingUser) return;
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
  };

  const handleDeleteUser = (id: number) => {
      if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          setUsers(prev => prev.filter(u => u.id !== id));
      }
  };

  const updateUserField = (field: keyof User, value: any) => {
      if (editingUser) {
          setEditingUser({ ...editingUser, [field]: value });
      }
  };

  // Mock Audit Log Generator
  const generateMockAuditLogs = (user: User): AuditLog[] => {
      return [
          { 
              id: '1', 
              action: 'Login Successful', 
              details: 'Logged in from IP 192.168.4.1 (New York, US)', 
              performedBy: 'System', 
              timestamp: 'Today, 09:41 AM',
              type: 'system'
          },
          { 
              id: '2', 
              action: 'Trade Executed', 
              details: 'Opened position EURUSD (Buy) - $500.00', 
              performedBy: user.name, 
              timestamp: 'Today, 09:30 AM',
              type: 'financial'
          },
          { 
              id: '3', 
              action: 'Balance Adjustment', 
              details: 'Manual credit added: +$2,500.00 (Bonus)', 
              performedBy: 'Admin User', 
              timestamp: 'Yesterday, 4:15 PM',
              type: 'admin'
          },
          { 
              id: '4', 
              action: 'Role Update', 
              details: `Role changed to ${user.role}`, 
              performedBy: 'Super Admin', 
              timestamp: 'Oct 20, 2023, 2:00 PM',
              type: 'admin'
          },
          { 
              id: '5', 
              action: 'Security Alert', 
              details: 'Failed login attempt detected', 
              performedBy: 'System', 
              timestamp: 'Oct 18, 2023, 11:00 PM',
              type: 'security'
          },
      ];
  };

  // Training Data Handlers
  const handleOpenAddTraining = () => {
      setTrainingForm({ category: 'General', question: '', answer: '' });
      setIsTrainingModalOpen(true);
  };

  const handleEditTraining = (item: TrainingItem) => {
      setTrainingForm(item);
      setIsTrainingModalOpen(true);
  };

  const handleDeleteTraining = (id: number) => {
      if (window.confirm('Delete this training data?')) {
          setTrainingData(prev => prev.filter(item => item.id !== id));
      }
  };

  const handleSaveTraining = () => {
      if (!trainingForm.question || !trainingForm.answer) return;

      if (trainingForm.id) {
          // Edit existing
          setTrainingData(prev => prev.map(item => item.id === trainingForm.id ? { ...item, ...trainingForm } as TrainingItem : item));
      } else {
          // Add new
          const newItem: TrainingItem = {
              id: Date.now(),
              question: trainingForm.question!,
              answer: trainingForm.answer!,
              category: trainingForm.category || 'General'
          };
          setTrainingData(prev => [newItem, ...prev]);
      }
      setIsTrainingModalOpen(false);
  };

  // Helper to get selected chat session
  const activeSession = chatSessions.find(s => s.userId === selectedChatUserId);
  const totalUnread = chatSessions.reduce((acc, s) => acc + (s.unreadAdmin ? 1 : 0), 0);

  // Derived Training Data
  const trainingCategories = ['All', ...Array.from(new Set(trainingData.map(item => item.category))).sort()];
  const filteredTrainingData = trainingFilter === 'All' 
    ? trainingData 
    : trainingData.filter(item => item.category === trainingFilter);

  return (
    <div className="min-h-screen bg-background text-white font-sans flex flex-col">
      {/* Admin Header */}
      <header className="h-16 bg-surface border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
             <ShieldAlert className="text-red-500" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none hidden sm:block">Admin Console</h1>
            <h1 className="font-bold text-lg leading-none sm:hidden">Admin</h1>
            <span className="text-[10px] text-zinc-500 font-mono uppercase">System Administrator</span>
          </div>
        </div>
        <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar - Desktop */}
        <aside className="w-64 bg-surface border-r border-zinc-800 hidden lg:block">
            <nav className="p-4 space-y-2">
                <button 
                    onClick={() => setActiveTab('actions')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'actions' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                    <Zap size={18} />
                    Quick Actions
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                    <Users size={18} />
                    User Management
                </button>
                <button 
                    onClick={() => setActiveTab('finance')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'finance' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                    <DollarSign size={18} />
                    Finance & Withdrawals
                </button>
                 <button 
                    onClick={() => setActiveTab('support')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all justify-between ${activeTab === 'support' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                    <div className="flex items-center gap-3">
                        <Headset size={18} />
                        Live Support
                    </div>
                    {totalUnread > 0 && (
                        <span className="bg-accentRed text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalUnread}</span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('training')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'training' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                    <Bot size={18} />
                    AI Training
                </button>
                <button 
                    onClick={() => setActiveTab('system')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'system' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                >
                    <Activity size={18} />
                    System Status
                </button>
            </nav>
        </aside>

        {/* Mobile Navigation Bar (Bottom) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-zinc-800 z-50 flex justify-around p-3 pb-safe">
             <button onClick={() => setActiveTab('actions')} className={`flex flex-col items-center gap-1 ${activeTab === 'actions' ? 'text-white' : 'text-zinc-500'}`}>
                <Zap size={20} />
                <span className="text-[10px]">Actions</span>
             </button>
             <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center gap-1 ${activeTab === 'users' ? 'text-white' : 'text-zinc-500'}`}>
                <Users size={20} />
                <span className="text-[10px]">Users</span>
             </button>
             <button onClick={() => setActiveTab('support')} className={`flex flex-col items-center gap-1 relative ${activeTab === 'support' ? 'text-white' : 'text-zinc-500'}`}>
                <Headset size={20} />
                <span className="text-[10px]">Support</span>
                {totalUnread > 0 && <span className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
              <button onClick={() => setActiveTab('training')} className={`flex flex-col items-center gap-1 ${activeTab === 'training' ? 'text-white' : 'text-zinc-500'}`}>
                <Bot size={20} />
                <span className="text-[10px]">AI</span>
             </button>
             <button onClick={() => setActiveTab('system')} className={`flex flex-col items-center gap-1 ${activeTab === 'system' ? 'text-white' : 'text-zinc-500'}`}>
                <Activity size={20} />
                <span className="text-[10px]">System</span>
             </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
            
            {/* ---------------- QUICK ACTIONS TAB ---------------- */}
            {activeTab === 'actions' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                    
                    {/* Market Manipulation / Crash */}
                    <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <TrendingDown size={120} />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-red-900/30 rounded-lg text-red-500">
                                <TrendingDown size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Market Manipulation</h3>
                                <p className="text-xs text-zinc-400">Advanced actions to influence trader accounts.</p>
                            </div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 text-sm text-zinc-300">
                                This action will trigger a catastrophic loss event for the active user session. 
                                Balances will be decimated, and open positions will be liquidated.
                            </div>
                            <button 
                                onClick={handleCrashClick}
                                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 hover:shadow-red-900/60 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <AlertTriangle size={18} />
                                CRASH USER ACCOUNT
                            </button>
                        </div>
                    </section>

                    {/* Broadcast Center */}
                    <section className="bg-surface border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-zinc-900 rounded-lg text-white">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Broadcast Message</h3>
                                <p className="text-xs text-zinc-500">Send a push notification to all active mobile users.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendBroadcast()}
                                placeholder="Type your announcement here..."
                                disabled={broadcastStatus === 'sending'}
                                className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
                            />
                            <button 
                                onClick={handleSendBroadcast}
                                disabled={!broadcastMsg.trim() || broadcastStatus === 'sending'}
                                className={`px-6 rounded-xl font-bold text-sm transition-all flex items-center gap-2 min-w-[100px] justify-center
                                    ${broadcastStatus === 'success' 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {broadcastStatus === 'sending' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : broadcastStatus === 'success' ? (
                                    <>Sent <Check size={16} /></>
                                ) : (
                                    <>Send <Send size={16} /></>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* System Toggles */}
                    <section>
                         <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <Power className="text-blue-500" size={20} />
                            System Controls
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button 
                                onClick={() => toggleSystemSetting('maintenance')}
                                className={`p-4 rounded-xl border flex flex-col items-start gap-3 transition-all ${
                                    systemConfig.maintenance 
                                    ? 'bg-red-500/10 border-red-500/50' 
                                    : 'bg-surface border-zinc-800'
                                }`}
                            >
                                <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${systemConfig.maintenance ? 'bg-red-500' : 'bg-zinc-700'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${systemConfig.maintenance ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm ${systemConfig.maintenance ? 'text-red-500' : 'text-white'}`}>Maintenance Mode</h4>
                                    <p className="text-[10px] text-zinc-500 mt-1">Suspend all trading activities immediately.</p>
                                </div>
                            </button>

                             <button 
                                onClick={() => toggleSystemSetting('registrationsOpen')}
                                className={`p-4 rounded-xl border flex flex-col items-start gap-3 transition-all ${
                                    !systemConfig.registrationsOpen 
                                    ? 'bg-zinc-800 border-zinc-700' 
                                    : 'bg-surface border-zinc-800'
                                }`}
                            >
                                <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${systemConfig.registrationsOpen ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${systemConfig.registrationsOpen ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">New Registrations</h4>
                                    <p className="text-[10px] text-zinc-500 mt-1">Allow new users to sign up.</p>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => setActiveTab('finance')}
                                className="p-4 rounded-xl border bg-surface border-zinc-800 flex flex-col items-start gap-3 hover:border-zinc-600 transition-colors"
                            >
                                <div className="p-1.5 bg-zinc-800 rounded text-accentGreen">
                                    <ArrowRight size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Review Requests</h4>
                                    <p className="text-[10px] text-zinc-500 mt-1">{pendingRequests.length} pending approvals</p>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>
            )}
            
            {/* ---------------- USERS TAB ---------------- */}
            {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div>
                             <h2 className="text-xl font-bold text-white">User Management</h2>
                             <p className="text-zinc-400 text-xs">Manage traders, verify identities, and monitor activity.</p>
                         </div>
                         <div className="relative w-full sm:w-auto">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                             <input 
                                type="text" 
                                placeholder="Search users..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 bg-surface border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
                             />
                         </div>
                    </div>

                    <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-900/50 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs">User</th>
                                        <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs">Role</th>
                                        <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs">Status</th>
                                        <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs text-right">Balance</th>
                                        <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{user.name}</div>
                                                        <div className="text-xs text-zinc-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs font-medium border border-zinc-700">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    user.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                    user.status === 'Suspended' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                                }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-white">
                                                ${user.balance.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setViewingLogsUser(user)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="Audit Logs">
                                                        <FileText size={16} />
                                                    </button>
                                                    <button onClick={() => handleEditUser(user)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-blue-400 transition-colors" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-500 transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className="p-8 text-center text-zinc-500">
                                No users found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ---------------- FINANCE TAB ---------------- */}
            {activeTab === 'finance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                             <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
                             {pendingRequests.length === 0 ? (
                                 <div className="bg-surface border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                                     <CheckCircle size={48} className="mx-auto mb-3 text-zinc-700" />
                                     <p>All caught up! No pending requests.</p>
                                 </div>
                             ) : (
                                 <div className="space-y-3">
                                     {pendingRequests.map(req => (
                                         <div id={`request-${req.id}`} key={req.id} className="bg-surface border border-zinc-800 p-4 rounded-xl flex items-center justify-between transition-all duration-300">
                                             <div className="flex items-center gap-4">
                                                 <div className={`p-3 rounded-lg ${req.type === 'Deposit' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                     {req.type === 'Deposit' ? <ArrowRight className="rotate-45" size={20} /> : <ArrowRight className="-rotate-45" size={20} />}
                                                 </div>
                                                 <div>
                                                     <div className="font-bold text-white text-sm">{req.type} Request</div>
                                                     <div className="text-xs text-zinc-500">{req.user} • {req.time}</div>
                                                 </div>
                                             </div>
                                             
                                             <div className="flex items-center gap-6">
                                                 <div className="text-right">
                                                     <div className="font-mono font-bold text-white">${req.amount.toLocaleString()}</div>
                                                     <div className="text-xs text-zinc-500">{req.method}</div>
                                                 </div>
                                                 <div className="flex gap-2">
                                                     <button onClick={() => handleRequestAction(req.id, 'reject')} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors">
                                                         <X size={20} />
                                                     </button>
                                                     <button onClick={() => handleRequestAction(req.id, 'approve')} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-green-500 transition-colors">
                                                         <Check size={20} />
                                                     </button>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                        
                        <div className="space-y-6">
                             <div className="bg-surface border border-zinc-800 rounded-xl p-6">
                                 <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Settings size={18} /> Wallet Configuration</h3>
                                 <div className="space-y-4">
                                     <div>
                                         <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">BTC Wallet</label>
                                         <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={tempSettings.btcWallet} 
                                                onChange={(e) => setTempSettings({...tempSettings, btcWallet: e.target.value})}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs font-mono text-zinc-300"
                                            />
                                         </div>
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">USDT Wallet</label>
                                          <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={tempSettings.usdtWallet} 
                                                onChange={(e) => setTempSettings({...tempSettings, usdtWallet: e.target.value})}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs font-mono text-zinc-300"
                                            />
                                         </div>
                                     </div>
                                      <button 
                                        onClick={handleSaveSystemSettings}
                                        className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded transition-colors"
                                      >
                                          Save Wallet Addresses
                                      </button>
                                 </div>
                             </div>
                        </div>
                     </div>
                </div>
            )}

             {/* ---------------- SUPPORT TAB ---------------- */}
             {activeTab === 'support' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {/* Chat List */}
                     <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                         <div className="p-4 border-b border-zinc-800">
                             <h3 className="font-bold text-white">Active Sessions</h3>
                         </div>
                         <div className="flex-1 overflow-y-auto">
                             {chatSessions.length === 0 ? (
                                 <div className="p-8 text-center text-zinc-500 text-sm">No active support chats.</div>
                             ) : (
                                 chatSessions.map(session => (
                                     <button 
                                        key={session.userId}
                                        onClick={() => setSelectedChatUserId(session.userId)}
                                        className={`w-full p-4 text-left border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors ${selectedChatUserId === session.userId ? 'bg-zinc-800 border-l-2 border-l-accentOrange' : ''}`}
                                     >
                                         <div className="flex justify-between items-start mb-1">
                                             <span className="font-bold text-sm text-white">{session.userName}</span>
                                             {session.unreadAdmin && <span className="w-2 h-2 bg-accentRed rounded-full"></span>}
                                         </div>
                                         <p className="text-xs text-zinc-500 truncate">{session.messages[session.messages.length - 1]?.text}</p>
                                     </button>
                                 ))
                             )}
                         </div>
                     </div>

                     {/* Chat Window */}
                     <div className="lg:col-span-2 bg-surface border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                         {selectedChatUserId ? (
                             <>
                                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                                    <h3 className="font-bold text-white">{activeSession?.userName}</h3>
                                    <span className="text-xs text-zinc-500 font-mono">{activeSession?.userId}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
                                    {activeSession?.messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender === 'admin' ? 'bg-accentOrange text-white rounded-br-none' : 'bg-zinc-800 text-zinc-300 rounded-bl-none'}`}>
                                                {msg.text}
                                                <div className="text-[9px] opacity-70 text-right mt-1">
                                                    {msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={handleSendAdminMessage} className="p-4 border-t border-zinc-800 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={adminChatInput}
                                        onChange={(e) => setAdminChatInput(e.target.value)}
                                        placeholder="Type a reply..."
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                                    />
                                    <button type="submit" disabled={!adminChatInput.trim()} className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50">
                                        <Send size={18} />
                                    </button>
                                </form>
                             </>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                                 <MessageSquare size={48} className="mb-4 opacity-20" />
                                 <p>Select a chat session to start messaging</p>
                             </div>
                         )}
                     </div>
                </div>
             )}

             {/* ---------------- TRAINING TAB ---------------- */}
             {activeTab === 'training' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex justify-between items-center">
                         <div>
                             <h2 className="text-xl font-bold text-white">AI Training Data</h2>
                             <p className="text-zinc-400 text-xs">Manage Q&A pairs for the automated support bot.</p>
                         </div>
                         <button onClick={handleOpenAddTraining} className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                             <Plus size={16} /> Add New
                         </button>
                     </div>

                     <div className="flex gap-2 overflow-x-auto pb-2">
                         {trainingCategories.map(cat => (
                             <button 
                                key={cat}
                                onClick={() => setTrainingFilter(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${trainingFilter === cat ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                             >
                                 {cat}
                             </button>
                         ))}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {filteredTrainingData.map(item => (
                             <div key={item.id} className="bg-surface border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group">
                                 <div className="flex justify-between items-start mb-3">
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-accentOrange bg-accentOrange/10 px-2 py-1 rounded">{item.category}</span>
                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => handleEditTraining(item)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                                             <Edit size={14} />
                                         </button>
                                          <button onClick={() => handleDeleteTraining(item.id)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-500">
                                             <Trash2 size={14} />
                                         </button>
                                     </div>
                                 </div>
                                 <h4 className="font-bold text-white text-sm mb-2">{item.question}</h4>
                                 <p className="text-xs text-zinc-400 line-clamp-3">{item.answer}</p>
                             </div>
                         ))}
                     </div>
                 </div>
             )}

            {/* ---------------- SYSTEM TAB ---------------- */}
            {activeTab === 'system' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-surface border border-zinc-800 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} /> System Health</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                    <span className="text-sm text-zinc-300">API Status</span>
                                    <span className="text-xs font-bold text-green-500 flex items-center gap-1"><CheckCircle size={12} /> Operational</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                    <span className="text-sm text-zinc-300">Database Latency</span>
                                    <span className="text-xs font-bold text-zinc-400 font-mono">24ms</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                    <span className="text-sm text-zinc-300">Active Connections</span>
                                    <span className="text-xs font-bold text-blue-400 font-mono">1,240</span>
                                </div>
                            </div>
                        </div>

                         <div className="bg-surface border border-zinc-800 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert size={18} /> Security Logs</h3>
                            <div className="space-y-2">
                                <div className="text-xs text-zinc-500 flex justify-between px-2">
                                    <span>Event</span>
                                    <span>Time</span>
                                </div>
                                {[1,2,3].map(i => (
                                    <div key={i} className="p-2 rounded bg-zinc-900/30 border border-zinc-800/50 flex justify-between items-center">
                                        <span className="text-xs text-red-400 flex items-center gap-1"><XCircle size={10} /> Failed Login (IP: 192.168.1.{i})</span>
                                        <span className="text-[10px] text-zinc-600 font-mono">10:4{i} AM</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>
      
      {/* ---------------- MODALS ---------------- */}
      
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-surface border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Edit User</h3>
                    <button onClick={() => setEditingUser(null)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                        <input 
                            type="text" 
                            value={editingUser.name} 
                            onChange={(e) => updateUserField('name', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1"
                        />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                        <input 
                            type="email" 
                            value={editingUser.email} 
                            onChange={(e) => updateUserField('email', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1"
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase">Role</label>
                            <select 
                                value={editingUser.role} 
                                onChange={(e) => updateUserField('role', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1"
                            >
                                <option>Trader</option>
                                <option>VIP Trader</option>
                                <option>Administrator</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase">Status</label>
                            <select 
                                value={editingUser.status} 
                                onChange={(e) => updateUserField('status', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1"
                            >
                                <option>Active</option>
                                <option>Suspended</option>
                                <option>Pending</option>
                            </select>
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Account Balance</label>
                        <input 
                            type="number" 
                            value={editingUser.balance} 
                            onChange={(e) => updateUserField('balance', parseFloat(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1 font-mono"
                        />
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                    <button onClick={handleSaveUser} className="px-6 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200">Save Changes</button>
                </div>
            </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {viewingLogsUser && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-surface border border-zinc-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Audit Logs</h3>
                        <p className="text-xs text-zinc-500">Activity history for <span className="text-white font-bold">{viewingLogsUser.name}</span></p>
                    </div>
                    <button onClick={() => setViewingLogsUser(null)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {generateMockAuditLogs(viewingLogsUser).map(log => (
                        <div key={log.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                    log.type === 'security' ? 'text-red-500' :
                                    log.type === 'financial' ? 'text-green-500' :
                                    log.type === 'admin' ? 'text-orange-500' : 'text-blue-500'
                                }`}>{log.action}</span>
                                <span className="text-[10px] text-zinc-500">{log.timestamp}</span>
                            </div>
                            <p className="text-sm text-zinc-300">{log.details}</p>
                            <p className="text-[10px] text-zinc-600 mt-2">Performed by: {log.performedBy}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Add/Edit Training Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-surface border border-zinc-800 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">{trainingForm.id ? 'Edit' : 'Add'} Training Data</h3>
                    <button onClick={() => setIsTrainingModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Category</label>
                        <select 
                            value={trainingForm.category} 
                            onChange={(e) => setTrainingForm({...trainingForm, category: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1"
                        >
                            <option>General</option>
                            <option>Account Security</option>
                            <option>Trading</option>
                            <option>Withdrawals</option>
                            <option>Verification</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">User Question</label>
                        <input 
                            type="text" 
                            value={trainingForm.question} 
                            onChange={(e) => setTrainingForm({...trainingForm, question: e.target.value})}
                            placeholder="e.g. How do I deposit?"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1"
                        />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Bot Answer</label>
                        <textarea 
                            value={trainingForm.answer} 
                            onChange={(e) => setTrainingForm({...trainingForm, answer: e.target.value})}
                            rows={4}
                            placeholder="Type the automated response..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mt-1 resize-none"
                        />
                    </div>
                </div>
                 <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setIsTrainingModalOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                    <button onClick={handleSaveTraining} className="px-6 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200">Save Data</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;