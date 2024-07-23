import React from 'react';
import './App.css';
import Blocklist from './components/Blocklist';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DNS Filter</h1>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
