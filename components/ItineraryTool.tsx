
import React, { useState, useEffect } from 'react';
import { Trip, Activity, FlightInfo } from '../types';
import { PlusIcon, CoffeeIcon, CameraIcon, DiningIcon, BusIcon, TagIcon, MapIcon, PlaneIcon, ArrowLongRightIcon, ClockIcon, HourglassIcon, LockClosedIcon, LockOpenIcon, TrashIcon, ChevronRightIcon, NavigationArrowIcon, ChevronUpIcon, ChevronDownIcon, DocumentTextIcon, CloudIcon, XMarkIcon, CalendarIcon, CheckIcon, SparklesIcon } from './Icons';

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onToggleFullScreen?: (isOpen: boolean) => void;
}

const timezones = Array.from({ length: 27 }, (_, i) => {
    const offset = i - 12; // -12 to +14
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const label = `GMT${sign}${absOffset.toString().padStart(2, '0')}:00`;
    return { value: offset, label };
});

// Helper for type colors
const getTypeColor = (type: string) => {
    switch(type) {
        case 'sightseeing': return { hex: '#c084fc', tw: 'purple-500', bg: 'bg-purple-500' };
        case 'food': return { hex: '#34d399', tw: 'emerald-400', bg: 'bg-emerald-400' };
        case 'transport': return { hex: '#facc15', tw: 'yellow-400', bg: 'bg-yellow-400' };
        case 'flight': return { hex: '#38bdf8', tw: 'sky-400', bg: 'bg-sky-400' };
        default: return { hex: '#94a3b8', tw: 'slate-400', bg: 'bg-slate-400' };
    }
};

