import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Seat, Venue } from '../types';

interface SeatingStore {
  // State
  venue: Venue | null;
  seats: Seat[];
  selectedSeats: Seat[];
  loading: boolean;
  error: string | null;
  selectionError: string | null;
  
  // Actions
  setVenue: (venue: Venue) => void;
  setSeats: (seats: Seat[]) => void;
  selectSeat: (seat: Seat) => void;
  deselectSeat: (seatId: string) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelectionError: () => void;
  
  // Computed values
  getTotalPrice: () => number;
  getSelectionSummary: () => {
    count: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

export const useSeatingStore = create<SeatingStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    venue: null,
    seats: [],
    selectedSeats: [],
    loading: true,
    error: null,
    selectionError: null,
    
    // Actions
    setVenue: (venue) => set({ venue }),
    
    setSeats: (seats) => set({ seats }),
    
    selectSeat: (seat) => {
      const { selectedSeats } = get();
      
      // Check if seat is already selected
      const isSelected = selectedSeats.some(s => s.id === seat.id);
      if (isSelected) return;
      
      // Check max selection limit
      if (selectedSeats.length >= 8) {
        set({ selectionError: 'Maximum 8 seats can be selected' });
        return;
      }
      
      // Clear any previous error
      if (get().selectionError) {
        set({ selectionError: null });
      }
      
      set({ selectedSeats: [...selectedSeats, seat] });
    },
    
    deselectSeat: (seatId) => {
      const { selectedSeats } = get();
      set({ 
        selectedSeats: selectedSeats.filter(seat => seat.id !== seatId),
        selectionError: null
      });
    },
    
    clearSelection: () => set({ selectedSeats: [], selectionError: null }),
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),
    
    clearSelectionError: () => set({ selectionError: null }),
    
    // Computed values
    getTotalPrice: () => {
      const { selectedSeats } = get();
      return selectedSeats.reduce((total, seat) => total + seat.price, 0);
    },
    
    getSelectionSummary: () => {
      const { selectedSeats } = get();
      const subtotal = selectedSeats.reduce((total, seat) => total + seat.price, 0);
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;
      
      return {
        count: selectedSeats.length,
        subtotal,
        tax,
        total
      };
    }
  }))
);

// Sync with localStorage
useSeatingStore.subscribe(
  (state) => state.selectedSeats,
  (selectedSeats) => {
    if (selectedSeats.length > 0) {
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    } else {
      localStorage.removeItem('selectedSeats');
    }
  }
);

// Load from localStorage on initialization
const savedSeats = localStorage.getItem('selectedSeats');
if (savedSeats) {
  try {
    const seats = JSON.parse(savedSeats) as Seat[];
    useSeatingStore.setState({ selectedSeats: seats });
  } catch (error) {
    console.warn('Failed to load saved seats from localStorage:', error);
    localStorage.removeItem('selectedSeats');
  }
}