import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Casino as BoardgameIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import {
  LibraryToolbar,
  MediaPosterCard,
  MediaLedgerTable,
  filterAndSortItems,
} from "../../common/PlexComponents";

export default function Boardgame() {
  const navigate = useNavigate();
  const { refreshToken } = useApp();

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetch(`${API_URL}/boardgames`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, [refreshToken]);

  const availableFormats = useMemo(() => {
    const set = new Set(items.map((i) => i.format).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const displayed = useMemo(
    () =>
      filterAndSortItems(items, {
        searchQuery,
        ownershipFilter: "all",
        formatFilter,
        sortBy,
      }),
    [items, searchQuery, formatFilter, sortBy]
  );

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", pb: 6 }}>
      <LibraryToolbar
        title="Boardgames"
        subtitle="Tabletop Base Games, Deluxe Collector Boxes, Strategy Games & Expansions"
        icon={<BoardgameIcon />}
        totalCount={items.length}
        physicalCount={items.length}
        digitalCount={0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        formatFilter={formatFilter}
        onFormatFilterChange={setFormatFilter}
        availableFormats={availableFormats}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        addLabel="Add Boardgame"
        onAddClick={() => navigate("/boardgames/add")}
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
          <BoardgameIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
            {items.length === 0 ? "Your Boardgame Shelf is Empty" : "No Matching Boardgames Found"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
            {items.length === 0
              ? "Catalog your tabletop boardgames, player counts, playtime, complexity weight, and Kallax shelf positions."
              : "Try clearing your search filters."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/boardgames/add")}
          >
            Add First Boardgame
          </Button>
        </Paper>
      ) : viewMode === "table" ? (
        <MediaLedgerTable
          items={displayed}
          type="boardgame"
          onRowClick={(item) => navigate(`/boardgames/${item.id}`)}
          onEditClick={(item) => navigate(`/boardgames/${item.id}/edit`)}
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
            },
          }}
        >
          {displayed.map((item) => (
            <MediaPosterCard
              key={item.id}
              item={{
                ...item,
                title: item.name,
                format_badge:
                  item.min_players && item.max_players
                    ? `${item.min_players}–${item.max_players} Players`
                    : item.format,
                creator_label: [
                  item.publisher,
                  item.avg_playtime ? `${item.avg_playtime}m` : null,
                ]
                  .filter(Boolean)
                  .join(" • "),
              }}
              type="boardgame"
              aspectRatio="115%"
              onClick={() => navigate(`/boardgames/${item.id}`)}
              onEdit={() => navigate(`/boardgames/${item.id}/edit`)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
