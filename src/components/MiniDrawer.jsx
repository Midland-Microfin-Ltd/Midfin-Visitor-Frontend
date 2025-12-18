import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  ManageAccounts as ManageAccountsIcon,
  ConfirmationNumber as PassIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';

const drawerWidth = 240;
const miniDrawerWidth = 73;

const menuItems = [
  // { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Visitors', icon: <PeopleIcon />, path: '/visitors' },
  { text: 'Management', icon: <ManageAccountsIcon />, path: '/management' },
  { text: 'Passes', icon: <PassIcon />, path: '/passes' }
];

const MiniDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeContext();
  const username = localStorage.getItem('username') || 'User';

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getUserInitials = () => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: { sm: open ? drawerWidth : miniDrawerWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.3s ease',
        }}
      >
        {/* Permanent drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : miniDrawerWidth,
              overflowX: 'hidden',
              transition: 'width 0.3s ease',
              backgroundColor: mode === 'dark' ? '#2A303D' : '#CFD4DE',
              borderRight: mode === 'dark' ? '1px solid #2D3748' : '1px solid #E2E8F0',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
          open={open}
        >
          {/* Header Section */}
          <Box>
            <Toolbar>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: open ? 'space-between' : 'center',
                width: '100%' 
              }}>
                {open && (
                  <Typography 
                    variant="h6" 
                    noWrap 
                    component="div"
                    sx={{ 
                      color: mode === 'dark' ? '#FFFFFF' : '#1A202E',
                      fontWeight: 'bold',
                    }}
                  >
                    VMS
                  </Typography>
                )}
                <IconButton onClick={handleDrawerToggle}>
                  {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
              </Box>
            </Toolbar>
            <Divider />
            
            {/* User Profile Section */}
            {open && (
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: mode === 'dark' ? '#4299E1' : '#3182CE',
                    width: 40,
                    height: 40,
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: mode === 'dark' ? '#FFFFFF' : '#1A202E',
                      fontWeight: 'medium',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {username}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: mode === 'dark' ? '#CBD5E0' : '#718096',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Administrator
                  </Typography>
                </Box>
              </Box>
            )}
            {!open && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: mode === 'dark' ? '#4299E1' : '#3182CE',
                    width: 32,
                    height: 32,
                  }}
                >
                  {getUserInitials().charAt(0)}
                </Avatar>
              </Box>
            )}
            
            <Divider />
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem 
                  key={item.text} 
                  disablePadding 
                  sx={{ 
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      backgroundColor: isActive(item.path) 
                        ? (mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                      borderRadius: 2,
                      mx: 1,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive(item.path) 
                          ? (mode === 'dark' ? '#90caf9' : '#1976d2')
                          : (mode === 'dark' ? '#CBD5E0' : '#718096'),
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ 
                        opacity: open ? 1 : 0,
                        color: isActive(item.path) 
                          ? (mode === 'dark' ? '#FFFFFF' : '#1A202E')
                          : (mode === 'dark' ? '#CBD5E0' : '#718096'),
                        fontWeight: isActive(item.path) ? 'bold' : 'normal',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Footer Section with Theme Toggle and Logout */}
          <Box sx={{ mt: 'auto' }}>
            <Divider />
            
            {/* Theme Toggle */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={toggleTheme}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  mt: 1,
                  '&:hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: mode === 'dark' ? '#F6E05E' : '#D69E2E',
                  }}
                >
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: mode === 'dark' ? '#CBD5E0' : '#718096',
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* Logout Button */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: '#EF4444',
                    fontWeight: 'medium',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Box>
        </Drawer>

        {/* Temporary drawer for mobile */}
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: mode === 'dark' ? '#1A202E' : '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* Header */}
          <Box>
            {/* User Profile */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: mode === 'dark' ? '#4299E1' : '#3182CE',
                  width: 48,
                  height: 48,
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ color: mode === 'dark' ? '#FFFFFF' : '#1A202E' }}
                >
                  {username}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ color: mode === 'dark' ? '#CBD5E0' : '#718096' }}
                >
                  Administrator
                </Typography>
              </Box>
            </Box>
            
            <Divider />
          </Box>

          {/* Navigation */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleNavigation(item.path);
                      handleDrawerToggle();
                    }}
                    sx={{
                      backgroundColor: isActive(item.path) 
                        ? (mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path) 
                          ? (mode === 'dark' ? '#90caf9' : '#1976d2')
                          : (mode === 'dark' ? '#CBD5E0' : '#718096'),
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      sx={{
                        color: isActive(item.path) 
                          ? (mode === 'dark' ? '#FFFFFF' : '#1A202E')
                          : (mode === 'dark' ? '#CBD5E0' : '#718096'),
                        fontWeight: isActive(item.path) ? 'bold' : 'normal',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Footer with Theme Toggle and Logout */}
          <Box sx={{ mt: 'auto' }}>
            <Divider />
            
            {/* Theme Toggle */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  toggleTheme();
                  handleDrawerToggle();
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: mode === 'dark' ? '#F6E05E' : '#D69E2E',
                  }}
                >
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </ListItemIcon>
                <ListItemText 
                  primary={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  sx={{
                    color: mode === 'dark' ? '#CBD5E0' : '#718096',
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* Logout */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  handleLogout();
                  handleDrawerToggle();
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: '#EF4444',
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  sx={{
                    color: '#EF4444',
                    fontWeight: 'medium',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Box>
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${open ? drawerWidth : miniDrawerWidth}px)` },
          transition: 'width 0.3s ease',
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {/* Mobile Header */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: 'background.paper',
            borderBottom: mode === 'dark' ? '1px solid #2D3748' : '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary' }}>
              VMS
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Mobile Theme Toggle */}
            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton onClick={toggleTheme} size="small">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* Mobile User Avatar */}
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: mode === 'dark' ? '#4299E1' : '#3182CE',
                fontSize: '0.875rem',
              }}
            >
              {getUserInitials().charAt(0)}
            </Avatar>
          </Box>
        </Box>

        {/* Page Content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MiniDrawer;