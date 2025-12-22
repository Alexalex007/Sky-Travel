
import React, { useState, useEffect } from 'react';
import { Trip, Tab, TripType } from './types';
import ItineraryTool from './components/ItineraryTool';
import PackingTool from './components/PackingTool';
import ExpensesTool from './components/FoodTool';
import ToolboxTool from './components/PhraseTool';
import { MapIcon, WalletIcon, SuitcaseIcon, GridIcon, CogIcon, PlaneIcon, ChevronLeftIcon, UsersIcon, MoonIcon, SunIcon, EditIcon, ShareIcon, ChevronRightIcon, PlusIcon, TagIcon, CalendarIcon, GlobeIcon, SparklesIcon } from './components/Icons';

function App() {
  const [view, setView] = useState<'HOME' | 'CREATE' | 'TRIP'>('HOME');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ITINERARY);
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [savedTrip, setSavedTrip] = useState<Trip | null>(null);
  
  // Initialize dark mode from local storage
  const [isDarkMode, setIsDarkMode] = useState(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('sky_travel_dark_mode');
          if (saved !== null) {
              try {
                  return JSON.parse(saved);
              } catch (e) {
                  return true;
              }
          }
      }
      return true; // Default to dark mode
  });

  const [showHomeSettings, setShowHomeSettings] = useState(false);

  // Creation Form State
  const [tripName, setTripName] = useState('');
  const [tripType, setTripType] = useState<TripType>('Single');
  
  // Single City State
  const [singleDestination, setSingleDestination] = useState('');
  const [singleStartDate, setSingleStartDate] = useState('');
  const [singleEndDate, setSingleEndDate] = useState('');

  // Multi-city stops state
  interface Stop {
    id: number;
    destination: string;
    startDate: string;
    endDate: string;
  }

  const [stops, setStops] = useState<Stop[]>([
    { id: 1, destination: '', startDate: '', endDate: '' }
  ]);

  // Load saved trip on mount
  useEffect(() => {
    const saved = localStorage.getItem('sky_travel_trip_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedTrip(parsed);
      } catch (e) {
        console.error("Failed to parse saved trip", e);
      }
    }
  }, []);

  // Save trip whenever it updates
  useEffect(() => {
    if (tripData) {
      localStorage.setItem('sky_travel_trip_data', JSON.stringify(tripData));
      setSavedTrip(tripData); // Update local state for home screen reflection
    }
  }, [tripData]);

  // Toggle Dark Mode Class on HTML tag and persist
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sky_travel_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Logic to handle changing a stop's data
  const handleStopChange = (id: number, field: keyof Stop, value: string) => {
    setStops(prevStops => {
      const newStops = prevStops.map(stop => {
        if (stop.id === id) {
          return { ...stop, [field]: value };
        }
        return stop;
      });

      // Auto-link dates: If changing endDate of stop N, set startDate of stop N+1
      if (field === 'endDate') {
        const currentIndex = newStops.findIndex(s => s.id === id);
        if (currentIndex !== -1 && currentIndex < newStops.length - 1) {
           newStops[currentIndex + 1].startDate = value;
        }
      }

      return newStops;
    });
  };

  const handleAddStop = () => {
    if (stops.length >= 6) return;
    const lastStop = stops[stops.length - 1];
    setStops([
      ...stops,
      { 
        id: stops.length + 1, 
        destination: '', 
        startDate: lastStop.endDate, // Default to previous end date
        endDate: '' 
      }
    ]);
  };

  const handleRemoveStop = (id: number) => {
    if (stops.length <= 1) return;
    setStops(stops.filter(s => s.id !== id).map((s, index) => ({ ...s, id: index + 1 })));
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDestination = '';
    let finalStart = '';
    let finalEnd = '';

    if (tripType === 'Single') {
        if (!singleDestination || !singleStartDate || !singleEndDate) {
            alert("請完整填寫旅程資訊");
            return;
        }
        finalDestination = singleDestination;
        finalStart = singleStartDate;
        finalEnd = singleEndDate;
    } else {
        // Multi city validation
        if (!stops[0].destination || !stops[0].startDate || !stops[0].endDate) {
            alert("請至少完整填寫第一站資訊");
            return;
        }
        finalDestination = stops.map(s => s.destination).join(' - ');
        finalStart = stops[0].startDate;
        finalEnd = stops[stops.length - 1].endDate;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      name: tripName || `Trip to ${finalDestination.split(' - ')[0]}`,
      destination: finalDestination,
      startDate: finalStart,
      endDate: finalEnd,
      type: tripType,
      activities: {},
      expenses: [],
      packingList: [],
      documents: []
    };
    setTripData(newTrip);
    setView('TRIP');
    setActiveTab(Tab.ITINERARY);
  };

  const handleContinueTrip = () => {
      if (savedTrip) {
          setTripData(savedTrip);
          setView('TRIP');
          setActiveTab(Tab.ITINERARY);
      }
  };

  // Reset form when entering Create view
  useEffect(() => {
    if (view === 'CREATE') {
        setTripName('');
        setSingleDestination('');
        setSingleStartDate('');
        setSingleEndDate('');
        setStops([{ id: 1, destination: '', startDate: '', endDate: '' }]);
    }
  }, [view]);

  const SettingsView = () => (
    <div className="h-full flex flex-col p-6 pb-24 bg-transparent transition-colors duration-300">
       <div className="flex justify-between items-center mb-8">
           <button onClick={() => setView('HOME')} className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-colors bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-[#1e293b] dark:border-white/5 dark:text-slate-400 dark:hover:bg-[#334155]">
               <ChevronLeftIcon className="w-5 h-5" />
           </button>
           <div className="w-16 h-16 rounded-full flex items-center justify-center border shadow-lg shadow-blue-500/10 bg-white border-slate-200 dark:bg-[#1e293b] dark:border-white/5">
               <CogIcon className="w-8 h-8 text-slate-400 dark:text-slate-300" />
           </div>
           <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-blue-500 border shadow-sm bg-white border-slate-200 dark:bg-[#1e293b] dark:border-white/5 dark:text-blue-400">
               <ShareIcon className="w-5 h-5" />
           </button>
       </div>

       <div className="text-center mb-10">
           <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">設定與管理</h2>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">版本 v3.8.0</p>
       </div>

       <div className="space-y-4 overflow-y-auto no-scrollbar">
           
           <div 
             className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
             onClick={() => setIsDarkMode(!isDarkMode)}
           >
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400 flex items-center justify-center">
                       <MoonIcon className="w-5 h-5" />
                   </div>
                   <div>
                       <h3 className="font-bold text-sm text-slate-800 dark:text-white">黑暗模式</h3>
                       <p className="text-[10px] font-bold text-slate-500">{isDarkMode ? '開啟' : '關閉'}</p>
                   </div>
               </div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
               </div>
           </div>

           <div className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer">
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
                       <UsersIcon className="w-5 h-5" />
                   </div>
                   <div>
                       <h3 className="font-bold text-sm text-slate-800 dark:text-white">邀請旅伴協作</h3>
                       <p className="text-[10px] font-bold text-slate-500">即時同步行程</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-4 h-4 text-slate-600" />
           </div>

           <div className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer">
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                       <EditIcon className="w-5 h-5" />
                   </div>
                   <div>
                       <h3 className="font-bold text-sm text-slate-800 dark:text-white">修改旅程</h3>
                       <p className="text-[10px] font-bold text-slate-500">調整目的地與日期</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-4 h-4 text-slate-600" />
           </div>
       </div>
    </div>
  );

  // Bottom Nav Setup
  const tabs = [Tab.ITINERARY, Tab.EXPENSES, Tab.PACKING, Tab.TOOLBOX, Tab.SETTINGS];
  const activeIndex = tabs.indexOf(activeTab);

  if (view === 'HOME') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-transparent relative overflow-hidden transition-colors duration-300">
        
        {/* Top Right Settings Button */}
        <div className="absolute top-6 right-6 z-50 flex flex-col items-end">
            <button 
                onClick={() => setShowHomeSettings(!showHomeSettings)}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-slate-500 dark:text-white flex items-center justify-center hover:bg-white/20 transition-all shadow-lg active:scale-95 group"
            >
                <CogIcon className={`w-6 h-6 transition-transform duration-500 ${showHomeSettings ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            </button>

            {showHomeSettings && (
                <div className="mt-3 p-2 bg-white/90 dark:bg-[#1e293b]/95 backdrop-blur-2xl rounded-[20px] border border-slate-200 dark:border-white/10 shadow-2xl animate-fade-in-up w-48 z-50">
                    <button 
                        onClick={() => {
                            setIsDarkMode(!isDarkMode);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-violet-500/20 text-violet-400' : 'bg-orange-500/10 text-orange-500'}`}>
                                {isDarkMode ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {isDarkMode ? '黑夜模式' : '日光模式'}
                            </span>
                        </div>
                    </button>
                </div>
            )}
        </div>

        {/* Nebula Background */}
        <div className="absolute top-0 left-0 w-full h-full nebula-bg pointer-events-none opacity-50"></div>

        <div className="z-10 text-center space-y-8 w-full max-w-sm">
          <div className="w-28 h-28 bg-[#38bdf8] rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(56,189,248,0.3)] mx-auto transform -rotate-12 border border-white/50 backdrop-blur-sm">
            <PlaneIcon className="w-14 h-14 text-white" />
          </div>
          <div>
              <h1 className="text-5xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">Sky Travel</h1>
              <div className="h-1 w-12 bg-[#38bdf8] mx-auto rounded-full"></div>
          </div>
          
          {savedTrip ? (
             <div className="space-y-4 animate-fade-in-up">
                 <p className="text-slate-500 text-sm font-bold tracking-wide">歡迎回來！準備好繼續冒險了嗎？</p>
                 
                 {/* Saved Trip Card */}
                 <div 
                    onClick={handleContinueTrip}
                    className="glass-card p-5 rounded-[28px] border hover:border-[#38bdf8]/50 cursor-pointer group transition-all duration-300 transform hover:-translate-y-1 shadow-xl relative overflow-hidden text-left border-white/50 dark:border-white/10"
                 >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#38bdf8]"></div>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="text-[#38bdf8] text-[10px] font-bold uppercase tracking-widest mb-1">CURRENT TRIP</div>
                            <h3 className="text-slate-900 dark:text-white text-xl font-black">{savedTrip.name}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8] group-hover:bg-[#38bdf8] group-hover:text-white transition-colors">
                            <ChevronRightIcon className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <MapIcon className="w-4 h-4" />
                            <span className="font-bold truncate max-w-[120px]">{savedTrip.destination}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4" />
                            <span className="font-bold font-mono text-xs">{savedTrip.startDate}</span>
                        </div>
                    </div>
                 </div>

                 {/* New Trip Button (Secondary) */}
                 <button 
                    onClick={() => setView('CREATE')}
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-sm py-3 flex items-center justify-center gap-2 w-full transition-colors"
                 >
                    <PlusIcon className="w-4 h-4" />
                    建立新旅程
                 </button>
             </div>
          ) : (
             <>
                <p className="text-slate-500 max-w-xs mx-auto text-sm font-bold tracking-wide leading-relaxed">
                    極簡 • 純粹 • 星際漫遊<br/>
                    您的下一代旅遊計畫助手
                </p>
                <button 
                    onClick={() => setView('CREATE')}
                    className="group relative inline-flex items-center justify-center px-8 py-5 font-black text-white transition-all duration-200 bg-[#38bdf8] rounded-2xl focus:outline-none hover:bg-[#0ea5e9] w-full max-w-[240px] shadow-[0_10px_40px_rgba(56,189,248,0.4)] mt-12 text-lg active:scale-95"
                >
                    新增旅程
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
                </button>
             </>
          )}
        </div>
      </div>
    );
  }

  // Create View
  if (view === 'CREATE') {
    return (
      <div className="h-full flex flex-col p-6 bg-transparent transition-colors duration-300">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setView('HOME')} className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-colors bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-[#1e293b] dark:border-white/5 dark:text-slate-400 dark:hover:bg-[#334155]">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
        </div>
        
        <h2 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">建立新旅程</h2>
        <p className="text-slate-500 text-sm font-bold mb-6">規劃您的下一場冒險</p>
        
        <form onSubmit={handleCreateTrip} className={`flex-grow flex flex-col ${tripType === 'Single' ? 'overflow-hidden space-y-5' : 'overflow-y-auto space-y-6'} no-scrollbar pb-6`}>
             
             {/* Toggle */}
             <div className="relative p-1 rounded-2xl bg-white border-slate-200 dark:bg-[#111827]/80 dark:border-white/10 border backdrop-blur-xl flex h-16 shadow-inner overflow-hidden flex-shrink-0">
                 <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-slate-100 border-slate-200 dark:bg-[#1e293b] dark:border-white/10 border shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0 ${tripType === 'Single' ? 'left-1' : 'left-[50%]'}`}
                 ></div>
                 <button 
                    type="button"
                    onClick={() => setTripType('Single')}
                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${tripType === 'Single' ? 'text-[#38bdf8]' : 'text-slate-500'}`}
                 >
                    <MapIcon className="w-5 h-5" /> 單一城市
                 </button>
                 <button 
                    type="button"
                    onClick={() => setTripType('Multi')}
                    className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-300 ${tripType === 'Multi' ? 'text-[#a78bfa]' : 'text-slate-500'}`}
                 >
                    <GlobeIcon className="w-5 h-5" /> 多城市漫遊
                 </button>
             </div>

             <div className="space-y-2">
                <label className="text-slate-500 text-xs font-bold ml-1">旅程名稱 (選填)</label>
                <div className="bg-white border-slate-200 dark:bg-[#111827] dark:border-white/10 border rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                    <span className="text-[#38bdf8]"><TagIcon className="w-5 h-5" /></span>
                    <input 
                        type="text" 
                        className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-bold text-lg"
                        placeholder="例如：2025 東京行"
                        value={tripName}
                        onChange={e => setTripName(e.target.value)}
                    />
                </div>
             </div>

             {/* Single Destination Input */}
             {tripType === 'Single' && (
                 <div className="space-y-3 animate-fade-in-up">
                     <label className="text-slate-500 text-xs font-bold ml-1">目的地</label>
                     <div className="bg-white border-slate-200 dark:bg-[#111827] dark:border-white/10 border rounded-2xl p-5 flex items-center gap-3 shadow-xl">
                        <span className="text-[#38bdf8]"><MapIcon className="w-6 h-6" /></span>
                        <input 
                            type="text" 
                            className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-bold text-lg"
                            placeholder="例如：東京"
                            value={singleDestination}
                            onChange={e => setSingleDestination(e.target.value)}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">抵達日期</label>
                            <div className="bg-white border-slate-200 dark:bg-[#111827] dark:border-white/10 border rounded-2xl p-4 shadow-lg">
                                <input type="date" className="bg-transparent w-full text-slate-900 dark:text-white font-bold focus:outline-none" value={singleStartDate} onChange={e => setSingleStartDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">離開日期</label>
                            <div className="bg-white border-slate-200 dark:bg-[#111827] dark:border-white/10 border rounded-2xl p-4 shadow-lg">
                                <input type="date" className="bg-transparent w-full text-slate-900 dark:text-white font-bold focus:outline-none" value={singleEndDate} onChange={e => setSingleEndDate(e.target.value)} />
                            </div>
                        </div>
                     </div>
                 </div>
             )}

             {/* Multi City Logic */}
             {tripType === 'Multi' && (
                 <div className="space-y-4 animate-fade-in-up">
                    {stops.map((stop, idx) => (
                        <div key={stop.id} className="bg-white border-slate-200 dark:bg-[#111827] dark:border-white/10 border rounded-[28px] p-5 shadow-xl mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-sm">{stop.id}</div>
                                <input 
                                    type="text" 
                                    className="bg-transparent w-full text-slate-900 dark:text-white font-bold text-lg focus:outline-none" 
                                    placeholder="城市名稱"
                                    value={stop.destination}
                                    onChange={e => handleStopChange(stop.id, 'destination', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">抵達日期</label>
                                    <input type="date" className="w-full bg-slate-100 dark:bg-[#1f2937] rounded-xl p-3 text-sm text-slate-900 dark:text-white font-bold focus:outline-none" value={stop.startDate} onChange={e => handleStopChange(stop.id, 'startDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">離開日期</label>
                                    <input type="date" className="w-full bg-slate-100 dark:bg-[#1f2937] rounded-xl p-3 text-sm text-slate-900 dark:text-white font-bold focus:outline-none" value={stop.endDate} onChange={e => handleStopChange(stop.id, 'endDate', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={handleAddStop} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[24px] text-slate-500 font-bold">+ 新增下一站</button>
                 </div>
             )}

            <button 
                type="submit"
                className="w-full py-5 bg-[#334155] text-white font-black text-lg rounded-3xl hover:bg-[#38bdf8] shadow-lg transition-colors flex items-center justify-center gap-2 mt-auto flex-shrink-0"
            >
                <ChevronRightIcon className="w-5 h-5" />
                開始規劃
            </button>
        </form>
      </div>
    );
  }

  // TRIP VIEW
  return (
    <div className="h-full bg-transparent relative transition-colors duration-300">
      {/* Main Content Area - Added padding bottom to prevent nav overlap */}
      <div className="h-full overflow-hidden pb-32"> 
        {activeTab === Tab.ITINERARY && tripData && (
          <ItineraryTool 
             trip={tripData} 
             onUpdateTrip={setTripData} 
             isDarkMode={isDarkMode}
             toggleTheme={() => setIsDarkMode(!isDarkMode)}
          />
        )}
        {activeTab === Tab.PACKING && tripData && (
          <PackingTool trip={tripData} onUpdateTrip={setTripData} />
        )}
        {activeTab === Tab.EXPENSES && tripData && (
          <ExpensesTool trip={tripData} onUpdateTrip={setTripData} />
        )}
        {activeTab === Tab.TOOLBOX && tripData && (
          <ToolboxTool trip={tripData} onUpdateTrip={setTripData} />
        )}
        {activeTab === Tab.SETTINGS && <SettingsView />}
      </div>

      {/* Global Bottom Gradient Mask for Seamless Scrolling */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f0f9ff] via-[#f0f9ff]/90 to-transparent dark:from-[#05080F] dark:via-[#05080F]/90 z-40 pointer-events-none backdrop-blur-[2px]"></div>

      {/* Floating Bottom Navigation - REFINED STYLE FOR PERFECT BLENDING */}
      <div className="fixed bottom-6 left-6 right-6 h-[80px] bg-white/40 dark:bg-[#05080F]/40 backdrop-blur-2xl rounded-[32px] border border-white/20 dark:border-white/10 flex items-center px-2 shadow-2xl z-50 transition-colors duration-300">
        {/* Animated Background Indicator */}
        <div 
            className="absolute h-14 w-14 rounded-2xl bg-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] top-1/2 -translate-y-1/2 -translate-x-1/2 z-0"
            style={{ 
                left: `calc(8px + ((100% - 16px) / 5 * ${activeIndex}) + ((100% - 16px) / 10))` 
            }}
        ></div>

        <div className="flex-1 flex justify-center z-10">
          <NavIcon 
            icon={<MapIcon className="w-6 h-6" />} 
            active={activeTab === Tab.ITINERARY} 
            onClick={() => setActiveTab(Tab.ITINERARY)} 
          />
        </div>
        <div className="flex-1 flex justify-center z-10">
          <NavIcon 
            icon={<WalletIcon className="w-6 h-6" />} 
            active={activeTab === Tab.EXPENSES} 
            onClick={() => setActiveTab(Tab.EXPENSES)} 
          />
        </div>
        <div className="flex-1 flex justify-center z-10">
          <NavIcon 
            icon={<SuitcaseIcon className="w-6 h-6" />} 
            active={activeTab === Tab.PACKING} 
            onClick={() => setActiveTab(Tab.PACKING)} 
          />
        </div>
        <div className="flex-1 flex justify-center z-10">
          <NavIcon 
            icon={<SparklesIcon className="w-6 h-6" />} 
            active={activeTab === Tab.TOOLBOX} 
            onClick={() => setActiveTab(Tab.TOOLBOX)} 
          />
        </div>
        <div className="flex-1 flex justify-center z-10">
          <NavIcon 
            icon={<CogIcon className="w-6 h-6" />} 
            active={activeTab === Tab.SETTINGS} 
            onClick={() => setActiveTab(Tab.SETTINGS)} 
          />
        </div>
      </div>
    </div>
  );
}

const NavIcon = ({ icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200 relative ${active ? 'text-white' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
  >
    {icon}
  </button>
);

export default App;
