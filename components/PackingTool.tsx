
import React, { useState, useEffect, useMemo } from 'react';
import { Trip, PackingItem } from '../types';
import { CartIcon, SuitcaseIcon, TrashIcon, ShoppingBagIcon } from './Icons';

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

// Inline Question Mark Icon
const QuestionMarkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008z" />
    </svg>
);

const PackingTool: React.FC<Props> = ({ trip, onUpdateTrip }) => {
  // Use local state for immediate UI updates, sync with parent on change
  const [items, setItems] = useState<PackingItem[]>(trip.packingList || []);
  const [tab, setTab] = useState<'SHOPPING' | 'PACKING'>('PACKING');
  const [newItemName, setNewItemName] = useState('');

  // Sync back to trip when items change
  useEffect(() => {
    onUpdateTrip({ ...trip, packingList: items });
  }, [items]);

  // Filter items based on active tab
  const activeItems = useMemo(() => {
      return items.filter(item => 
          tab === 'SHOPPING' 
              ? item.category === 'shopping' 
              : item.category !== 'shopping'
      );
  }, [items, tab]);

  // Calculate Progress
  const progress = useMemo(() => {
      if (activeItems.length === 0) return 0;
      const checkedCount = activeItems.filter(i => i.checked).length;
      return (checkedCount / activeItems.length) * 100;
  }, [activeItems]);

  // Handlers
  const handleAddItem = (isUnsure: boolean = false) => {
      if (!newItemName.trim()) return;
      
      const prefix = isUnsure ? '❓ ' : '';

      const newItem: PackingItem = {
          id: Date.now().toString(),
          name: prefix + newItemName.trim(),
          checked: false,
          category: tab === 'SHOPPING' ? 'shopping' : 'general'
      };

      setItems([newItem, ...items]); // Add to top
      setNewItemName('');
  };

  const handleToggleItem = (id: string) => {
      setItems(items.map(item => 
          item.id === id ? { ...item, checked: !item.checked } : item
      ));
  };

  const handleDeleteItem = (id: string) => {
      if (confirm('確定要刪除此項目嗎？')) {
          setItems(items.filter(item => item.id !== id));
      }
  };

  const handleUpdateItemName = (id: string, newName: string) => {
      setItems(items.map(item => 
          item.id === id ? { ...item, name: newName } : item
      ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleAddItem(false);
      }
  };

  const themeColor = tab === 'SHOPPING' ? 'pink' : 'sky';
  const themeColorHex = tab === 'SHOPPING' ? '#f472b6' : '#38bdf8';

  return (
    <div className="h-full flex flex-col p-6 pb-24 bg-transparent transition-colors duration-300 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">行李與裝備</h2>
        <span className="text-xs font-bold px-3 py-1 rounded-full transition-colors" style={{ color: themeColorHex, backgroundColor: `${themeColorHex}15` }}>
            {activeItems.filter(i => i.checked).length}/{activeItems.length}
        </span>
      </div>
      
      {/* Progress Bar with Animation */}
      <div className="w-full bg-slate-200 dark:bg-[#1e293b] h-3 rounded-full mb-2 overflow-hidden border border-slate-300/50 dark:border-white/5 relative">
         <div 
            className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden"
            style={{ 
                width: `${progress}%`,
                backgroundColor: themeColorHex,
                boxShadow: `0 0 10px ${themeColorHex}80`
            }}
         >
             {/* Shimmer Effect */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
         </div>
      </div>
      <div className="text-right text-[10px] font-bold text-slate-500 mb-6 tracking-wider uppercase">
          {tab === 'SHOPPING' ? 'PURCHASED' : 'PACKED'} {Math.round(progress)}%
      </div>

      {/* Tabs */}
      <div className="bg-slate-100 dark:bg-[#1f2937] p-1.5 rounded-[20px] flex mb-6 border border-slate-200 dark:border-white/5 relative z-10">
         <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#2d3748] rounded-2xl shadow-sm transition-all duration-300 ease-out border border-black/5 dark:border-white/5 ${tab === 'SHOPPING' ? 'left-1.5' : 'left-[50%]'}`}
         ></div>

         <button 
            onClick={() => setTab('SHOPPING')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors relative z-10 ${tab === 'SHOPPING' ? 'text-pink-500' : 'text-slate-400'}`}
         >
             <CartIcon className="w-4 h-4" /> 採購清單
         </button>
         <button 
            onClick={() => setTab('PACKING')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors relative z-10 ${tab === 'PACKING' ? 'text-[#38bdf8]' : 'text-slate-400'}`}
         >
             <SuitcaseIcon className="w-4 h-4" /> 行李清單
         </button>
      </div>

      {/* List Area */}
      <div className="flex-grow overflow-y-auto no-scrollbar space-y-3 pb-24 pr-1 -mr-1">
         {activeItems.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-40 -mt-10 animate-fade-in">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${tab === 'SHOPPING' ? 'bg-pink-100 text-pink-400 dark:bg-pink-500/10' : 'bg-sky-100 text-sky-400 dark:bg-sky-500/10'}`}>
                    {tab === 'SHOPPING' ? <ShoppingBagIcon className="w-10 h-10" /> : <SuitcaseIcon className="w-10 h-10" />}
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                    {tab === 'SHOPPING' ? '暫無待買項目' : '行李箱空空如也'}
                </p>
                <p className="text-slate-300 dark:text-slate-600 text-xs mt-2">使用下方工具新增物品</p>
             </div>
         ) : (
             activeItems.map((item, idx) => {
                 const isUnsure = item.name.trim().startsWith('❓');
                 return (
                     <div 
                        key={item.id} 
                        className={`p-4 rounded-[20px] flex items-center gap-3 shadow-sm group animate-fade-in-up transition-all duration-300
                            ${isUnsure 
                                ? 'bg-amber-50 dark:bg-amber-500/10 border-2 border-dashed border-amber-400' 
                                : 'bg-white/60 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-white/5 backdrop-blur-sm'
                            }
                        `}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                     >
                         <button 
                            onClick={() => handleToggleItem(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                                item.checked 
                                    ? (tab === 'SHOPPING' ? 'bg-pink-500 border-pink-500 scale-110' : 'bg-[#38bdf8] border-[#38bdf8] scale-110')
                                    : 'border-slate-300 dark:border-slate-600 bg-transparent hover:border-[#38bdf8]'
                            }`}
                         >
                             {item.checked && (
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-white animate-scale-in">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                 </svg>
                             )}
                         </button>
                         
                         <input 
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                            className={`flex-grow bg-transparent font-bold text-sm focus:outline-none min-w-0 ${item.checked ? 'text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-800 dark:text-white'}`}
                         />
    
                         <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-all active:scale-90 flex-shrink-0"
                         >
                             <TrashIcon className="w-4 h-4" />
                         </button>
                     </div>
                 );
             })
         )}
      </div>

      {/* Floating Input Area - Fixed above nav & gradient */}
      <div className="fixed bottom-[120px] left-6 right-6 z-[60] flex gap-3 items-center">
          
          {/* Left: Question/Unsure Button */}
          <button
             onClick={() => handleAddItem(true)}
             disabled={!newItemName.trim()}
             className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-lg transition-all active:scale-90 border flex-shrink-0 backdrop-blur-xl ${
                 !newItemName.trim()
                 ? 'bg-slate-100 dark:bg-[#1e293b]/80 text-slate-300 border-transparent cursor-not-allowed'
                 : 'bg-white/90 dark:bg-[#1e293b]/90 text-amber-500 border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10'
             }`}
          >
              <QuestionMarkIcon className="w-6 h-6" />
          </button>

          {/* Right: Input Field with Internal Button */}
          <div className="flex-grow relative shadow-2xl rounded-[24px] ring-1 ring-black/5 dark:ring-white/10">
             <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tab === 'SHOPPING' ? "新增採購項目..." : "新增行李物品..."}
                className="w-full h-14 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-bold text-sm pl-6 pr-14 rounded-[24px]"
             />
             <button 
                onClick={() => handleAddItem(false)}
                disabled={!newItemName.trim()}
                className={`absolute right-1.5 top-1.5 bottom-1.5 w-11 rounded-[18px] flex items-center justify-center text-white shadow-md transition-all active:scale-90 ${
                    !newItemName.trim() 
                        ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                        : (tab === 'SHOPPING' ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30' : 'bg-[#38bdf8] hover:bg-[#0ea5e9] shadow-blue-500/30')
                }`}
             >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                 </svg>
             </button>
          </div>

      </div>
    </div>
  );
};

export default PackingTool;
