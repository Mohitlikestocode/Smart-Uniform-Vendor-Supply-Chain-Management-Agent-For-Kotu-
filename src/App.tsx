import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Store,
  Package,
  AlertCircle,
  Search,
  MessageSquare,
  X,
  Send,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Layers,
  Activity,
  Bell,
  Settings,
  Plus,
  Download,
  Calendar,
  ChevronDown,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface InventoryItem {
  id: number;
  school: string;
  category: string;
  subcategory: string;
  item_name: string;
  size: string;
  color: string;
  outlet_id: number;
  quantity_available: number;
  quantity_sold: number;
  quantity_incoming: number;
  last_updated: string;
}

interface Summary {
  total_available: number;
  total_sold: number;
  total_incoming: number;
  low_stock_count: number;
}

type UserRole = 'admin' | 'customer';
type ViewType = 'available' | 'sold' | 'incoming';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-[#111111] p-6 rounded-xl border border-white/5 flex items-start justify-between group hover:border-white/10 transition-all">
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      {trend !== undefined && (
        <div className={`flex items-center mt-3 text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          <div className={`p-1 rounded-full mr-2 ${trend > 0 ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}>
            {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          </div>
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors`}>
      <Icon size={20} className={color || "text-blue-500"} />
    </div>
  </div>
);

const OutletCard = ({ id, active, onClick }: { id: number; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-[200px] p-5 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group ${active
      ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]'
      : 'bg-[#111111] border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/5'
      }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${active ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
        <Store size={18} />
      </div>
      {active && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
    </div>
    <h4 className="font-bold text-lg text-white">Outlet {id}</h4>
    <p className="text-xs mt-1 text-slate-500 font-medium">Regional Distribution Center</p>

    {active && (
      <motion.div
        layoutId="active-outlet"
        className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"
      />
    )}
  </button>
);

const ChatWidget = ({ role }: { role: UserRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: `System initialized. I am your ${role} assistant. How can I help you today?`, isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, role, sessionId })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Assistant is currently unavailable.');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { text: `Error: ${err.message || "Connection to inventory server failed."}`, isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#111111] w-[400px] h-[600px] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden mb-6"
          >
            {/* Header */}
            <div className="bg-[#161616] p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <MessageSquare size={22} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#161616] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Kotu's intelligent Assistant</h3>
                  <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    <span className="text-emerald-500 mr-1.5">●</span>
                    {role === 'admin' ? 'Privileged Access' : 'Standard Access'}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0d0d0d]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed ${m.isBot
                    ? 'bg-[#1a1a1a] border border-white/5 text-slate-300 rounded-tl-none'
                    : 'bg-blue-600 text-white rounded-tr-none font-medium shadow-lg shadow-blue-900/10'
                    }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-xl rounded-tl-none flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-[#161616] border-t border-white/5">
              <div className="flex items-center space-x-3 bg-[#0d0d0d] border border-white/5 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-white placeholder:text-slate-600"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2.5 bg-blue-600 text-white rounded-lg disabled:opacity-30 hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Outlet 1 stock?', 'Shiv Nadar size 8?', 'Low stock?'].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setInput(chip)}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-slate-300 transition-all border border-white/5"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [role, setRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<number>(1);
  const [viewType, setViewType] = useState<ViewType>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard Date Filtering
  const [dateRange, setDateRange] = useState<'Day' | 'Week' | 'Month' | 'Year' | 'Custom'>('Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Summary filtering
  const [summaryOutletMode, setSummaryOutletMode] = useState<'all' | 'single'>('all');
  const [summaryOutletId, setSummaryOutletId] = useState<number>(1);

  useEffect(() => {
    fetchSummary();
  }, [summaryOutletMode, summaryOutletId]);

  useEffect(() => {
    fetchInventory(selectedOutlet);
  }, [selectedOutlet]);

  const fetchSummary = async () => {
    const outletId = summaryOutletMode === 'all' ? 'all' : summaryOutletId;
    const res = await fetch(`/api/summary?outletId=${outletId}`);
    const data = await res.json();
    setSummary(data);
  };

  const fetchInventory = async (outletId: number) => {
    setIsLoading(true);
    const res = await fetch(`/api/inventory?outletId=${outletId}`);
    const data = await res.json();
    setInventory(data);
    setIsLoading(false);
  };

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (role === 'customer') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col">
        {/* Navigation */}
        <nav className="p-8 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Package size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Kotu's intelligent system</h1>
          </div>
          <div className="flex items-center space-x-8">
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Schools</a>
            <button
              onClick={() => setRole('admin')}
              className="bg-white/5 border border-white/10 px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
            >
              Admin Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Live Inventory Sync Active</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl font-bold mb-8 tracking-tighter leading-[0.9]"
            >
              The Operating System for <br />
              <span className="text-blue-500">School Uniforms.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Stop guessing. Start knowing. Check real-time availability across all regional outlets for Complete Shiv Nadar and Knowledge Habitat schools.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center space-x-4 mb-20"
            >
              <button
                onClick={() => {
                  // Trigger chat widget
                  const chatBtn = document.querySelector('.fixed.bottom-8.right-8 button') as HTMLButtonElement;
                  if (chatBtn) chatBtn.click();
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center"
              >
                Check Availability
                <ChevronRight size={20} className="ml-2" />
              </button>
              <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95">
                View Schools
              </button>
            </motion.div>

            {/* Social Proof / Trusted By */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-12 border-t border-white/5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 mb-8">Trusted by leading institutions</p>
              <div className="flex items-center justify-center space-x-12 grayscale opacity-30">
                <div className="text-2xl font-black tracking-tighter">COMPLETE SHIV NADAR</div>
                <div className="text-2xl font-black tracking-tighter">KNOWLEDGE HABITAT</div>
                <div className="text-2xl font-black tracking-tighter">KOTU'S SYSTEM</div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Kotu's intelligent system • Built for precision
        </footer>

        <ChatWidget role="customer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Package size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Kotu's intelligent system</h1>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: Store, label: 'Outlets' },
            { icon: Activity, label: 'Analytics' },
            { icon: Bell, label: 'Alerts', badge: summary?.low_stock_count },
            { icon: Clock, label: 'Audit Log' },
            { icon: Settings, label: 'Settings' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${activeTab === item.label
                ? 'bg-blue-600/10 text-blue-500 font-bold'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge ? (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === item.label ? 'opacity-100' : ''}`} />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center space-x-4 mb-6 px-2">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 border border-white/5">
              <User size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Admin User</p>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest truncate">System Root</p>
            </div>
          </div>
          <button
            onClick={() => setRole('customer')}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-white/5"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tight">{activeTab}</h2>
            <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
              <Clock size={14} className="mr-2" />
              Last sync: Just now
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-[#111111] border border-white/5 rounded-xl w-96 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm transition-all text-white placeholder:text-slate-700"
              />
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Plus size={18} />
              <span>New Item</span>
            </button>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <>
            {/* Summary Filter */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center space-x-1 bg-[#111111] p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'All Outlets' },
                  { id: 'single', label: 'Select Outlet' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setSummaryOutletMode(mode.id as any)}
                    className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${summaryOutletMode === mode.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                      : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {summaryOutletMode === 'single' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 bg-[#111111] px-4 py-2 rounded-xl border border-white/5"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Outlet</span>
                  <select
                    value={summaryOutletId}
                    onChange={(e) => setSummaryOutletId(parseInt(e.target.value))}
                    className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map(id => (
                      <option key={id} value={id} className="bg-[#111111]">Outlet {id}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Date Filters */}
              <div className="flex items-center space-x-1 bg-[#111111] p-1.5 rounded-xl border border-white/5 ml-auto">
                {['Day', 'Week', 'Month', 'Year'].map(range => (
                  <button
                    key={range}
                    onClick={() => {
                      setDateRange(range as any);
                      setShowCalendar(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${dateRange === range && !showCalendar
                      ? 'bg-white/10 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    {range}
                  </button>
                ))}
                <div className="w-px h-4 bg-white/10 mx-2" />
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showCalendar
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <Calendar size={14} />
                  <span>Calendar</span>
                </button>
              </div>
            </div>

            {/* Custom Date Range Picker */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-8"
                >
                  <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 flex items-center space-x-8">
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-[#0a0a0a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-[#0a0a0a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <button className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all">
                      Apply custom range
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard
                title="Total Available"
                value={summary?.total_available || 0}
                icon={Package}
                trend={12.5}
                color="text-blue-500"
              />
              <StatCard
                title="Total Sold"
                value={summary?.total_sold || 0}
                icon={Activity}
                trend={8.2}
                color="text-emerald-500"
              />
              <StatCard
                title="Incoming Stock"
                value={summary?.total_incoming || 0}
                icon={Clock}
                trend={-2.4}
                color="text-yellow-500"
              />
              <StatCard
                title="Low Stock Alerts"
                value={summary?.low_stock_count || 0}
                icon={AlertCircle}
                color="text-rose-500"
              />
            </div>

            {/* Outlet Selector */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Distribution Outlets</h3>
                <button className="text-blue-500 text-xs font-bold hover:underline uppercase tracking-widest">View All</button>
              </div>
              <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                {[1, 2, 3, 4, 5].map(id => (
                  <div key={id} className="flex-1 min-w-[220px]">
                    <OutletCard
                      id={id}
                      active={selectedOutlet === id}
                      onClick={() => setSelectedOutlet(id)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Inventory Table Section */}
            <section className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5">
                  {[
                    { id: 'available', label: 'Current' },
                    { id: 'sold', label: 'Sold' },
                    { id: 'incoming', label: 'Incoming' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setViewType(tab.id as ViewType)}
                      className={`px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewType === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
                    <Filter size={16} />
                    <span>Filters</span>
                  </button>
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center justify-between">
                          <span>School</span>
                          <ChevronDown size={14} className="text-slate-700 cursor-pointer hover:text-slate-400" />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center justify-between">
                          <span>Category</span>
                          <ChevronDown size={14} className="text-slate-700 cursor-pointer hover:text-slate-400" />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center justify-between">
                          <span>Item Name</span>
                          <ChevronDown size={14} className="text-slate-700 cursor-pointer hover:text-slate-400" />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center justify-between">
                          <span>Size</span>
                          <ChevronDown size={14} className="text-slate-700 cursor-pointer hover:text-slate-400" />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center justify-between">
                          <span>Color</span>
                          <ChevronDown size={14} className="text-slate-700 cursor-pointer hover:text-slate-400" />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span>{viewType === 'available' ? 'Qty' : viewType === 'sold' ? 'Sold' : 'Incoming'}</span>
                          <ChevronDown size={14} className="text-slate-700 cursor-pointer hover:text-slate-400" />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <ChevronDown size={14} className="text-slate-700 cursor-pointer hover:text-slate-400" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Outlet {selectedOutlet} Data...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center max-w-xs mx-auto">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-slate-700 mb-6">
                              <Search size={40} />
                            </div>
                            <p className="text-white font-bold text-xl">No inventory found</p>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">We couldn't find any items matching your current filters or search query.</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6 text-sm font-bold text-white">{item.school}</td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{item.category}</td>
                        <td className="px-8 py-6 text-sm font-bold text-white">{item.item_name}</td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg text-[10px] font-bold border border-white/5 uppercase tracking-widest">
                            {item.size}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            {item.color && item.color !== 'Standard' && (
                              <div className="w-4 h-4 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: item.color.toLowerCase() }} />
                            )}
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.color || '—'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`font-mono text-xl font-bold ${viewType === 'available' && item.quantity_available < 10 ? 'text-rose-500' : 'text-white'
                            }`}>
                            {viewType === 'available' ? item.quantity_available : viewType === 'sold' ? item.quantity_sold : item.quantity_incoming}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {viewType === 'available' && item.quantity_available < 10 ? (
                            <div className="flex items-center text-rose-500 text-[10px] font-bold bg-rose-500/10 px-3 py-1.5 rounded-lg w-fit border border-rose-500/20 uppercase tracking-widest">
                              <AlertCircle size={14} className="mr-2" />
                              Critical
                            </div>
                          ) : (
                            <div className="flex items-center text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20 uppercase tracking-widest">
                              <ShieldCheck size={14} className="mr-2" />
                              Stable
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Showing <span className="text-white">{filteredInventory.length}</span> items in database
                </p>
                <div className="flex space-x-3">
                  <button className="px-6 py-2.5 border border-white/5 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-white/5 hover:text-white disabled:opacity-20 transition-all" disabled>Previous</button>
                  <button className="px-6 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">Next</button>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab !== 'Dashboard' && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-slate-700 mb-8">
              <Activity size={48} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">{activeTab} Section</h3>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              This module is currently being optimized for production. Real-time data sync for {activeTab.toLowerCase()} will be available in the next update.
            </p>
            <button
              onClick={() => setActiveTab('Dashboard')}
              className="mt-10 btn-secondary"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </main>

      <ChatWidget role="admin" />
    </div>
  );
}
