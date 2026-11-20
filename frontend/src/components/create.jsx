import React from "react";
import { Box, Button, Typography, Paper, Chip } from "@mui/material";
import {
  LocalMovies,
  Tv,
  SportsEsports,
  MenuBook,
  Casino,
  CollectionsBookmark,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PLEX_GOLD } from "./common/PlexComponents";

const categories = [
  {
    title: "Movie",
    badge: "4K UHD â€¢ Blu-ray â€¢ DVD â€¢ Digital",
    description:
      "Catalog owned movies including physical discs (4K UHD, Blu-ray, DVD, Steelbooks) and digital copies purchased on Apple TV, Prime Video, or Vudu.",
    icon: <LocalMovies fontSize="large" />,
    path: "/movies/add",
  },
  {
    title: "TV Show & Box Set",
    badge: "Box Sets â€¢ Complete Series â€¢ Seasons",
    description:
      "Track owned TV series box sets, individual season Blu-rays/DVDs, collector editions, or digital season passes.",
    icon: <Tv fontSize="large" />,
    path: "/tvshows/add",
  },
  {
    title: "Videogame",
    badge: "Physical Disc â€¢ Cartridge â€¢ Digital",
    description:
      "Log console and PC games across PS5, Nintendo Switch, Xbox, retro cartridges, Steam, GOG, and collector's boxes.",
    icon: <SportsEsports fontSize="large" />,
    path: "/videogames/add",
  },
  {
    title: "Book & Literature",
    badge: "Hardcover â€¢ Paperback â€¢ eBook â€¢ Audio",
    description:
      "Record your personal library of physical hardcovers, paperbacks, first editions, comics/manga, Kindle eBooks, and audiobooks.",
    icon: <MenuBook fontSize="large" />,
    path: "/books/add",
  },
  {
    title: "Boardgame & Tabletop",
    badge: "Base Games â€¢ Expansions â€¢ Deluxe",
    description:
      "Keep inventory of your tabletop boxes, expansions, player counts, complexity weight, and Kallax shelf locations.",
    icon: <Casino fontSize="large" />,
    path: "/boardgames/add",
  },
  {
    title: "Curated Collection",
    badge: "Franchises â€¢ Custom Shelves â€¢ Sets",
    description:
      "Create a custom collection to bundle owned items together across categories (e.g., 'Lord of the Rings', 'Steelbook Wall', 'Signed Copies').",
    icon: <CollectionsBookmark fontSize="large" />,
    path: "/add-collection",
  },
];

export default function Create() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Chip
          label="CATALOG NEW ACQUISITION"
          size="small"
          sx={{
            mb: 1,
            bgcolor: "rgba(51, 140, 255, 0.16)",
            color: PLEX_GOLD,
            border: "1px solid rgba(51, 140, 255, 0.35)",
            fontWeight: 800,
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
          }}
        />
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
          Add Owned Media to Vault
        </Typography>
        <Typography sx={{ mt: 0.75, color: "text.secondary", maxWidth: 720 }}>
          Choose the type of media you want to catalog in your personal ownership ledger.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2.5,
        }}
      >
        {categories.map((cat) => (
          <Paper
            key={cat.title}
            onClick={() => navigate(cat.path)}
            sx={{
              cursor: "pointer",
              p: 3,
              borderRadius: 3,
              display: "flex",
              alignItems: "flex-start",
              gap: 2.5,
              bgcolor: "rgba(22, 25, 34, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: PLEX_GOLD,
                transform: "translateY(-4px)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
              },
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(51, 140, 255, 0.14)",
                border: "1px solid rgba(51, 140, 255, 0.35)",
                color: PLEX_GOLD,
                flexShrink: 0,
              }}
            >
              {cat.icon}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                  {cat.title}
                </Typography>
                <Chip
                  label={cat.badge}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.68rem",
                    bgcolor: "rgba(255,255,255,0.06)",
                    color: "#D1D5DB",
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.55 }}>
                {cat.description}
              </Typography>

              <Button
                size="small"
                endIcon={<ArrowForward fontSize="small" />}
                sx={{
                  color: PLEX_GOLD,
                  p: 0,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
              >
                Add {cat.title}
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
