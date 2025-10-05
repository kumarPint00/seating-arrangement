import React from 'react';
import './App.css';
import SeatingMap from './components/SeatingMap';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Event Seating Map</h1>
        <p>Select up to 8 seats for your event</p>
      </header>
      <main className="App-main">
        <SeatingMap />
      </main>
    </div>
  );
};

export default App;
