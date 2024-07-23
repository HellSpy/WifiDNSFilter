import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import Blocklist from './Blocklist';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_requests: 0,
    most_frequent_domains: [],
    most_blocked_domains: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Total Requests</Typography>
              <Typography variant="h6">{stats.total_requests}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Most Frequent Domains</Typography>
              {stats.most_frequent_domains.length ? (
                stats.most_frequent_domains.map((domain, index) => (
                  <Typography key={index} variant="body2">{domain[0]}: {domain[1]} requests</Typography>
                ))
              ) : (
                <Typography variant="body2">None</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Most Blocked Domains</Typography>
              {stats.most_blocked_domains.length ? (
                stats.most_blocked_domains.map((domain, index) => (
                  <Typography key={index} variant="body2">{domain[0]}: {domain[1]} blocks</Typography>
                ))
              ) : (
                <Typography variant="body2">None</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>Manage Blocklist</Typography>
      <Blocklist />
    </Container>
  );
};

export default Dashboard;
