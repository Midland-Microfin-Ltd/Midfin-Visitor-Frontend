import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

// shadcn/ui-style tokens (zinc neutrals + indigo brand)
const getTokens = (mode) => {
  const dark = mode === 'dark';
  return {
    bg: dark ? '#09090b' : '#f6f7f9',
    paper: dark ? '#131316' : '#ffffff',
    muted: dark ? '#1c1c20' : '#f4f4f5',
    border: dark ? '#27272a' : '#e4e4e7',
    borderStrong: dark ? '#3f3f46' : '#d4d4d8',
    text: dark ? '#fafafa' : '#09090b',
    textMuted: dark ? '#a1a1aa' : '#71717a',
    primary: dark ? '#6366f1' : '#4f46e5',
    shadow: dark ? '0,0,0' : '16,24,40',
    shadowAlpha: dark ? 4 : 1,
  };
};

const buildShadows = ({ shadow: c, shadowAlpha: k }) => [
  'none',
  ...Array.from({ length: 24 }, (_, i) => {
    const e = i + 1;
    const a = (v) => Math.min(v * k, 0.6).toFixed(3);
    if (e === 1) return `0 1px 2px rgba(${c},${a(0.05)})`;
    if (e <= 4) return `0 1px 3px rgba(${c},${a(0.1)}), 0 1px 2px rgba(${c},${a(0.06)})`;
    if (e <= 8) return `0 4px 12px -2px rgba(${c},${a(0.1)}), 0 2px 4px -2px rgba(${c},${a(0.05)})`;
    if (e <= 16) return `0 12px 24px -4px rgba(${c},${a(0.12)}), 0 4px 8px -4px rgba(${c},${a(0.05)})`;
    return `0 24px 48px -12px rgba(${c},${a(0.25)})`;
  }),
];

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

  const theme = useMemo(() => {
    const t = getTokens(mode);
    const dark = mode === 'dark';

    return createTheme({
      palette: {
        mode,
        background: { default: t.bg, paper: t.paper },
        primary: {
          main: t.primary,
          light: '#818cf8',
          dark: dark ? '#4f46e5' : '#4338ca',
          contrastText: '#ffffff',
        },
        secondary: { main: dark ? '#a78bfa' : '#7c3aed' },
        success: { main: dark ? '#22c55e' : '#16a34a', contrastText: '#ffffff' },
        warning: { main: dark ? '#f59e0b' : '#d97706', contrastText: '#ffffff' },
        error: { main: dark ? '#ef4444' : '#dc2626', contrastText: '#ffffff' },
        info: { main: dark ? '#38bdf8' : '#0284c7', contrastText: '#ffffff' },
        text: { primary: t.text, secondary: t.textMuted, disabled: alpha(t.textMuted, 0.6) },
        divider: t.border,
        action: {
          hover: dark ? 'rgba(255,255,255,0.04)' : 'rgba(24,24,27,0.035)',
          selected: alpha(t.primary, dark ? 0.16 : 0.08),
        },
      },
      typography: {
        fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 700, letterSpacing: '-0.025em' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontWeight: 700, letterSpacing: '-0.025em' },
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 600, letterSpacing: '-0.015em' },
        h6: { fontWeight: 600, letterSpacing: '-0.01em' },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shadows: buildShadows(t),
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              fontFeatureSettings: '"cv11", "ss01"',
            },
            '::selection': { background: alpha(t.primary, 0.2) },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: ({ ownerState }) => ({
              backgroundImage: 'none',
              ...(ownerState.variant === 'elevation' &&
                ownerState.elevation === 1 && { border: `1px solid ${t.border}` }),
            }),
            rounded: { borderRadius: 12 },
            outlined: { borderColor: t.border },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: { borderRadius: 12 },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: { backgroundColor: dark ? t.paper : t.primary },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 600,
              transition: 'background-color .15s ease, border-color .15s ease, box-shadow .15s ease, transform .1s ease',
              '&:active': { transform: 'translateY(0.5px)' },
            },
            sizeSmall: { padding: '4px 12px', fontSize: '0.8125rem' },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: { textTransform: 'none', fontWeight: 600 },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              transition: 'box-shadow .15s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: dark ? '#52525b' : '#a1a1aa' },
              '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(t.primary, 0.18)}` },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1, borderColor: t.primary },
              '&.Mui-error.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(dark ? '#ef4444' : '#dc2626', 0.18)}` },
            },
            notchedOutline: { borderColor: t.borderStrong },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: { height: 2, borderRadius: 2 },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44 },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: ({ ownerState, theme }) => {
              const color = ownerState.color;
              const base = { borderRadius: 6, fontWeight: 600 };
              if (!color || color === 'default') {
                return ownerState.variant === 'outlined'
                  ? { ...base, borderColor: t.border }
                  : { ...base, backgroundColor: t.muted, color: t.text };
              }
              if (ownerState.variant === 'outlined') return base;
              // soft "badge" look for coloured chips
              const main = theme.palette[color]?.main;
              if (!main) return base;
              return {
                ...base,
                backgroundColor: alpha(main, dark ? 0.16 : 0.1),
                color: dark ? theme.palette[color].light : theme.palette[color].dark,
                boxShadow: `inset 0 0 0 1px ${alpha(main, dark ? 0.3 : 0.22)}`,
                '& .MuiChip-icon': { color: 'inherit' },
              };
            },
            sizeSmall: { height: 22, fontSize: '0.72rem' },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: { borderBottom: `1px solid ${t.border}` },
            head: {
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: t.textMuted,
              backgroundColor: t.muted,
              paddingTop: 10,
              paddingBottom: 10,
            },
            stickyHeader: { backgroundColor: t.muted },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              transition: 'background-color .15s ease',
              '&:last-child td': { borderBottom: 0 },
            },
          },
        },
        MuiTablePagination: {
          styleOverrides: {
            root: { borderTop: `1px solid ${t.border}`, color: t.textMuted },
            selectLabel: { fontSize: '0.8125rem' },
            displayedRows: { fontSize: '0.8125rem', fontWeight: 500 },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 16,
              border: `1px solid ${t.border}`,
              boxShadow: `0 24px 64px -12px rgba(${t.shadow},${dark ? 0.7 : 0.25})`,
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: { root: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em' } },
        },
        MuiDialogActions: {
          styleOverrides: { root: { padding: '12px 24px 20px', gap: 4 } },
        },
        MuiBackdrop: {
          styleOverrides: {
            root: ({ ownerState }) =>
              ownerState.invisible ? {} : { backgroundColor: 'rgba(9,9,11,0.55)', backdropFilter: 'blur(4px)' },
          },
        },
        MuiTooltip: {
          defaultProps: { arrow: true },
          styleOverrides: {
            tooltip: {
              backgroundColor: dark ? '#fafafa' : '#18181b',
              color: dark ? '#09090b' : '#fafafa',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: 6,
              padding: '6px 10px',
            },
            arrow: { color: dark ? '#fafafa' : '#18181b' },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: { border: `1px solid ${t.border}`, marginTop: 4 },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: { borderRadius: 6, margin: '0 4px', fontSize: '0.875rem' },
          },
        },
        MuiAlert: {
          styleOverrides: { root: { borderRadius: 10, alignItems: 'center' } },
        },
        MuiLinearProgress: {
          styleOverrides: { root: { borderRadius: 4, height: 3 } },
        },
        MuiAvatar: {
          styleOverrides: { root: { fontWeight: 600, fontSize: '0.95rem' } },
        },
        MuiDivider: {
          styleOverrides: { root: { borderColor: t.border } },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
