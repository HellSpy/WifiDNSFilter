import React from 'react';
import Blocklist from './components/Blocklist';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DNS Filter</h1>
      </header>
      <main>
        <Blocklist />
      </main>
    </div>
  );
}

export default App;
