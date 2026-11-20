import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  CollectionsBookmark as CollectionsIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import { API_URL, resolveCoverUrl } from "../../api/client";
import { PLEX_GOLD } from "../common/PlexComponents";

export default function Collections() {
  const navigate = useNavigate();
  const { refreshToken } = useApp();

  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/collections`)
      .then((res) => res.json())
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]));
  }, [refreshToken]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", pb: 6 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: "rgba(51, 140, 255, 0.14)",
              border: "1px solid rgba(51, 140, 255, 0.35)",
              color: PLEX_GOLD,
              display: "grid",
              placeItems: "center",
            }}
          >
            <CollectionsIcon />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                Collections
              </Typography>
              <Chip
                label={`${collections.length} Collections`}
                size="small"
                sx={{
                  bgcolor: "rgba(51, 140, 255, 0.16)",
                  color: PLEX_GOLD,
                  border: "1px solid rgba(51, 140, 255, 0.35)",
                  fontWeight: 800,
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Group owned movies, TV box sets, books, videogames, and boardgames into franchises or custom shelves
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/add-collection")}
          sx={{
            bgcolor: PLEX_GOLD,
            color: "#FFFFFF",
            fontWeight: 800,
            px: 2.5,
            py: 1,
          }}
        >
          New Collection
        </Button>
      </Box>

      {/* SEARCH BAR */}
      <Paper
        sx={{
          p: 1.5,
          mb: 3.5,
          borderRadius: 2.5,
          bgcolor: "rgba(22, 25, 34, 0.8)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search collections by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 460 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filtered.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "rgba(22, 25, 34, 0.6)",
            border: "1px dashed rgba(255,255,255,0.12)",
          }}
        >
          <CollectionsIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
            No Collections Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
            Create custom collections like "4K UHD Steelbooks", "Middle-earth Collection", "PlayStation Classics", or "Living Room Display Shelf".
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/add-collection")}
          >
            Create First Collection
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {filtered.map((collection) => {
            const coverSrc = resolveCoverUrl(collection.cover_url);
            const previews = (collection.preview_covers || [])
              .map(resolveCoverUrl)
              .filter(Boolean);

            return (
              <Paper
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.id}`)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,0.08)",
                  transition: "all 0.22s ease",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    borderColor: PLEX_GOLD,
                    transform: "translateY(-4px)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
                  },
                }}
              >
                {/* COLLECTION VISUAL (COVER OR PLEX 2x2 MOSAIC) */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "68%",
                    bgcolor: "#141822",
                    overflow: "hidden",
                  }}
                >
                  {coverSrc ? (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("${coverSrc}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : previews.length > 0 ? (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        gridTemplateColumns: previews.length > 1 ? "1fr 1fr" : "1fr",
                        gridTemplateRows: previews.length > 2 ? "1fr 1fr" : "1fr",
                        gap: 0.4,
                        bgcolor: "#0d0f14",
                      }}
                    >
                      {previews.slice(0, 4).map((src, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            backgroundImage: `url("${src}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, #212636 0%, #131620 100%)",
                        display: "grid",
                        placeItems: "center",
                        color: "rgba(51, 140, 255, 0.4)",
                      }}
                    >
                      <CollectionsIcon sx={{ fontSize: 48 }} />
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(13,15,20,0.92) 0%, transparent 65%)",
                    }}
                  />

                  <Chip
                    label={`${collection.item_count || 0} Items`}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      bgcolor: "rgba(13, 15, 20, 0.85)",
                      color: PLEX_GOLD,
                      border: "1px solid rgba(51, 140, 255, 0.4)",
                      fontWeight: 800,
                      backdropFilter: "blur(6px)",
                    }}
                  />
                </Box>

                {/* DETAILS */}
                <Box sx={{ p: 2.25 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#FFFFFF" }} noWrap>
                    {collection.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 40,
                    }}
                  >
                    {collection.description || "Custom media collection"}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
