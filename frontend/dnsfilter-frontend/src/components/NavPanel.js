// components/NavPanel.js
import React from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar, Typography, ListItemIcon } from '@mui/material';
import { Dashboard, ListAlt, Settings, HelpOutline, Assignment } from '@mui/icons-material';

const NavPanel = ({ setActivePage }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: '#173B45', color: '#F8EDED' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ color: '#FF8225' }}>
          DNS Filter
        </Typography>
      </Toolbar>
      <List>
        <ListItem button onClick={() => setActivePage('Blocklist')}>
          <ListItemIcon sx={{ color: '#F8EDED' }}>
            <ListAlt />
          </ListItemIcon>
          <ListItemText primary="Blocklist" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Analytics')}>
          <ListItemIcon sx={{ color: '#F8EDED' }}>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Analytics Panel" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Logs')}>
          <ListItemIcon sx={{ color: '#F8EDED' }}>
            <Assignment />
          </ListItemIcon>
          <ListItemText primary="Logs" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Help')}>
          <ListItemIcon sx={{ color: '#F8EDED' }}>
            <HelpOutline />
          </ListItemIcon>
          <ListItemText primary="Help" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Settings')}>
          <ListItemIcon sx={{ color: '#F8EDED' }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default NavPanel;
