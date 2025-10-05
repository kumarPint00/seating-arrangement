import React from 'react';
import { Seat } from '../types';
import './SelectionSummary.css';

interface SelectionSummaryProps {
  selectedSeats: Seat[];
  onClearSelection: () => void;
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({ 
  selectedSeats, 
  onClearSelection 
}) => {
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  if (selectedSeats.length === 0) {
    return (
      <div className="selection-summary empty">
        <h3>Your Selection</h3>
        <p>No seats selected</p>
        <p className="instruction">Click on available seats to select them (max 8 seats)</p>
      </div>
    );
  }

  return (
    <div className="selection-summary">
      <div className="summary-header">
        <h3>Your Selection ({selectedSeats.length}/8)</h3>
        <button 
          className="clear-button"
          onClick={onClearSelection}
          aria-label="Clear all selected seats"
        >
          Clear All
        </button>
      </div>
      
      <div className="selected-seats">
        {selectedSeats.map(seat => (
          <div key={seat.id} className="selected-seat">
            <div className="seat-info">
              <span className="seat-location">
                {seat.section} - {seat.row}{seat.number}
              </span>
              <span className="seat-price">${seat.price}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pricing-summary">
        <div className="price-line">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="price-line">
          <span>Tax (8%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="price-line total">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <button className="purchase-button" disabled={selectedSeats.length === 0}>
        Purchase Tickets
      </button>
    </div>
  );
};

export default SelectionSummary;