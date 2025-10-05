import React from 'react';
import { Seat as SeatType } from '../types';

interface SeatProps {
  seat: SeatType;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  isSelected: boolean;
}

const Seat: React.FC<SeatProps> = ({ seat, onClick, onKeyDown, isSelected }) => {
  const getSeatColor = () => {
    switch (seat.status) {
      case 'available':
        return seat.priceTier === 3 ? '#ff6b6b' :   // Premium - red
               seat.priceTier === 2 ? '#4ecdc4' :    // Standard - teal  
               '#45b7d1';                             // Economy - blue
      case 'selected':
        return '#ffd700';                             // Gold for selected
      case 'occupied':
      case 'reserved':
        return '#999999';                             // Gray for unavailable
      case 'held':
        return '#ff8c00';                             // Orange for held
      default:
        return '#cccccc';
    }
  };

  const getSeatOpacity = () => {
    return seat.status === 'occupied' || seat.status === 'reserved' || seat.status === 'held' ? 0.5 : 1;
  };

  const getSeatBorder = () => {
    return isSelected ? '#333333' : '#ffffff';
  };

  const getSeatAriaLabel = () => {
    const priceTier = seat.priceTier === 3 ? 'Premium' : seat.priceTier === 2 ? 'Standard' : 'Economy';
    return `Seat ${seat.row}-${seat.number}, ${priceTier} section, $${seat.price}, ${seat.status}`;
  };

  const isInteractive = seat.status === 'available' || seat.status === 'selected';

  return (
    <circle
      cx={seat.x}
      cy={seat.y}
      r={8}
      fill={getSeatColor()}
      stroke={getSeatBorder()}
      strokeWidth={1}
      className="seat"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label={getSeatAriaLabel()}
      style={{
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        opacity: getSeatOpacity()
      }}
    />
  );
};

export default Seat;