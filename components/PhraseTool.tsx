
import React, { useState } from 'react';
import { Trip, DocumentItem } from '../types';
import { ChevronRightIcon, LinkIcon, DocumentTextIcon, ArchiveIcon, PlusIcon, TrashIcon, PhotoIcon, PaperClipIcon } from './Icons';

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const ToolboxTool: React.FC<Props> = ({ trip, onUpdateTrip }) => {
  const [activeTab, setActiveTab] = useState<'TOOLS' | 'DOCS'>('TOOLS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState<{ title: string; type: 'link' | 'note' | 'file'; content: string }>({
      title: '',
      type: 'link',
      content: ''
  });

  const documents = trip.documents || [];

  const handleOpenLink = (url: string) => {
      window.open(url, '_blank');
  };

  const handleOpenSearch = (query: string, site?: string) => {
      let url = '';
      const encodedQuery = encodeURIComponent(query);
      
      switch(site) {
          case 'news':
              url = `https://www.google.com/search?q=${encodedQuery}+news&tbm=nws`;
              break;
          case 'weather':
              url = `https://www.google.com/search?q=${encodedQuery}+weather`;
              break;
          case 'klook':
              url = `https://www.klook.com/search?text=${encodedQuery}`;
              break;
          case 'kkday':
              url = `https://www.kkday.com/en/product/productlist?keyword=${encodedQuery}`;
              break;
          default:
              url = `https://www.google.com/search?q=${encodedQuery}`;
      }
      window.open(url, '_blank');
  };

  const handleAddDocument = () => {
      if (!newDoc.title || !newDoc.content) return;
      
      const newItem: DocumentItem = {
          id: Date.now().toString(),
          title: newDoc.title,
          type: newDoc.type,
          content: newDoc.content,
          createdAt: new Date().toISOString()
      };

      const updatedDocs = [newItem, ...documents];
      onUpdateTrip({ ...trip, documents: updatedDocs });
      setShowAddModal(false);
      setNewDoc({ title: '', type: 'link', content: '' });
  };

  const handleDeleteDocument = (id: string) => {
      if (confirm('確定要刪除此文件嗎？')) {
          const updatedDocs = documents.filter(doc => doc.id !== id);
          onUpdateTrip({ ...trip, documents: updatedDocs });
      }
  };

  const handleDocClick = (doc: DocumentItem) => {
      if (doc.type === 'link') {
          let url = doc.content;
          if (!url.startsWith('http')) url = 'https://' + url;
          window.open(url, '_blank');
      } else if (doc.type === 'file') {
          // Open Base64 in new tab
          const win = window.open();
          if(win) {
              win.document.write(`<iframe src="${doc.content}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
          }
      } else {
          alert(doc.content);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("檔案大小不能超過 2MB");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        setNewDoc({ ...newDoc, content: reader.result as string, title: newDoc.title || file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col p-6 pb-24 bg-transparent transition-colors duration-300 relative">
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
       <div className="bg-slate-100 dark:bg-[#1f2937] p-1.5 rounded-2xl flex mb-6 border border-slate-200 dark:border-white/5 relative z-10">
         <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#2d3748] rounded-2xl shadow-sm transition-all duration-300 ease-out border border-black/5 dark:border-white/5 ${activeTab === 'TOOLS' ? 'left-1.5' : 'left-[50%]'}`}
         ></div>
         
         <button 
            onClick={() => setActiveTab('TOOLS')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors relative z-10 ${activeTab === 'TOOLS' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
         >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             實用工具
         </button>
         <button 
            onClick={() => setActiveTab('DOCS')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors relative z-10 ${activeTab === 'DOCS' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
         >
             <ArchiveIcon className="w-4 h-4" />
             我的文件
         </button>
       </div>

       {activeTab === 'TOOLS' ? (
           <div className="space-y-4 overflow-y-auto no-scrollbar pb-10 animate-fade-in">
               {/* News Card */}
               <div 
                  onClick={() => handleOpenSearch(trip.destination, 'news')}
                  className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95 duration-200"
               >
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-800 dark:text-white">當地新聞</h3>
                           <p className="text-xs font-bold text-slate-500">查看 {trip.destination} 最新動態</p>
                       </div>
                   </div>
                   <ChevronRightIcon className="w-5 h-5 text-slate-600" />
               </div>

               {/* Translate Card */}
               <div 
                  onClick={() => handleOpenLink('https://translate.google.com/')}
                  className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95 duration-200"
               >
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
                           <span className="font-serif text-xl font-bold">文</span>
                       </div>
                   </div>
                   <div className="flex-1 px-4">
                       <h3 className="font-bold text-slate-800 dark:text-white">Google 翻譯</h3>
                       <p className="text-xs font-bold text-slate-500">語言翻譯助手</p>
                   </div>
                   <ChevronRightIcon className="w-5 h-5 text-slate-600" />
               </div>

               {/* Weather Card */}
               <div 
                  onClick={() => handleOpenSearch(trip.destination, 'weather')}
                  className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95 duration-200"
               >
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-800 dark:text-white">當地天氣</h3>
                           <p className="text-xs font-bold text-slate-500">{trip.destination} 氣溫預報</p>
                       </div>
                   </div>
                   <ChevronRightIcon className="w-5 h-5 text-slate-600" />
               </div>

               {/* Grid Bottom */}
               <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => handleOpenSearch(trip.destination, 'klook')}
                    className="glass-card p-6 rounded-[24px] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer aspect-[4/3] active:scale-95 duration-200"
                  >
                       <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-500/20">K</div>
                       <span className="font-bold text-sm text-slate-600 dark:text-slate-300">Klook</span>
                  </div>
                  <div 
                    onClick={() => handleOpenSearch(trip.destination, 'kkday')}
                    className="glass-card p-6 rounded-[24px] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer aspect-[4/3] active:scale-95 duration-200"
                  >
                       <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-lg transform rotate-45 shadow-md shadow-blue-400/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform -rotate-45"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                       </div>
                       <span className="font-bold text-sm text-slate-600 dark:text-slate-300">KKday</span>
                  </div>
               </div>
           </div>
       ) : (
           <div className="flex-grow flex flex-col relative animate-fade-in">
                {documents.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center opacity-40 -mt-10">
                        <ArchiveIcon className="w-16 h-16 text-slate-400 mb-4" />
                        <p className="text-slate-400 font-bold tracking-wider">暫無儲存文件</p>
                        <p className="text-slate-300 text-xs mt-2">可儲存電子機票連結或重要筆記</p>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto no-scrollbar pb-24">
                        {documents.map((doc) => (
                            <div 
                                key={doc.id}
                                onClick={() => handleDocClick(doc)}
                                className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95 duration-200"
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-lg 
                                        ${doc.type === 'link' ? 'bg-indigo-500 shadow-indigo-500/20' : 
                                          doc.type === 'file' ? 'bg-orange-500 shadow-orange-500/20' :
                                          'bg-emerald-500 shadow-emerald-500/20'}`}
                                    >
                                        {doc.type === 'link' && <LinkIcon className="w-6 h-6" />}
                                        {doc.type === 'note' && <DocumentTextIcon className="w-6 h-6" />}
                                        {doc.type === 'file' && <PhotoIcon className="w-6 h-6" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-slate-800 dark:text-white truncate">{doc.title}</h3>
                                        <p className="text-xs font-bold text-slate-500 truncate">
                                            {doc.type === 'file' ? '點擊預覽檔案' : doc.content}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Repositioned FAB: Fixed position above the bottom nav (bottom nav is ~80px + margin 24px = ~104px) */}
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-[115px] right-6 z-50 w-16 h-16 bg-[#38bdf8] hover:bg-[#0ea5e9] rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-90 transition-all duration-300 border-4 border-white dark:border-[#05080F]"
                >
                    <PlusIcon className="w-8 h-8 stroke-[2.5]" />
                </button>
           </div>
       )}

       {/* Add Document Modal */}
       {showAddModal && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">新增文件</h3>
                   
                   <div className="space-y-4 mb-6">
                       <div>
                           <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">類型</label>
                           
                           {/* Glass Sliding Toggle */}
                           <div className="bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-2xl flex relative h-14 items-center backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-inner">
                                <div 
                                    className={`absolute top-1.5 bottom-1.5 w-[calc(33.33%-4px)] rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg border border-white/20 backdrop-blur-md
                                        ${newDoc.type === 'link' ? 'left-1.5 bg-gradient-to-br from-indigo-400/80 to-indigo-600/80 shadow-indigo-500/20' : 
                                          newDoc.type === 'note' ? 'left-[calc(33.33%+2px)] bg-gradient-to-br from-emerald-400/80 to-emerald-600/80 shadow-emerald-500/20' : 
                                          'left-[calc(66.66%-2px)] bg-gradient-to-br from-orange-400/80 to-orange-600/80 shadow-orange-500/20'}
                                    `}
                                ></div>

                                <button 
                                    onClick={() => setNewDoc({ ...newDoc, type: 'link', content: '' })}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${newDoc.type === 'link' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <LinkIcon className="w-4 h-4" /> 連結
                                </button>
                                <button 
                                    onClick={() => setNewDoc({ ...newDoc, type: 'note', content: '' })}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${newDoc.type === 'note' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <DocumentTextIcon className="w-4 h-4" /> 筆記
                                </button>
                                <button 
                                    onClick={() => setNewDoc({ ...newDoc, type: 'file', content: '' })}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${newDoc.type === 'file' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <PaperClipIcon className="w-4 h-4" /> 檔案
                                </button>
                           </div>
                       </div>

                       <div>
                           <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">標題</label>
                           <input 
                               type="text" 
                               placeholder={newDoc.type === 'file' ? "檔案名稱 (選填)" : "例如：電子機票"}
                               value={newDoc.title}
                               onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                               className="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-slate-800 dark:text-white font-bold focus:outline-none"
                           />
                       </div>

                       <div>
                           <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">
                               {newDoc.type === 'link' ? '網址 URL' : newDoc.type === 'note' ? '內容 Content' : '上傳檔案 (Max 2MB)'}
                           </label>
                           
                           {newDoc.type === 'link' && (
                               <input 
                                   type="url" 
                                   placeholder="https://..."
                                   value={newDoc.content}
                                   onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                                   className="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-slate-800 dark:text-white font-bold focus:outline-none text-sm"
                               />
                           )}
                           
                           {newDoc.type === 'note' && (
                               <textarea 
                                   rows={4}
                                   placeholder="輸入備忘錄內容..."
                                   value={newDoc.content}
                                   onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                                   className="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-slate-800 dark:text-white font-bold focus:outline-none text-sm resize-none"
                               />
                           )}

                           {newDoc.type === 'file' && (
                               <div className="relative">
                                   <input 
                                       type="file" 
                                       accept="image/*,application/pdf"
                                       onChange={handleFileChange}
                                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                   />
                                   <div className={`w-full bg-slate-50 dark:bg-[#1f2937] border-2 border-dashed ${newDoc.content ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10' : 'border-slate-300 dark:border-slate-600'} rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors`}>
                                        {newDoc.content ? (
                                            <>
                                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-500/30">
                                                    <PhotoIcon className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400">檔案已選取</p>
                                                <p className="text-[10px] text-slate-400 mt-1">點擊更換</p>
                                            </>
                                        ) : (
                                            <>
                                                <PaperClipIcon className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-xs font-bold text-slate-500">點擊上傳圖片或 PDF</p>
                                                <p className="text-[10px] text-slate-400 mt-1">支援格式: JPG, PNG, PDF</p>
                                            </>
                                        )}
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>

                   <div className="flex gap-3">
                       <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-[#1e293b] text-slate-500 font-bold">取消</button>
                       <button onClick={handleAddDocument} disabled={!newDoc.title && !newDoc.content} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg ${(!newDoc.title && !newDoc.content) ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#38bdf8] hover:bg-[#0ea5e9] shadow-blue-500/30'}`}>儲存</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default ToolboxTool;
