"use client";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from '@mui/material';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function MuiThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Determine if dark mode should be used
  const isDarkMode = 
    theme === 'dark' || 
    (theme === 'system' && prefersDarkMode);

  // Create the MUI theme based on the current mode - Threads-like style
  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        // Threads uses mostly monochromatic with occasional blue
        main: isDarkMode ? '#FFFFFF' : '#000000',
      },
      secondary: {
        main: '#0095F6', // Instagram/Threads blue
      },
      background: {
        default: isDarkMode ? '#101010' : '#FFFFFF',
        paper: isDarkMode ? '#1C1C1C' : '#FFFFFF',
      },
      text: {
        primary: isDarkMode ? '#FFFFFF' : '#000000',
        secondary: isDarkMode ? '#A8A8A8' : '#737373',
      },
      divider: isDarkMode ? '#2E2E2E' : '#DBDBDB',
    },
    typography: {
      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: {
        fontSize: '24px',
        fontWeight: 700,
      },
      h2: {
        fontSize: '20px',
        fontWeight: 700,
      },
      h6: {
        fontSize: '16px',
        fontWeight: 600,
      },
      body1: {
        fontSize: '15px',
      },
      body2: {
        fontSize: '14px',
      },
      caption: {
        fontSize: '12px',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true, // No ripple, like Threads app
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // No uppercase text in buttons
            fontWeight: 600,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundColor: isDarkMode ? '#101010' : '#FFFFFF',
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#101010' : '#FFFFFF',
            height: '56px',
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            padding: '6px 0',
            minWidth: 'auto',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: isDarkMode ? '1px solid #2E2E2E' : '1px solid #DBDBDB',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '12px',
            '&:last-child': {
              paddingBottom: '12px',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      }
    },
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline /> {/* This normalizes styles and applies the theme */}
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a MuiThemeProvider');
  }
  return context;
};