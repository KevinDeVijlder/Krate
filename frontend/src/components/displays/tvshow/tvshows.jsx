import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Tv as TvIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import {
  LibraryToolbar,
  MediaPosterCard,
  MediaLedgerTable,
  filterAndSortItems,
  isDigitalOwnership,
} from "../../common/PlexComponents";

export default function TvShows() {
  const navigate = useNavigate();
  const { refreshToken } = useApp();

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetch(`${API_URL}/tvshows`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, [refreshToken]);

  const availableFormats = useMemo(() => {
    const set = new Set(items.map((i) => i.format).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const physicalCount = useMemo(
    () => items.filter((i) => !isDigitalOwnership(i.ownership_type, i.format)).length,
    [items]
  );
  const digitalCount = items.length - physicalCount;

  const displayed = useMemo(
    () =>
      filterAndSortItems(items, {
        searchQuery,
        ownershipFilter,
        formatFilter,
        sortBy,
      }),
    [items, searchQuery, ownershipFilter, formatFilter, sortBy]
  );

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", pb: 6 }}>
      <LibraryToolbar
        title="TV Shows"
        subtitle="Complete Series Box Sets, Season Blu-rays/DVDs & Digital Season Passes"
        icon={<TvIcon />}
        totalCount={items.length}
        physicalCount={physicalCount}
        digitalCount={digitalCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        ownershipFilter={ownershipFilter}
        onOwnershipFilterChange={setOwnershipFilter}
        formatFilter={formatFilter}
        onFormatFilterChange={setFormatFilter}
        availableFormats={availableFormats}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        addLabel="Add TV Show"
        onAddClick={() => navigate("/tvshows/add")}
      />

      {displayed.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "rgba(22, 25, 34, 0.6)",
            border: "1px dashed rgba(255,255,255,0.12)",
          }}
        >
          <TvIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
            {items.length === 0 ? "Your TV Show Vault is Empty" : "No Matching TV Shows Found"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
            {items.length === 0
              ? "Catalog your owned TV series box sets, Blu-ray/DVD seasons, anime collector sets, or digital seasons."
              : "Try clearing your search or format filters."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/tvshows/add")}
          >
            Add First TV Show
          </Button>
        </Paper>
      ) : viewMode === "table" ? (
        <MediaLedgerTable
          items={displayed}
          type="tvshow"
          onRowClick={(item) => navigate(`/tvshows/${item.id}`)}
          onEditClick={(item) => navigate(`/tvshows/${item.id}/edit`)}
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2.75,
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
              xl: "repeat(6, 1fr)",
            },
          }}
        >
          {displayed.map((item) => (
            <MediaPosterCard
              key={item.id}
              item={{
                ...item,
                creator_label: item.seasons_owned || item.network || item.creator,
              }}
              type="tvshow"
              onClick={() => navigate(`/tvshows/${item.id}`)}
              onEdit={() => navigate(`/tvshows/${item.id}/edit`)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
