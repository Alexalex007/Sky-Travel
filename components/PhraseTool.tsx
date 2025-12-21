
import React from 'react';
import { ChevronRightIcon } from './Icons';

const ToolboxTool: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 pb-24 bg-transparent transition-colors duration-300">
       <div className="flex items-center justify-center mb-8">
           <div className="w-16 h-16 bg-white dark:bg-[#1f2937] rounded-3xl grid grid-cols-2 gap-1 p-3 border border-slate-200 dark:border-white/5 shadow-lg">
               <div className="border-2 border-slate-300 dark:border-slate-500 rounded-lg"></div>
               <div className="border-2 border-slate-300 dark:border-slate-500 rounded-lg"></div>
               <div className="border-2 border-slate-300 dark:border-slate-500 rounded-lg"></div>
               <div className="border-2 border-slate-300 dark:border-slate-500 rounded-lg"></div>
           </div>
       </div>
       <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">旅行百寶箱</h2>

       {/* Top Tabs */}
       <div className="bg-slate-100 dark:bg-[#1f2937] p-1.5 rounded-2xl flex mb-6 border border-slate-200 dark:border-white/5">
         <button className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-white dark:bg-[#2d3748] text-slate-900 dark:text-white shadow-lg border border-slate-100 dark:border-white/5">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             實用工具
         </button>
         <button className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-slate-500">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 20.25V9" /></svg>
             我的文件
         </button>
       </div>

       <div className="space-y-4 overflow-y-auto no-scrollbar pb-10">
           
           {/* News Card */}
           <div className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors border border-slate-200 dark:border-white/10 cursor-pointer">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></svg>
                   </div>
                   <div>
                       <h3 className="font-bold text-slate-800 dark:text-white">當地新聞</h3>
                       <p className="text-xs font-bold text-slate-500">札幌 - 函館新聞</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-5 h-5 text-slate-600" />
           </div>

           {/* Translate Card */}
           <div className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors border border-slate-200 dark:border-white/10 cursor-pointer">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
                       <span className="font-serif text-xl font-bold">文</span>
                   </div>
                   <div>
                       <h3 className="font-bold text-slate-800 dark:text-white">Google 翻譯</h3>
                       <p className="text-xs font-bold text-slate-500">語言翻譯助手</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-5 h-5 text-slate-600" />
           </div>

           {/* Weather Card */}
           <div className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors border border-slate-200 dark:border-white/10 cursor-pointer">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                   </div>
                   <div>
                       <h3 className="font-bold text-slate-800 dark:text-white">當地天氣</h3>
                       <p className="text-xs font-bold text-slate-500">查看氣溫預報</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-5 h-5 text-slate-600" />
           </div>

           {/* Grid Bottom */}
           <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-6 rounded-[24px] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer aspect-[4/3]">
                   <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">K</div>
                   <span className="font-bold text-sm text-slate-600 dark:text-slate-300">Klook</span>
              </div>
              <div className="glass-card p-6 rounded-[24px] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer aspect-[4/3]">
                   <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-lg transform rotate-45">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform -rotate-45"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                   </div>
                   <span className="font-bold text-sm text-slate-600 dark:text-slate-300">KKday</span>
              </div>
           </div>
       </div>
    </div>
  );
};

export default ToolboxTool;
