// Generate venue.json with ~15,000 seats
const fs = require('fs');

function generateVenueData() {
  const venue = {
    venueId: "arena-01",
    name: "Metropolis Arena", 
    map: { width: 1200, height: 900 },
    priceTiers: {
      "1": { price: 45, label: "Economy" },
      "2": { price: 85, label: "Standard" }, 
      "3": { price: 150, label: "Premium" }
    },
    sections: []
  };

  const sections = [
    // Lower Bowl - Premium seats (closest to stage)
    { id: "LOWER_A", label: "Lower Bowl A", baseX: 100, baseY: 650, rows: 20, seatsPerRow: 30, priceTier: 3 },
    { id: "LOWER_B", label: "Lower Bowl B", baseX: 750, baseY: 650, rows: 20, seatsPerRow: 30, priceTier: 3 },
    { id: "LOWER_C", label: "Lower Bowl C", baseX: 300, baseY: 700, rows: 18, seatsPerRow: 35, priceTier: 3 },
    { id: "LOWER_D", label: "Lower Bowl D", baseX: 500, baseY: 700, rows: 18, seatsPerRow: 35, priceTier: 3 },
    
    // Middle Tier - Standard seats  
    { id: "MID_A", label: "Middle Tier A", baseX: 50, baseY: 400, rows: 25, seatsPerRow: 40, priceTier: 2 },
    { id: "MID_B", label: "Middle Tier B", baseX: 650, baseY: 400, rows: 25, seatsPerRow: 40, priceTier: 2 },
    { id: "MID_C", label: "Middle Tier C", baseX: 200, baseY: 450, rows: 22, seatsPerRow: 45, priceTier: 2 },
    { id: "MID_D", label: "Middle Tier D", baseX: 500, baseY: 450, rows: 22, seatsPerRow: 45, priceTier: 2 },
    { id: "MID_E", label: "Middle Tier E", baseX: 350, baseY: 500, rows: 20, seatsPerRow: 50, priceTier: 2 },
    
    // Upper Tier - Economy seats
    { id: "UPPER_A", label: "Upper Tier A", baseX: 25, baseY: 100, rows: 30, seatsPerRow: 50, priceTier: 1 },
    { id: "UPPER_B", label: "Upper Tier B", baseX: 600, baseY: 100, rows: 30, seatsPerRow: 50, priceTier: 1 },
    { id: "UPPER_C", label: "Upper Tier C", baseX: 150, baseY: 150, rows: 28, seatsPerRow: 55, priceTier: 1 },
    { id: "UPPER_D", label: "Upper Tier D", baseX: 450, baseY: 150, rows: 28, seatsPerRow: 55, priceTier: 1 },
    { id: "UPPER_E", label: "Upper Tier E", baseX: 300, baseY: 50, rows: 25, seatsPerRow: 60, priceTier: 1 },
    
    // Balcony sections - Economy
    { id: "BALCONY_A", label: "Balcony A", baseX: 75, baseY: 25, rows: 15, seatsPerRow: 35, priceTier: 1 },
    { id: "BALCONY_B", label: "Balcony B", baseX: 575, baseY: 25, rows: 15, seatsPerRow: 35, priceTier: 1 }
  ];

  const statusOptions = ["available", "reserved", "sold", "held"];
  let totalSeats = 0;

  sections.forEach(sectionConfig => {
    const section = {
      id: sectionConfig.id,
      label: sectionConfig.label,
      transform: { x: 0, y: 0, scale: 1 },
      rows: []
    };

    for (let rowIndex = 1; rowIndex <= sectionConfig.rows; rowIndex++) {
      const row = {
        index: rowIndex,
        seats: []
      };

      for (let seatCol = 1; seatCol <= sectionConfig.seatsPerRow; seatCol++) {
        // Calculate position with slight curve for realism
        const baseX = sectionConfig.baseX + (seatCol - 1) * 25;
        const baseY = sectionConfig.baseY - (rowIndex - 1) * 30;
        
        // Add slight curve based on distance from center
        const centerX = sectionConfig.baseX + (sectionConfig.seatsPerRow * 25) / 2;
        const curveOffset = Math.sin((seatCol / sectionConfig.seatsPerRow) * Math.PI) * 5;
        
        const seat = {
          id: `${sectionConfig.id}-${rowIndex}-${seatCol.toString().padStart(2, '0')}`,
          col: seatCol,
          x: baseX + curveOffset,
          y: baseY,
          priceTier: sectionConfig.priceTier,
          status: statusOptions[Math.floor(Math.random() * 100) < 85 ? 0 : Math.floor(Math.random() * 4)]
        };

        row.seats.push(seat);
        totalSeats++;
      }

      section.rows.push(row);
    }

    venue.sections.push(section);
  });

  console.log(`Generated venue with ${totalSeats} total seats`);
  return venue;
}

const venueData = generateVenueData();
fs.writeFileSync('/home/ravi/linkdenproject/frontend/public/venue.json', JSON.stringify(venueData, null, 2));
console.log('Venue data written to public/venue.json');