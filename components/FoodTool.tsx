
import React, { useState, useEffect, useMemo } from 'react';
import { Trip, Expense, Budget } from '../types';
import { PlusIcon, DiningIcon, BusIcon, ShoppingBagIcon, HomeIcon, TagIcon, ArrowsRightLeftIcon, CreditCardIcon, BanknotesIcon, TicketIcon, PlaneIcon, ShieldCheckIcon, ChevronDownIcon, ChevronLeftIcon, MapIcon, ChartPieIcon, XMarkIcon, CalendarIcon, WalletIcon } from './Icons';

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

// Pre-trip Categories
const PRE_TRIP_CATEGORIES = [
    { id: 'flight', label: '機票', icon: PlaneIcon, color: '#38bdf8', bg: 'bg-sky-500' },
    { id: 'stay', label: '住宿', icon: HomeIcon, color: '#818cf8', bg: 'bg-indigo-500' },
    { id: 'ticket', label: '景點門票', icon: TicketIcon, color: '#34d399', bg: 'bg-emerald-500' },
    { id: 'transport_pass', label: '交通票券', icon: BusIcon, color: '#facc15', bg: 'bg-yellow-500' },
    { id: 'insurance', label: '保險', icon: ShieldCheckIcon, color: '#f87171', bg: 'bg-red-500' },
    { id: 'other', label: '其他', icon: TagIcon, color: '#94a3b8', bg: 'bg-slate-500' },
];

// On-trip Categories
const ON_TRIP_CATEGORIES = [
    { id: 'food', label: '餐飲', icon: DiningIcon, color: '#38bdf8', bg: 'bg-sky-500' },
    { id: 'transport', label: '交通', icon: BusIcon, color: '#facc15', bg: 'bg-yellow-500' },
    { id: 'shopping', label: '購物', icon: ShoppingBagIcon, color: '#f472b6', bg: 'bg-pink-500' },
    { id: 'activity', label: '活動體驗', icon: TicketIcon, color: '#34d399', bg: 'bg-emerald-500' },
    { id: 'stay', label: '住宿', icon: HomeIcon, color: '#818cf8', bg: 'bg-indigo-500' },
    { id: 'other', label: '其他', icon: TagIcon, color: '#94a3b8', bg: 'bg-slate-500' },
];

// Comprehensive Global Currencies List
const ALL_CURRENCIES = [
    { code: 'TWD', name: '新台幣' },
    { code: 'HKD', name: '港幣' },
    { code: 'JPY', name: '日圓' },
    { code: 'USD', name: '美元' },
    { code: 'EUR', name: '歐元' },
    { code: 'KRW', name: '韓元' },
    { code: 'CNY', name: '人民幣' },
    { code: 'GBP', name: '英鎊' },
    { code: 'AUD', name: '澳幣' },
    { code: 'CAD', name: '加幣' },
    { code: 'SGD', name: '新加坡幣' },
    { code: 'CHF', name: '瑞士法郎' },
    { code: 'THB', name: '泰銖' },
    { code: 'MYR', name: '馬來西亞林吉特' },
    { code: 'VND', name: '越南盾' },
    { code: 'PHP', name: '菲律賓披索' },
    { code: 'IDR', name: '印尼盾' },
    { code: 'INR', name: '印度盧比' },
    { code: 'NZD', name: '紐西蘭元' },
    { code: 'MOP', name: '澳門幣' },
    { code: 'SEK', name: '瑞典克朗' },
    { code: 'DKK', name: '丹麥克朗' },
    { code: 'NOK', name: '挪威克朗' },
    { code: 'TRY', name: '土耳其里拉' },
    { code: 'RUB', name: '俄羅斯盧布' },
    { code: 'BRL', name: '巴西雷亞爾' },
    { code: 'ZAR', name: '南非蘭特' },
    { code: 'MXN', name: '墨西哥披索' },
    { code: 'SAR', name: '沙烏地里亞爾' },
    { code: 'AED', name: '阿聯酋迪拉姆' },
    { code: 'EGP', name: '埃及鎊' },
    { code: 'ILS', name: '以色列謝克爾' },
    { code: 'PLN', name: '波蘭茲羅提' },
    { code: 'CZK', name: '捷克克朗' },
    { code: 'HUF', name: '匈牙利福林' }
];

