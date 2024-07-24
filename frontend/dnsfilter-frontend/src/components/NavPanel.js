// components/NavPanel.js

import React from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar, Typography } from '@mui/material';

const NavPanel = ({ setActivePage }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap>
          DNS Filter
        </Typography>
      </Toolbar>
      <List>
        <ListItem button onClick={() => setActivePage('Blocklist')}>
          <ListItemText primary="Blocklist" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Analytics')}>
          <ListItemText primary="Analytics Panel" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Logs')}>
          <ListItemText primary="Logs" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Help')}>
          <ListItemText primary="Help" />
        </ListItem>
        <ListItem button onClick={() => setActivePage('Settings')}>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default NavPanel;
