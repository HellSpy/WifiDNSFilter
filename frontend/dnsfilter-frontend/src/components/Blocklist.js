import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, List, ListItem, ListItemText, IconButton, Container, Typography, Paper, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

const Blocklist = () => {
  const [blocklist, setBlocklist] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchBlocklist();
  }, []);

  const fetchBlocklist = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/blocklist');
      setBlocklist(response.data);
    } catch (error) {
      console.error('Error fetching blocklist', error);
    }
  };

  const addDomain = async () => {
    try {
      await axios.post('http://localhost:5000/api/add_blocklist', { domain: newDomain });
      fetchBlocklist();
      setNewDomain('');
    } catch (error) {
      console.error('Error adding domain', error);
    }
  };

  const removeDomain = async (domain) => {
    try {
      await axios.post('http://localhost:5000/api/remove_blocklist', { domain });
      fetchBlocklist();
    } catch (error) {
      console.error('Error removing domain', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log('File selected:', selectedFile); // Debug log for file selection
    if (selectedFile) {
      console.log('File name:', selectedFile.name); // Additional debug log for file name
    } else {
      console.log('No file selected'); // Log if no file is selected
    }
  };

  const importBlocklist = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      console.log('Sending file to backend:', file); // Debug log for file sending
      const response = await axios.post('http://localhost:5000/api/import_blocklist', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Backend response:', response.data); // Debug log for backend response
      fetchBlocklist();
      setFile(null);
    } catch (error) {
      console.error('Error importing blocklist', error);
    }
  };

  const exportBlocklist = () => {
    window.location.href = 'http://localhost:5000/api/export_blocklist';
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
        <TextField
          label="Add domain to blocklist"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          fullWidth
          style={{ marginBottom: '16px' }}
        />
        <Button variant="contained" color="primary" onClick={addDomain}>Add</Button>
      </Paper>
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
        <Typography variant="h6">Current Blocklist</Typography>
        <List>
          {blocklist.map((domain) => (
            <ListItem key={domain} secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => removeDomain(domain)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText primary={domain} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px' }}>
        <input
          accept="application/json"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" startIcon={<UploadIcon />}>
            Upload Blocklist
          </Button>
        </label>
        <Button variant="contained" color="secondary" onClick={importBlocklist} disabled={!file} style={{ marginLeft: '16px' }}>
          Import
        </Button>
        <Button variant="contained" color="primary" onClick={exportBlocklist} startIcon={<DownloadIcon />} style={{ marginLeft: '16px' }}>
          Export Blocklist
        </Button>
      </Paper>
    </Container>
  );
};

export default Blocklist;
