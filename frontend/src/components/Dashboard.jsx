import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Album as DiscIcon,
  CloudDone as CloudIcon,
  Inventory2 as VaultIcon,
  CollectionsBookmark as CollectionsIcon,
  LocalMovies as MovieIcon,
  Tv as TvIcon,
  SportsEsports as GameIcon,
  MenuBook as BookIcon,
  Casino as BoardgameIcon,
  ArrowForward as ArrowForwardIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { API_URL, resolveCoverUrl } from "../api/client";
import {
  PLEX_GOLD,
  MediaPosterCard,
  MediaLedgerTable,
  isDigitalOwnership,
} from "./common/PlexComponents";

export default function Dashboard() {
  const navigate = useNavigate();
  const { refreshToken } = useApp();

  const [vault, setVault] = useState({
    allItems: [],
    movies: [],
    tvshows: [],
    videogames: [],
    books: [],
    boardgames: [],
    stats: {
      total: 0,
      physical: 0,
      digital: 0,
      movies: 0,
      tvshows: 0,
      videogames: 0,
      books: 0,
      boardgames: 0,
      collections: 0,
    },
  });
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all"); // all | physical | digital
  const [categoryFilter, setCategoryFilter] = useState("all"); // all | movie | tvshow | videogame | book | boardgame
  const [viewMode, setViewMode] = useState("hub"); // hub | grid | table

  useEffect(() => {
    fetch(`${API_URL}/vault`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.allItems)) {
          setVault(data);
        }
      })
      .catch((err) => console.error("Failed loading vault:", err));

    fetch(`${API_URL}/collections`)
      .then((res) => res.json())
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]));
  }, [refreshToken]);

  const filteredItems = useMemo(() => {
    return vault.allItems.filter((item) => {
      if (categoryFilter !== "all" && item.item_type !== categoryFilter) {
        return false;
      }

      const digital = isDigitalOwnership(item.ownership_type || item.ownership_badge, item.format);
      if (ownershipFilter === "physical" && digital) return false;
      if (ownershipFilter === "digital" && !digital) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          item.title,
          item.name,
          item.creator_label,
          item.author,
          item.director,
          item.developer,
          item.publisher,
          item.platform,
          item.format,
          item.genre,
          item.location,
          item.edition,
          item.type_label,
          item.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [vault.allItems, categoryFilter, ownershipFilter, searchQuery]);

  const isFiltering =
    searchQuery.trim() !== "" ||
    ownershipFilter !== "all" ||
    categoryFilter !== "all" ||
    viewMode !== "hub";

  const categoryShelves = [
    {
      key: "movie",
      title: "Movies & Cinema",
      subtitle: "4K UHD Blu-rays, Blu-rays, DVDs, Steelbooks & Digital Films",
      icon: <MovieIcon />,
      items: vault.movies,
      path: "/movies",
      addPath: "/movies/add",
    },
    {
      key: "tvshow",
      title: "TV Shows & Box Sets",
      subtitle: "Complete Series Box Sets, Season Discs & Digital Seasons",
      icon: <TvIcon />,
      items: vault.tvshows,
      path: "/tvshows",
      addPath: "/tvshows/add",
    },
    {
      key: "videogame",
      title: "Videogames",
      subtitle: "Physical Discs, Cartridges, Collector Editions & Digital Storefronts",
      icon: <GameIcon />,
      items: vault.videogames,
      path: "/videogames",
      addPath: "/videogames/add",
    },
    {
      key: "book",
      title: "Books & Literature",
      subtitle: "Hardcovers, Paperbacks, First Editions, eBooks & Audiobooks",
      icon: <BookIcon />,
      items: vault.books,
      path: "/books",
      addPath: "/books/add",
    },
    {
      key: "boardgame",
      title: "Boardgames & Tabletop",
      subtitle: "Tabletop Boxes, Strategy Games, Expansions & Deluxe Editions",
      icon: <BoardgameIcon />,
      items: vault.boardgames,
      path: "/boardgames",
      addPath: "/boardgames/add",
    },
  ];

  const handleNavigateItem = (item) => {
    if (item.detail_path) {
      navigate(item.detail_path);
    } else if (item.item_type) {
      navigate(`/${item.item_type}s/${item.id}`);
    }
  };

  const handleEditItem = (item) => {
    if (item.detail_path) {
      navigate(`${item.detail_path}/edit`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1480, mx: "auto", pb: 6 }}>
      {/* PLEX VAULT HERO BANNER */}
      <Paper
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3.5,
          p: { xs: 2.5, md: 4 },
          mb: 4,
          background:
            "linear-gradient(135deg, rgba(28, 32, 44, 0.95) 0%, rgba(18, 21, 29, 0.96) 60%, rgba(51, 140, 255, 0.14) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.09)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            mb: 3.5,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label="PERSONAL OWNERSHIP LEDGER"
                size="small"
                sx={{
                  bgcolor: "rgba(51, 140, 255, 0.18)",
                  color: PLEX_GOLD,
                  border: "1px solid rgba(51, 140, 255, 0.4)",
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                }}
              />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#FFFFFF",
                fontSize: { xs: "1.8rem", md: "2.4rem" },
                mb: 0.75,
              }}
            >
              My Media Vault
            </Typography>
            <Typography variant="body1" sx={{ color: "#9CA3AF", maxWidth: 680 }}>
              Catalog, organize, and track everything you own â€” from physical books, 4K Blu-rays,
              DVDs, boardgames, and game cartridges to digital movies and games across platforms.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/create")}
              sx={{
                bgcolor: PLEX_GOLD,
                color: "#FFFFFF",
                fontWeight: 800,
                px: 2.75,
                py: 1.1,
                boxShadow: "0 8px 24px rgba(51, 140, 255, 0.3)",
                "&:hover": { bgcolor: "#4D9BFF" },
              }}
            >
              Add to Vault
            </Button>
            <Button
              variant="outlined"
              startIcon={<CollectionsIcon />}
              onClick={() => navigate("/add-collection")}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#F3F4F6",
                "&:hover": { borderColor: PLEX_GOLD, color: PLEX_GOLD },
              }}
            >
              New Collection
            </Button>
          </Box>
        </Box>

        {/* OWNERSHIP METRICS STRIP */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(4, 1fr)",
              lg: "repeat(8, 1fr)",
            },
            gap: 1.5,
          }}
        >
          <StatCard
            label="Total Owned"
            value={vault.stats.total}
            icon={<VaultIcon fontSize="small" />}
            accent={PLEX_GOLD}
            active={categoryFilter === "all" && ownershipFilter === "all"}
            onClick={() => {
              setCategoryFilter("all");
              setOwnershipFilter("all");
            }}
          />
          <StatCard
            label="Physical Media"
            value={vault.stats.physical}
            icon={<DiscIcon fontSize="small" />}
            accent="#38BDF8"
            active={ownershipFilter === "physical"}
            onClick={() =>
              setOwnershipFilter((prev) => (prev === "physical" ? "all" : "physical"))
            }
          />
          <StatCard
            label="Digital Licenses"
            value={vault.stats.digital}
            icon={<CloudIcon fontSize="small" />}
            accent="#A855F7"
            active={ownershipFilter === "digital"}
            onClick={() =>
              setOwnershipFilter((prev) => (prev === "digital" ? "all" : "digital"))
            }
          />
          <StatCard
            label="Movies"
            value={vault.stats.movies}
            icon={<MovieIcon fontSize="small" />}
            onClick={() => navigate("/movies")}
          />
          <StatCard
            label="TV Shows"
            value={vault.stats.tvshows}
            icon={<TvIcon fontSize="small" />}
            onClick={() => navigate("/tvshows")}
          />
          <StatCard
            label="Videogames"
            value={vault.stats.videogames}
            icon={<GameIcon fontSize="small" />}
            onClick={() => navigate("/videogames")}
          />
          <StatCard
            label="Books"
            value={vault.stats.books}
            icon={<BookIcon fontSize="small" />}
            onClick={() => navigate("/books")}
          />
          <StatCard
            label="Boardgames"
            value={vault.stats.boardgames}
            icon={<BoardgameIcon fontSize="small" />}
            onClick={() => navigate("/boardgames")}
          />
        </Box>
      </Paper>

      {/* GLOBAL VAULT SEARCH & FILTER BAR */}
      <Paper
        sx={{
          p: 1.75,
          mb: 4,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          bgcolor: "rgba(22, 25, 34, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <TextField
          size="small"
          placeholder="Search entire vault by title, author, director, format (Blu-ray, Hardcover, PS5, Steam), or shelf..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: "1 1 320px", maxWidth: { md: 520 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {/* OWNERSHIP FILTER PILLS */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "rgba(13, 15, 20, 0.7)",
              p: 0.4,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { id: "all", label: "All Owned" },
              { id: "physical", label: "Physical Only" },
              { id: "digital", label: "Digital Only" },
            ].map((tab) => {
              const active = ownershipFilter === tab.id;
              return (
                <Button
                  key={tab.id}
                  size="small"
                  onClick={() => setOwnershipFilter(tab.id)}
                  sx={{
                    px: 1.5,
                    py: 0.4,
                    fontSize: "0.76rem",
                    borderRadius: 1.5,
                    bgcolor: active ? PLEX_GOLD : "transparent",
                    color: active ? "#FFFFFF" : "#9CA3AF",
                    fontWeight: active ? 800 : 600,
                    "&:hover": {
                      bgcolor: active ? PLEX_GOLD : "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>

          {/* VIEW MODE SWITCHER */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "rgba(13, 15, 20, 0.7)",
              p: 0.4,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Tooltip title="Vault Shelves Hub">
              <Button
                size="small"
                onClick={() => {
                  setViewMode("hub");
                  setCategoryFilter("all");
                }}
                sx={{
                  minWidth: 0,
                  px: 1.25,
                  py: 0.4,
                  fontSize: "0.75rem",
                  borderRadius: 1.5,
                  bgcolor: viewMode === "hub" ? "rgba(51, 140, 255, 0.2)" : "transparent",
                  color: viewMode === "hub" ? PLEX_GOLD : "text.secondary",
                }}
              >
                Hub
              </Button>
            </Tooltip>
            <Tooltip title="All Posters Wall">
              <IconButton
                size="small"
                onClick={() => setViewMode("grid")}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: viewMode === "grid" ? "rgba(51, 140, 255, 0.2)" : "transparent",
                  color: viewMode === "grid" ? PLEX_GOLD : "text.secondary",
                }}
              >
                <GridViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Master Inventory Ledger Table">
              <IconButton
                size="small"
                onClick={() => setViewMode("table")}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: viewMode === "table" ? "rgba(51, 140, 255, 0.2)" : "transparent",
                  color: viewMode === "table" ? PLEX_GOLD : "text.secondary",
                }}
              >
                <TableRowsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* FILTERED / MASTER LEDGER VIEW */}
      {isFiltering ? (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Vault Inventory ({filteredItems.length})
              </Typography>
              {(searchQuery || ownershipFilter !== "all" || categoryFilter !== "all") && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchQuery("");
                    setOwnershipFilter("all");
                    setCategoryFilter("all");
                    setViewMode("hub");
                  }}
                  sx={{ color: PLEX_GOLD }}
                >
                  Reset Filters
                </Button>
              )}
            </Box>

            {/* Category filter chips */}
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All Categories" },
                { id: "movie", label: "Movies" },
                { id: "tvshow", label: "TV Shows" },
                { id: "videogame", label: "Videogames" },
                { id: "book", label: "Books" },
                { id: "boardgame", label: "Boardgames" },
              ].map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  size="small"
                  onClick={() => setCategoryFilter(cat.id)}
                  sx={{
                    cursor: "pointer",
                    bgcolor:
                      categoryFilter === cat.id
                        ? PLEX_GOLD
                        : "rgba(255,255,255,0.06)",
                    color: categoryFilter === cat.id ? "#FFFFFF" : "#D1D5DB",
                    fontWeight: 700,
                  }}
                />
              ))}
            </Box>
          </Box>

          {filteredItems.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No matching items in your vault
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Try adjusting your search query or ownership filters, or add a new item.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/create")}
              >
                Add Owned Media
              </Button>
            </Paper>
          ) : viewMode === "table" ? (
            <MediaLedgerTable
              items={filteredItems}
              onRowClick={handleNavigateItem}
              onEditClick={handleEditItem}
            />
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(6, 1fr)",
                },
              }}
            >
              {filteredItems.map((item) => (
                <MediaPosterCard
                  key={item.uid || `${item.item_type}-${item.id}`}
                  item={item}
                  type={item.item_type}
                  showCategoryBadge
                  onClick={() => handleNavigateItem(item)}
                  onEdit={() => handleEditItem(item)}
                />
              ))}
            </Box>
          )}
        </Box>
      ) : (
        /* PLEX HOME HUB SHELVES */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {/* 1. RECENTLY ADDED TO VAULT */}
          {vault.allItems.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                    Recently Added to Vault
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                    Latest physical and digital acquisitions across all your libraries
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  onClick={() => setViewMode("grid")}
                  sx={{ color: PLEX_GOLD }}
                >
                  View All ({vault.allItems.length})
                </Button>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 2.5,
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(4, 1fr)",
                    lg: "repeat(6, 1fr)",
                  },
                }}
              >
                {vault.allItems.slice(0, 6).map((item) => (
                  <MediaPosterCard
                    key={`recent-${item.uid}`}
                    item={item}
                    type={item.item_type}
                    showCategoryBadge
                    onClick={() => handleNavigateItem(item)}
                    onEdit={() => handleEditItem(item)}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* 2. CATEGORY RAILS (MOVIES, TV SHOWS, VIDEOGAMES, BOOKS, BOARDGAMES) */}
          {categoryShelves.map((shelf) => (
            <Box key={shelf.key}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Box
                  onClick={() => navigate(shelf.path)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    cursor: "pointer",
                    "&:hover .shelf-title": { color: PLEX_GOLD },
                  }}
                >
                  <Box sx={{ color: PLEX_GOLD, display: "flex" }}>{shelf.icon}</Box>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        className="shelf-title"
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: "#FFFFFF",
                          transition: "color 0.15s",
                        }}
                      >
                        {shelf.title}
                      </Typography>
                      <Chip
                        label={shelf.items.length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.72rem",
                          bgcolor: "rgba(255,255,255,0.08)",
                          color: "#D1D5DB",
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                      {shelf.subtitle}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<AddIcon fontSize="small" />}
                    onClick={() => navigate(shelf.addPath)}
                    sx={{
                      color: "#D1D5DB",
                      border: "1px solid rgba(255,255,255,0.12)",
                      "&:hover": { borderColor: PLEX_GOLD, color: PLEX_GOLD },
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate(shelf.path)}
                    sx={{ color: PLEX_GOLD }}
                  >
                    Open Library
                  </Button>
                </Box>
              </Box>

              {shelf.items.length === 0 ? (
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: "rgba(22, 25, 34, 0.5)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No {shelf.title.toLowerCase()} cataloged in your vault yet.
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(shelf.addPath)}
                    sx={{ borderColor: PLEX_GOLD, color: PLEX_GOLD }}
                  >
                    Add First Entry
                  </Button>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gap: 2.5,
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                      lg: "repeat(6, 1fr)",
                    },
                  }}
                >
                  {shelf.items.slice(0, 6).map((item) => (
                    <MediaPosterCard
                      key={`${shelf.key}-${item.id}`}
                      item={item}
                      type={shelf.key}
                      onClick={() => navigate(`${shelf.path}/${item.id}`)}
                      onEdit={() => navigate(`${shelf.path}/${item.id}/edit`)}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {/* 3. CURATED COLLECTIONS RAIL */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <CollectionsIcon sx={{ color: PLEX_GOLD }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                    Curated Collections & Franchises
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                    Custom groupings of owned physical and digital media across categories
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/add-collection")}
                  sx={{
                    color: "#D1D5DB",
                    border: "1px solid rgba(255,255,255,0.12)",
                    "&:hover": { borderColor: PLEX_GOLD, color: PLEX_GOLD },
                  }}
                >
                  New Collection
                </Button>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/collection")}
                  sx={{ color: PLEX_GOLD }}
                >
                  All Collections
                </Button>
              </Box>
            </Box>

            {collections.length === 0 ? (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  bgcolor: "rgba(22, 25, 34, 0.5)",
                  border: "1px dashed rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Create collections to group owned items (e.g., "4K Steelbook Shelf", "Tolkien Collection", "PlayStation Favorites").
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/add-collection")}
                  sx={{ borderColor: PLEX_GOLD, color: PLEX_GOLD }}
                >
                  Create Collection
                </Button>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gap: 2.5,
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                }}
              >
                {collections.map((col) => {
                  const coverSrc = resolveCoverUrl(col.cover_url);
                  return (
                    <Paper
                      key={col.id}
                      onClick={() => navigate(`/collections/${col.id}`)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: 3,
                        overflow: "hidden",
                        position: "relative",
                        height: 170,
                        border: "2px solid rgba(255,255,255,0.08)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: PLEX_GOLD,
                          transform: "translateY(-4px)",
                          boxShadow: "0 14px 34px rgba(0,0,0,0.65)",
                        },
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
                      ) : (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(135deg, #232838 0%, #141720 100%)",
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(10,12,16,0.94) 10%, rgba(10,12,16,0.35) 100%)",
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Chip
                          label={`${col.item_count || 0} Items`}
                          size="small"
                          sx={{
                            alignSelf: "flex-start",
                            mb: 0.75,
                            height: 20,
                            fontSize: "0.68rem",
                            bgcolor: "rgba(51, 140, 255, 0.22)",
                            color: PLEX_GOLD,
                            border: "1px solid rgba(51, 140, 255, 0.4)",
                            fontWeight: 800,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }} noWrap>
                          {col.name}
                        </Typography>
                        {col.description && (
                          <Typography variant="caption" sx={{ color: "#D1D5DB" }} noWrap>
                            {col.description}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function StatCard({ label, value, icon, accent = "#9CA3AF", active = false, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: active ? "rgba(51, 140, 255, 0.16)" : "rgba(13, 15, 20, 0.55)",
        border: active
          ? `1px solid ${PLEX_GOLD}`
          : "1px solid rgba(255, 255, 255, 0.07)",
        transition: "all 0.18s ease",
        "&:hover": {
          borderColor: PLEX_GOLD,
          bgcolor: "rgba(51, 140, 255, 0.1)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: accent,
          mb: 0.5,
        }}
      >
        {icon}
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
          {value ?? 0}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: "#9CA3AF",
          fontWeight: 700,
          fontSize: "0.72rem",
          display: "block",
        }}
        noWrap
      >
        {label}
      </Typography>
    </Box>
  );
}
