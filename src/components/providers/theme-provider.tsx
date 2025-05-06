"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  CssBaseline,
} from "@mui/material";
import { PaletteMode } from "@mui/material";

interface ThemeContextType {
  toggleTheme: () => void;
  mode: PaletteMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>("light");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // palette values for light mode
                primary: {
                  main: "#1976d2", // Example primary color
                },
                background: {
                  default: "#ffffff", // White background
                  paper: "#f5f5f5", // Light grey for paper elements
                },
                text: {
                  primary: "#212121", // Dark grey for text
                  secondary: "#757575", // Lighter grey for secondary text
                },
              }
            : {
                // palette values for dark mode
                primary: {
                  main: "#90caf9", // Lighter blue for dark mode
                },
                background: {
                  default: "#121212", // Standard dark background
                  paper: "#1e1e1e", // Slightly lighter dark for paper elements
                },
                text: {
                  primary: "#ffffff", // White text
                  secondary: "#bdbdbd", // Lighter grey for secondary text
                },
              }),
        },
        typography: {
          fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI", // Corrected: No extra quotes needed for array elements
            "Roboto",
            "Helvetica Neue", // Corrected
            "Arial",
            "sans-serif",
            "Apple Color Emoji", // Corrected
            "Segoe UI Emoji", // Corrected
            "Segoe UI Symbol", // Corrected
          ].join(","), // Ensure this is correctly applied
          // You can customize typography (font sizes, weights, etc.) here
          // For a Medium-like feel, consider slightly larger body fonts and distinct header styles.
          h1: { fontSize: "2.5rem", fontWeight: 500 },
          h2: { fontSize: "2rem", fontWeight: 500 },
          body1: { fontSize: "1rem", lineHeight: 1.6 },
        },
        // You can also customize components globally here
        // For example, to give Paper a bit more elevation by default:
        // components: {
        //   MuiPaper: {
        //     styleOverrides: {
        //       root: {
        //         elevation: 3, // Default elevation for Paper components
        //       },
        //     },
        //   },
        // },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline /> {/* Ensures baseline styles and dark mode background */}
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}