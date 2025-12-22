
import React, { useState, useEffect } from 'react';
import { Trip, Tab, TripType, Stop } from './types';
import ItineraryTool from './components/ItineraryTool';
import PackingTool from './components/PackingTool';
import ExpensesTool from './components/FoodTool';
import ToolboxTool from './components/PhraseTool';
import { MapIcon, WalletIcon, SuitcaseIcon, GridIcon, CogIcon, PlaneIcon, ChevronLeftIcon, UsersIcon, MoonIcon, SunIcon, EditIcon, ShareIcon, ChevronRightIcon, PlusIcon, TagIcon, CalendarIcon, GlobeIcon, SparklesIcon, ClipboardDocumentListIcon, ArchiveBoxArrowDownIcon, TrashIcon, XMarkIcon, ArchiveIcon, RefreshIcon } from './components/Icons';

const APP_VERSION = "v4.0.6";
const CHANGELOG_DATA = [
    {
        version: "v4.0.6",
        date: "2025-12-22",
        items: [
            "優化：天數選擇器點擊時不再放大，保持介面穩定",
            "優化：消費分析功能整合至總開支面板，介面更簡潔",
            "修正：恢復行程卡拖拽排序功能",
            "新增：路線規劃支援拖拽排序",
            "修正：多城市行程編輯時的編號顯示位置",
            "優化：當地新聞現在會直接跳轉至 Google News"
        ]
    },
    {
        version: "v4.0.5",
        date: "2025-12-22",
        items: [
            "優化：調整設定頁面視覺，移除底部模糊遮罩",
            "優化：行程頁面 Header 全新設計，支援多城市動態顯示",
            "新增：多城市行程中，轉場日會自動顯示「出發地 → 目的地」"
        ]
    },
    {
        version: "v4.0.4",
        date: "2025-12-21",
        items: [
            "修正：修復多城市行程「新增下一站」按鈕失效問題",
            "優化：修改行程頁面現在能正確顯示與編輯多城市行程細節",
            "優化：移除常用工具頁面底部的模糊遮罩層"
        ]
    },
    {
        version: "v4.0.3",
        date: "2025-12-21",
        items: [
            "優化：移除常用工具頁面底部的模糊遮罩層",
            "修正：部分介面顯示問題"
        ]
    },
    {
        version: "v4.0.2",
        date: "2025-12-21",
        items: [
            "優化：移除常用工具頁面的毛玻璃模糊效果",
            "優化：調整介面視覺細節"
        ]
    },
    {
        version: "v4.0.1",
        date: "2025-12-21",
        items: [
            "修正：修復設定頁與百寶箱底部留白過多的問題",
            "優化：調整底部導航列的視覺體驗"
        ]
    },
    {
        version: "v4.0.0",
        date: "2025-12-20",
        items: [
            "新增：行程編輯功能 (目的地/日期/名稱)",
            "新增：行程封存與還原功能",
            "新增：刪除行程功能",
            "優化：設定頁面介面與更新日誌",
            "優化：分享功能"
        ]
    }
];

