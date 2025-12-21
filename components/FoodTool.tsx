
import React, { useState, useEffect, useMemo } from 'react';
import { Trip, Expense, Budget } from '../types';
import { PlusIcon, EditIcon, TrashIcon, DiningIcon, BusIcon, ShoppingBagIcon, HomeIcon, TagIcon, WalletIcon, ArrowsRightLeftIcon, CreditCardIcon, BanknotesIcon, TicketIcon, PlaneIcon, ShieldCheckIcon, ChevronDownIcon, MapIcon, ChevronLeftIcon } from './Icons';

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

const CURRENCIES = ['HKD', 'TWD', 'JPY', 'USD', 'EUR', 'KRW', 'THB', 'GBP'];

const ExpensesTool: React.FC<Props> = ({ trip, onUpdateTrip }) => {
  // --- State ---
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'PRE_TRIP' | 'ON_TRIP'>('DASHBOARD');
  const [globalCurrency, setGlobalCurrency] = useState('HKD');
  const [expenses, setExpenses] = useState<Expense[]>(trip.expenses || []);
  const [budget, setBudget] = useState<Budget>(trip.budget || { amount: 0, currency: 'JPY', type: 'total' });
  
  // Modals
  const [activeModal, setActiveModal] = useState<'NONE' | 'BUDGET' | 'ADD_PRE' | 'ADD_ON'>('NONE');
  
  // Exchange Rate Data
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  
  // Calculator State
  const [calcFrom, setCalcFrom] = useState('JPY');
  const [calcTo, setCalcTo] = useState('HKD');
  const [calcAmount, setCalcAmount] = useState<string>('100');

  // New Expense State
  const [newExpense, setNewExpense] = useState<{
      amount: string;
      currency: string;
      title: string;
      category: string;
      paymentMethod: 'cash' | 'card' | 'other';
  }>({ amount: '', currency: 'HKD', title: '', category: '', paymentMethod: 'cash' });

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

  const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
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
  const budgetInGlobal = convert(budget.amount, budget.currency, globalCurrency);
  const totalSpentInGlobal = preTripTotalBase + onTripTotalBase; // Simplified: assumes budget covers everything
  // Determine what counts towards budget based on type
  const relevantExpenses = expenses.filter(e => {
      if (budget.type === 'total') return true;
      return e.paymentMethod === 'cash'; // 'cash_only' type
  });
  const usedBudgetAmount = relevantExpenses.reduce((sum, e) => sum + convert(e.amount, e.currency, budget.currency), 0);
  const remainingBudget = budget.amount - usedBudgetAmount;
  const budgetProgress = Math.min(100, Math.max(0, (usedBudgetAmount / budget.amount) * 100));

  // Calculator Result
  const calcResult = useMemo(() => {
     const amt = parseFloat(calcAmount) || 0;
     if (!exchangeRates[calcFrom] || !exchangeRates[calcTo]) return 0;
     // Rates are based on HKD
     const valInBase = amt / exchangeRates[calcFrom];
     return valInBase * exchangeRates[calcTo];
  }, [calcAmount, calcFrom, calcTo, exchangeRates]);


  // --- Handlers ---
  const handleSaveExpense = (isPre: boolean) => {
      if (!newExpense.amount || !newExpense.title || !newExpense.category) return;
      
      const expense: Expense = {
          id: Date.now().toString(),
          title: newExpense.title,
          amount: parseFloat(newExpense.amount),
          currency: newExpense.currency,
          category: newExpense.category,
          date: new Date().toISOString().split('T')[0],
          isPreTrip: isPre,
          paymentMethod: newExpense.paymentMethod
      };

      setExpenses([expense, ...expenses]);
      setActiveModal('NONE');
      setNewExpense({ amount: '', currency: globalCurrency, title: '', category: '', paymentMethod: 'cash' });
  };

  const handleDeleteExpense = (id: string) => {
      if (confirm('確定要刪除這筆消費紀錄嗎？')) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
  };

  const renderListView = (viewMode: 'PRE_TRIP' | 'ON_TRIP') => {
      const isPre = viewMode === 'PRE_TRIP';
      const title = isPre ? '行前準備' : '旅途開支';
      const listExpenses = isPre ? preTripExpenses : onTripExpenses;
      const totalAmount = isPre ? preTripTotalBase : onTripTotalBase;
      const categories = isPre ? PRE_TRIP_CATEGORIES : ON_TRIP_CATEGORIES;

      return (
        <div className="h-full flex flex-col relative bg-transparent animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 flex items-center gap-4 bg-white/30 dark:bg-[#1e293b]/30 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
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
                             <div key={exp.id} className="bg-white/50 dark:bg-[#1e293b]/30 p-4 rounded-2xl flex items-center justify-between border border-white/50 dark:border-transparent animate-fade-in-up">
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
                                     <button onClick={() => handleDeleteExpense(exp.id)} className="text-[10px] text-red-400 mt-1">刪除</button>
                                 </div>
                             </div>
                         )
                    })
                )}
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-[100px] left-0 right-0 px-6 pb-6 pt-10 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#05080F] dark:via-[#05080F]/80 pointer-events-none z-20">
                 <button 
                    onClick={() => setActiveModal(isPre ? 'ADD_PRE' : 'ADD_ON')}
                    className="w-full py-4 bg-[#38bdf8] text-white font-black text-lg rounded-3xl hover:bg-[#0ea5e9] shadow-lg shadow-blue-500/30 transition-colors pointer-events-auto flex items-center justify-center gap-2 active:scale-95 transform duration-100"
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
            {/* 1. Header: Total Expenses */}
            <div className="px-6 pt-8 pb-4 bg-white/30 dark:bg-[#1e293b]/30 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">總開支 TOTAL EXPENSES</span>
                    <div className="relative group">
                        <select 
                            value={globalCurrency} 
                            onChange={e => setGlobalCurrency(e.target.value)}
                            className="appearance-none bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-white/10 focus:outline-none"
                        >
                            {CURRENCIES.map(c => <option key={c} value={c}>{c} {c === 'HKD' ? '港幣' : ''}</option>)}
                        </select>
                        <ChevronDownIcon className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-lg">{globalCurrency}</span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{Math.round(displayedTotalExpenses).toLocaleString()}</h1>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-6 pb-40 space-y-6 no-scrollbar pt-2">
                
                {/* 2. Budget Card */}
                <div className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[28px] p-5 relative overflow-hidden shadow-lg dark:shadow-none transition-colors duration-300">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-0.5">旅途預算 ({budget.type === 'total' ? '總額' : '僅現金'})</h3>
                            <p className="text-slate-900 dark:text-white font-black text-2xl tracking-wide">
                                {budget.currency === 'JPY' ? '¥' : '$'}
                                {budget.amount.toLocaleString()} 
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-normal ml-2">{budget.currency}</span>
                            </p>
                            <p className="text-slate-500 dark:text-slate-500 text-xs font-bold mt-1">(約 {formatCurrency(convert(budget.amount, budget.currency, globalCurrency), globalCurrency)})</p>
                        </div>
                        <button 
                            onClick={() => setActiveModal('BUDGET')}
                            className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center hover:bg-[#38bdf8] hover:text-white transition-colors"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-4 bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden mb-2 z-10">
                        <div 
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${remainingBudget < 0 ? 'bg-red-500' : 'bg-[#34d399]'}`}
                            style={{ width: `${budget.amount > 0 ? Math.min(100, budgetProgress) : 0}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold relative z-10">
                        <span className="text-slate-500 dark:text-slate-400">已使用 {Math.round(budgetProgress)}%</span>
                        <span className={remainingBudget < 0 ? 'text-red-500 dark:text-red-400' : 'text-[#34d399]'}>
                            剩餘: {budget.currency === 'JPY' ? '¥' : '$'}{remainingBudget.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* 3. Expense Breakdown Cards (Two Columns) */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Pre-Trip Card */}
                    <button 
                        onClick={() => setCurrentView('PRE_TRIP')}
                        className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[28px] p-5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform h-40 relative overflow-hidden group shadow-md dark:shadow-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-300 relative z-10 shadow-sm dark:shadow-none">
                            <PlaneIcon className="w-5 h-5" />
                        </div>
                        <div className="text-center relative z-10">
                            <h4 className="text-slate-800 dark:text-white font-bold mb-1">行前準備</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
                                {globalCurrency} {Math.round(preTripTotalBase).toLocaleString()}
                            </p>
                        </div>
                    </button>

                    {/* On-Trip Card */}
                    <button 
                        onClick={() => setCurrentView('ON_TRIP')}
                        className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[28px] p-5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform h-40 relative overflow-hidden group shadow-md dark:shadow-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-300 relative z-10 shadow-sm dark:shadow-none">
                            <MapIcon className="w-5 h-5" />
                        </div>
                        <div className="text-center relative z-10">
                            <h4 className="text-slate-800 dark:text-white font-bold mb-1">旅途開支</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
                                {globalCurrency} {Math.round(onTripTotalBase).toLocaleString()}
                            </p>
                        </div>
                    </button>
                </div>

                {/* 4. Real-time Calculator */}
                <div className="bg-white/60 dark:bg-[#1e293b]/40 border border-white/50 dark:border-white/10 rounded-[28px] p-5 shadow-lg dark:shadow-none transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-4 text-[#38bdf8]">
                        <ArrowsRightLeftIcon className="w-5 h-5" />
                        <span className="font-bold text-sm">實時匯率計算器</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="bg-slate-50 dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold mb-1">From</p>
                                <input 
                                    type="number" 
                                    value={calcAmount}
                                    onChange={e => setCalcAmount(e.target.value)}
                                    className="bg-transparent text-slate-900 dark:text-white font-black text-2xl w-32 focus:outline-none placeholder-slate-400 dark:placeholder-slate-700"
                                    placeholder="0"
                                />
                            </div>
                            <div className="relative">
                                <select 
                                    value={calcFrom}
                                    onChange={e => setCalcFrom(e.target.value)}
                                    className="appearance-none bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none text-right border border-slate-200 dark:border-transparent"
                                >
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                                    {calcResult.toFixed(2)}
                                </div>
                            </div>
                            <div className="relative">
                                <select 
                                    value={calcTo}
                                    onChange={e => setCalcTo(e.target.value)}
                                    className="appearance-none bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none text-right border border-slate-200 dark:border-transparent"
                                >
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold mt-4 text-center">
                        1.00 {calcFrom} = {(exchangeRates[calcTo] / exchangeRates[calcFrom]).toFixed(6)} {calcTo} • Real-time
                    </p>
                </div>
                
                {/* Recent Expenses List (Dashboard Only) */}
                {expenses.length > 0 && (
                    <div className="pt-4">
                        <h3 className="text-slate-800 dark:text-white font-bold mb-4 px-1">近期消費紀錄</h3>
                        <div className="space-y-3">
                            {expenses.slice(0, 5).map(exp => {
                                const cats = exp.isPreTrip ? PRE_TRIP_CATEGORIES : ON_TRIP_CATEGORIES;
                                const cat = cats.find(c => c.id === exp.category) || cats[cats.length-1];
                                return (
                                    <div key={exp.id} className="bg-white/50 dark:bg-[#1e293b]/30 p-4 rounded-2xl flex items-center justify-between border border-white/50 dark:border-transparent">
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
                                            <button onClick={() => handleDeleteExpense(exp.id)} className="text-[10px] text-red-400 mt-1">刪除</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
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
               
               <div className="flex gap-2 mb-6">
                   <input 
                      type="number" 
                      value={budget.amount}
                      onChange={e => setBudget({...budget, amount: parseFloat(e.target.value) || 0})}
                      className="flex-grow bg-slate-100 dark:bg-[#1e293b] rounded-2xl text-slate-900 dark:text-white font-black text-2xl text-center py-3 focus:outline-none placeholder-slate-400"
                      placeholder="0"
                   />
                   <div className="relative w-28">
                       <select 
                          value={budget.currency}
                          onChange={e => setBudget({...budget, currency: e.target.value})}
                          className="appearance-none w-full h-full bg-slate-100 dark:bg-[#1e293b] rounded-2xl text-slate-900 dark:text-white font-bold text-center focus:outline-none pl-2 pr-8"
                       >
                           {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                   </div>
               </div>

               <p className="text-slate-500 text-xs font-bold text-center mb-2">預算類型</p>
               <div className="bg-slate-100 dark:bg-[#1e293b] p-1 rounded-xl flex mb-8">
                   <button 
                      onClick={() => setBudget({...budget, type: 'total'})}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${budget.type === 'total' ? 'bg-[#38bdf8]/20 text-[#38bdf8] shadow-sm' : 'text-slate-500'}`}
                   >
                       總預算 (現金+卡)
                   </button>
                   <button 
                      onClick={() => setBudget({...budget, type: 'cash_only'})}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${budget.type === 'cash_only' ? 'bg-[#38bdf8]/20 text-[#38bdf8] shadow-sm' : 'text-slate-500'}`}
                   >
                       僅限現金
                   </button>
               </div>

               <div className="flex gap-3">
                   <button onClick={() => setActiveModal('NONE')} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 font-bold">取消</button>
                   <button onClick={() => setActiveModal('NONE')} className="flex-1 py-4 rounded-2xl bg-[#38bdf8] text-white font-bold shadow-lg shadow-blue-500/30">確認</button>
               </div>
           </div>
        </div>
      )}

      {/* 2. Add Expense Modal (Pre & On-Trip) */}
      {(activeModal === 'ADD_PRE' || activeModal === 'ADD_ON') && (
         <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm sm:p-4 animate-fade-in">
             <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col animate-slide-up max-h-[90vh]">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">
                         {activeModal === 'ADD_PRE' ? '新增行前開支' : '新增旅途開支'}
                     </h3>
                     <button onClick={() => setActiveModal('NONE')} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                 </div>

                 <div className="flex-grow overflow-y-auto no-scrollbar space-y-6 pb-6">
                     {/* Amount & Currency */}
                     <div>
                         <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">金額與幣種</label>
                         <div className="flex gap-3">
                             <input 
                                type="number" 
                                placeholder="0" 
                                autoFocus
                                value={newExpense.amount}
                                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                className="flex-grow bg-slate-100 dark:bg-[#1e293b] rounded-2xl py-3 px-4 text-center text-2xl font-black text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-700"
                             />
                             <div className="relative w-28 shrink-0">
                                <select 
                                    value={newExpense.currency}
                                    onChange={e => setNewExpense({...newExpense, currency: e.target.value})}
                                    className="appearance-none w-full h-full bg-slate-100 dark:bg-[#1e293b] rounded-2xl text-slate-900 dark:text-white font-bold text-center focus:outline-none pl-2 pr-8"
                                >
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                             </div>
                         </div>
                     </div>

                     {/* Name */}
                     <div>
                         <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">項目名稱</label>
                         <div className="bg-slate-100 dark:bg-[#1e293b] rounded-2xl p-4">
                             <input 
                                type="text" 
                                placeholder="例如：機票、晚餐、紀念品..." 
                                value={newExpense.title}
                                onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                                className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-bold text-lg" 
                             />
                         </div>
                     </div>

                     {/* Payment Method */}
                     <div>
                         <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">付款方式</label>
                         <div className="bg-slate-100 dark:bg-[#1e293b] p-1.5 rounded-2xl flex">
                             <button 
                                onClick={() => setNewExpense({...newExpense, paymentMethod: 'cash'})}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${newExpense.paymentMethod === 'cash' ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30' : 'text-slate-500 hover:bg-white dark:hover:text-white dark:hover:bg-white/10'}`}
                             >
                                 <BanknotesIcon className="w-4 h-4" /> 現金
                             </button>
                             <button 
                                onClick={() => setNewExpense({...newExpense, paymentMethod: 'card'})}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${newExpense.paymentMethod === 'card' ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30' : 'text-slate-500 hover:bg-white dark:hover:text-white dark:hover:bg-white/10'}`}
                             >
                                 <CreditCardIcon className="w-4 h-4" /> 信用卡
                             </button>
                             <button 
                                onClick={() => setNewExpense({...newExpense, paymentMethod: 'other'})}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${newExpense.paymentMethod === 'other' ? 'bg-[#94a3b8]/20 text-slate-600 dark:text-slate-300 border border-slate-500/30' : 'text-slate-500 hover:bg-white dark:hover:text-white dark:hover:bg-white/10'}`}
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
                     確認新增
                 </button>
             </div>
         </div>
      )}

    </div>
  );
};

export default ExpensesTool;
