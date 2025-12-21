
export type TripType = 'Single' | 'Multi';

export interface Budget {
  amount: number;
  currency: string; // e.g., 'HKD', 'JPY'
  type: 'total' | 'cash_only'; // 'total' = Cash + Card, 'cash_only' = Cash only
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: TripType;
  activities: Record<string, Activity[]>; // Date string key -> Activities
  expenses: Expense[];
  packingList: PackingItem[];
  budget?: Budget; // Optional for backward compatibility, but we will init it
}

export interface FlightInfo {
  flightNumber: string;
  planeType: string;
  departureCode: string;
  arrivalCode: string;
  departureDate: string;
  departureTime: string;
  departureTimezone: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalTimezone: string;
  duration: string;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  location?: string;
  completed: boolean;
  type: 'sightseeing' | 'food' | 'transport' | 'flight';
  duration?: string;
  description?: string;
  flightInfo?: FlightInfo;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string; // The currency this expense was paid in
  category: string;
  date: string;
  isPreTrip: boolean; // true = Pre-trip, false = On-trip
  paymentMethod: 'cash' | 'card' | 'other';
}

export interface PackingItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

export enum Tab {
  ITINERARY = 'ITINERARY',
  EXPENSES = 'EXPENSES',
  PACKING = 'PACKING',
  TOOLBOX = 'TOOLBOX',
  SETTINGS = 'SETTINGS'
}

export interface ItineraryActivity {
  time: string;
  activity: string;
  description: string;
  location: string;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  activities: ItineraryActivity[];
}

export interface PackingCategory {
  category: string;
  items: string[];
}

export interface Phrase {
  original: string;
  pronunciation: string;
  translation: string;
  usageContext: string;
}

export interface FoodItem {
  name: string;
  description: string;
  priceRange: string;
  bestPlaceToTry: string;
}