function App() {
  const [view, setView] = useState<'HOME' | 'CREATE' | 'TRIP'>('HOME');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ITINERARY);
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [savedTrip, setSavedTrip] = useState<Trip | null>(null);
  const [archivedTrips, setArchivedTrips] = useState<Trip[]>([]);
  
  // Modals & Popups State
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [showArchivedList, setShowArchivedList] = useState(false);
  
  // Edit Trip Form State
  const [editTripData, setEditTripData] = useState<{
      name: string;
      destination: string;
      startDate: string;
      endDate: string;
      type: TripType;
  }>({ name: '', destination: '', startDate: '', endDate: '', type: 'Single' });
  
  const [editStops, setEditStops] = useState<Stop[]>([]);

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
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, destination: '', startDate: '', endDate: '' }
  ]);

  // Load saved trip and archives on mount
  useEffect(() => {
    // Active Trip
    const saved = localStorage.getItem('sky_travel_trip_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedTrip(parsed);
      } catch (e) {
        console.error("Failed to parse saved trip", e);
      }
    }
    
    // Archived Trips
    const archives = localStorage.getItem('sky_travel_archived_trips');
    if (archives) {
        try {
            setArchivedTrips(JSON.parse(archives));
        } catch (e) {
            console.error("Failed to parse archives", e);
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

  // --- Handlers ---

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Sky Travel',
                text: '快來使用 Sky Travel 規劃你的下一趟旅程！極簡設計，星際漫遊體驗。',
                url: window.location.href,
            });
        } catch (error) {
            console.log('Error sharing', error);
        }
    } else {
        alert('您的裝置不支援原生分享功能，請手動複製網址。');
    }
  };

  const openEditModal = () => {
      if (!tripData) return;
      setEditTripData({
          name: tripData.name,
          destination: tripData.destination,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          type: tripData.type
      });
      // Initialize edit stops if available
      if (tripData.type === 'Multi' && tripData.stops) {
          setEditStops(JSON.parse(JSON.stringify(tripData.stops)));
      } else {
          setEditStops([]);
      }
      setIsEditTripOpen(true);
  };

  const handleEditStopChange = (id: number, field: keyof Stop, value: string) => {
      setEditStops(prev => {
          const newStops = prev.map(s => s.id === id ? { ...s, [field]: value } : s);
          if (field === 'endDate') {
              const idx = newStops.findIndex(s => s.id === id);
              if (idx !== -1 && idx < newStops.length - 1) {
                  newStops[idx + 1].startDate = value;
              }
          }
          return newStops;
      });
  };

  const handleAddEditStop = () => {
      if (editStops.length >= 6) return;
      const lastStop = editStops[editStops.length - 1];
      setEditStops([
          ...editStops,
          { 
              id: editStops.length + 1, 
              destination: '', 
              startDate: lastStop ? lastStop.endDate : '', 
              endDate: '' 
          }
      ]);
  };

  const handleConfirmEdit = () => {
      if (!tripData) return;
      let updatedTrip = { ...tripData, name: editTripData.name };

      if (tripData.type === 'Multi' && editStops.length > 0) {
          // Reconstruct details from stops
          const newDest = editStops.map(s => s.destination).join(' - ');
          const newStart = editStops[0].startDate;
          const newEnd = editStops[editStops.length - 1].endDate;
          
          updatedTrip = {
              ...updatedTrip,
              destination: newDest,
              startDate: newStart,
              endDate: newEnd,
              stops: editStops
          };
      } else {
          // Single trip or Legacy Multi trip update
          updatedTrip = {
              ...updatedTrip,
              destination: editTripData.destination,
              startDate: editTripData.startDate,
              endDate: editTripData.endDate
          };
      }

      setTripData(updatedTrip);
      setIsEditTripOpen(false);
  };

  const handleDeleteTrip = () => {
      setTripData(null);
      setSavedTrip(null);
      localStorage.removeItem('sky_travel_trip_data');
      setIsDeleteConfirmOpen(false);
      setView('HOME');
  };

  const handleArchiveTrip = () => {
      if (!tripData) return;
      
      const newArchives = [tripData, ...archivedTrips];
      setArchivedTrips(newArchives);
      localStorage.setItem('sky_travel_archived_trips', JSON.stringify(newArchives));
      
      // Clear active trip
      setTripData(null);
      setSavedTrip(null);
      localStorage.removeItem('sky_travel_trip_data');
      
      setIsArchiveConfirmOpen(false);
      setView('HOME');
  };

  const handleRestoreTrip = (trip: Trip) => {
      // Restore selected trip to active
      setTripData(trip);
      setSavedTrip(trip);
      localStorage.setItem('sky_travel_trip_data', JSON.stringify(trip));
      
      // Remove from archives (optional: or keep copy? usually restore implies moving back)
      const newArchives = archivedTrips.filter(t => t.id !== trip.id);
      setArchivedTrips(newArchives);
      localStorage.setItem('sky_travel_archived_trips', JSON.stringify(newArchives));
      
      setShowArchivedList(false);
      setShowHomeSettings(false);
  };

  // Logic to handle changing a stop's data in Creation
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
      stops: tripType === 'Multi' ? stops : undefined,
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
    <div className="h-full flex flex-col p-6 pb-0 bg-transparent transition-colors duration-300 relative">
       {/* Settings Header */}
       <div className="flex justify-between items-center mb-8 flex-shrink-0">
           <button onClick={() => setView('HOME')} className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-colors bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-[#1e293b] dark:border-white/5 dark:text-slate-400 dark:hover:bg-[#334155]">
               <ChevronLeftIcon className="w-5 h-5" />
           </button>
           <div className="w-16 h-16 rounded-full flex items-center justify-center border shadow-lg shadow-blue-500/10 bg-white border-slate-200 dark:bg-[#1e293b] dark:border-white/5">
               <CogIcon className="w-8 h-8 text-slate-400 dark:text-slate-300" />
           </div>
           <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-blue-500 border shadow-sm bg-white border-slate-200 dark:bg-[#1e293b] dark:border-white/5 dark:text-blue-400 active:scale-95 transition-transform"
           >
               <ShareIcon className="w-5 h-5" />
           </button>
       </div>

       <div className="text-center mb-10 flex-shrink-0">
           <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">設定與管理</h2>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">版本 {APP_VERSION}</p>
       </div>

       <div className="flex-grow space-y-4 overflow-y-auto no-scrollbar pb-32">
           
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

           <div 
             className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer active:scale-[0.98]"
             onClick={() => setIsChangelogOpen(true)}
           >
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                       <ClipboardDocumentListIcon className="w-5 h-5" />
                   </div>
                   <div>
                       <h3 className="font-bold text-sm text-slate-800 dark:text-white">更新日誌</h3>
                       <p className="text-[10px] font-bold text-slate-500">查看版本更新紀錄</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-4 h-4 text-slate-600" />
           </div>

           <div className="h-px bg-slate-200 dark:bg-white/10 mx-4 my-2"></div>

           <div 
             className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer active:scale-[0.98]"
             onClick={openEditModal}
           >
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

           <div 
             className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors cursor-pointer active:scale-[0.98]"
             onClick={() => setIsArchiveConfirmOpen(true)}
           >
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400 flex items-center justify-center">
                       <ArchiveBoxArrowDownIcon className="w-5 h-5" />
                   </div>
                   <div>
                       <h3 className="font-bold text-sm text-slate-800 dark:text-white">封存旅程</h3>
                       <p className="text-[10px] font-bold text-slate-500">儲存至歷史紀錄</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-4 h-4 text-slate-600" />
           </div>

            <div 
             className="glass-card p-4 rounded-[24px] flex items-center justify-between group hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer active:scale-[0.98] border-red-100 dark:border-red-900/20"
             onClick={() => setIsDeleteConfirmOpen(true)}
           >
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center">
                       <TrashIcon className="w-5 h-5" />
                   </div>
                   <div>
                       <h3 className="font-bold text-sm text-red-500 dark:text-red-400">刪除本次旅程</h3>
                       <p className="text-[10px] font-bold text-red-300 dark:text-red-500/70">此操作無法復原</p>
                   </div>
               </div>
               <ChevronRightIcon className="w-4 h-4 text-red-300" />
           </div>
       </div>
    </div>
  );

  // Bottom Nav Setup
  const tabs = [Tab.ITINERARY, Tab.EXPENSES, Tab.PACKING, Tab.TOOLBOX, Tab.SETTINGS];
  const activeIndex = tabs.indexOf(activeTab);
  
  // Logic to determine if blur should be shown (Not on Toolbox OR Settings)
  const showBottomBlur = activeTab !== Tab.TOOLBOX && activeTab !== Tab.SETTINGS;

  if (view === 'HOME') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-transparent relative overflow-hidden transition-colors duration-300">
        
        {/* Top Right Settings Button */}
        <div className="absolute top-6 right-6 z-50 flex flex-col items-end">
            <button 
                onClick={() => {
                    setShowHomeSettings(!showHomeSettings);
                    setShowArchivedList(false);
                }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-slate-500 dark:text-white flex items-center justify-center hover:bg-white/20 transition-all shadow-lg active:scale-95 group"
            >
                <CogIcon className={`w-6 h-6 transition-transform duration-500 ${showHomeSettings ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            </button>

            {showHomeSettings && (
                <div className="mt-3 bg-white/90 dark:bg-[#1e293b]/95 backdrop-blur-2xl rounded-[24px] border border-slate-200 dark:border-white/10 shadow-2xl animate-fade-in-up w-56 z-50 overflow-hidden p-2">
                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={() => {
                            setIsDarkMode(!isDarkMode);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group mb-1"
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
                    
                    {/* Archived Trips Button */}
                    <button 
                        onClick={() => setShowArchivedList(!showArchivedList)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                                <ArchiveIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                已封存的旅程
                            </span>
                        </div>
                        <ChevronRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${showArchivedList ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Archived List Sub-menu */}
                    {showArchivedList && (
                        <div className="mt-2 pl-2 pr-1 pb-1 space-y-1 max-h-40 overflow-y-auto no-scrollbar border-t border-slate-200 dark:border-white/5 pt-2">
                            {archivedTrips.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-2 font-bold">暫無封存紀錄</p>
                            ) : (
                                archivedTrips.map(trip => (
                                    <button 
                                        key={trip.id}
                                        onClick={() => handleRestoreTrip(trip)}
                                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{trip.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{trip.destination} • {trip.startDate}</p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                             <RefreshIcon className="w-4 h-4 text-blue-500" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
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
                        <div key={stop.id} className="bg-white border-slate-200 dark:bg-[#111827] dark:border-white/10 border rounded-[28px] p-5 shadow-xl mb-4 flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">{stop.id}</div>
                            <div className="flex-grow min-w-0">
                                <input 
                                    type="text" 
                                    className="bg-transparent w-full text-slate-900 dark:text-white font-bold text-lg focus:outline-none mb-4" 
                                    placeholder="城市名稱"
                                    value={stop.destination}
                                    onChange={e => handleStopChange(stop.id, 'destination', e.target.value)}
                                />
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
                        </div>
                    ))}
                    <button type="button" onClick={handleAddStop} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[24px] text-slate-500 font-bold">+ 新增下一站</button>
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
      {/* Main Content Area - Remove extra padding to let children control it */}
      <div className="h-full overflow-hidden pb-0"> 
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
      <div className={`fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f0f9ff] via-[#f0f9ff]/90 to-transparent dark:from-[#05080F] dark:via-[#05080F]/90 z-40 pointer-events-none ${showBottomBlur ? 'backdrop-blur-[2px]' : ''}`}></div>

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

      {/* --- Global Modals --- */}
      
      {/* 1. Changelog Modal */}
      {isChangelogOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
              <div className="bg-white/90 dark:bg-[#0f172a]/90 w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative animate-slide-up backdrop-blur-xl flex flex-col max-h-[80vh]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                          <ClipboardDocumentListIcon className="w-6 h-6 text-[#38bdf8]" />
                          更新日誌
                      </h3>
                      <button onClick={() => setIsChangelogOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                          <XMarkIcon className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto no-scrollbar space-y-6 pr-2">
                      {CHANGELOG_DATA.map((log, index) => (
                          <div key={index} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[#38bdf8] ring-4 ring-white dark:ring-[#0f172a]"></div>
                              <div className="mb-2">
                                  <span className="text-lg font-black text-slate-800 dark:text-white mr-2">{log.version}</span>
                                  <span className="text-xs font-bold text-slate-400">{log.date}</span>
                              </div>
                              <ul className="space-y-2">
                                  {log.items.map((item, idx) => (
                                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                          • {item}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sky Travel {APP_VERSION}</p>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Edit Trip Modal */}
      {isEditTripOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">修改旅程資訊</h3>
                      <button onClick={() => setIsEditTripOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                          <XMarkIcon className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 mb-6">
                      <div>
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">旅程名稱</label>
                          <div className="bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                              <input 
                                  type="text" 
                                  value={editTripData.name}
                                  onChange={e => setEditTripData({...editTripData, name: e.target.value})}
                                  className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-bold text-lg" 
                              />
                          </div>
                      </div>

                      {/* Conditional Rendering based on Trip Type */}
                      {editTripData.type === 'Single' || editStops.length === 0 ? (
                          <>
                              <div>
                                  <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">目的地</label>
                                  <div className="bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                                      <input 
                                          type="text" 
                                          value={editTripData.destination}
                                          onChange={e => setEditTripData({...editTripData, destination: e.target.value})}
                                          className="bg-transparent w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-bold text-lg" 
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">抵達日期</label>
                                      <div className="bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-3">
                                          <input 
                                              type="date" 
                                              value={editTripData.startDate}
                                              onChange={e => setEditTripData({...editTripData, startDate: e.target.value})}
                                              className="bg-transparent w-full text-slate-900 dark:text-white font-bold focus:outline-none text-sm" 
                                          />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">離開日期</label>
                                      <div className="bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-3">
                                          <input 
                                              type="date" 
                                              value={editTripData.endDate}
                                              onChange={e => setEditTripData({...editTripData, endDate: e.target.value})}
                                              className="bg-transparent w-full text-slate-900 dark:text-white font-bold focus:outline-none text-sm" 
                                          />
                                      </div>
                                  </div>
                              </div>
                          </>
                      ) : (
                          <div className="space-y-4">
                              <p className="text-xs font-bold text-slate-500 ml-1">多城市行程細節</p>
                              {editStops.map((stop, idx) => (
                                  <div key={stop.id} className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-[24px] p-4 flex gap-4">
                                      <div className="w-6 h-6 rounded-full bg-[#a78bfa] text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white dark:border-[#0f172a] flex-shrink-0 mt-1">{idx + 1}</div>
                                      <div className="flex-grow min-w-0">
                                          <input 
                                              type="text" 
                                              className="bg-transparent w-full text-slate-900 dark:text-white font-bold text-lg focus:outline-none mb-3" 
                                              placeholder="城市名稱"
                                              value={stop.destination}
                                              onChange={e => handleEditStopChange(stop.id, 'destination', e.target.value)}
                                          />
                                          <div className="grid grid-cols-2 gap-3">
                                              <div>
                                                  <label className="text-slate-400 text-[10px] font-bold mb-1 block">抵達</label>
                                                  <input type="date" className="w-full bg-white dark:bg-[#111827] rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none border border-slate-200 dark:border-white/5" value={stop.startDate} onChange={e => handleEditStopChange(stop.id, 'startDate', e.target.value)} />
                                              </div>
                                              <div>
                                                  <label className="text-slate-400 text-[10px] font-bold mb-1 block">離開</label>
                                                  <input type="date" className="w-full bg-white dark:bg-[#111827] rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none border border-slate-200 dark:border-white/5" value={stop.endDate} onChange={e => handleEditStopChange(stop.id, 'endDate', e.target.value)} />
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                              <button type="button" onClick={handleAddEditStop} className="w-full py-3 border-2 border-dashed border-[#a78bfa]/30 text-[#a78bfa] rounded-2xl font-bold text-sm hover:bg-[#a78bfa]/5 transition-colors">+ 新增下一站</button>
                          </div>
                      )}
                  </div>

                  <button 
                      onClick={handleConfirmEdit}
                      className="w-full py-4 bg-[#38bdf8] text-white font-black text-lg rounded-3xl hover:bg-[#0ea5e9] shadow-lg shadow-blue-500/30 transition-colors mt-auto"
                  >
                      儲存變更
                  </button>
              </div>
          </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-xs rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl text-center animate-slide-up">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-4">
                      <TrashIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">確定要刪除嗎？</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                      此操作將永久刪除本次旅程計畫，資料無法復原。
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 font-bold">取消</button>
                      <button onClick={handleDeleteTrip} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/30">確認刪除</button>
                  </div>
              </div>
          </div>
      )}

      {/* 4. Archive Confirmation Modal */}
      {isArchiveConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-xs rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl text-center animate-slide-up">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center mb-4">
                      <ArchiveBoxArrowDownIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">封存本次旅程</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                      旅程將移至「已封存」，您可以隨時在首頁的設定選單中還原。
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setIsArchiveConfirmOpen(false)} className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 font-bold">取消</button>
                      <button onClick={handleArchiveTrip} className="flex-1 py-3 rounded-2xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg">確認封存</button>
                  </div>
              </div>
          </div>
      )}

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
