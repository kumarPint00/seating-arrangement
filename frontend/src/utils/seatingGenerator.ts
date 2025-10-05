import { Seat } from '../types';

export const generateSeatingLayout = (venueWidth: number, venueHeight: number): Seat[] => {
  const seats: Seat[] = [];
  let seatId = 1;
  
  // Configuration for different sections
  const sections = [
    { 
      name: 'Premium', 
      id: 'premium',
      rows: 15, 
      seatsPerRow: 20, 
      price: 150, 
      startY: 100,
      color: '#ff6b6b'
    },
    { 
      name: 'Standard', 
      id: 'standard',
      rows: 25, 
      seatsPerRow: 30, 
      price: 85, 
      startY: 280,
      color: '#4ecdc4'
    },
    { 
      name: 'Economy', 
      id: 'economy',
      rows: 20, 
      seatsPerRow: 25, 
      price: 45, 
      startY: 530,
      color: '#45b7d1'
    }
  ];

  sections.forEach(section => {
    const seatWidth = 12;
    const seatHeight = 12;
    const seatSpacing = 16;
    const rowSpacing = 20;
    
    // Calculate total width needed for seats in this section
    const totalSeatWidth = section.seatsPerRow * seatSpacing;
    const startX = (venueWidth - totalSeatWidth) / 2;

    for (let row = 0; row < section.rows; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
      
      for (let seatNum = 1; seatNum <= section.seatsPerRow; seatNum++) {
        // Add some randomness to availability (90% available)
        const isAvailable = Math.random() > 0.1;
        
        const seat: Seat = {
          id: `${section.id}-${rowLetter}${seatNum}`,
          row: rowLetter,
          number: seatNum.toString(),
          section: section.name,
          x: startX + (seatNum - 1) * seatSpacing,
          y: section.startY + row * rowSpacing,
          price: section.price,
          status: isAvailable ? 'available' : 'occupied',
          priceTier: section.id === 'premium' ? 3 : section.id === 'standard' ? 2 : 1
        };
        
        seats.push(seat);
        seatId++;
      }
    }
  });

  return seats;
};

// Add some special reserved seats (VIP boxes, etc.)
export const addSpecialSeats = (seats: Seat[], venueWidth: number): Seat[] => {
  const vipSeats: Seat[] = [];
  
  // VIP boxes on the sides
  for (let i = 0; i < 8; i++) {
    const leftVip: Seat = {
      id: `vip-left-${i + 1}`,
      row: 'VIP',
      number: (i + 1).toString(),
      section: 'VIP Left',
      x: 50,
      y: 150 + i * 25,
      price: 300,
      status: i < 3 ? 'occupied' : 'available', // Some VIP seats already taken
      priceTier: 3
    };
    
    const rightVip: Seat = {
      id: `vip-right-${i + 1}`,
      row: 'VIP',
      number: (i + 1).toString(),
      section: 'VIP Right',
      x: venueWidth - 70,
      y: 150 + i * 25,
      price: 300,
      status: i < 2 ? 'occupied' : 'available',
      priceTier: 3
    };
    
    vipSeats.push(leftVip, rightVip);
  }
  
  return [...seats, ...vipSeats];
};