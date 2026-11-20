import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./AppContext";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "typeface-ubuntu";

export const PLEX_GOLD = "#338CFF";
export const PLEX_GOLD_HOVER = "#4D9BFF";
export const PLEX_BG = "#0d0f14";
export const PLEX_SURFACE = "#161922";
export const PLEX_SURFACE_ELEVATED = "#1e222e";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: PLEX_GOLD,
      light: "#66A9FF",
      dark: "#1F6FEB",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#38BDF8",
    },
    background: {
      default: PLEX_BG,
      paper: PLEX_SURFACE,
    },
    text: {
      primary: "#F3F4F6",
      secondary: "#9CA3AF",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h3: {
      fontFamily: "'Ubuntu', 'Roboto', sans-serif",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontFamily: "'Ubuntu', 'Roboto', sans-serif",
      fontWeight: 800,
      letterSpacing: "-0.015em",
    },
    h5: {
      fontFamily: "'Ubuntu', 'Roboto', sans-serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "'Ubuntu', 'Roboto', sans-serif",
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: PLEX_BG,
          backgroundImage:
            "radial-gradient(circle at 18% 0%, rgba(51, 140, 255, 0.08) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.05) 0%, transparent 45%)",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: PLEX_SURFACE,
          border: "1px solid rgba(255, 255, 255, 0.07)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: PLEX_SURFACE,
          border: "1px solid rgba(255, 255, 255, 0.07)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "7px 16px",
          fontWeight: 700,
        },
        containedPrimary: {
          backgroundColor: PLEX_GOLD,
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: PLEX_GOLD_HOVER,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(13, 15, 20, 0.55)",
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.12)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(255, 255, 255, 0.25) !important",
          },
          "&.Mui-focused fieldset": {
            borderColor: `${PLEX_GOLD} !important`,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: PLEX_GOLD,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
