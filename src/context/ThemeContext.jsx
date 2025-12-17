import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode') || 
                     localStorage.getItem('theme') || 
                     'light';
    return savedMode;
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('theme', mode);

    document.documentElement.setAttribute('data-theme', mode);
    
    localStorage.removeItem('thememode'); 
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode,
        background: {
          default: mode === 'dark' ? '#2A303D' : '#CFD4DE',
          paper: mode === 'dark' ? '#1E232E' : '#FFFFFF',
        },
        primary: {
          main: mode === 'dark' ? '#90caf9' : '#1976d2',
        },
        secondary: {
          main: mode === 'dark' ? '#f48fb1' : '#dc004e',
        },
        text: {
          primary: mode === 'dark' ? '#FFFFFF' : '#000000',
          secondary: mode === 'dark' ? '#B0B7C3' : '#5F6368',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'dark' ? '#1E232E' : '#FFFFFF',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'dark' ? '#1E232E' : '#FFFFFF',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'dark' ? '#1E232E' : '#1976d2',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
      },
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};