const ExpensesTool: React.FC<Props> = ({ trip, onUpdateTrip }) => {
  // --- State ---
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'PRE_TRIP' | 'ON_TRIP'>('DASHBOARD');
  const [globalCurrency, setGlobalCurrency] = useState('HKD');
  const [expenses, setExpenses] = useState<Expense[]>(trip.expenses || []);
  const [budget, setBudget] = useState<Budget>(trip.budget || { amount: 0, currency: 'JPY', type: 'total' });
  
  // Modals
  const [activeModal, setActiveModal] = useState<'NONE' | 'BUDGET' | 'ADD_PRE' | 'ADD_ON' | 'STATS'>('NONE');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Exchange Rate Data
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  
  // Calculator State
  const [calcFrom, setCalcFrom] = useState('JPY');
  const [calcTo, setCalcTo] = useState('HKD');
  const [calcAmount, setCalcAmount] = useState<string>(''); // Default empty

  // New Expense State
  const [newExpense, setNewExpense] = useState<{
      amount: string;
      currency: string;
      title: string;
      category: string;
      date: string;
      paymentMethod: 'cash' | 'card' | 'other';
  }>({ 
      amount: '', 
      currency: 'HKD', 
      title: '', 
      category: '', 
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash' 
  });

  // --- Effects ---
  useEffect(() => {
      // Fetch rates on mount (Base HKD)
      fetch(`https://api.exchangerate-api.com/v4/latest/HKD`)
        .then(res => res.json())
        .then(data => {
            setExchangeRates(data.rates);
        })
        .catch(err => console.error("Failed to fetch rates", err));
  }, []);

  // Update trip data when local state changes
  useEffect(() => {
      onUpdateTrip({ ...trip, expenses, budget });
  }, [expenses, budget]);

  // --- Helpers ---
  const convert = (amount: number, from: string, to: string) => {
      if (!exchangeRates[from] || !exchangeRates[to]) return amount;
      // Convert to base (HKD) first, then to target
      const inBase = amount / exchangeRates[from];
      return inBase * exchangeRates[to];
  };

  const getCurrencyLabel = (code: string) => {
      const found = ALL_CURRENCIES.find(c => c.code === code);
      return found ? found.name : '';
  };

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
        'TWD': 'NT$', 'HKD': 'HK$', 'JPY': '¥', 'USD': '$', 'EUR': '€',
        'KRW': '₩', 'CNY': '¥', 'GBP': '£', 'AUD': 'A$', 'CAD': 'C$',
        'SGD': 'S$', 'CHF': 'Fr', 'THB': '฿', 'MYR': 'RM', 'VND': '₫',
        'PHP': '₱', 'IDR': 'Rp', 'INR': '₹', 'NZD': 'NZ$', 'MOP': 'MOP$',
        'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R', 'MXN': '$',
        'SAR': '﷼', 'AED': 'dh', 'EGP': 'E£', 'ILS': '₪', 'PLN': 'zł',
        'CZK': 'Kč', 'HUF': 'Ft', 'SEK': 'kr', 'DKK': 'kr', 'NOK': 'kr'
    };
    return symbols[code] || '$';
  };

  // --- Calculations ---
  const totalExpensesHKD = useMemo(() => {
      return expenses.reduce((sum, e) => sum + convert(e.amount, e.currency, 'HKD'), 0);
  }, [expenses, exchangeRates]);

  const displayedTotalExpenses = convert(totalExpensesHKD, 'HKD', globalCurrency);

  const preTripExpenses = expenses.filter(e => e.isPreTrip);
  const onTripExpenses = expenses.filter(e => !e.isPreTrip);

  const preTripTotalBase = preTripExpenses.reduce((sum, e) => sum + convert(e.amount, e.currency, globalCurrency), 0);
  const onTripTotalBase = onTripExpenses.reduce((sum, e) => sum + convert(e.amount, e.currency, globalCurrency), 0);

  // Budget Calculations
  const relevantExpenses = expenses.filter(e => {
      // Rule 1: Must be On-Trip (Not Pre-Trip)
      if (e.isPreTrip) return false;

      // Rule 2: Budget Type Logic
      if (budget.type === 'cash_only') {
          return e.paymentMethod === 'cash';
      }
      
      // If type is 'total', include everything (cash, card, other) that is On-Trip
      return true;
  });

  const usedBudgetAmount = relevantExpenses.reduce((sum, e) => sum + convert(e.amount, e.currency, budget.currency), 0);
  const remainingBudget = budget.amount - usedBudgetAmount;
  const budgetProgress = budget.amount > 0 ? (usedBudgetAmount / budget.amount) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  // Stats: On-Trip Only
  const onTripStats = useMemo(() => {
      const catStats: Record<string, number> = {};
      const methodStats: Record<string, number> = { cash: 0, card: 0, other: 0 };
      const dailyStats: Record<string, number> = {};
      
      onTripExpenses.forEach(exp => {
          const val = convert(exp.amount, exp.currency, globalCurrency);
          
          // Category
          catStats[exp.category] = (catStats[exp.category] || 0) + val;
          
          // Payment Method
          methodStats[exp.paymentMethod] = (methodStats[exp.paymentMethod] || 0) + val;

          // Daily
          dailyStats[exp.date] = (dailyStats[exp.date] || 0) + val;
      });

      const categories = Object.entries(catStats)
        .sort(([,a], [,b]) => b - a)
        .map(([id, amount]) => {
             const allCats = [...PRE_TRIP_CATEGORIES, ...ON_TRIP_CATEGORIES];
             const catInfo = allCats.find(c => c.id === id) || { label: '其他', color: '#94a3b8', bg: 'bg-slate-500', icon: TagIcon };
             return { id, amount, ...catInfo };
        });

      // Daily stats array sorted by date
      const days = Object.entries(dailyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, total]) => ({ date, total }));
        
      const maxDailyTotal = Math.max(...days.map(d => d.total), 0);

      return { categories, methods: methodStats, days, maxDailyTotal, total: onTripTotalBase };
  }, [onTripExpenses, globalCurrency, exchangeRates, onTripTotalBase]);

  // Calculator Result
  const calcResult = useMemo(() => {
     const amt = parseFloat(calcAmount) || 0;
     if (!exchangeRates[calcFrom] || !exchangeRates[calcTo]) return 0;
     const valInBase = amt / exchangeRates[calcFrom];
     return valInBase * exchangeRates[calcTo];
  }, [calcAmount, calcFrom, calcTo, exchangeRates]);

  // Japan Tax Free Logic
  const jpyValue = useMemo(() => {
      if (!calcAmount) return null; // Only show when user is typing
      if (calcFrom === 'JPY') return parseFloat(calcAmount) || 0;
      if (calcTo === 'JPY') return calcResult;
      return null;
  }, [calcFrom, calcTo, calcAmount, calcResult]);
  
  const TAX_FREE_THRESHOLD = 5000;


  // --- Handlers ---
  const handleSaveExpense = (isPre: boolean) => {
      if (!newExpense.amount || !newExpense.title || !newExpense.category) return;
      
      if (editingId) {
          // Update existing
          setExpenses(expenses.map(e => e.id === editingId ? {
              ...e,
              title: newExpense.title,
              amount: parseFloat(newExpense.amount),
              currency: newExpense.currency,
              category: newExpense.category,
              date: newExpense.date,
              paymentMethod: newExpense.paymentMethod
          } : e));
          setEditingId(null);
      } else {
          // Create new
          const expense: Expense = {
              id: Date.now().toString(),
              title: newExpense.title,
              amount: parseFloat(newExpense.amount),
              currency: newExpense.currency,
              category: newExpense.category,
              date: newExpense.date || new Date().toISOString().split('T')[0],
              isPreTrip: isPre,
              paymentMethod: newExpense.paymentMethod
          };
          setExpenses([expense, ...expenses]);
      }

      setActiveModal('NONE');
      // Reset
      setNewExpense({ 
          amount: '', 
          currency: globalCurrency, 
          title: '', 
          category: '', 
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash' 
      });
  };

  const handleDeleteExpense = (id: string) => {
      if (confirm('確定要刪除這筆消費紀錄嗎？')) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
  };

  const handleEditExpense = (exp: Expense) => {
      setEditingId(exp.id);
      setNewExpense({
          amount: exp.amount.toString(),
          currency: exp.currency,
          title: exp.title,
          category: exp.category,
          date: exp.date,
          paymentMethod: exp.paymentMethod
      });
      setActiveModal(exp.isPreTrip ? 'ADD_PRE' : 'ADD_ON');
  };

  const CircularProgress = ({ percentage, color, size = 140, stroke = 10 }: { percentage: number, color: string, size?: number, stroke?: number }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(percentage, 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-slate-200 dark:text-white/5"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                {size >= 100 && (
                     <>
                        <span className={`text-2xl font-black tracking-tighter ${isOverBudget ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                            {Math.round(percentage)}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">USED</span>
                     </>
                )}
                {size < 100 && (
                    <span className="text-xs font-bold text-slate-500">{Math.round(percentage)}%</span>
                )}
            </div>
        </div>
    );
  };

  const renderListView = (viewMode: 'PRE_TRIP' | 'ON_TRIP') => {
      const isPre = viewMode === 'PRE_TRIP';
      const title = isPre ? '行前準備' : '旅途消費';
      const listExpenses = isPre ? preTripExpenses : onTripExpenses;
      const totalAmount = isPre ? preTripTotalBase : onTripTotalBase;
      const categories = isPre ? PRE_TRIP_CATEGORIES : ON_TRIP_CATEGORIES;

      return (
        <div className="h-full flex flex-col relative bg-transparent animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-6 pb-3 flex items-center gap-4 bg-white/30 dark:bg-[#1e293b]/30 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
                <button 
                    onClick={() => setCurrentView('DASHBOARD')}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-colors bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-[#1e293b] dark:border-white/5 dark:text-slate-400 dark:hover:bg-[#334155]"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        總計: {globalCurrency} {Math.round(totalAmount).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto px-6 pt-2 pb-40 space-y-3 no-scrollbar">
                {listExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center mb-4">
                            <TagIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-slate-400 font-bold tracking-wider text-sm">暫無{title}紀錄</p>
                    </div>
                ) : (
                    listExpenses.map(exp => {
                         const cat = categories.find(c => c.id === exp.category) || categories[categories.length-1];
                         return (
                             <div 
                                key={exp.id} 
                                onClick={() => handleEditExpense(exp)}
                                className="bg-white/50 dark:bg-[#1e293b]/30 p-4 rounded-2xl flex items-center justify-between border border-white/50 dark:border-transparent animate-fade-in-up active:scale-[0.98] transition-all cursor-pointer"
                             >
                                 <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-full ${cat.bg} bg-opacity-20 flex items-center justify-center`} style={{ color: cat.color }}>
                                         <cat.icon className="w-5 h-5" />
                                     </div>
                                     <div>
                                         <p className="text-slate-800 dark:text-white font-bold text-sm">{exp.title}</p>
                                         <p className="text-[10px] text-slate-500 font-bold">{exp.date}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-slate-800 dark:text-white font-bold text-sm">{exp.currency} {exp.amount.toLocaleString()}</p>
                                     <button onClick={(e) => { e.stopPropagation(); handleDeleteExpense(exp.id); }} className="text-[10px] text-red-400 mt-1 hover:text-red-500 font-bold">刪除</button>
                                 </div>
                             </div>
                         )
                    })
                )}
            </div>

            {/* Bottom Button - Fixed and elevated above global gradient */}
            <div className="fixed bottom-[120px] left-0 right-0 px-6 z-[60] pointer-events-none flex justify-center">
                 <button 
                    onClick={() => { 
                        setEditingId(null); 
                        setActiveModal(isPre ? 'ADD_PRE' : 'ADD_ON'); 
                        setNewExpense({ 
                            amount: '', 
                            currency: globalCurrency, 
                            title: '', 
                            category: '', 
                            date: new Date().toISOString().split('T')[0], 
                            paymentMethod: 'cash' 
                        }); 
                    }}
                    className="w-full py-4 bg-[#38bdf8] text-white font-black text-lg rounded-3xl hover:bg-[#0ea5e9] shadow-lg shadow-blue-500/30 transition-colors pointer-events-auto flex items-center justify-center gap-2 active:scale-95 transform duration-100 max-w-sm"
                 >
                     <PlusIcon className="w-5 h-5" />
                     新增{title}
                 </button>
            </div>
        </div>
      );
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent">
      
      {currentView === 'DASHBOARD' ? (
        <>
            {/* 1. Header: Total Expenses & Analysis Button - Split into two */}
            <div className="px-6 pt-6 pb-2 sticky top-0 z-30 pointer-events-none grid grid-cols-[1.4fr_1fr] gap-3">
                
                {/* Left: Total Expenses Card */}
                <div className="pointer-events-auto relative overflow-hidden rounded-[28px] p-4 shadow-lg shadow-blue-500/20 transition-all duration-300 bg-gradient-to-br from-[#38bdf8] to-[#0284c7] dark:from-[#0f172a] dark:to-[#1e293b] dark:border dark:border-white/10 flex flex-col justify-between group">
                     {/* Background Decor */}
                     <div className="absolute -right-4 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
                     
                     {/* Header Row */}
                     <div className="flex justify-between items-start z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                                <WalletIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-blue-50 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">總開支</span>
                        </div>

                        {/* Currency Selector */}
                        <div className="relative pointer-events-auto">
                            <select 
                                value={globalCurrency} 
                                onChange={e => setGlobalCurrency(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                            >
                                {ALL_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                            </select>
                            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full border border-white/30 hover:bg-white/30 transition-colors">
                                <span className="font-bold text-[10px] text-white">{globalCurrency}</span>
                                <ChevronDownIcon className="w-2.5 h-2.5 text-white/80" />
                            </div>
                        </div>
                     </div>
                     
                     {/* Amount Row */}
                     <div className="z-10 mt-3 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-blue-100">{getCurrencySymbol(globalCurrency)}</span>
                        <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm truncate">
                           {Math.round(displayedTotalExpenses).toLocaleString()}
                        </h1>
                     </div>
                </div>

                {/* Right: Analysis Stats Button (Restored Purple Theme) */}
                <button 
                    onClick={() => setActiveModal('STATS')}
                    className="pointer-events-auto relative overflow-hidden rounded-[28px] p-4 shadow-lg shadow-purple-500/20 transition-all duration-300 bg-gradient-to-br from-violet-500 to-fuchsia-600 hover:opacity-90 active:scale-95 flex flex-col items-center justify-center gap-2 group"
                >
                    <div className="absolute -left-4 -bottom-12 h-32 w-32 rounded-full bg-white/20 blur-3xl pointer-events-none group-hover:bg-white/30 transition-colors"></div>
                    
                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white relative z-10 backdrop-blur-sm">
                        <ChartPieIcon className="w-5 h-5" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide relative z-10">消費分析</span>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto px-6 pb-40 space-y-6 no-scrollbar pt-2">
                
                {/* 2. Redesigned Budget Dashboard */}
                <div className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[32px] p-6 relative overflow-hidden shadow-lg dark:shadow-none backdrop-blur-xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-800 dark:text-white font-black text-lg">旅途預算監控</h3>
                        <button 
                            onClick={() => setActiveModal('BUDGET')}
                            className="text-xs font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-3 py-1.5 rounded-full hover:bg-[#38bdf8]/20 transition-colors"
                        >
                            設定 / 編輯
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-shrink-0">
                             <CircularProgress 
                                percentage={budgetProgress} 
                                color={isOverBudget ? '#ef4444' : '#38bdf8'} 
                             />
                        </div>

                        <div className="flex-grow space-y-4">
                             <div className="bg-slate-50/50 dark:bg-white/5 rounded-2xl p-3 border border-slate-200/50 dark:border-white/5">
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">預算上限 ({budget.type === 'total' ? '總額' : '現金'})</p>
                                 <p className="text-slate-900 dark:text-white font-bold font-mono">
                                     {budget.currency} {budget.amount.toLocaleString()}
                                 </p>
                             </div>
                             <div className={`rounded-2xl p-3 border ${isOverBudget ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                 <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                                     {isOverBudget ? '已超支' : '剩餘額度'}
                                 </p>
                                 <p className={`font-bold font-mono ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                                     {budget.currency} {Math.abs(remainingBudget).toLocaleString()}
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. Quick Access Tabs (Removed separate analysis button, moved up) */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setCurrentView('PRE_TRIP')}
                        className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[24px] p-4 flex items-center gap-3 active:scale-95 transition-transform hover:bg-white/80 dark:hover:bg-[#1e293b]/60"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                            <PlaneIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PRE-TRIP</p>
                            <p className="text-slate-900 dark:text-white font-bold text-sm">行前準備</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => setCurrentView('ON_TRIP')}
                        className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[24px] p-4 flex items-center gap-3 active:scale-95 transition-transform hover:bg-white/80 dark:hover:bg-[#1e293b]/60"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <MapIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ON-TRIP</p>
                            <p className="text-slate-900 dark:text-white font-bold text-sm">旅途消費</p>
                        </div>
                    </button>
                </div>

                {/* 4. Real-time Calculator */}
                <div className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[32px] p-6 shadow-lg dark:shadow-none transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-4 text-[#38bdf8]">
                        <ArrowsRightLeftIcon className="w-5 h-5" />
                        <span className="font-bold text-sm">實時匯率計算器</span>
                    </div>
                    {/* ... (Calculator content same as before) ... */}
                    <div className="space-y-2">
                        <div className="bg-slate-50 dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold mb-1">From</p>
                                <input 
                                    type="number" 
                                    value={calcAmount}
                                    onChange={e => setCalcAmount(e.target.value)}
                                    className="bg-transparent text-slate-900 dark:text-white font-black text-2xl w-32 focus:outline-none placeholder-slate-300 dark:placeholder-slate-700 placeholder:font-black"
                                    placeholder="1000"
                                />
                            </div>
                            <div className="relative">
                                <select 
                                    value={calcFrom}
                                    onChange={e => setCalcFrom(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                >
                                    {ALL_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                                </select>
                                <div className="flex items-center gap-1.5 pointer-events-none bg-white dark:bg-[#1e293b] py-2 pl-4 pr-3 rounded-xl border border-slate-200 dark:border-transparent">
                                     <span className="text-slate-800 dark:text-white font-bold">{calcFrom}</span>
                                     <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <button 
                                onClick={() => {
                                    setCalcFrom(calcTo);
                                    setCalcTo(calcFrom);
                                }}
                                className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors shadow-lg"
                            >
                                <ArrowsRightLeftIcon className="w-4 h-4 transform rotate-90" />
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold mb-1">To</p>
                                <div className="text-slate-900 dark:text-white font-black text-2xl w-32 truncate">
                                    {calcAmount ? calcResult.toFixed(2) : <span className="text-slate-300 dark:text-slate-700">0</span>}
                                </div>
                            </div>
                            <div className="relative">
                                <select 
                                    value={calcTo}
                                    onChange={e => setCalcTo(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                >
                                    {ALL_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                                </select>
                                <div className="flex items-center gap-1.5 pointer-events-none bg-white dark:bg-[#1e293b] py-2 pl-4 pr-3 rounded-xl border border-slate-200 dark:border-transparent">
                                     <span className="text-slate-800 dark:text-white font-bold">{calcTo}</span>
                                     <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold mt-4 text-center">
                        1.00 {calcFrom} = {(exchangeRates[calcTo] / exchangeRates[calcFrom]).toFixed(6)} {calcTo} • Real-time
                    </p>

                    {jpyValue !== null && (
                        <div className={`mt-4 rounded-2xl p-4 relative overflow-hidden transition-all duration-500 animate-fade-in-up border ${jpyValue >= TAX_FREE_THRESHOLD ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30' : 'bg-[#1e293b] border-white/5'}`}>
                             {jpyValue >= TAX_FREE_THRESHOLD && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    <div className="absolute top-2 left-10 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
                                    <div className="absolute bottom-4 right-10 w-1.5 h-1.5 bg-amber-200 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
                                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
                                    <div className="absolute top-4 right-4 w-1 h-1 bg-yellow-100 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
                                </div>
                             )}

                             <div className="flex items-center justify-between relative z-10">
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">🇯🇵</span>
                                        <span className={`text-xs font-bold ${jpyValue >= TAX_FREE_THRESHOLD ? 'text-amber-500' : 'text-slate-400'}`}>
                                            日本免稅門檻 (¥5,000)
                                        </span>
                                     </div>
                                     {jpyValue >= TAX_FREE_THRESHOLD ? (
                                         <div className="flex items-baseline gap-2">
                                            <p className="text-amber-500 font-bold text-lg mb-0.5">已達標！</p>
                                            <p className="text-amber-600/80 dark:text-amber-400/80 text-xs font-bold">
                                                (預計退稅 ¥{Math.floor(jpyValue * 0.1).toLocaleString()})
                                            </p>
                                         </div>
                                     ) : (
                                         <div>
                                             <p className="text-white font-black text-xl tracking-tight">
                                                 還差 ¥{(TAX_FREE_THRESHOLD - jpyValue).toLocaleString()}
                                             </p>
                                         </div>
                                     )}
                                 </div>

                                 <div>
                                     {jpyValue >= TAX_FREE_THRESHOLD ? (
                                         <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 animate-scale-in">
                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                 <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                             </svg>
                                         </div>
                                     ) : (
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            <CircularProgress 
                                                percentage={(jpyValue / TAX_FREE_THRESHOLD) * 100} 
                                                color="#38bdf8" 
                                                size={48} 
                                                stroke={4} 
                                            />
                                        </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </>
      ) : (
        renderListView(currentView)
      )}

            {/* --- MODALS --- */}

            {/* 1. Set Budget Modal */}
            {activeModal === 'BUDGET' && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-slide-up">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-8">設定旅途預算</h3>
                        
                        <div className="flex gap-3 mb-8">
                            <div className="flex-1 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center h-20 relative">
                                <span className="text-[10px] font-bold text-slate-400 absolute top-2 left-4">金額</span>
                                <input 
                                    type="number" 
                                    value={budget.amount}
                                    onChange={e => setBudget({...budget, amount: parseFloat(e.target.value) || 0})}
                                    className="w-full bg-transparent text-slate-900 dark:text-white font-black text-2xl text-center focus:outline-none placeholder-slate-400"
                                    placeholder="0"
                                />
                            </div>
                            <div className="w-32 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl h-20 relative flex items-center justify-center">
                                <select 
                                    value={budget.currency}
                                    onChange={e => setBudget({...budget, currency: e.target.value})}
                                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                >
                                    {ALL_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                                </select>
                                <div className="flex items-center gap-1.5 pointer-events-none">
                                    <span className="text-slate-900 dark:text-white font-bold text-lg">{budget.currency}</span>
                                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-500 text-xs font-bold text-center mb-2">預算類型</p>
                        
                        <div className="bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-2xl flex relative mb-8 h-14 items-center backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-inner">
                            <div 
                                    className={`absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg border border-white/20 backdrop-blur-md
                                    ${budget.type === 'total' 
                                        ? 'left-1.5 w-[calc(50%-6px)] bg-gradient-to-br from-[#38bdf8]/60 to-[#0284c7]/60 shadow-blue-500/20' 
                                        : 'left-[50%] w-[calc(50%-6px)] bg-gradient-to-br from-[#38bdf8]/60 to-[#0284c7]/60 shadow-blue-500/20'}
                                    `}
                            ></div>
                            
                            <button 
                                onClick={() => setBudget({...budget, type: 'total'})}
                                className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-300 ${budget.type === 'total' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                總預算 (現金+卡)
                            </button>
                            <button 
                                onClick={() => setBudget({...budget, type: 'cash_only'})}
                                className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-300 ${budget.type === 'cash_only' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                僅限現金
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setActiveModal('NONE')} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-white/5">取消</button>
                            <button onClick={() => setActiveModal('NONE')} className="flex-1 py-4 rounded-2xl bg-[#38bdf8] text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-[#0ea5e9]">確認</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Add Expense Modal (Pre & On-Trip) */}
            {(activeModal === 'ADD_PRE' || activeModal === 'ADD_ON') && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm sm:p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col animate-slide-up max-h-[90vh]">
                        {/* ... Modal content identical to previous, just context preserved ... */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">
                                {editingId ? '編輯消費項目' : (activeModal === 'ADD_PRE' ? '新增行前開支' : '新增旅途消費')}
                            </h3>
                            <button onClick={() => setActiveModal('NONE')} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto no-scrollbar space-y-6 pb-6">
                            {/* Amount & Currency Split Block */}
                            <div>
                                <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">金額與幣種</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center h-24 relative">
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                            className="w-full bg-transparent text-slate-900 dark:text-white font-black text-3xl text-left pl-2 focus:outline-none placeholder-slate-400 dark:placeholder-slate-700"
                                        />
                                    </div>
                                    <div className="w-36 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl h-24 relative flex items-center justify-center">
                                        <select 
                                            value={newExpense.currency}
                                            onChange={e => setNewExpense({...newExpense, currency: e.target.value})}
                                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                        >
                                            {ALL_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                                        </select>
                                        <div className="flex flex-col items-center gap-1 pointer-events-none">
                                            <div className="flex items-center gap-1">
                                                <span className="text-slate-900 dark:text-white font-bold text-lg">{newExpense.currency}</span>
                                                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">{getCurrencyLabel(newExpense.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Name & Date */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">項目名稱</label>
                                    <div className="bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                                        <input 
                                            type="text" 
                                            placeholder="例如：機票、晚餐、紀念品..." 
                                            value={newExpense.title}
                                            onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                                            className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-bold text-lg" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">日期</label>
                                    <div className="bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3">
                                        <span className="text-slate-400"><CalendarIcon className="w-5 h-5" /></span>
                                        <input 
                                            type="date"
                                            value={newExpense.date}
                                            onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                                            className="bg-transparent w-full text-slate-900 dark:text-white font-bold text-lg focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Premium Glass Sliding Payment Method Toggle */}
                            <div>
                                <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">付款方式</label>
                                <div className="bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-2xl flex relative h-14 items-center backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-inner">
                                    <div 
                                        className={`absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg border border-white/20 backdrop-blur-md
                                            ${newExpense.paymentMethod === 'cash' ? 'left-1.5 w-[calc(33.33%-4px)] bg-gradient-to-br from-[#34d399]/60 to-[#059669]/60 shadow-emerald-500/20' : 
                                            newExpense.paymentMethod === 'card' ? 'left-[calc(33.33%+2px)] w-[calc(33.33%-4px)] bg-gradient-to-br from-[#38bdf8]/60 to-[#0284c7]/60 shadow-blue-500/20' : 
                                            'left-[calc(66.66%-2px)] w-[calc(33.33%-4px)] bg-gradient-to-br from-[#94a3b8]/60 to-[#475569]/60 shadow-slate-500/20'}
                                        `}
                                    ></div>

                                    <button 
                                        onClick={() => setNewExpense({...newExpense, paymentMethod: 'cash'})}
                                        className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${newExpense.paymentMethod === 'cash' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        <BanknotesIcon className="w-4 h-4" /> 現金
                                    </button>
                                    <button 
                                        onClick={() => setNewExpense({...newExpense, paymentMethod: 'card'})}
                                        className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${newExpense.paymentMethod === 'card' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        <CreditCardIcon className="w-4 h-4" /> 信用卡
                                    </button>
                                    <button 
                                        onClick={() => setNewExpense({...newExpense, paymentMethod: 'other'})}
                                        className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${newExpense.paymentMethod === 'other' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        ... 其他
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <label className="text-slate-500 text-[10px] font-bold mb-2 block ml-1">分類</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(activeModal === 'ADD_PRE' ? PRE_TRIP_CATEGORIES : ON_TRIP_CATEGORIES).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewExpense({...newExpense, category: cat.id})}
                                            className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${newExpense.category === cat.id ? 'bg-white dark:bg-[#1e293b] border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'bg-slate-50 dark:bg-[#1e293b]/50 border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${cat.bg}`} style={{ backgroundColor: cat.color }}></div>
                                            <span className={`text-sm font-bold ${newExpense.category === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleSaveExpense(activeModal === 'ADD_PRE')}
                            disabled={!newExpense.amount || !newExpense.title || !newExpense.category}
                            className={`w-full py-4 rounded-3xl font-bold text-lg shadow-lg mt-auto transition-all ${(!newExpense.amount || !newExpense.title || !newExpense.category) ? 'bg-slate-200 dark:bg-[#1f2937] text-slate-500 cursor-not-allowed' : 'bg-[#38bdf8] text-white hover:bg-[#0ea5e9] shadow-blue-500/30'}`}
                        >
                            {editingId ? '更新項目' : '確認新增'}
                        </button>
                    </div>
                </div>
            )}

            {/* 3. Analysis Stats Modal */}
            {activeModal === 'STATS' && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-slide-up relative overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <ChartPieIcon className="w-6 h-6 text-violet-500" />
                                旅途消費分析
                            </h3>
                            <button onClick={() => setActiveModal('NONE')} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto no-scrollbar space-y-8 pb-4">
                            {/* Payment Methods */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">付款方式統計 (On-Trip)</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
                                        <div className="text-emerald-500 mb-1 flex justify-center"><BanknotesIcon className="w-5 h-5" /></div>
                                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-bold mb-0.5">現金</p>
                                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm truncate">{Math.round(onTripStats.methods.cash).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 text-center">
                                        <div className="text-blue-500 mb-1 flex justify-center"><CreditCardIcon className="w-5 h-5" /></div>
                                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-bold mb-0.5">信用卡</p>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm truncate">{Math.round(onTripStats.methods.card).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-500/10 border border-slate-500/20 rounded-2xl p-3 text-center">
                                        <div className="text-slate-500 mb-1 flex justify-center"><TagIcon className="w-5 h-5" /></div>
                                        <p className="text-[10px] text-slate-600/70 dark:text-slate-400/70 font-bold mb-0.5">其他</p>
                                        <p className="text-slate-600 dark:text-slate-400 font-bold text-sm truncate">{Math.round(onTripStats.methods.other).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">類別排行 (On-Trip)</h4>
                                {onTripStats.categories.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-sm font-bold border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                                        尚無旅途消費數據
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {onTripStats.categories.map((cat, idx) => {
                                            const percent = (cat.amount / onTripStats.total) * 100;
                                            return (
                                                <div key={cat.id}>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 rounded-full ${cat.bg} bg-opacity-20 flex items-center justify-center font-bold text-xs`} style={{ color: cat.color }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div className={`w-6 h-6 rounded-full ${cat.bg} bg-opacity-20 flex items-center justify-center`} style={{ color: cat.color }}>
                                                                <cat.icon className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.label}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono block">
                                                                {globalCurrency} {Math.round(cat.amount).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex items-center gap-2">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                                            style={{ 
                                                                width: `${percent}%`,
                                                                backgroundColor: cat.color,
                                                                boxShadow: `0 0 10px ${cat.color}60`
                                                            }}
                                                        ></div>
                                                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{Math.round(percent)}%</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Daily Expenses Chart */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">每日開支 (On-Trip)</h4>
                                {onTripStats.days.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-sm font-bold border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                                        尚無旅途消費數據
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {onTripStats.days.map((day) => {
                                            const percent = onTripStats.maxDailyTotal > 0 ? (day.total / onTripStats.maxDailyTotal) * 100 : 0;
                                            const dateObj = new Date(day.date);
                                            const dateLabel = !isNaN(dateObj.getTime()) ? `${dateObj.getMonth() + 1}/${dateObj.getDate()}` : day.date;
                                            
                                            return (
                                                <div key={day.date} className="flex items-center gap-3">
                                                    <div className="w-10 text-xs font-bold text-slate-500 text-right shrink-0">{dateLabel}</div>
                                                    <div className="flex-grow h-8 bg-slate-50 dark:bg-white/5 rounded-lg relative overflow-hidden flex items-center px-2">
                                                         <div 
                                                            className="absolute top-0 bottom-0 left-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-lg transition-all duration-1000 ease-out"
                                                            style={{ width: `${percent}%` }}
                                                         ></div>
                                                         <span className="relative z-10 text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">
                                                             {globalCurrency} {Math.round(day.total).toLocaleString()}
                                                         </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center pt-2">
                            <p className="text-[10px] text-slate-400 font-bold">所有金額皆已換算為 {globalCurrency}</p>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default ExpensesTool;
