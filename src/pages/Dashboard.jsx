import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { 
  People, 
  CheckCircle, 
  Schedule, 
  BarChart,
  Logout,
  Person,
  Today,
  AccessTime
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MiniDrawer from '../components/MiniDrawer';
import { useThemeContext } from '../context/ThemeContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/');
  };

  const statsCards = [
    {
      title: 'Total Visitors',
      value: '1,234',
      icon: <People fontSize="large" />,
      color: '#2196f3',
      change: '+12%',
    },
    {
      title: 'Active Visits',
      value: '42',
      icon: <CheckCircle fontSize="large" />,
      color: '#4caf50',
      change: '+5%',
    },
    {
      title: 'Scheduled',
      value: '18',
      icon: <Schedule fontSize="large" />,
      color: '#ff9800',
      change: '+3%',
    },
    {
      title: 'Monthly Stats',
      value: '+15%',
      icon: <BarChart fontSize="large" />,
      color: '#9c27b0',
      change: '+2%',
    },
  ];

  const recentVisitors = [
    { name: 'John Doe', time: '10:30 AM', purpose: 'Meeting', avatar: 'JD' },
    { name: 'Jane Smith', time: '11:15 AM', purpose: 'Interview', avatar: 'JS' },
    { name: 'Robert Johnson', time: '1:45 PM', purpose: 'Delivery', avatar: 'RJ' },
    { name: 'Sarah Wilson', time: '2:30 PM', purpose: 'Client Visit', avatar: 'SW' },
    { name: 'Mike Brown', time: '3:15 PM', purpose: 'Maintenance', avatar: 'MB' },
  ];

  return (
    <MiniDrawer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {username}!
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Here's what's happening with your visitors today.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleLogout}
          startIcon={<Logout />}
        >
          Logout
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Last 24 hours
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {card.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: card.change.startsWith('+') ? '#4caf50' : '#f44336',
                      fontWeight: 'bold'
                    }}
                  >
                    {card.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Visitors */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Today sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Recent Visitors
              </Typography>
            </Box>
            <List>
              {recentVisitors.map((visitor, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {visitor.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">
                            {visitor.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            <AccessTime sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                            {visitor.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          Purpose: {visitor.purpose}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentVisitors.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Today's Visitors
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  24
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Avg. Visit Duration
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  45m
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Check-ins Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  18
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Pending Approvals
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  3
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </MiniDrawer>
  );
};

export default Dashboard;