import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import {
  LocalMovies,
  Tv,
  SportsEsports,
  MenuBook,
  Casino,
  Tune,
  Menu,
  MenuOpen,
  AddCircleOutline,
} from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CollectionsIcon from "@mui/icons-material/Collections";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logosmall.png";
import { PLEX_GOLD } from "./common/PlexComponents";

const mainNavItems = [
  { label: "Home Vault", icon: <DashboardIcon fontSize="small" />, path: "/" },
];

const libraryNavItems = [
  { label: "Movies", icon: <LocalMovies fontSize="small" />, path: "/movies" },
  { label: "TV Shows", icon: <Tv fontSize="small" />, path: "/tvshows" },
  { label: "Videogames", icon: <SportsEsports fontSize="small" />, path: "/videogames" },
  { label: "Books", icon: <MenuBook fontSize="small" />, path: "/books" },
  { label: "Boardgames", icon: <Casino fontSize="small" />, path: "/boardgames" },
];

const curationNavItems = [
  { label: "Collections", icon: <CollectionsIcon fontSize="small" />, path: "/collection" },
  { label: "Vault Settings", icon: <Tune fontSize="small" />, path: "/configuration" },
];

export default function Sidebar({ isExpanded, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isRouteActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/collection") {
      return (
        location.pathname.startsWith("/collection") ||
        location.pathname.startsWith("/add-collection")
      );
    }
    return location.pathname.startsWith(path);
  };

  const renderListItem = (item) => {
    const active = isRouteActive(item.path);
    return (
      <Tooltip key={item.label} title={isExpanded ? "" : item.label} placement="right">
        <ListItemButton
          onClick={() => navigate(item.path)}
          sx={{
            mx: 1,
            mb: 0.5,
            height: 44,
            borderRadius: 2,
            bgcolor: active ? "rgba(51, 140, 255, 0.14)" : "transparent",
            color: active ? PLEX_GOLD : "#9CA3AF",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.18s ease",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 8,
              bottom: 8,
              width: 3.5,
              borderRadius: "0 4px 4px 0",
              bgcolor: active ? PLEX_GOLD : "transparent",
              transition: "background-color 0.2s",
            },
            "&:hover": {
              bgcolor: active
                ? "rgba(51, 140, 255, 0.2)"
                : "rgba(255, 255, 255, 0.06)",
              color: active ? PLEX_GOLD : "#F3F4F6",
            },
            display: "flex",
            justifyContent: isExpanded ? "flex-start" : "center",
            px: isExpanded ? 1.75 : 0,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              color: "inherit",
              mr: isExpanded ? 1.75 : 0,
            }}
          >
            {item.icon}
          </ListItemIcon>
          {isExpanded && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                sx: {
                  fontFamily: "'Ubuntu', sans-serif",
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.9rem",
                  color: active ? "#FFFFFF" : "inherit",
                },
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: isExpanded ? 230 : 68,
        bgcolor: "rgba(15, 17, 23, 0.96)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.07)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        overflowX: "hidden",
        zIndex: 1200,
      }}
    >
      {/* BRAND HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "space-between" : "center",
          px: isExpanded ? 2 : 1,
          py: 2,
          minHeight: 68,
        }}
      >
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: 1.25,
          }}
        >
          <Box
            component="img"
            src={Logo}
            alt="MediaLedger"
            sx={{
              height: 34,
              width: 34,
              borderRadius: 1.5,
              boxShadow: "0 0 16px rgba(51, 140, 255, 0.25)",
            }}
          />
          {isExpanded && (
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Ubuntu', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                }}
              >
                Media<Box component="span" sx={{ color: PLEX_GOLD }}>Ledger</Box>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Ownership Vault
              </Typography>
            </Box>
          )}
        </Box>

        {isExpanded && (
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{ color: "#6B7280", "&:hover": { color: "#F3F4F6" } }}
          >
            <MenuOpen fontSize="small" />
          </IconButton>
        )}
      </Box>

      {!isExpanded && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{ color: "#9CA3AF", "&:hover": { color: PLEX_GOLD } }}
          >
            <Menu fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* QUICK ADD TO VAULT BUTTON */}
      <Box sx={{ px: isExpanded ? 2 : 1.25, mb: 2 }}>
        {isExpanded ? (
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => navigate("/create")}
            sx={{
              bgcolor: PLEX_GOLD,
              color: "#FFFFFF",
              fontWeight: 800,
              py: 0.9,
              borderRadius: 2,
              boxShadow: "0 4px 16px rgba(51, 140, 255, 0.25)",
              "&:hover": { bgcolor: "#4D9BFF" },
            }}
          >
            Add Owned Media
          </Button>
        ) : (
          <Tooltip title="Add Owned Media" placement="right">
            <IconButton
              onClick={() => navigate("/create")}
              sx={{
                width: "100%",
                borderRadius: 2,
                bgcolor: PLEX_GOLD,
                color: "#FFFFFF",
                "&:hover": { bgcolor: "#4D9BFF" },
              }}
            >
              <AddCircleOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* NAVIGATION SECTIONS */}
      <List sx={{ flexGrow: 1, p: 0 }}>
        {mainNavItems.map((item) => renderListItem(item))}

        <Divider sx={{ my: 1.5, mx: 2, borderColor: "rgba(255,255,255,0.06)" }} />

        {isExpanded && (
          <Typography
            variant="caption"
            sx={{
              px: 2.5,
              pb: 0.75,
              display: "block",
              color: "#6B7280",
              fontWeight: 800,
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Owned Libraries
          </Typography>
        )}
        {libraryNavItems.map((item) => renderListItem(item))}

        <Divider sx={{ my: 1.5, mx: 2, borderColor: "rgba(255,255,255,0.06)" }} />

        {isExpanded && (
          <Typography
            variant="caption"
            sx={{
              px: 2.5,
              pb: 0.75,
              display: "block",
              color: "#6B7280",
              fontWeight: 800,
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Organization
          </Typography>
        )}
        {curationNavItems.map((item) => renderListItem(item))}
      </List>
    </Box>
  );
}
