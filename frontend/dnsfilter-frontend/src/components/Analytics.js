import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6666', '#6AFF66', '#66FFD9', '#668CFF', '#C066FF'];

const Analytics = () => {
  const [stats, setStats] = useState({
    total_requests: 0,
    most_frequent_domains: [],
    most_blocked_domains: [],
    timeline_data: []
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
      <Typography variant="h5" gutterBottom>Analytics information here</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#B43F3F' }}>Total Requests</Typography>
              <Typography variant="h6">{stats.total_requests}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#B43F3F' }}>Requests Over Time</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.timeline_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#B43F3F' }}>Most Frequent Domains</Typography>
              {stats.most_frequent_domains.length ? (
                <>
                  <BarChart width={500} height={300} data={stats.most_frequent_domains.map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                  <TableContainer component={Paper} style={{ backgroundColor: '#F8EDED' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Domain</TableCell>
                          <TableCell align="right">Requests</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.most_frequent_domains.map(([name, value]) => (
                          <TableRow key={name}>
                            <TableCell component="th" scope="row">{name}</TableCell>
                            <TableCell align="right">{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography variant="body2">None</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#B43F3F' }}>Most Blocked Domains</Typography>
              {stats.most_blocked_domains.length ? (
                <>
                  <PieChart width={400} height={400}>
                    <Pie
                      data={stats.most_blocked_domains.map(([name, value]) => ({ name, value }))}
                      cx={200}
                      cy={200}
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.most_blocked_domains.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                  <TableContainer component={Paper} style={{ backgroundColor: '#F8EDED' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Domain</TableCell>
                          <TableCell align="right">Blocks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.most_blocked_domains.map(([name, value]) => (
                          <TableRow key={name}>
                            <TableCell component="th" scope="row">{name}</TableCell>
                            <TableCell align="right">{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography variant="body2">None</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
