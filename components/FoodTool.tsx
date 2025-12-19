import React, { useState } from 'react';
import { Trip, Expense } from '../types';
import { PlusIcon, EditIcon } from './Icons';

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const ExpensesTool: React.FC<Props> = ({ trip, onUpdateTrip }) => {
  const [expenses, setExpenses] = useState<Expense[]>(trip.expenses || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '' });

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budget = 150000; // Hardcoded for demo
  const remaining = budget - total;

  return (
    <div className="h-full flex flex-col p-6 pb-24 bg-[#05080F] space-y-6">
      
      {/* Total Expenses Header */}
      <div className="flex justify-between items-end">
         <div>
             <p className="text-slate-400 text-xs font-bold tracking-wider mb-1">總開支 TOTAL EXPENSES</p>
             <h2 className="text-4xl font-black text-white">HK$ <span className="text-white">{total.toLocaleString()}</span></h2>
         </div>
         <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
             <span className="text-xs font-bold text-slate-300">HKD 港幣</span>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
         </div>
      </div>

      {/* Budget Card */}
      <div className="glass-card p-5 rounded-[24px] border border-white/10 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-slate-300 font-bold text-sm">旅途預算 (總額): ¥{budget.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs mt-0.5">(約 HK$7,800)</p>
              </div>
              <button className="p-2 bg-blue-500/20 rounded-full text-blue-400 hover:text-white transition-colors">
                  <EditIcon className="w-4 h-4" />
              </button>
          </div>
          
          <div className="w-full bg-[#1e293b] h-3 rounded-full mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full w-[0%]"></div>
          </div>
          
          <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500">已使用 0%</span>
              <span className="text-[#34d399]">剩餘: ¥{remaining.toLocaleString()}</span>
          </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 rounded-[24px] border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors cursor-pointer">
              <span className="text-slate-500 mb-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg></span>
              <p className="font-bold text-white text-sm">行前準備</p>
              <p className="text-slate-500 text-xs font-bold">HK$ 0</p>
          </div>
          <div className="glass-card p-6 rounded-[24px] border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors cursor-pointer">
              <span className="text-slate-500 mb-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg></span>
              <p className="font-bold text-white text-sm">旅途開支</p>
              <p className="text-slate-500 text-xs font-bold">HK$ 0</p>
          </div>
      </div>

      {/* Exchange Rate Calculator */}
      <div className="glass-card p-0 rounded-[24px] border border-white/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-cyan-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
             <span className="text-xs font-bold text-white">實時匯率計算器</span>
          </div>
          <div className="p-1">
             <div className="bg-[#0f172a] rounded-xl p-4 mb-1 relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500">From</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">JPY <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></span>
                </div>
                <div className="text-2xl font-bold text-slate-400">¥ 100</div>
                {/* Swap Button */}
                <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 w-8 h-8 bg-slate-700 rounded-full border-4 border-[#1e293b] flex items-center justify-center z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
                </div>
             </div>
             <div className="bg-[#0f172a] rounded-xl p-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500">To</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">HKD <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></span>
                </div>
                <div className="text-2xl font-bold text-white">HK$ 0</div>
             </div>
          </div>
          <div className="px-5 py-3 border-t border-white/5 flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-400">1.00 JPY = 0.050000 HKD</span>
             <span className="text-[10px] font-bold text-slate-600">Mid-market rate • Real-time</span>
          </div>
      </div>

       {/* Tax Refund Card */}
       <div className="glass-card p-4 rounded-[24px] border border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-lg">🇯🇵</div>
               <div>
                   <p className="text-xs font-bold text-slate-400">日本免稅門檻 (¥5,000)</p>
                   <p className="text-sm font-bold text-slate-200">還差 ¥5,000</p>
               </div>
           </div>
           <div className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold">
               0%
           </div>
       </div>

      {/* FAB */}
      <div className="absolute bottom-28 right-6 z-20">
        <button 
          className="w-14 h-14 bg-[#38bdf8] hover:bg-[#0ea5e9] rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-90 transition-all"
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      </div>

    </div>
  );
};

export default ExpensesTool;