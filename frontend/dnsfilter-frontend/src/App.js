// App.js

import React, { useState } from 'react';
import { CssBaseline, Box, Toolbar, Typography, Container } from '@mui/material';
import NavPanel from './components/NavPanel';
import Blocklist from './components/Blocklist';
import Analytics from './components/Analytics'; // Renamed from Dashboard to Analytics
import Settings from './components/Settings';
import Logs from './components/Logs';
import Help from './components/Help';

function App() {
  const [activePage, setActivePage] = useState('Blocklist');

  const renderContent = () => {
    switch (activePage) {
      case 'Blocklist':
        return <Blocklist />;
      case 'Analytics':
        return <Analytics />;
      case 'Settings':
        return <Settings />;
      case 'Logs':
        return <Logs />;
      case 'Help':
        return <Help />;
      default:
        return <Blocklist />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <NavPanel setActivePage={setActivePage} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          marginLeft: '100px',
          marginRight: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom>
            {activePage === 'Blocklist' ? 'Manage Blocklist' : 
             activePage === 'Analytics' ? 'Analytics Panel' : 
             activePage === 'Settings' ? 'Settings' :
             activePage === 'Logs' ? 'Logs' :
             activePage === 'Help' ? 'Help & FAQ' :
             'Manage Blocklist'}
          </Typography>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
}

export default App;
