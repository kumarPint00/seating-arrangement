import { generateSeatingLayout, addSpecialSeats } from '../utils/seatingGenerator';

describe('seatingGenerator', () => {
  describe('generateSeatingLayout', () => {
    test('should generate seats for each section', () => {
      const seats = generateSeatingLayout(1200, 800);
      
      expect(seats.length).toBeGreaterThan(0);
      
      // Check that we have seats from each section
      const sections = ['Premium', 'Standard', 'Economy'];
      sections.forEach(section => {
        const sectionSeats = seats.filter(seat => seat.section === section);
        expect(sectionSeats.length).toBeGreaterThan(0);
      });
    });

    test('should generate seats with valid coordinates', () => {
      const seats = generateSeatingLayout(1200, 800);
      
      seats.forEach(seat => {
        expect(seat.x).toBeGreaterThanOrEqual(0);
        expect(seat.x).toBeLessThanOrEqual(1200);
        expect(seat.y).toBeGreaterThanOrEqual(0);
        expect(seat.y).toBeLessThanOrEqual(800);
      });
    });

    test('should generate seats with valid pricing', () => {
      const seats = generateSeatingLayout(1200, 800);
      
      seats.forEach(seat => {
        expect(seat.price).toBeGreaterThan(0);
        expect([1, 2, 3]).toContain(seat.priceTier);
      });
    });
  });

  describe('addSpecialSeats', () => {
    test('should add VIP seats to existing layout', () => {
      const baseSeats = generateSeatingLayout(1200, 800);
      const seatsWithVip = addSpecialSeats(baseSeats, 1200);
      
      expect(seatsWithVip.length).toBeGreaterThan(baseSeats.length);
      
      // Check for VIP seats
      const vipSeats = seatsWithVip.filter(seat => seat.section.includes('VIP'));
      expect(vipSeats.length).toBeGreaterThan(0);
    });

    test('should place VIP seats at venue edges', () => {
      const baseSeats = generateSeatingLayout(1200, 800);
      const seatsWithVip = addSpecialSeats(baseSeats, 1200);
      
      const vipSeats = seatsWithVip.filter(seat => seat.section.includes('VIP'));
      
      vipSeats.forEach(seat => {
        // VIP seats should be at the edges (left or right side)
        expect(seat.x < 100 || seat.x > 1100).toBeTruthy();
      });
    });
  });
});