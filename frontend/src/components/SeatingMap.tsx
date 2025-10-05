import React, { useEffect, useCallback, useMemo } from 'react';
import { Seat } from '../types';
import SeatComponent from './Seat';
import SelectionSummary from './SelectionSummary';
import ZoomControls from './ZoomControls';
import ErrorNotification from './ErrorNotification';
// Note: Using venue.json data instead of generated seating
import { usePanZoom } from '../hooks/usePanZoom';
import { useSeatingStore } from '../store/seatingStore';
import './SeatingMap.css';

const SeatingMap: React.FC = () => {
  // Zustand store
  const {
    venue,
    seats,
    selectedSeats,
    loading,
    error,
    selectionError,
    setVenue,
    setSeats,
    selectSeat,
    deselectSeat,
    setLoading,
    setError,
    clearSelectionError
  } = useSeatingStore();

  // Pan and zoom functionality for mobile
  const { elementRef, transform, scale, resetZoom, zoomIn, zoomOut } = usePanZoom({
    minZoom: 0.5,
    maxZoom: 3,
    enabled: true
  });

  // Load venue data from public/venue.json as required
  useEffect(() => {
    const loadVenueData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/venue-clean.json');
        if (!response.ok) {
          throw new Error('Failed to load venue data');
        }
        const data = await response.json();
        setVenue(data);
        
        // Extract seats from venue sections
        const allSeats: Seat[] = [];
        if (data.sections) {
          data.sections.forEach((section: any) => {
            if (section.rows) {
              section.rows.forEach((row: any) => {
                if (row.seats) {
                  row.seats.forEach((seat: any) => {
                    // Calculate price based on price tier
                    const price = data.priceTiers[seat.priceTier]?.price || 0;
                    
                    allSeats.push({
                      id: seat.id,
                      row: row.index.toString(),
                      number: seat.col.toString(),
                      section: section.id,
                      x: seat.x,
                      y: seat.y,
                      price: price,
                      priceTier: seat.priceTier,
                      status: seat.status
                    });
                  });
                }
              });
            }
          });
        }
        setSeats(allSeats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadVenueData();
  }, [setVenue, setSeats, setLoading, setError]);

  // Handle seat selection with Zustand store
  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'reserved' || seat.status === 'held') {
      return; // Can't select unavailable seats
    }

    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isAlreadySelected) {
      deselectSeat(seat.id);
    } else {
      selectSeat(seat);
    }
  }, [selectedSeats, selectSeat, deselectSeat]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, seat: Seat) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSeatClick(seat);
    }
  }, [handleSeatClick]);

  // Memoized seat rendering for performance - limit seats for better performance
  const renderedSeats = useMemo(() => {
    // For performance, we'll sample seats or limit the display
    const maxSeatsToRender = 5000; // Limit for smooth performance
    const seatsToRender = seats.length > maxSeatsToRender 
      ? seats.filter((seat, index) => index % Math.ceil(seats.length / maxSeatsToRender) === 0)
      : seats;

    return seatsToRender.map(seat => {
      const isSelected = selectedSeats.some(s => s.id === seat.id);
      const seatStatus = isSelected ? 'selected' : seat.status;
      
      return (
        <SeatComponent
          key={seat.id}
          seat={{ ...seat, status: seatStatus }}
          onClick={() => handleSeatClick(seat)}
          onKeyDown={(event: React.KeyboardEvent) => handleKeyDown(event, seat)}
          isSelected={isSelected}
        />
      );
    });
  }, [seats, selectedSeats, handleSeatClick, handleKeyDown]);

  if (loading) {
    return (
      <div className="seating-map-loading" role="status" aria-live="polite">
        <p>Loading seating map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seating-map-error" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="seating-map-error" role="alert">
        <p>Error loading venue data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="seating-map-container">
      {/* Error notification for seat selection limit */}
      <ErrorNotification 
        message={selectionError}
        onClose={clearSelectionError}
      />
      
      <div className="seating-map-header">
        <h2>{venue.name}</h2>
        <div className="legend">
          <div className="legend-status">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-color occupied"></div>
              <span>Occupied</span>
            </div>
            <div className="legend-item">
              <div className="legend-color reserved"></div>
              <span>Reserved</span>
            </div>
            <div className="legend-item">
              <div className="legend-color held"></div>
              <span>Held</span>
            </div>
          </div>
          
          <div className="price-legend">
            <div className="price-item">
              <div className="price-color premium"></div>
              <span>Premium ($150)</span>
            </div>
            <div className="price-item">
              <div className="price-color standard"></div>
              <span>Standard ($85)</span>
            </div>
            <div className="price-item">
              <div className="price-color economy"></div>
              <span>Economy ($45)</span>
            </div>
          </div>
          
          <div className="performance-info">
            <span className="seat-count">
              Showing {Math.min(seats.length, 5000).toLocaleString()} of {seats.length.toLocaleString()} seats
            </span>
          </div>
        </div>
      </div>
      
      <div className="seating-map-content">
        <div className="venue-container">
          <ZoomControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
            scale={scale}
          />
          <svg
            ref={elementRef}
            className="venue-svg"
            width="100%"
            height="100%"
            viewBox={`0 0 ${venue.map?.width || 1200} ${venue.map?.height || 900}`}
            role="img"
            aria-label={`Seating map for ${venue.name}`}
            style={{ transform }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect
              x="0"
              y="0"
              width={venue.map?.width || 1200}
              height={venue.map?.height || 900}
              fill="#f8f9fa"
            />
            
            {/* Stage area */}
            <rect
              x={(venue.map?.width || 1200) * 0.25}
              y={(venue.map?.height || 900) - 100}
              width={(venue.map?.width || 1200) * 0.5}
              height={60}
              fill="#2c3e50"
              rx={8}
            />
            <text
              x={(venue.map?.width || 1200) / 2}
              y={(venue.map?.height || 900) - 65}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              STAGE
            </text>
            
            {/* Section backgrounds for visual grouping */}
            {venue.sections && venue.sections.map((section: any, index: number) => {
              // Calculate section bounds based on actual seat positions
              let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
              
              section.rows?.forEach((row: any) => {
                row.seats?.forEach((seat: any) => {
                  minX = Math.min(minX, seat.x);
                  maxX = Math.max(maxX, seat.x);
                  minY = Math.min(minY, seat.y);
                  maxY = Math.max(maxY, seat.y);
                });
              });
              
              const padding = 25;
              const labelHeight = 35;
              
              return (
                <g key={section.id}>
                  {/* Section background - positioned around actual seats with padding */}
                  <rect
                    x={minX - padding}
                    y={minY - padding - labelHeight}
                    width={maxX - minX + padding * 2}
                    height={maxY - minY + padding * 2 + labelHeight}
                    fill="rgba(52, 152, 219, 0.03)"
                    stroke="rgba(52, 152, 219, 0.15)"
                    strokeWidth="1"
                    rx="8"
                  />
                  {/* Section label - positioned above the seats */}
                  <text
                    x={minX - padding + 10}
                    y={minY - padding - labelHeight + 20}
                    fill="#34495e"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {section.label}
                  </text>
                </g>
              );
            })}
            
            {/* Render all seats */}
            {renderedSeats}
          </svg>
        </div>
        
        <SelectionSummary
          selectedSeats={selectedSeats}
          onClearSelection={() => useSeatingStore.getState().clearSelection()}
        />
      </div>
    </div>
  );
};

export default SeatingMap;