import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  SpaceDashboardOutlined as DashboardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DarkModeOutlined as DarkModeIcon,
  LightModeOutlined as LightModeIcon,
  Logout as LogoutIcon,
  PeopleAltOutlined as PeopleIcon,
  ManageAccountsOutlined as ManageAccountsIcon,
  ConfirmationNumberOutlined as PassIcon,
  VerifiedUser as BrandIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import { IconTile } from './ui';

const drawerWidth = 248;
const miniDrawerWidth = 76;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
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
  const isDark = mode === 'dark';

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

  const itemSx = (expanded, active = false, danger = false) => (theme) => ({
    minHeight: 42,
    borderRadius: 2,
    mx: 1.5,
    px: expanded ? 1.5 : 0,
    justifyContent: expanded ? 'flex-start' : 'center',
    position: 'relative',
    color: danger ? 'error.main' : active ? 'primary.main' : 'text.secondary',
    bgcolor: active ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08) : 'transparent',
    '&:hover': {
      bgcolor: danger
        ? alpha(theme.palette.error.main, 0.1)
        : active
          ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12)
          : 'action.hover',
      color: danger ? 'error.main' : active ? 'primary.main' : 'text.primary',
    },
    '&::before': active
      ? {
          content: '""',
          position: 'absolute',
          left: -12,
          top: 10,
          bottom: 10,
          width: 3,
          borderRadius: '0 3px 3px 0',
          bgcolor: 'primary.main',
        }
      : {},
  });

  const iconSx = (expanded) => ({
    minWidth: 0,
    mr: expanded ? 1.5 : 0,
    justifyContent: 'center',
    color: 'inherit',
    '& svg': { fontSize: 21 },
  });

  const textProps = (active) => ({
    primary: { noWrap: true, sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 500 } },
  });

  // Shared by the desktop (collapsible) and mobile (temporary) drawers
  const renderDrawerContent = (expanded, afterAction = () => {}) => (
    <>
      {/* Brand */}
      <Box
        sx={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: expanded ? 2.5 : 0,
          justifyContent: expanded ? 'flex-start' : 'center',
          flexShrink: 0,
        }}
      >
        <IconTile size={38}>
          <BrandIcon />
        </IconTile>
        {expanded && (
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              VMS
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              Visitor Management
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pt: 1 }}>
        {expanded && (
          <Typography
            sx={{ px: 3, mb: 1, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', color: 'text.disabled' }}
          >
            MENU
          </Typography>
        )}
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={expanded ? '' : item.text} placement="right">
                  <ListItemButton
                    onClick={() => {
                      handleNavigation(item.path);
                      afterAction();
                    }}
                    sx={itemSx(expanded, active)}
                  >
                    <ListItemIcon sx={iconSx(expanded)}>{item.icon}</ListItemIcon>
                    {expanded && <ListItemText primary={item.text} slotProps={textProps(active)} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer: theme toggle, logout, profile */}
      <Box sx={{ flexShrink: 0, pb: 1.5 }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={expanded ? '' : isDark ? 'Light Mode' : 'Dark Mode'} placement="right">
              <ListItemButton
                onClick={() => {
                  toggleTheme();
                  afterAction();
                }}
                sx={itemSx(expanded)}
              >
                <ListItemIcon sx={{ ...iconSx(expanded), color: isDark ? '#facc15' : '#d97706' }}>
                  {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                </ListItemIcon>
                {expanded && (
                  <ListItemText primary={isDark ? 'Light Mode' : 'Dark Mode'} slotProps={textProps(false)} />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={expanded ? '' : 'Logout'} placement="right">
              <ListItemButton
                onClick={() => {
                  handleLogout();
                  afterAction();
                }}
                sx={itemSx(expanded, false, true)}
              >
                <ListItemIcon sx={iconSx(expanded)}>
                  <LogoutIcon />
                </ListItemIcon>
                {expanded && <ListItemText primary="Logout" slotProps={textProps(false)} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>

        <Box
          sx={{
            mx: 1.5,
            p: expanded ? 1.25 : 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            gap: 1.25,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: '#fff',
            }}
          >
            {expanded ? getUserInitials() : getUserInitials().charAt(0)}
          </Avatar>
          {expanded && (
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                {username}
              </Typography>
              <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Administrator
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );

  const paperSx = {
    bgcolor: 'background.paper',
    borderRight: 1,
    borderColor: 'divider',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="nav"
        sx={{
          width: { sm: open ? drawerWidth : miniDrawerWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.25s ease',
        }}
      >
        {/* Permanent drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              ...paperSx,
              width: open ? drawerWidth : miniDrawerWidth,
              overflowX: 'hidden',
              transition: 'width 0.25s ease',
            },
          }}
          open={open}
        >
          {renderDrawerContent(open)}
        </Drawer>

        {/* Collapse / expand handle on the drawer edge */}
        <IconButton
          onClick={handleDrawerToggle}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          size="small"
          sx={{
            display: { xs: 'none', sm: 'flex' },
            position: 'fixed',
            top: 24,
            left: (open ? drawerWidth : miniDrawerWidth) - 13,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: 26,
            height: 26,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 2,
            color: 'text.secondary',
            transition: 'left 0.25s ease, color .15s ease',
            '&:hover': { bgcolor: 'background.paper', color: 'primary.main' },
            '& svg': { fontSize: 18 },
          }}
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>

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
            '& .MuiDrawer-paper': { ...paperSx, width: drawerWidth },
          }}
        >
          {renderDrawerContent(true, handleDrawerToggle)}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { sm: `calc(100% - ${open ? drawerWidth : miniDrawerWidth}px)` },
          transition: 'width 0.25s ease',
          minHeight: '100vh',
        }}
      >
        {/* Mobile Header */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.25,
            position: 'sticky',
            top: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <IconTile size={30}>
              <BrandIcon />
            </IconTile>
            <Typography noWrap component="div" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              VMS
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <IconButton onClick={toggleTheme} size="small">
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: '#fff',
                fontSize: '0.8rem',
              }}
            >
              {getUserInitials().charAt(0)}
            </Avatar>
          </Box>
        </Box>

        {/* Page Content */}
        <Box
          key={location.pathname}
          className="fade-up"
          sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1680, mx: 'auto' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MiniDrawer;
