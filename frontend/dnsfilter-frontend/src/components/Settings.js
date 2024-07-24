import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, TextField, Button, Switch, FormControlLabel } from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    dns_server_ip: '',
    port_number: '',
    enable_logging: true,
    log_retention: 30
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: checked,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/settings', settings);
      console.log('Settings saved:', response.data);
    } catch (error) {
      console.error('Error saving settings', error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Network Settings</Typography>
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
        <TextField
          label="DNS Server IP"
          name="dns_server_ip"
          value={settings.dns_server_ip}
          onChange={handleChange}
          fullWidth
          style={{ marginBottom: '16px' }}
        />
        <TextField
          label="Port Number"
          name="port_number"
          type="number"
          value={settings.port_number}
          onChange={handleChange}
          fullWidth
          style={{ marginBottom: '16px' }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.enable_logging}
              onChange={handleSwitchChange}
              name="enable_logging"
            />
          }
          label="Enable Logging"
        />
        <TextField
          label="Log Retention Period (days)"
          name="log_retention"
          type="number"
          value={settings.log_retention}
          onChange={handleChange}
          fullWidth
          style={{ marginBottom: '16px' }}
        />
        <Button variant="contained" color="primary" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </Paper>
    </Container>
  );
};

export default Settings;
