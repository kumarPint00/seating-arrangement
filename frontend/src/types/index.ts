export interface Seat {
  id: string;
  row: string;
  number: string;
  section: string;
  x: number;
  y: number;
  price: number;
  status: 'available' | 'selected' | 'occupied' | 'reserved' | 'held';
  priceTier: number;
}

export interface Selection {
  seats: Seat[];
  subtotal: number;
}

export interface Venue {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  priceTiers: {
    [key: string]: {
      price: number;
      label: string;
    };
  };
  sections: any[];
}

export interface VenueSection {
  id: string;
  name: string;
  color: string;
  seats: number;
}