
import React, { useState } from 'react';
import { Trip, DocumentItem } from '../types';
import { LinkIcon, DocumentTextIcon, ArchiveIcon, PlusIcon, TrashIcon, PhotoIcon, PaperClipIcon, SparklesIcon, TicketIcon, MapIcon, CloudIcon, NewspaperIcon, XMarkIcon } from './Icons';

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
}

const ToolboxTool: React.FC<Props> = ({ trip, onUpdateTrip }) => {
  const [activeTab, setActiveTab] = useState<'TOOLS' | 'DOCS'>('TOOLS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCitySelect, setShowCitySelect] = useState(false); // New state for city selector
  const [newDoc, setNewDoc] = useState<{ title: string; type: 'link' | 'note' | 'file'; content: string }>({
      title: '',
      type: 'link',
      content: ''
  });

  const documents = trip.documents || [];

  const handleOpenSearch = (query: string, site?: string) => {
      const encodedQuery = encodeURIComponent(query);
      let url = '';
      
      switch(site) {
          case 'news':
              url = `https://news.google.com/search?q=${encodedQuery}`;
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

  const handleWeatherClick = () => {
      if (trip.type === 'Multi' && trip.stops && trip.stops.length > 0) {
          setShowCitySelect(true);
      } else {
          handleOpenSearch(trip.destination, 'weather');
      }
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
    
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            setNewDoc({ ...newDoc, type: 'file', content: e.target.result as string, title: file.name });
        }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col p-6 pb-0 bg-transparent transition-colors duration-300 relative">
        {/* Header Design matching Settings Page */}
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
            <div className="w-10 h-10"></div> {/* Spacer for alignment */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center border shadow-lg shadow-blue-500/10 bg-white border-slate-200 dark:bg-[#1e293b] dark:border-white/5">
               <SparklesIcon className="w-8 h-8 text-slate-400 dark:text-slate-300" />
            </div>
            <div className="w-10 h-10"></div> {/* Spacer for alignment */}
        </div>

        <div className="text-center mb-8 flex-shrink-0">
           <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">旅遊百寶箱</h2>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">實用工具 & 文件管理</p>
        </div>

        {/* Premium Glass Sliding Toggle - Fixed Width to prevent jump */}
        <div className="w-full bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-2xl flex relative mb-8 h-14 items-center border border-white/20 dark:border-white/10 shadow-inner flex-shrink-0">
            <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg border border-white/20
                ${activeTab === 'TOOLS' 
                    ? 'left-1.5 bg-gradient-to-br from-indigo-500/80 to-purple-500/80 shadow-indigo-500/20' 
                    : 'left-[50%] bg-gradient-to-br from-slate-700/80 to-slate-900/80 shadow-slate-500/20'}
                `}
            ></div>
            
            <button 
                onClick={() => setActiveTab('TOOLS')}
                className={`flex-1 relative z-10 text-sm font-bold transition-colors duration-300 ${activeTab === 'TOOLS' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
                常用工具
            </button>
            <button 
                onClick={() => setActiveTab('DOCS')}
                className={`flex-1 relative z-10 text-sm font-bold transition-colors duration-300 ${activeTab === 'DOCS' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
                行程文件
            </button>
        </div>

        {/* Content Area - Flex grow to fill remaining space */}
        <div className="flex-grow w-full overflow-hidden flex flex-col">
            {activeTab === 'TOOLS' ? (
                // Tools View - Locked Scrolling, auto-fit grid
                <div className="h-full grid grid-cols-2 gap-4 pb-32">
                    <div onClick={handleWeatherClick} className="bg-gradient-to-br from-[#38bdf8] to-[#0284c7] rounded-[32px] p-4 text-white shadow-xl shadow-blue-500/20 cursor-pointer active:scale-95 transition-transform group flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                            <CloudIcon className="w-16 h-16 transform rotate-12" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-inner border border-white/20">
                            <CloudIcon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-black text-lg mb-1 tracking-wide">當地天氣</h3>
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Real-time Forecast</p>
                    </div>

                    <div onClick={() => handleOpenSearch(trip.destination, 'news')} className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[32px] p-4 text-white shadow-xl shadow-indigo-500/20 cursor-pointer active:scale-95 transition-transform group flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                            <NewspaperIcon className="w-16 h-16 transform -rotate-12" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-inner border border-white/20">
                            <NewspaperIcon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-black text-lg mb-1 tracking-wide">最新新聞</h3>
                        <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Local Updates</p>
                    </div>
                    
                    <div onClick={() => handleOpenSearch(trip.destination, 'klook')} className="bg-gradient-to-br from-[#ff5b00] to-[#ff8c42] rounded-[32px] p-4 text-white shadow-xl shadow-orange-500/20 cursor-pointer active:scale-95 transition-transform group flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                            <TicketIcon className="w-16 h-16 transform rotate-6" />
                        </div>
                         <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-inner border border-white/20">
                            <TicketIcon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-black text-lg mb-1 tracking-wide">Klook</h3>
                        <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Tickets & Tours</p>
                    </div>

                    <div onClick={() => handleOpenSearch(trip.destination, 'kkday')} className="bg-gradient-to-br from-[#26bec9] to-[#4dd0e1] rounded-[32px] p-4 text-white shadow-xl shadow-cyan-500/20 cursor-pointer active:scale-95 transition-transform group flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/10">
                         <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                            <MapIcon className="w-16 h-16 transform -rotate-6" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-inner border border-white/20">
                            <MapIcon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-black text-lg mb-1 tracking-wide">KKday</h3>
                        <p className="text-cyan-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Travel Activities</p>
                    </div>
                </div>
            ) : (
                // Docs View - Scrollable
                <div className="h-full overflow-y-auto no-scrollbar space-y-3 pb-32">
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                                <ArchiveIcon className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-400 font-bold tracking-wider text-sm">暫無儲存的文件</p>
                        </div>
                    ) : (
                        documents.map((doc, idx) => (
                            <div 
                                key={doc.id} 
                                onClick={() => handleDocClick(doc)} 
                                className="bg-white/60 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-white/10 p-4 rounded-[24px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:bg-white/80 dark:hover:bg-[#1e293b]/80 animate-slide-up"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 flex-shrink-0">
                                        {doc.type === 'link' && <LinkIcon className="w-6 h-6" />}
                                        {doc.type === 'note' && <DocumentTextIcon className="w-6 h-6" />}
                                        {doc.type === 'file' && <PhotoIcon className="w-6 h-6" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-800 dark:text-white truncate text-base mb-0.5">{doc.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold truncate tracking-wide uppercase">{doc.type} • {doc.type === 'link' ? new URL(doc.content.startsWith('http') ? doc.content : `https://${doc.content}`).hostname : '查看內容'}</p>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        {activeTab === 'DOCS' && (
            <button 
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-[130px] right-6 z-[60] w-16 h-16 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 shadow-xl active:scale-90 transition-all hover:scale-105"
            >
                <PlusIcon className="w-8 h-8 stroke-[2.5]" />
            </button>
        )}

        {/* --- Modals --- */}

        {/* 1. City Selection Modal (For Weather in Multi-city) */}
        {showCitySelect && trip.stops && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-slide-up">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <CloudIcon className="w-6 h-6 text-[#38bdf8]" />
                            選擇城市
                        </h3>
                        <button onClick={() => setShowCitySelect(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {trip.stops.map((stop, idx) => (
                            <button
                                key={stop.id}
                                onClick={() => {
                                    handleOpenSearch(stop.destination, 'weather');
                                    setShowCitySelect(false);
                                }}
                                className="w-full bg-slate-50 dark:bg-[#1e293b]/50 p-4 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-[#1e293b] hover:border-[#38bdf8] dark:hover:border-[#38bdf8] transition-all group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-white">{stop.destination}</span>
                                </div>
                                <div className="text-slate-400 group-hover:text-[#38bdf8]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 2. Add Doc Modal */}
        {showAddModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl animate-slide-up">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">新增文件</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex gap-2">
                            <button onClick={() => setNewDoc({...newDoc, type: 'link'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${newDoc.type === 'link' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'text-slate-500 border-slate-200 dark:border-white/10'}`}>連結</button>
                            <button onClick={() => setNewDoc({...newDoc, type: 'note'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${newDoc.type === 'note' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'text-slate-500 border-slate-200 dark:border-white/10'}`}>筆記</button>
                            <button onClick={() => setNewDoc({...newDoc, type: 'file'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${newDoc.type === 'file' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'text-slate-500 border-slate-200 dark:border-white/10'}`}>檔案</button>
                        </div>

                        <input 
                            type="text" 
                            placeholder="標題" 
                            className="w-full bg-slate-100 dark:bg-[#1f2937] p-4 rounded-2xl font-bold focus:outline-none text-slate-900 dark:text-white"
                            value={newDoc.title}
                            onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                        />

                        {newDoc.type === 'link' && (
                            <input 
                                type="url" 
                                placeholder="https://..." 
                                className="w-full bg-slate-100 dark:bg-[#1f2937] p-4 rounded-2xl font-bold focus:outline-none text-slate-900 dark:text-white"
                                value={newDoc.content}
                                onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                            />
                        )}

                        {newDoc.type === 'note' && (
                            <textarea 
                                placeholder="輸入內容..." 
                                className="w-full bg-slate-100 dark:bg-[#1f2937] p-4 rounded-2xl font-bold focus:outline-none text-slate-900 dark:text-white h-32"
                                value={newDoc.content}
                                onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                            />
                        )}

                        {newDoc.type === 'file' && (
                            <div className="bg-slate-100 dark:bg-[#1f2937] p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center relative">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <PaperClipIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-500">{newDoc.content ? '已選擇檔案' : '點擊上傳圖片或PDF'}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 dark:bg-[#1f2937]">取消</button>
                        <button onClick={handleAddDocument} className="flex-1 py-3 rounded-2xl font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-lg">儲存</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ToolboxTool;