const FlightCard: React.FC<{ activity: Activity, onClick: () => void }> = ({ activity, onClick }) => {
      const info = activity.flightInfo!;
      return (
          <div 
             className="bg-white dark:bg-[#0f172a] rounded-[24px] overflow-hidden shadow-xl dark:shadow-blue-900/10 relative active:scale-95 transition-transform duration-200 border border-slate-200 dark:border-slate-800 group touch-manipulation cursor-pointer"
             onClick={onClick}
          >
              {/* Top Row: Flight Code, Plane Type, Icon */}
              <div className="px-4 pt-3 pb-1 flex justify-between items-start">
                  <div className="flex gap-2">
                      <span className="bg-slate-100 dark:bg-[#1e293b] text-[#38bdf8] text-xs font-black px-2 py-1 rounded-md tracking-wider">{info.flightNumber}</span>
                      {info.planeType && <span className="bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded-md">{info.planeType}</span>}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-[#38bdf8]">
                      <PlaneIcon className="w-4 h-4 transform -rotate-45" />
                  </div>
              </div>

              {/* Middle Row: Codes and Gradient Arrow */}
              <div className="px-4 py-0 flex justify-between items-center relative z-10">
                  <div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-wide">{info.departureCode}</div>
                  </div>
                  
                  <div className="flex-grow px-3 flex items-center justify-center h-full pt-1">
                      <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none" className="w-full h-4">
                          <defs>
                              <linearGradient id={`arrowGrad-${activity.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" /> 
                                  <stop offset="50%" stopColor="#38bdf8" />
                                  <stop offset="100%" stopColor="#38bdf8" />
                              </linearGradient>
                          </defs>
                          <path d="M0 8H98 M94 3L99 8L94 13" stroke={`url(#arrowGrad-${activity.id})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                  </div>

                  <div className="text-right">
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-wide">{info.arrivalCode}</div>
                  </div>
              </div>

              <div className="px-4 pb-3 flex justify-between items-center">
                  <div className="text-slate-400 dark:text-slate-300 font-bold text-base tracking-widest">↗ {info.departureTime}</div>
                  <div className="text-slate-400 dark:text-slate-300 font-bold text-base tracking-widest">↘ {info.arrivalTime}</div>
              </div>

              {/* Bottom Row */}
              <div className="bg-slate-50 dark:bg-[#1e293b] px-4 py-2 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">FLIGHT TIME</span>
                  <div className="flex items-center gap-2 text-[#38bdf8]">
                       <HourglassIcon className="w-3.5 h-3.5" />
                       <span className="text-xs font-bold font-mono">{info.duration}</span>
                  </div>
              </div>
          </div>
      );
};

const ActivityCard: React.FC<{ activity: Activity, onClick: () => void }> = ({ activity, onClick }) => {
    const typeColor = getTypeColor(activity.type);
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };
    const rgb = hexToRgb(typeColor.hex);

    const handleMapClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activity.location || activity.title) {
            const query = encodeURIComponent(activity.location || activity.title);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        }
    };
    
    return (
        <div 
            onClick={onClick}
            className="rounded-[28px] p-5 flex items-center justify-between border overflow-hidden relative transition-transform active:scale-[0.98] min-h-[100px] cursor-pointer touch-manipulation"
            style={{ 
                background: `rgba(${rgb}, 0.1)`, 
                backdropFilter: 'blur(16px)',
                borderColor: `rgba(${rgb}, 0.2)`
            }}
        >
            {/* Reduced width from min-w-[60px] to min-w-[48px], reduced pr-4 to pr-2, font 3xl to 2xl */}
            <div className="flex flex-col items-center justify-center min-w-[48px] pr-2 border-r border-slate-200 dark:border-white/10">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mb-0.5 uppercase tracking-wider">
                    {parseInt(activity.time.split(':')[0]) >= 12 ? '下午' : '上午'}
                </span>
                <span className="text-2xl font-black text-slate-800 dark:text-white font-mono tracking-tighter leading-none">{activity.time}</span>
            </div>

            <div className="flex-1 px-4">
                <h3 className="text-slate-900 dark:text-white font-black text-xl mb-1 leading-tight tracking-wide">{activity.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    <MapIcon className="w-3 h-3" />
                    <span className="truncate max-w-[140px]">{activity.location || activity.title}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 mx-1"></span>
                    <span>{activity.duration || '1h'}</span>
                </div>
            </div>

            <button 
                onClick={handleMapClick}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/50 dark:border-white/10 active:scale-90 transition-transform bg-white/50 dark:bg-transparent"
                style={{ color: typeColor.hex }}
            >
                {activity.type === 'sightseeing' && <CameraIcon className="w-5 h-5" />}
                {activity.type === 'food' && <DiningIcon className="w-5 h-5" />}
                {activity.type === 'transport' && <BusIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};

const ItineraryTool: React.FC<Props> = ({ trip, onUpdateTrip, isDarkMode, toggleTheme, onToggleFullScreen }) => {
  const [selectedDate, setSelectedDate] = useState<string>(trip.startDate);
  const [dates, setDates] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'PLAN' | 'FLIGHT' | 'THEME'>('PLAN');
  const [isLocked, setIsLocked] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Route Modal Drag State
  const [draggedRouteIndex, setDraggedRouteIndex] = useState<number | null>(null);

  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  
  const [routeLocations, setRouteLocations] = useState<Activity[]>([]);

  // Flight Info Extra State for TZ
  const [depTz, setDepTz] = useState(8);
  const [arrTz, setArrTz] = useState(9);

  // Sightseeing Multi-add State
  const [sightseeingList, setSightseeingList] = useState<{title: string; location: string; duration: string}[]>([
      { title: '', location: '', duration: '2h' }
  ]);

  // Daily Theme State
  const [dailyTheme, setDailyTheme] = useState('');

  // Notify parent about fullscreen modal state
  useEffect(() => {
      if (onToggleFullScreen) {
          onToggleFullScreen(showAddModal);
      }
  }, [showAddModal, onToggleFullScreen]);

  // Activity State
  const [newActivity, setNewActivity] = useState<{
    time: string;
    title: string;
    location: string;
    duration: string;
    description: string;
    type: 'sightseeing' | 'food' | 'transport' | 'flight';
  }>({ 
    time: '11:35', 
    title: '', 
    location: '', 
    duration: '2h',
    description: '',
    type: 'sightseeing' 
  });

  const [newFlight, setNewFlight] = useState<FlightInfo>({
      flightNumber: '',
      planeType: '',
      departureCode: '',
      arrivalCode: '',
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: '09:00',
      departureTimezone: 'GMT+08:00',
      arrivalDate: new Date().toISOString().split('T')[0],
      arrivalTime: '10:35',
      arrivalTimezone: 'GMT+09:00',
      duration: ''
  });

  const isFormValid = modalMode === 'PLAN' 
    ? (newActivity.type === 'sightseeing' && !editingActivityId ? sightseeingList.every(i => i.title.trim() !== '') : !!newActivity.title)
    : modalMode === 'THEME' 
        ? !!dailyTheme.trim()
        : !!(newFlight.flightNumber && newFlight.departureCode && newFlight.arrivalCode);

  // Get Dynamic Title Props and Icon
  const getActivityConfig = (type: string) => {
      switch(type) {
          case 'food': return { label: '餐廳名稱', placeholder: '例如：一蘭拉麵、築地市場', icon: DiningIcon };
          case 'transport': return { label: '交通方式', placeholder: '例如：搭乘 JR 山手線、新幹線', icon: BusIcon };
          case 'flight': return { label: '項目名稱', placeholder: '例如：其他行程', icon: PlaneIcon };
          default: return { label: '景點名稱', placeholder: '例如：參觀東京鐵塔、淺草寺', icon: CameraIcon };
      }
  };
  const activityConfig = getActivityConfig(newActivity.type);
  const ActivityTitleIcon = activityConfig.icon;

  // Calculate duration when flight times change
  useEffect(() => {
      const getUTC = (dateStr: string, timeStr: string, offset: number) => {
        const d = new Date(`${dateStr}T${timeStr}:00Z`);
        d.setHours(d.getHours() - offset);
        return d.getTime();
      };

      const startUTC = getUTC(newFlight.departureDate, newFlight.departureTime, depTz);
      const endUTC = getUTC(newFlight.arrivalDate, newFlight.arrivalTime, arrTz);
      let diffMs = endUTC - startUTC;
      
      if (diffMs < 0) {
      } else {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setNewFlight(prev => ({ ...prev, duration: `${hours}h ${minutes}m` }));
      }
  }, [newFlight.departureDate, newFlight.departureTime, depTz, newFlight.arrivalDate, newFlight.arrivalTime, arrTz]);

  useEffect(() => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const dateArray = [];
    let current = new Date(start);

    while (current <= end) {
      dateArray.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    setDates(dateArray);
    
    if (!dateArray.includes(selectedDate)) {
        setSelectedDate(dateArray[0]);
    }
  }, [trip]);

  const currentActivities = trip.activities[selectedDate] || [];
  const canSort = currentActivities.length > 1;

  // Auto lock if only 1 item
  useEffect(() => {
      if (!canSort) setIsLocked(true);
  }, [canSort]);

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[d.getDay()];
  };

  const getFormattedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getDayNumber = (dateStr: string) => {
      const start = new Date(trip.startDate);
      const current = new Date(dateStr);
      const diffTime = Math.abs(current.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return `DAY ${diffDays + 1}`;
  };

  // Logic to determine what to show in the Header based on Multi-city logic
  const getHeaderLocation = () => {
      // Single Trip
      if (trip.type === 'Single' || !trip.stops) {
          return <span className="truncate">{trip.destination.split(',')[0]}</span>;
      }

      // Multi Trip Transition Check
      // Check if selectedDate is a transition day (End of Stop A AND Start of Stop B)
      for (let i = 0; i < trip.stops.length - 1; i++) {
          const currentStop = trip.stops[i];
          const nextStop = trip.stops[i+1];
          
          if (selectedDate === currentStop.endDate && selectedDate === nextStop.startDate) {
              return (
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <span className="truncate">{currentStop.destination}</span>
                      <ArrowLongRightIcon className="w-5 h-5 flex-shrink-0 animate-pulse text-[#38bdf8]" />
                      <span className="truncate">{nextStop.destination}</span>
                  </div>
              );
          }
      }

      // If not transition, find current stop
      const activeStop = trip.stops.find(s => selectedDate >= s.startDate && selectedDate <= s.endDate);
      return <span className="truncate">{activeStop ? activeStop.destination : trip.destination.split(',')[0]}</span>;
  };

  // Determine the exact city string for weather search
  const getWeatherCity = () => {
      // Single Trip
      if (trip.type === 'Single' || !trip.stops || trip.stops.length === 0) {
          return trip.destination;
      }

      // Multi Trip Logic
      for (let i = 0; i < trip.stops.length - 1; i++) {
          const currentStop = trip.stops[i];
          const nextStop = trip.stops[i+1];
          
          // If selectedDate is a transition day, search the ARRIVAL city (nextStop)
          if (selectedDate === currentStop.endDate && selectedDate === nextStop.startDate) {
              return nextStop.destination;
          }
      }

      // Normal day: find active stop
      const activeStop = trip.stops.find(s => selectedDate >= s.startDate && selectedDate <= s.endDate);
      return activeStop ? activeStop.destination : trip.destination;
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingActivityId(null);
    setModalMode('PLAN');
    setSightseeingList([{ title: '', location: '', duration: '2h' }]); // Reset list
    setDailyTheme('');
    // Reset to defaults or basic time, but when adding new, we calculate in onClick
    setNewActivity({ 
        time: '11:35', 
        title: '', 
        location: '', 
        duration: '2h',
        description: '',
        type: 'sightseeing' 
    });
    setNewFlight({
        flightNumber: '',
        planeType: '',
        departureCode: '',
        arrivalCode: '',
        departureDate: new Date().toISOString().split('T')[0],
        departureTime: '09:00',
        departureTimezone: 'GMT+08:00',
        arrivalDate: new Date().toISOString().split('T')[0],
        arrivalTime: '10:35',
        arrivalTimezone: 'GMT+09:00',
        duration: ''
    });
  };

  const getNextStartTime = () => {
      if (!currentActivities || currentActivities.length === 0) return '09:00';
      const last = currentActivities[currentActivities.length - 1];
      
      let h = 0, m = 0;
      
      if (last.type === 'flight' && last.flightInfo) {
          // If flight, next activity starts at arrival time
          const parts = last.flightInfo.arrivalTime.split(':');
          h = parseInt(parts[0]) || 0;
          m = parseInt(parts[1]) || 0;
      } else {
          // Normal activity: start time + duration
          const parts = last.time.split(':');
          h = parseInt(parts[0]) || 0;
          m = parseInt(parts[1]) || 0;
          
          let durationMins = 60; // default 1h
          if (last.duration) {
              // Handle "2h" or "1.5h"
              durationMins = Math.round(parseFloat(last.duration.replace('h', '')) * 60);
          }
          
          m += durationMins;
      }
      
      // Handle minute overflow
      h += Math.floor(m / 60);
      m = m % 60;
      // Handle day overflow (keep within 24h for time picker)
      h = h % 24;
      
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleSaveActivity = () => {
    const updatedActivities = { ...trip.activities };
    if (!updatedActivities[selectedDate]) {
      updatedActivities[selectedDate] = [];
    }

    if (modalMode === 'THEME') {
        const updatedThemes = { ...trip.themes, [selectedDate]: dailyTheme };
        onUpdateTrip({ ...trip, themes: updatedThemes });
        closeModal();
        return;
    }

    if (modalMode === 'PLAN') {
        // Multi-add Sightseeing Logic
        if (newActivity.type === 'sightseeing' && !editingActivityId) {
            // Check if lists are valid
            if (sightseeingList.some(i => !i.title.trim())) return;

            let currentTimeStr = newActivity.time;
            
            const newItems: Activity[] = sightseeingList.map((item, idx) => {
                // Calculate time for this item
                const [h, m] = currentTimeStr.split(':').map(Number);
                const currentItemTime = currentTimeStr; // Store current

                // Calculate NEXT time for the loop based on ITEM duration
                const itemDuration = item.duration || '2h';
                const durationMins = Math.round(parseFloat(itemDuration.replace('h', '')) * 60);
                
                const date = new Date();
                date.setHours(h);
                date.setMinutes(m + durationMins);
                currentTimeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

                return {
                    id: Date.now().toString() + idx, // Unique ID
                    time: currentItemTime,
                    title: item.title,
                    location: item.location,
                    completed: false,
                    type: 'sightseeing',
                    duration: itemDuration,
                    description: newActivity.description
                };
            });
            updatedActivities[selectedDate].push(...newItems);

        } else {
            // Single Item Logic (Existing)
            if (!newActivity.title) return;
            
            const activityData = {
                id: editingActivityId || Date.now().toString(),
                time: newActivity.time,
                title: newActivity.title,
                location: newActivity.location,
                completed: false,
                type: newActivity.type,
                duration: newActivity.duration,
                description: newActivity.description
            };

            if (editingActivityId) {
                updatedActivities[selectedDate] = updatedActivities[selectedDate].map(a => 
                    a.id === editingActivityId ? { ...a, ...activityData } : a
                );
            } else {
                updatedActivities[selectedDate].push(activityData);
            }
        }

    } else {
        if (!newFlight.flightNumber || !newFlight.departureCode || !newFlight.arrivalCode) return;
        
        const flightData = {
            id: editingActivityId || Date.now().toString(),
            time: newFlight.departureTime,
            title: `Flight ${newFlight.flightNumber}`,
            location: `${newFlight.departureCode} -> ${newFlight.arrivalCode}`,
            completed: false,
            type: 'flight' as const,
            flightInfo: newFlight
        };

        if (editingActivityId) {
             updatedActivities[selectedDate] = updatedActivities[selectedDate].map(a => 
                a.id === editingActivityId ? { ...a, ...flightData } : a
            );
        } else {
            updatedActivities[selectedDate].push(flightData);
        }
    }

    if (!editingActivityId) {
        updatedActivities[selectedDate].sort((a, b) => a.time.localeCompare(b.time));
    }

    onUpdateTrip({ ...trip, activities: updatedActivities });
    closeModal();
  };

  const handleDeleteActivity = () => {
      if (!editingActivityId) return;
      const updatedActivities = { ...trip.activities };
      updatedActivities[selectedDate] = updatedActivities[selectedDate].filter(a => a.id !== editingActivityId);
      onUpdateTrip({ ...trip, activities: updatedActivities });
      closeModal();
  };

  const handleAddToCalendar = () => {
      let title = '';
      let details = '';
      let location = '';
      let startDateTime = '';
      let endDateTime = '';

      const formatDateForGCal = (dateStr: string, timeStr: string) => {
           // Create Date object assuming local time input
           const d = new Date(`${dateStr}T${timeStr}`);
           // Convert to ISO string (UTC) and strip delimiters for Google Calendar "Z" format
           return d.toISOString().replace(/-|:|\.\d+/g, "");
      };

      const addHours = (dateStr: string, timeStr: string, hours: number) => {
           const d = new Date(`${dateStr}T${timeStr}`);
           d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
           return d.toISOString().replace(/-|:|\.\d+/g, "");
      };

      if (modalMode === 'PLAN') {
          if(!newActivity.title) {
              alert('請先輸入行程標題');
              return;
          }
          title = newActivity.title;
          details = newActivity.description || '';
          location = newActivity.location || '';
          
          const duration = parseFloat((newActivity.duration || '1').replace('h', ''));
          
          startDateTime = formatDateForGCal(selectedDate, newActivity.time);
          endDateTime = addHours(selectedDate, newActivity.time, duration);
      } else {
          // Flight
           if(!newFlight.flightNumber || !newFlight.departureCode) {
              alert('請先輸入航班資訊');
              return;
          }
          title = `✈️ ${newFlight.departureCode} ➝ ${newFlight.arrivalCode} (${newFlight.flightNumber})`;
          details = `航班: ${newFlight.flightNumber}\n機型: ${newFlight.planeType}\n出發: ${newFlight.departureTime} @ ${newFlight.departureCode}\n抵達: ${newFlight.arrivalTime} @ ${newFlight.arrivalCode}`;
          location = `${newFlight.departureCode} Airport`;
          
          startDateTime = formatDateForGCal(newFlight.departureDate, newFlight.departureTime);
          endDateTime = formatDateForGCal(newFlight.arrivalDate, newFlight.arrivalTime);
      }

      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(url, '_blank');
  };

  const handleWeatherSearch = () => {
    // Use the dynamic city based on current logic (transition day sensitive)
    const targetCity = getWeatherCity();
    const query = encodeURIComponent(`${targetCity} weather`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleOpenRouteNav = () => {
    const locations = currentActivities.filter(a => (a.location || a.title) && a.type !== 'flight');
    setRouteLocations(locations);
    setShowRouteModal(true);
  };

  // Main List Drag Handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    if (isLocked) {
        e.preventDefault();
        return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary for drop to work
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newActivities = [...currentActivities];
    const [draggedItem] = newActivities.splice(draggedIndex, 1);
    newActivities.splice(dropIndex, 0, draggedItem);

    const updatedActivities = { ...trip.activities };
    updatedActivities[selectedDate] = newActivities;
    onUpdateTrip({ ...trip, activities: updatedActivities });
    setDraggedIndex(null);
  };

  // Route Modal Drag Handlers
  const onRouteDragStart = (e: React.DragEvent, index: number) => {
      setDraggedRouteIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const onRouteDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };

  const onRouteDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedRouteIndex === null || draggedRouteIndex === dropIndex) return;

      const newLocations = [...routeLocations];
      const [draggedItem] = newLocations.splice(draggedRouteIndex, 1);
      newLocations.splice(dropIndex, 0, draggedItem);
      
      setRouteLocations(newLocations);
      setDraggedRouteIndex(null);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivityId(activity.id);
    if (activity.type === 'flight' && activity.flightInfo) {
        setModalMode('FLIGHT');
        setNewFlight(activity.flightInfo);
    } else {
        setModalMode('PLAN');
        setNewActivity({
            time: activity.time,
            title: activity.title,
            location: activity.location || '',
            duration: activity.duration || '2h',
            description: activity.description || '',
            type: activity.type
        });
    }
    setShowAddModal(true);
  };

  const handleConfirmRoute = () => {
    if (routeLocations.length === 0) return;
    const getQuery = (a: Activity) => encodeURIComponent(a.location || a.title);
    
    const origin = getQuery(routeLocations[0]);
    const destination = getQuery(routeLocations[routeLocations.length - 1]);
    
    let waypoints = '';
    if (routeLocations.length > 2) {
        const points = routeLocations.slice(1, routeLocations.length - 1).map(getQuery);
        waypoints = `&waypoints=${points.join('|')}`;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
    setShowRouteModal(false);
  };

  // Handlers for Multi-Sightseeing
  const handleAddSightseeingItem = () => {
      setSightseeingList([...sightseeingList, { title: '', location: '', duration: '2h' }]);
  };

  const handleRemoveSightseeingItem = (idx: number) => {
      if (sightseeingList.length > 1) {
          setSightseeingList(sightseeingList.filter((_, i) => i !== idx));
      }
  };

  const handleSightseeingChange = (idx: number, field: 'title' | 'location' | 'duration', value: string) => {
      const newList = [...sightseeingList];
      newList[idx][field] = value;
      setSightseeingList(newList);
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent">
      
      {/* 1. Header (Reduced height h-28) - Layout Optimization */}
      <div className="h-28 galaxy-header rounded-b-[40px] shadow-2xl shadow-blue-900/20 z-20 relative flex flex-col justify-center px-6 pt-2 flex-shrink-0">
          <div className="stars"></div>
          <div className="relative z-10 flex justify-between items-center w-full mt-1">
            {/* Left: Info */}
            <div className="flex flex-col gap-3 flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] flex-shrink-0">
                        <MapIcon className="w-4 h-4 text-slate-800 dark:text-white" />
                    </div>
                    {/* Updated Header Title Logic and Sizing */}
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide leading-none drop-shadow-lg truncate">
                        {getHeaderLocation()}
                    </h1>
                </div>
                <div className="flex items-center gap-2 pl-1">
                    <span className="bg-white/40 dark:bg-white/10 text-slate-900 dark:text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm border border-white/10">{getDayNumber(selectedDate)}</span>
                    <span className="text-slate-600 dark:text-blue-100 text-sm font-mono font-bold tracking-wide opacity-80">{selectedDate}</span>
                </div>
            </div>

            {/* Right: Weather Widget - Updated Style */}
            <button 
                onClick={handleWeatherSearch}
                className="w-[68px] h-[68px] rounded-[32px] bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center text-yellow-300 shadow-xl active:scale-95 transition-transform flex-shrink-0 relative overflow-hidden group"
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 mb-0.5 relative z-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
            </button>
          </div>
      </div>

      {/* 2. Date Selector */}
      <div className="pt-3 pb-2 pl-6 flex-shrink-0">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 snap-x pr-6">
            {dates.map(date => {
                const isSelected = selectedDate === date;
                return (
                <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`snap-center flex-shrink-0 w-[4.5rem] h-[4.5rem] rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                    isSelected 
                        ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] shadow-lg z-10' 
                        : 'bg-white/60 dark:bg-[#111827] text-slate-500 border border-slate-200 dark:border-white/5'
                    }`}
                >
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{getDayName(date)}</span>
                    <span className={`text-xl font-black ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{getFormattedDate(date)}</span>
                </button>
                )
            })}
          </div>
      </div>

      {/* 3. Toolbar (Sort Lock & Route) */}
      <div className="px-6 flex justify-between items-center gap-2 mb-2 pb-1 flex-shrink-0">
         <button 
             onClick={handleOpenRouteNav}
             className="flex-none px-4 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center gap-2 text-[#38bdf8] font-bold text-xs shadow-sm active:scale-95 transition-transform whitespace-nowrap"
         >
             <div className="bg-[#38bdf8] rounded-full p-1">
                <NavigationArrowIcon className="w-2.5 h-2.5 text-white" />
             </div>
             路線導航
         </button>

         <button 
            onClick={() => canSort && setIsLocked(!isLocked)}
            disabled={!canSort}
            className={`flex-none px-4 h-10 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs shadow-sm transition-all whitespace-nowrap ml-auto ${
                !canSort 
                ? 'bg-slate-100 dark:bg-[#1e293b]/40 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                : isLocked 
                    ? 'bg-slate-100 dark:bg-[#1e293b]/40 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 active:scale-95' 
                    : 'bg-blue-500/10 border-blue-400/30 text-blue-500 dark:text-blue-300 active:scale-95'
            }`}
         >
            {isLocked ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
            {isLocked ? '鎖定' : '解鎖'}
         </button>
      </div>

      {/* 4. Timeline List */}
      <div className="flex-grow overflow-y-auto px-6 pt-2 space-y-0 no-scrollbar relative pb-32">
        {/* Daily Theme Display */}
        {trip.themes?.[selectedDate] && (
            <div className="mb-6 p-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl flex items-center gap-3 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 shrink-0">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-fuchsia-500/70 uppercase tracking-widest mb-0.5">DAILY THEME</p>
                    <h3 className="text-slate-800 dark:text-white font-bold text-lg leading-tight">{trip.themes[selectedDate]}</h3>
                </div>
            </div>
        )}

        {currentActivities.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 space-y-4 mt-8 opacity-60">
            <CoffeeIcon className="w-24 h-24 stroke-1" />
            <p className="text-sm font-bold tracking-widest">本日尚無行程</p>
          </div>
        ) : (
          <div className="relative pl-0 pt-4 pb-4">
            {currentActivities.map((activity, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === currentActivities.length - 1;
              const prevActivity = !isFirst ? currentActivities[idx - 1] : undefined;
              
              const typeColor = getTypeColor(activity.type);
              const prevColor = prevActivity ? getTypeColor(prevActivity.type) : typeColor;

              return (
                <div 
                    key={activity.id}
                    draggable={!isLocked}
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, idx)}
                    className={`group relative flex gap-4 ${!isLast ? 'mb-8' : ''}`}
                >
                    {/* Timeline Column */}
                    <div className="flex flex-col items-center w-6 flex-shrink-0 relative">
                        {!isFirst && (
                            <div 
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 z-0 opacity-80"
                                style={{ 
                                    background: `linear-gradient(to bottom, ${prevColor.hex}, ${typeColor.hex})`,
                                    top: '-32px',
                                    height: 'calc(50% + 32px)'
                                }}
                            />
                        )}

                        <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)] box-content dark:bg-[#05080F] bg-white border-[3px]"
                            style={{ borderColor: typeColor.hex }}
                        ></div>

                        {!isLast && (
                            <div 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 z-0 opacity-80"
                                style={{ 
                                    background: typeColor.hex, // Solid color leaving current item
                                    height: '50%'
                                }}
                            />
                        )}
                    </div>

                    {/* Card Column */}
                    <div className="flex-grow min-w-0">
                        {activity.type === 'flight' && activity.flightInfo 
                            ? <FlightCard activity={activity} onClick={() => openEditModal(activity)} /> 
                            : <ActivityCard activity={activity} onClick={() => openEditModal(activity)} />
                        }
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Floating Add Button */}
      <button 
        onClick={() => { 
            setEditingActivityId(null); 
            setModalMode('PLAN');
            setSightseeingList([{ title: '', location: '', duration: '2h' }]);
            setDailyTheme(trip.themes?.[selectedDate] || '');
            
            // Auto Calculate Next Start Time
            const nextTime = getNextStartTime();
            setNewActivity({ 
                time: nextTime, 
                title: '', 
                location: '', 
                duration: '2h',
                description: '',
                type: 'sightseeing' 
            });
            // Also suggest for flight default time
            setNewFlight(prev => ({
                ...prev,
                departureTime: nextTime
            }));
            
            setShowAddModal(true); 
        }}
        className="fixed bottom-[130px] right-6 z-[60] w-16 h-16 bg-[#38bdf8] hover:bg-[#0ea5e9] rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-90 transition-all duration-300 border-4 border-white dark:border-[#05080F]"
      >
        <PlusIcon className="w-8 h-8 stroke-[2.5]" />
      </button>

      {/* --- MODALS --- */}
      
      {/* 1. Add/Edit Activity Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">
                          {modalMode === 'THEME' ? '每日主題' : (editingActivityId ? '編輯項目' : '新增項目')}
                      </h3>
                      <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                          <XMarkIcon className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Mode Tabs - Sliding Gradient Glass */}
                  <div className="bg-slate-100/80 dark:bg-white/5 p-1.5 rounded-[20px] flex relative h-14 items-center backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-inner mb-6 shrink-0">
                    <div 
                        className={`absolute top-1.5 bottom-1.5 w-[calc(33.33%-6px)] rounded-[16px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg backdrop-blur-md
                        ${modalMode === 'PLAN' 
                            ? 'left-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-purple-500/30' 
                            : modalMode === 'FLIGHT'
                                ? 'left-[calc(33.33%+3px)] bg-gradient-to-r from-sky-400 to-blue-500 shadow-blue-500/30'
                                : 'left-[calc(66.66%)] bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30'
                        }
                        `}
                    ></div>
                    
                    <button 
                        type="button"
                        onClick={() => setModalMode('PLAN')} 
                        className={`flex-1 relative z-10 font-bold text-xs sm:text-sm transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 ${modalMode === 'PLAN' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <MapIcon className="w-4 h-4" /> 
                        一般
                    </button>
                    <button 
                        type="button"
                        onClick={() => setModalMode('FLIGHT')} 
                        className={`flex-1 relative z-10 font-bold text-xs sm:text-sm transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 ${modalMode === 'FLIGHT' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <PlaneIcon className="w-4 h-4" /> 
                        航班
                    </button>
                    <button 
                        type="button"
                        onClick={() => setModalMode('THEME')} 
                        className={`flex-1 relative z-10 font-bold text-xs sm:text-sm transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 ${modalMode === 'THEME' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <SparklesIcon className="w-4 h-4" /> 
                        主題
                    </button>
                 </div>

                  {/* Scrollable Content */}
                  <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 pb-4">
                      
                      {modalMode === 'THEME' ? (
                          <div className="space-y-4 animate-fade-in">
                              <div>
                                  <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">本日主題</label>
                                  <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3">
                                      <span className="text-slate-400"><SparklesIcon className="w-5 h-5" /></span>
                                      <input 
                                          type="text" 
                                          placeholder="例如：歷史文化之旅、購物狂歡日" 
                                          className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-medium" 
                                          value={dailyTheme} 
                                          onChange={e => setDailyTheme(e.target.value)} 
                                      />
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-2 ml-1">設定主題後將會顯示在行程列表的最上方。</p>
                              </div>
                          </div>
                      ) : modalMode === 'PLAN' ? (
                          <div className="space-y-4 animate-fade-in">
                              {/* Type Selection */}
                              <div className="relative p-1 rounded-2xl bg-slate-100 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 backdrop-blur-xl flex h-14 shadow-inner mb-6">
                                  <div className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] rounded-xl bg-white dark:bg-[#374151] border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0`} style={{ left: newActivity.type === 'sightseeing' ? '4px' : newActivity.type === 'food' ? 'calc(33.33% + 2px)' : 'calc(66.66%)' }}></div>
                                  <button onClick={() => setNewActivity({...newActivity, type: 'sightseeing'})} className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-xs font-bold transition-colors ${newActivity.type === 'sightseeing' ? 'text-purple-500 dark:text-purple-400' : 'text-slate-400'}`}><CameraIcon className="w-4 h-4" /> 觀光景點</button>
                                  <button onClick={() => setNewActivity({...newActivity, type: 'food'})} className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-xs font-bold transition-colors ${newActivity.type === 'food' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`}><DiningIcon className="w-4 h-4" /> 特色美食</button>
                                  <button onClick={() => setNewActivity({...newActivity, type: 'transport'})} className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-xs font-bold transition-colors ${newActivity.type === 'transport' ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-400'}`}><BusIcon className="w-4 h-4" /> 交通移動</button>
                              </div>

                              {/* Multi-add for Sightseeing (Only when creating new) */}
                              {newActivity.type === 'sightseeing' && !editingActivityId ? (
                                  <div className="space-y-3">
                                      <div className="flex justify-between items-center px-1">
                                          <label className="text-slate-500 text-[10px] font-bold block">景點列表 (依序新增)</label>
                                          <span className="text-[10px] text-purple-500 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">批量模式</span>
                                      </div>
                                      
                                      {sightseeingList.map((item, idx) => (
                                          <div key={idx} className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-3 relative group">
                                              <div className="absolute top-0 right-0 w-6 h-6 bg-slate-200 dark:bg-white/10 rounded-bl-xl flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                  {idx + 1}
                                              </div>
                                              
                                              <div className="flex flex-col gap-2">
                                                  <div className="flex items-center gap-2">
                                                      <CameraIcon className="w-4 h-4 text-slate-400" />
                                                      <input 
                                                          type="text" 
                                                          placeholder="景點名稱" 
                                                          className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-bold text-sm" 
                                                          value={item.title} 
                                                          onChange={e => handleSightseeingChange(idx, 'title', e.target.value)}
                                                      />
                                                  </div>
                                                  <div className="h-px bg-slate-200 dark:bg-white/5 w-full"></div>
                                                  <div className="flex gap-2">
                                                      <div className="flex-1 flex items-center gap-2">
                                                          <MapIcon className="w-4 h-4 text-slate-400" />
                                                          <input 
                                                              type="text" 
                                                              placeholder="地點 (選填)" 
                                                              className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none text-xs font-medium" 
                                                              value={item.location} 
                                                              onChange={e => handleSightseeingChange(idx, 'location', e.target.value)} 
                                                          />
                                                      </div>
                                                      <div className="w-24 border-l border-slate-200 dark:border-white/5 pl-2 flex items-center gap-1">
                                                          <HourglassIcon className="w-3.5 h-3.5 text-slate-400" />
                                                          <select 
                                                              className="bg-transparent w-full text-slate-800 dark:text-white focus:outline-none font-bold text-xs" 
                                                              value={item.duration} 
                                                              onChange={e => handleSightseeingChange(idx, 'duration', e.target.value)}
                                                          >
                                                              {Array.from({ length: 36 }, (_, i) => (i + 1) * 0.5).map(val => (<option key={val} value={`${val}h`} className="bg-white dark:bg-[#1f2937]">{val}h</option>))}
                                                          </select>
                                                      </div>
                                                  </div>
                                              </div>

                                              {sightseeingList.length > 1 && (
                                                  <button 
                                                      onClick={() => handleRemoveSightseeingItem(idx)}
                                                      className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                  >
                                                      <XMarkIcon className="w-3 h-3" />
                                                  </button>
                                              )}
                                          </div>
                                      ))}
                                      
                                      <button 
                                          onClick={handleAddSightseeingItem}
                                          className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                      >
                                          <PlusIcon className="w-4 h-4" /> 新增下一個景點
                                      </button>
                                  </div>
                              ) : (
                                  <>
                                      {/* Title */}
                                      <div>
                                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">{activityConfig.label}</label>
                                          <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3">
                                              <span className="text-slate-400"><ActivityTitleIcon className="w-5 h-5" /></span>
                                              <input 
                                                  type="text" 
                                                  placeholder={activityConfig.placeholder} 
                                                  className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-medium" 
                                                  value={newActivity.title} 
                                                  onChange={e => setNewActivity({...newActivity, title: e.target.value})} 
                                              />
                                          </div>
                                      </div>
                                      
                                      {/* Location */}
                                      <div>
                                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">地點 (輸入可跳轉地圖)</label>
                                          <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3">
                                              <span className="text-slate-400"><MapIcon className="w-5 h-5" /></span>
                                              <input type="text" placeholder="輸入具體地址或地標" className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-medium" value={newActivity.location} onChange={e => setNewActivity({...newActivity, location: e.target.value})} />
                                          </div>
                                      </div>
                                  </>
                              )}
                              
                              {/* Time & Duration (Show global duration only if NOT in multi-add mode) */}
                              <div className="flex gap-4">
                                  <div className="flex-1">
                                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">開始時間</label>
                                      <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl px-4 flex items-center gap-3 h-[58px]">
                                          <span className="text-slate-400"><ClockIcon className="w-5 h-5" /></span>
                                          <input type="time" className="bg-transparent w-full text-slate-800 dark:text-white focus:outline-none font-bold appearance-none" value={newActivity.time} onChange={e => setNewActivity({...newActivity, time: e.target.value})} />
                                      </div>
                                  </div>
                                  {!(newActivity.type === 'sightseeing' && !editingActivityId) && (
                                      <div className="flex-1">
                                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">預計停留</label>
                                          <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl px-4 flex items-center gap-3 h-[58px]">
                                              <span className="text-slate-400"><HourglassIcon className="w-5 h-5" /></span>
                                              <select className="bg-transparent w-full text-slate-800 dark:text-white focus:outline-none font-bold text-sm" value={newActivity.duration} onChange={e => setNewActivity({...newActivity, duration: e.target.value})}>
                                                  {Array.from({ length: 36 }, (_, i) => (i + 1) * 0.5).map(val => (<option key={val} value={`${val}h`} className="bg-white dark:bg-[#1f2937]">{val}h</option>))}
                                              </select>
                                          </div>
                                      </div>
                                  )}
                              </div>
                              
                              {/* Notes */}
                              <div>
                                  <label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">備註 (選填)</label>
                                  <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-start gap-3">
                                      <span className="text-slate-400 mt-0.5"><DocumentTextIcon className="w-5 h-5" /></span>
                                      <textarea 
                                          placeholder="例如：預約號碼、注意事項..." 
                                          className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-medium resize-none h-20" 
                                          value={newActivity.description} 
                                          onChange={e => setNewActivity({...newActivity, description: e.target.value})} 
                                      />
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-6 animate-fade-in">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">航班編號</label>
                                      <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5">
                                          <input type="text" placeholder="CX500" className="w-full bg-transparent text-slate-800 dark:text-white font-bold text-center uppercase focus:outline-none placeholder-slate-400 dark:placeholder-slate-600" value={newFlight.flightNumber} onChange={e => setNewFlight({...newFlight, flightNumber: e.target.value.toUpperCase()})} />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">機型 (選填)</label>
                                      <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5">
                                          <input type="text" placeholder="A350" className="w-full bg-transparent text-slate-800 dark:text-white font-bold text-center uppercase focus:outline-none placeholder-slate-400 dark:placeholder-slate-600" value={newFlight.planeType} onChange={e => setNewFlight({...newFlight, planeType: e.target.value.toUpperCase()})} />
                                      </div>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">出發地代碼</label>
                                      <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                                          <input type="text" placeholder="HKG" className="w-full bg-transparent text-slate-800 dark:text-white font-black text-2xl text-center uppercase focus:outline-none placeholder-slate-400 dark:placeholder-slate-600" value={newFlight.departureCode} onChange={e => setNewFlight({...newFlight, departureCode: e.target.value.toUpperCase()})} />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">目的地代碼</label>
                                      <div className="bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                                          <input type="text" placeholder="NRT" className="w-full bg-transparent text-slate-800 dark:text-white font-black text-2xl text-center uppercase focus:outline-none placeholder-slate-400 dark:placeholder-slate-600" value={newFlight.arrivalCode} onChange={e => setNewFlight({...newFlight, arrivalCode: e.target.value.toUpperCase()})} />
                                      </div>
                                  </div>
                              </div>
                              {/* Departure */}
                              <div className="bg-slate-50 dark:bg-[#1e293b]/50 rounded-[24px] p-4 border border-slate-200 dark:border-white/5">
                                  <div className="flex items-center gap-2 mb-4 text-[#38bdf8]">
                                      {/* Rocket Icon replacement (using rotated PlaneIcon) */}
                                      <PlaneIcon className="w-5 h-5 transform -rotate-45" />
                                      <span className="font-bold text-sm">出發資訊</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 border border-slate-200 dark:border-white/5"><input type="date" value={newFlight.departureDate} onChange={e => setNewFlight({...newFlight, departureDate: e.target.value})} className="bg-transparent text-slate-800 dark:text-white text-sm font-bold w-full focus:outline-none" /></div>
                                      <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 border border-slate-200 dark:border-white/5"><input type="time" value={newFlight.departureTime} onChange={e => setNewFlight({...newFlight, departureTime: e.target.value})} className="bg-transparent text-slate-800 dark:text-white text-sm font-bold w-full focus:outline-none" /></div>
                                  </div>
                                  <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 border border-slate-200 dark:border-white/5 flex justify-between items-center relative">
                                      <select className="absolute inset-0 bg-transparent text-transparent w-full opacity-0 z-10" value={depTz} onChange={e => setDepTz(Number(e.target.value))}>{timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}</select>
                                      <span className="text-slate-800 dark:text-white text-sm font-bold truncate">{timezones.find(t => t.value === depTz)?.label}</span>
                                      <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                                  </div>
                              </div>
                              {/* Arrival */}
                              <div className="bg-slate-50 dark:bg-[#1e293b]/50 rounded-[24px] p-4 border border-slate-200 dark:border-white/5">
                                  <div className="flex items-center gap-2 mb-4 text-[#34d399]">
                                      <MapIcon className="w-5 h-5" />
                                      <span className="font-bold text-sm">抵達資訊</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 border border-slate-200 dark:border-white/5"><input type="date" value={newFlight.arrivalDate} onChange={e => setNewFlight({...newFlight, arrivalDate: e.target.value})} className="bg-transparent text-slate-800 dark:text-white text-sm font-bold w-full focus:outline-none" /></div>
                                      <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 border border-slate-200 dark:border-white/5"><input type="time" value={newFlight.arrivalTime} onChange={e => setNewFlight({...newFlight, arrivalTime: e.target.value})} className="bg-transparent text-slate-800 dark:text-white text-sm font-bold w-full focus:outline-none" /></div>
                                  </div>
                                  <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 border border-slate-200 dark:border-white/5 flex justify-between items-center relative">
                                      <select className="absolute inset-0 bg-transparent text-transparent w-full opacity-0 z-10" value={arrTz} onChange={e => setArrTz(Number(e.target.value))}>{timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}</select>
                                      <span className="text-slate-800 dark:text-white text-sm font-bold truncate">{timezones.find(t => t.value === arrTz)?.label}</span>
                                      <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 flex gap-3 pb-safe mt-auto">
                      {editingActivityId && <button onClick={handleDeleteActivity} className="w-14 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"><TrashIcon className="w-5 h-5" /></button>}
                      <button onClick={handleAddToCalendar} className="w-14 flex items-center justify-center rounded-2xl bg-orange-100 text-orange-500 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20"><CalendarIcon className="w-5 h-5" /></button>
                      <button onClick={handleSaveActivity} disabled={!isFormValid} className={`flex-1 py-4 rounded-2xl font-bold border transition-all duration-300 shadow-lg ${isFormValid ? 'bg-[#38bdf8] text-white border-transparent shadow-blue-500/30' : 'bg-slate-100 dark:bg-[#1f2937] text-slate-500 border-slate-200 dark:border-white/5 cursor-not-allowed'}`}>{isFormValid ? (editingActivityId || modalMode === 'THEME' ? '儲存變更' : '確認新增') : '請填寫完整資訊'}</button>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Route Navigation Modal */}
      {showRouteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-scale-in">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <NavigationArrowIcon className="w-6 h-6 text-[#38bdf8]" />
                          路線規劃
                      </h3>
                      <button onClick={() => setShowRouteModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                          <XMarkIcon className="w-5 h-5" />
                      </button>
                  </div>

                  <p className="text-sm text-slate-500 mb-4 font-bold">拖曳調整順序，生成最佳路線：</p>

                  <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                      {routeLocations.map((loc, idx) => (
                          <div 
                              key={loc.id}
                              draggable
                              onDragStart={(e) => onRouteDragStart(e, idx)}
                              onDragOver={onRouteDragOver}
                              onDrop={(e) => onRouteDrop(e, idx)}
                              className={`bg-slate-50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-white/5 cursor-move active:scale-95 transition-transform ${draggedRouteIndex === idx ? 'opacity-50' : ''}`}
                          >
                              <div className="w-6 h-6 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {idx + 1}
                              </div>
                              <span className="font-bold text-slate-700 dark:text-white text-sm truncate">{loc.location || loc.title}</span>
                          </div>
                      ))}
                  </div>

                  <button 
                      onClick={handleConfirmRoute}
                      className="w-full py-4 bg-[#38bdf8] text-white rounded-2xl font-black text-lg shadow-lg hover:bg-[#0ea5e9] transition-all flex items-center justify-center gap-2"
                  >
                      <MapIcon className="w-5 h-5" />
                      開啟 Google Maps 導航
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default ItineraryTool;
