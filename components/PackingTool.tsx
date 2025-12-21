
import React, { useState } from 'react';
import { Trip, PackingItem } from '../types';
import { PlusIcon, CartIcon } from './Icons';

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const PackingTool: React.FC<Props> = ({ trip, onUpdateTrip }) => {
  const [items, setItems] = useState<PackingItem[]>(trip.packingList || []);
  const [tab, setTab] = useState<'PURCHASE' | 'PACKING'>('PURCHASE');

  return (
    <div className="h-full flex flex-col p-6 pb-24 bg-transparent transition-colors duration-300">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">採購裝備</h2>
      
      {/* Progress */}
      <div className="w-full bg-slate-200 dark:bg-[#1e293b] h-2 rounded-full mb-2 overflow-hidden">
         <div className="bg-slate-400 dark:bg-slate-600 h-full rounded-full w-[0%]"></div>
      </div>
      <div className="text-right text-xs font-bold text-slate-500 mb-6">0% 已採購</div>

      {/* Tabs */}
      <div className="bg-slate-100 dark:bg-[#1f2937] p-1.5 rounded-2xl flex mb-12 border border-slate-200 dark:border-white/5">
         <button 
            onClick={() => setTab('PURCHASE')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === 'PURCHASE' ? 'bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white shadow-lg border border-slate-100 dark:border-white/5' : 'text-slate-500'}`}
         >
             <CartIcon className="w-4 h-4" /> 採購裝備
         </button>
         <button 
            onClick={() => setTab('PACKING')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === 'PACKING' ? 'bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white shadow-lg border border-slate-100 dark:border-white/5' : 'text-slate-500'}`}
         >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
             購物清單
         </button>
      </div>

      {/* Empty State */}
      <div className="flex-grow flex flex-col items-center justify-center opacity-30 mb-20">
         <CartIcon className="w-24 h-24 text-slate-400 dark:text-slate-500 stroke-1 mb-4" />
         <p className="text-slate-400 font-bold tracking-wider">尚無待採購裝備</p>
      </div>

      {/* Floating Input Area */}
      <div className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl rounded-[24px] p-2 flex items-center gap-2 border border-slate-200 dark:border-white/10 shadow-2xl">
         <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
             <span className="text-slate-400 text-sm">?</span>
         </div>
         <input 
            type="text" 
            placeholder="新增待採購裝備..." 
            className="bg-transparent flex-grow text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium text-sm"
         />
         <button className="w-10 h-10 bg-[#38bdf8] rounded-xl flex items-center justify-center text-white hover:bg-[#0ea5e9] transition-colors">
             <PlusIcon className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};

export default PackingTool;
