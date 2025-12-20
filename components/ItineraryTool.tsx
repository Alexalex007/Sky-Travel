
import React, { useState, useEffect } from 'react';
import { Trip, Activity, FlightInfo } from '../types';
import { PlusIcon, CoffeeIcon, CameraIcon, DiningIcon, BusIcon, TagIcon, MapIcon, PlaneIcon, ArrowLongRightIcon, ClockIcon, HourglassIcon, LockClosedIcon, LockOpenIcon, TrashIcon, ChevronRightIcon, NavigationArrowIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

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

const FlightCard: React.FC<{ activity: Activity, isLast: boolean, nextType?: string, onClick: () => void, isLocked: boolean, onDragStart: (e: React.DragEvent) => void, onDragOver: (e: React.DragEvent) => void, onDrop: (e: React.DragEvent) => void }> = ({ activity, isLast, nextType, onClick, isLocked, onDragStart, onDragOver, onDrop }) => {
      const info = activity.flightInfo!;
      const typeColor = getTypeColor('flight');
      const nextColor = nextType ? getTypeColor(nextType) : typeColor;

      return (
          <div 
             className="relative pl-12 animate-fade-in-up group touch-manipulation"
             onClick={onClick}
             draggable={!isLocked}
             onDragStart={onDragStart}
             onDragOver={onDragOver}
             onDrop={onDrop}
          >
              {/* Timeline Line (Gradient to next) */}
              {!isLast && (
                  <div 
                    className="absolute left-[23px] top-1/2 w-0.5 z-0 opacity-80"
                    style={{ 
                        background: `linear-gradient(to bottom, ${typeColor.hex}, ${nextColor.hex})`,
                        height: 'calc(100% + 32px)' 
                    }}
                  ></div>
              )}
              
              {/* Centered Dot */}
              <div 
                  className="absolute left-[19px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)] box-content"
                  style={{ 
                      backgroundColor: '#05080F', 
                      border: `3px solid ${typeColor.hex}` 
                  }}
              ></div>
              
              {/* Dark Card Design matching image */}
              <div className="bg-[#0f172a] rounded-[24px] overflow-hidden shadow-2xl shadow-blue-900/10 relative active:scale-95 transition-transform duration-200 border border-slate-800">
                  
                  {/* Top Row: Flight Code, Plane Type, Icon */}
                  <div className="px-5 pt-4 pb-1 flex justify-between items-start">
                      <div className="flex gap-2">
                          <span className="bg-[#1e293b] text-[#38bdf8] text-sm font-black px-2 py-1 rounded-md tracking-wider">{info.flightNumber}</span>
                          {info.planeType && <span className="bg-[#1e293b] text-slate-400 text-xs font-bold px-2 py-1 rounded-md">{info.planeType}</span>}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-[#38bdf8]">
                          <PlaneIcon className="w-5 h-5 transform -rotate-45" />
                      </div>
                  </div>

                  {/* Middle Row: Codes and Gradient Arrow */}
                  <div className="px-5 py-1 flex justify-between items-center relative z-10">
                      <div>
                          <div className="text-4xl font-black text-white tracking-wide">{info.departureCode}</div>
                      </div>
                      
                      <div className="flex-grow px-4 flex items-center justify-center h-full pt-2">
                          <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-5">
                              <defs>
                                  <linearGradient id={`arrowGrad-${activity.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                      <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" /> 
                                      <stop offset="50%" stopColor="#38bdf8" />
                                      <stop offset="100%" stopColor="#38bdf8" />
                                  </linearGradient>
                              </defs>
                              <path d="M0 10H98 M92 4L98 10L92 16" stroke={`url(#arrowGrad-${activity.id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                      </div>

                      <div className="text-right">
                          <div className="text-4xl font-black text-white tracking-wide">{info.arrivalCode}</div>
                      </div>
                  </div>

                  <div className="px-5 pb-4 flex justify-between items-center">
                      <div className="text-slate-300 font-bold text-lg tracking-widest">↗ {info.departureTime}</div>
                      <div className="text-slate-300 font-bold text-lg tracking-widest">↘ {info.arrivalTime}</div>
                  </div>

                  {/* Bottom Row */}
                  <div className="bg-[#1e293b] px-5 py-2 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">FLIGHT TIME</span>
                      <div className="flex items-center gap-2 text-[#38bdf8]">
                           <HourglassIcon className="w-4 h-4" />
                           <span className="text-sm font-bold font-mono">{info.duration}</span>
                      </div>
                  </div>
              </div>
          </div>
      );
};

const ActivityCard: React.FC<{ activity: Activity, isLast: boolean, nextType?: string, onClick: () => void, isLocked: boolean, onDragStart: (e: React.DragEvent) => void, onDragOver: (e: React.DragEvent) => void, onDrop: (e: React.DragEvent) => void }> = ({ activity, isLast, nextType, onClick, isLocked, onDragStart, onDragOver, onDrop }) => {
    const typeColor = getTypeColor(activity.type);
    const nextColor = nextType ? getTypeColor(nextType) : typeColor;
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
           className="relative pl-12 animate-fade-in-up group touch-manipulation" 
           onClick={onClick}
           draggable={!isLocked}
           onDragStart={onDragStart}
           onDragOver={onDragOver}
           onDrop={onDrop}
        >
            {!isLast && (
                <div 
                className="absolute left-[23px] top-1/2 w-0.5 z-0 opacity-80"
                style={{ 
                    background: `linear-gradient(to bottom, ${typeColor.hex}, ${nextColor.hex})`,
                    height: 'calc(100% + 32px)' 
                }}
                ></div>
            )}
            
            <div 
              className="absolute left-[19px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)] box-content"
              style={{ 
                  backgroundColor: '#05080F', 
                  border: `3px solid ${typeColor.hex}` 
              }}
            ></div>

            <div 
                className="rounded-[28px] p-5 flex items-center justify-between border overflow-hidden relative transition-transform active:scale-[0.98] min-h-[100px]"
                style={{ 
                    background: `rgba(${rgb}, 0.1)`, 
                    backdropFilter: 'blur(16px)',
                    borderColor: `rgba(${rgb}, 0.2)`
                }}
            >
                <div className="flex flex-col items-center justify-center min-w-[60px] pr-4 border-r border-white/10">
                    <span className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">
                        {parseInt(activity.time.split(':')[0]) >= 12 ? '下午' : '上午'}
                    </span>
                    <span className="text-3xl font-black text-white font-mono tracking-tighter leading-none">{activity.time}</span>
                </div>

                <div className="flex-1 px-5">
                    <h3 className="text-white font-black text-xl mb-1 leading-tight tracking-wide">{activity.title}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <MapIcon className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">{activity.location || activity.title}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600 mx-1"></span>
                        <span>{activity.duration || '1h'}</span>
                    </div>
                </div>

                <button 
                    onClick={handleMapClick}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                    style={{ color: typeColor.hex, backgroundColor: `rgba(${rgb}, 0.1)` }}
                >
                    {activity.type === 'sightseeing' && <CameraIcon className="w-5 h-5" />}
                    {activity.type === 'food' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
                    {activity.type === 'transport' && <BusIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

const timezones = [
  { label: 'GMT-12:00', value: -12 },
  { label: 'GMT-11:00', value: -11 },
  { label: 'GMT-10:00 Hawaii', value: -10 },
  { label: 'GMT-09:00 Alaska', value: -9 },
  { label: 'GMT-08:00 Pacific', value: -8 },
  { label: 'GMT-07:00 Mountain', value: -7 },
  { label: 'GMT-06:00 Central', value: -6 },
  { label: 'GMT-05:00 Eastern', value: -5 },
  { label: 'GMT-04:00 Atlantic', value: -4 },
  { label: 'GMT-03:00 Brazil', value: -3 },
  { label: 'GMT-02:00 Mid-Atlantic', value: -2 },
  { label: 'GMT-01:00 Azores', value: -1 },
  { label: 'GMT+00:00 London', value: 0 },
  { label: 'GMT+01:00 Paris', value: 1 },
  { label: 'GMT+02:00 Athens', value: 2 },
  { label: 'GMT+03:00 Moscow', value: 3 },
  { label: 'GMT+04:00 Dubai', value: 4 },
  { label: 'GMT+05:00 Pakistan', value: 5 },
  { label: 'GMT+06:00 Dhaka', value: 6 },
  { label: 'GMT+07:00 Bangkok', value: 7 },
  { label: 'GMT+08:00 Hong Kong', value: 8 },
  { label: 'GMT+09:00 Tokyo', value: 9 },
  { label: 'GMT+10:00 Sydney', value: 10 },
  { label: 'GMT+11:00 Solomon Is.', value: 11 },
  { label: 'GMT+12:00 Wellington', value: 12 },
];

interface Props {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ItineraryTool: React.FC<Props> = ({ trip, onUpdateTrip, isDarkMode, toggleTheme }) => {
  const [selectedDate, setSelectedDate] = useState<string>(trip.startDate);
  const [dates, setDates] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'PLAN' | 'FLIGHT'>('PLAN');
  const [isLocked, setIsLocked] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  
  const [routeLocations, setRouteLocations] = useState<Activity[]>([]);

  // Flight Info Extra State for TZ
  const [depTz, setDepTz] = useState(8);
  const [arrTz, setArrTz] = useState(9);

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

  const handleSaveActivity = () => {
    const updatedActivities = { ...trip.activities };
    if (!updatedActivities[selectedDate]) {
      updatedActivities[selectedDate] = [];
    }

    if (modalMode === 'PLAN') {
        if (!newActivity.title) return;
        
        const activityData = {
            id: editingActivityId || Date.now().toString(),
            time: newActivity.time,
            title: newActivity.title,
            location: newActivity.location,
            completed: false,
            type: newActivity.type,
            duration: newActivity.duration
        };

        if (editingActivityId) {
            updatedActivities[selectedDate] = updatedActivities[selectedDate].map(a => 
                a.id === editingActivityId ? { ...a, ...activityData } : a
            );
        } else {
            updatedActivities[selectedDate].push(activityData);
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

  const openEditModal = (activity: Activity) => {
      setEditingActivityId(activity.id);
      if (activity.type === 'flight' && activity.flightInfo) {
          setNewFlight(activity.flightInfo);
          setModalMode('FLIGHT');
      } else {
          setNewActivity({
              time: activity.time,
              title: activity.title,
              location: activity.location || '',
              duration: activity.duration || '1h',
              description: activity.description || '',
              type: activity.type
          });
          setModalMode('PLAN');
      }
      setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowRouteModal(false);
    setEditingActivityId(null);
    setNewActivity({ time: '12:35', title: '', location: '', duration: '1 小時', description: '', type: 'sightseeing' });
    setNewFlight({
        flightNumber: '', planeType: '', departureCode: '', arrivalCode: '',
        departureDate: new Date().toISOString().split('T')[0], departureTime: '12:35', departureTimezone: 'GMT+08:00',
        arrivalDate: new Date().toISOString().split('T')[0], arrivalTime: '16:00', arrivalTimezone: 'GMT+09:00', duration: ''
    });
  };

  // Drag and Drop Logic
  const onDragStart = (e: React.DragEvent, index: number) => {
      if (isLocked) return;
      setDraggedIndex(index);
  };
  const onDragOver = (e: React.DragEvent) => {
      if (isLocked) return;
      e.preventDefault(); 
  };
  const onDrop = (e: React.DragEvent, dropIndex: number) => {
      if (isLocked || draggedIndex === null || draggedIndex === dropIndex) return;
      
      const list = [...(trip.activities[selectedDate] || [])];
      const [removed] = list.splice(draggedIndex, 1);
      list.splice(dropIndex, 0, removed);
      
      const updatedActivities = { ...trip.activities, [selectedDate]: list };
      onUpdateTrip({ ...trip, activities: updatedActivities });
      setDraggedIndex(null);
  };

  const handleWeatherSearch = () => {
      const query = encodeURIComponent(`${trip.destination} weather`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleOpenRouteNav = () => {
      const activities = trip.activities[selectedDate] || [];
      const validLocations = activities.filter(a => 
          (a.type === 'sightseeing' || a.type === 'food') && 
          (a.location && a.location.trim() !== '')
      );
      setRouteLocations(validLocations);
      setShowRouteModal(true);
  };

  const handleRouteOrderChange = (index: number, direction: 'up' | 'down') => {
      const newOrder = [...routeLocations];
      if (direction === 'up' && index > 0) {
          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      setRouteLocations(newOrder);
  };

  const handleConfirmRoute = () => {
      if (routeLocations.length === 0) return;
      const destinations = routeLocations.map(a => encodeURIComponent(a.location || a.title)).join('/');
      const url = `https://www.google.com/maps/dir/${destinations}`;
      window.open(url, '_blank');
      setShowRouteModal(false);
  };

  const isFormValid = modalMode === 'PLAN' 
    ? newActivity.title !== '' && newActivity.time !== '' 
    : newFlight.flightNumber !== '' && newFlight.departureCode !== '';

  return (
    <div className="h-full flex flex-col relative bg-transparent">
      
      {/* 1. Header (Reduced height h-28) - Layout Optimization */}
      <div className="h-28 galaxy-header rounded-b-[40px] shadow-2xl shadow-blue-900/20 z-20 relative flex flex-col justify-center px-6 pt-2 flex-shrink-0">
          <div className="stars"></div>
          <div className="relative z-10 flex justify-between items-center w-full mt-1">
            {/* Left: Info */}
            <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        <MapIcon className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-wide leading-none drop-shadow-lg truncate max-w-[200px]">{trip.destination.split(',')[0]}</h1>
                </div>
                <div className="flex items-center gap-2 pl-1">
                    <span className="bg-white/20 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">{getDayNumber(selectedDate)}</span>
                    <span className="text-blue-100 text-xs font-mono font-bold tracking-wide opacity-80">{selectedDate}</span>
                </div>
            </div>

            {/* Right: Weather Widget */}
            <button 
                onClick={handleWeatherSearch}
                className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.2)] active:scale-95 transition-transform flex-shrink-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
            </button>
          </div>
      </div>

      {/* 2. Date Selector */}
      <div className="pt-6 pb-2 pl-6 flex-shrink-0">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 snap-x pr-6">
            {dates.map(date => {
                const isSelected = selectedDate === date;
                return (
                <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`snap-center flex-shrink-0 w-[4.5rem] h-[4.5rem] rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                    isSelected 
                        ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] transform scale-105 z-10' 
                        : 'bg-white/80 dark:bg-[#111827] text-slate-500 border border-slate-200 dark:border-white/5'
                    }`}
                >
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{getDayName(date)}</span>
                    <span className={`text-xl font-black ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{getFormattedDate(date)}</span>
                </button>
                )
            })}
          </div>
      </div>

      {/* 2.5 Secondary Toolbar - Reduced Size */}
      <div className="px-6 flex gap-3 mb-2">
         <button 
             onClick={handleOpenRouteNav}
             className="flex-1 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center gap-2 text-[#38bdf8] font-bold text-xs shadow-sm active:scale-95 transition-transform"
         >
             <div className="bg-[#38bdf8] rounded-full p-1">
                <NavigationArrowIcon className="w-2.5 h-2.5 text-white" />
             </div>
             本日路線導航
         </button>

         <button 
            onClick={() => canSort && setIsLocked(!isLocked)}
            disabled={!canSort}
            className={`flex-1 h-10 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs shadow-sm transition-all ${
                !canSort 
                ? 'bg-[#1e293b]/40 border-white/5 text-slate-500 cursor-not-allowed opacity-50'
                : isLocked 
                    ? 'bg-[#1e293b]/40 border-white/10 text-slate-400 active:scale-95' 
                    : 'bg-blue-500/20 border-blue-400/30 text-blue-300 active:scale-95'
            }`}
         >
            {isLocked ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
            {isLocked ? '排序鎖定' : '排序解鎖'}
         </button>
      </div>

      {/* 3. Content Area */}
      <div className="flex-grow overflow-y-auto px-6 pt-2 space-y-8 no-scrollbar relative pb-32">
        {currentActivities.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 space-y-4 mt-8 opacity-60">
            <CoffeeIcon className="w-24 h-24 stroke-1" />
            <p className="text-sm font-bold tracking-widest">本日尚無行程</p>
          </div>
        ) : (
          <div className="relative pl-0 space-y-8 pt-4 pb-4">
            {currentActivities.map((activity, idx) => {
              const isLast = idx === currentActivities.length - 1;
              const nextActivity = !isLast ? currentActivities[idx + 1] : undefined;
              const commonProps = {
                  key: activity.id,
                  activity,
                  isLast,
                  nextType: nextActivity?.type,
                  onClick: () => openEditModal(activity),
                  isLocked,
                  onDragStart: (e: React.DragEvent) => onDragStart(e, idx),
                  onDragOver,
                  onDrop: (e: React.DragEvent) => onDrop(e, idx)
              };
              return activity.type === 'flight' && activity.flightInfo 
                ? <FlightCard {...commonProps} /> 
                : <ActivityCard {...commonProps} />;
            })}
          </div>
        )}
      </div>

      {/* FAB - Fixed Position significantly lower */}
      <button 
        onClick={() => { setEditingActivityId(null); setModalMode('PLAN'); setShowAddModal(true); }}
        className="fixed bottom-[130px] right-6 z-[60] w-16 h-16 bg-[#38bdf8] hover:bg-[#0ea5e9] rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-90 transition-all duration-300 border-4 border-[#05080F]"
      >
        <PlusIcon className="w-8 h-8 stroke-[2.5]" />
      </button>

      {/* Modals ... */}
      {showRouteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
             {/* Route Modal Content */}
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-white tracking-wide">本日路線規劃</h3>
                 <button onClick={() => setShowRouteModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             </div>
             <div className="flex-grow overflow-y-auto no-scrollbar space-y-3 pb-4">
                {routeLocations.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm font-bold">
                        <p>找不到可導航的地點。</p>
                        <p className="mt-2 text-xs">請確保行程中包含「觀光」或「美食」類型，並已填寫地點資訊。</p>
                    </div>
                ) : (
                    routeLocations.map((loc, idx) => (
                        <div key={loc.id} className="bg-[#1f2937] p-4 rounded-2xl flex items-center gap-3 border border-white/5">
                            <div className="w-6 h-6 rounded-full bg-[#38bdf8] text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                            <div className="flex-grow overflow-hidden">
                                <p className="text-white font-bold truncate">{loc.location || loc.title}</p>
                                <p className="text-slate-400 text-xs truncate">{loc.title}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => handleRouteOrderChange(idx, 'up')} disabled={idx === 0} className={`p-1 rounded bg-white/5 ${idx === 0 ? 'opacity-30' : 'hover:bg-white/10'}`}><ChevronUpIcon className="w-4 h-4 text-slate-400" /></button>
                                <button onClick={() => handleRouteOrderChange(idx, 'down')} disabled={idx === routeLocations.length - 1} className={`p-1 rounded bg-white/5 ${idx === routeLocations.length - 1 ? 'opacity-30' : 'hover:bg-white/10'}`}><ChevronDownIcon className="w-4 h-4 text-slate-400" /></button>
                            </div>
                        </div>
                    ))
                )}
             </div>
             <button onClick={handleConfirmRoute} disabled={routeLocations.length < 1} className={`w-full py-4 rounded-2xl font-bold border transition-all duration-300 shadow-lg mt-auto flex items-center justify-center gap-2 ${routeLocations.length >= 1 ? 'bg-[#38bdf8] text-white border-transparent shadow-blue-500/30' : 'bg-[#1f2937] text-slate-500 border-white/5 cursor-not-allowed'}`}><NavigationArrowIcon className="w-5 h-5" />開啟 Google Maps 多點導航</button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[32px] border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-white tracking-wide">{editingActivityId ? '編輯行程' : (modalMode === 'PLAN' ? '規劃行程' : '新增航班資訊')}</h3>
                 <button onClick={closeModal} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
             </div>
             
             <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 pb-4">
             {modalMode === 'PLAN' ? (
                 /* ... Existing Plan Form Code ... */
                 <div className="space-y-4">
                    {/* Simplified for brevity - Assume same Plan Form structure but kept here in principle */}
                    <div className="relative p-1 rounded-2xl bg-[#1f2937] border border-white/5 backdrop-blur-xl flex h-14 shadow-inner mb-6">
                        <div className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] rounded-xl bg-[#374151] border border-white/10 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0`} style={{ left: newActivity.type === 'sightseeing' ? '4px' : newActivity.type === 'food' ? 'calc(33.33% + 2px)' : 'calc(66.66%)' }}></div>
                        <button onClick={() => setNewActivity({...newActivity, type: 'sightseeing'})} className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${newActivity.type === 'sightseeing' ? 'text-purple-400' : 'text-slate-400'}`}><CameraIcon className="w-4 h-4" /> 觀光</button>
                        <button onClick={() => setNewActivity({...newActivity, type: 'food'})} className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${newActivity.type === 'food' ? 'text-emerald-400' : 'text-slate-400'}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> 美食</button>
                        <button onClick={() => setNewActivity({...newActivity, type: 'transport'})} className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${newActivity.type === 'transport' ? 'text-yellow-400' : 'text-slate-400'}`}><BusIcon className="w-4 h-4" /> 交通</button>
                    </div>
                    <div><label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">行程名稱</label><div className="bg-[#1f2937] border border-white/5 rounded-2xl p-4 flex items-center gap-3"><span className="text-slate-400"><TagIcon className="w-5 h-5" /></span><input type="text" placeholder="例如：參觀東京鐵塔" className="bg-transparent w-full text-white placeholder-slate-600 focus:outline-none font-medium" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} /></div></div>
                    <div className="flex gap-4"><div className="flex-1"><label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">開始時間</label><div className="bg-[#1f2937] border border-white/5 rounded-2xl p-4 flex items-center gap-3"><span className="text-slate-400"><ClockIcon className="w-5 h-5" /></span><input type="time" className="bg-transparent w-full text-white focus:outline-none font-bold appearance-none" value={newActivity.time} onChange={e => setNewActivity({...newActivity, time: e.target.value})} /></div></div><div className="flex-1"><label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">預計停留</label><div className="bg-[#1f2937] border border-white/5 rounded-2xl px-4 py-3.5 flex items-center gap-3 h-[58px]"><span className="text-slate-400"><ClockIcon className="w-5 h-5" /></span><select className="bg-transparent w-full text-white focus:outline-none font-bold text-sm" value={newActivity.duration} onChange={e => setNewActivity({...newActivity, duration: e.target.value})}>{Array.from({ length: 36 }, (_, i) => (i + 1) * 0.5).map(val => (<option key={val} value={`${val}h`} className="bg-[#1f2937]">{val}h</option>))}</select></div></div></div>
                    <div><label className="text-slate-500 text-[10px] font-bold mb-1.5 block ml-1">地點 (輸入可跳轉地圖)</label><div className="bg-[#1f2937] border border-white/5 rounded-2xl p-4 flex items-center gap-3"><span className="text-slate-400"><MapIcon className="w-5 h-5" /></span><input type="text" placeholder="輸入具體地址或地標" className="bg-transparent w-full text-white placeholder-slate-600 focus:outline-none font-medium" value={newActivity.location} onChange={e => setNewActivity({...newActivity, location: e.target.value})} /></div></div>
                 </div>
             ) : (
                 <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">航班編號</label>
                             <div className="bg-[#1f2937] border border-white/5 rounded-2xl p-3.5">
                                 <input type="text" placeholder="CX500" className="w-full bg-transparent text-white font-bold text-center uppercase focus:outline-none placeholder-slate-600" value={newFlight.flightNumber} onChange={e => setNewFlight({...newFlight, flightNumber: e.target.value.toUpperCase()})} />
                             </div>
                         </div>
                         <div>
                             <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">機型 (選填)</label>
                             <div className="bg-[#1f2937] border border-white/5 rounded-2xl p-3.5">
                                 <input type="text" placeholder="A350" className="w-full bg-transparent text-white font-bold text-center uppercase focus:outline-none placeholder-slate-600" value={newFlight.planeType} onChange={e => setNewFlight({...newFlight, planeType: e.target.value.toUpperCase()})} />
                             </div>
                         </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">出發地代碼</label>
                             <div className="bg-[#1f2937] border border-white/5 rounded-2xl p-4">
                                 <input type="text" placeholder="HKG" className="w-full bg-transparent text-white font-black text-2xl text-center uppercase focus:outline-none placeholder-slate-600" value={newFlight.departureCode} onChange={e => setNewFlight({...newFlight, departureCode: e.target.value.toUpperCase()})} />
                             </div>
                         </div>
                         <div>
                             <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">目的地代碼</label>
                             <div className="bg-[#1f2937] border border-white/5 rounded-2xl p-4">
                                 <input type="text" placeholder="NRT" className="w-full bg-transparent text-white font-black text-2xl text-center uppercase focus:outline-none placeholder-slate-600" value={newFlight.arrivalCode} onChange={e => setNewFlight({...newFlight, arrivalCode: e.target.value.toUpperCase()})} />
                             </div>
                         </div>
                     </div>
                     {/* Departure */}
                     <div className="bg-[#1e293b]/50 rounded-[24px] p-4 border border-white/5">
                         <div className="flex items-center gap-2 mb-4 text-[#38bdf8]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg><span className="font-bold text-sm">出發資訊</span></div>
                         <div className="grid grid-cols-2 gap-4 mb-4">
                             <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5"><input type="date" value={newFlight.departureDate} onChange={e => setNewFlight({...newFlight, departureDate: e.target.value})} className="bg-transparent text-white text-sm font-bold w-full focus:outline-none" /></div>
                             <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5"><input type="time" value={newFlight.departureTime} onChange={e => setNewFlight({...newFlight, departureTime: e.target.value})} className="bg-transparent text-white text-sm font-bold w-full focus:outline-none" /></div>
                         </div>
                         <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5 flex justify-between items-center relative">
                             <select className="absolute inset-0 bg-transparent text-transparent w-full opacity-0 z-10" value={depTz} onChange={e => setDepTz(Number(e.target.value))}>{timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}</select>
                             <span className="text-white text-sm font-bold truncate">{timezones.find(t => t.value === depTz)?.label}</span>
                             <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                         </div>
                     </div>
                     {/* Arrival */}
                     <div className="bg-[#1e293b]/50 rounded-[24px] p-4 border border-white/5">
                         <div className="flex items-center gap-2 mb-4 text-[#34d399]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg><span className="font-bold text-sm">抵達資訊</span></div>
                         <div className="grid grid-cols-2 gap-4 mb-4">
                             <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5"><input type="date" value={newFlight.arrivalDate} onChange={e => setNewFlight({...newFlight, arrivalDate: e.target.value})} className="bg-transparent text-white text-sm font-bold w-full focus:outline-none" /></div>
                             <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5"><input type="time" value={newFlight.arrivalTime} onChange={e => setNewFlight({...newFlight, arrivalTime: e.target.value})} className="bg-transparent text-white text-sm font-bold w-full focus:outline-none" /></div>
                         </div>
                         <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5 flex justify-between items-center relative">
                             <select className="absolute inset-0 bg-transparent text-transparent w-full opacity-0 z-10" value={arrTz} onChange={e => setArrTz(Number(e.target.value))}>{timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}</select>
                             <span className="text-white text-sm font-bold truncate">{timezones.find(t => t.value === arrTz)?.label}</span>
                             <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                         </div>
                     </div>
                 </div>
             )}
             </div>
             {!editingActivityId && (
                 <div className="mt-2 mb-4 relative p-1 rounded-2xl bg-[#1f2937]/50 border border-white/5 backdrop-blur-xl flex h-14 shadow-inner">
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-300 ease-out z-0
                        ${modalMode === 'PLAN' ? 'left-1 bg-gradient-to-tr from-[#38bdf8] to-blue-500' : 'left-[calc(50%+4px)] bg-gradient-to-tr from-sky-400 to-cyan-400'}
                        `}
                    ></div>
                    <button 
                        onClick={() => setModalMode('PLAN')}
                        className={`flex-1 relative z-10 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${modalMode === 'PLAN' ? 'text-white' : 'text-slate-500'}`}
                    >
                        行程規劃
                    </button>
                    <button 
                        onClick={() => setModalMode('FLIGHT')}
                        className={`flex-1 relative z-10 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${modalMode === 'FLIGHT' ? 'text-white' : 'text-slate-500'}`}
                    >
                        <PlaneIcon className="w-4 h-4" />
                        航班資訊
                    </button>
                 </div>
             )}
             <div className="pt-2 flex gap-3 pb-safe">
                 {editingActivityId && <button onClick={handleDeleteActivity} className="w-14 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"><TrashIcon className="w-5 h-5" /></button>}
                 <button onClick={handleSaveActivity} disabled={!isFormValid} className={`flex-1 py-4 rounded-2xl font-bold border transition-all duration-300 shadow-lg ${isFormValid ? 'bg-[#38bdf8] text-white border-transparent shadow-blue-500/30' : 'bg-[#1f2937] text-slate-500 border-white/5 cursor-not-allowed'}`}>{isFormValid ? '儲存變更' : '請填寫完整資訊'}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryTool;
