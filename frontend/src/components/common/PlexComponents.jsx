import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  Add as AddIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Album as DiscIcon,
  CloudDone as CloudIcon,
  CollectionsBookmark as CollectionsIcon,
  Place as PlaceIcon,
  LocalMovies as MovieIcon,
  Tv as TvIcon,
  SportsEsports as GameIcon,
  MenuBook as BookIcon,
  Casino as BoardgameIcon,
  Inventory2 as VaultIcon,
  CheckCircle as CheckIcon,
  CloudUpload as UploadIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { resolveCoverUrl, API_URL } from "../../api/client";
import { useApp } from "../../AppContext";

export const PLEX_GOLD = "#338CFF";

export function isDigitalOwnership(ownership, format = "") {
  const combined = `${ownership || ""} ${format || ""}`.toLowerCase();
  return /digital|ebook|e-book|kindle|audible|audiobook|steam|gog|epic|psn|eshop|apple tv|itunes|prime video|cloud|vudu/.test(
    combined
  ) && !/physical|disc|cartridge|hardcover|paperback|steelbook|box set/.test((ownership || "").toLowerCase());
}

export function getCategoryIcon(type, fontSize = "medium") {
  switch (type) {
    case "movie":
      return <MovieIcon fontSize={fontSize} />;
    case "tvshow":
      return <TvIcon fontSize={fontSize} />;
    case "videogame":
      return <GameIcon fontSize={fontSize} />;
    case "book":
      return <BookIcon fontSize={fontSize} />;
    case "boardgame":
      return <BoardgameIcon fontSize={fontSize} />;
    default:
      return <VaultIcon fontSize={fontSize} />;
  }
}

export function getFormatAccent(format = "") {
  const f = (format || "").toLowerCase();
  if (f.includes("4k") || f.includes("uhd")) return { bg: "#111827", border: "#F59E0B", text: "#FBBF24" };
  if (f.includes("blu-ray") || f.includes("bluray")) return { bg: "rgba(2, 132, 199, 0.88)", border: "#38BDF8", text: "#FFFFFF" };
  if (f.includes("dvd")) return { bg: "rgba(75, 85, 99, 0.88)", border: "#9CA3AF", text: "#F3F4F6" };
  if (f.includes("steelbook") || f.includes("collector")) return { bg: "rgba(180, 83, 9, 0.9)", border: "#F59E0B", text: "#FEF3C7" };
  if (f.includes("hardcover")) return { bg: "rgba(124, 45, 18, 0.88)", border: "#FB923C", text: "#FFEDD5" };
  if (f.includes("paperback")) return { bg: "rgba(30, 58, 138, 0.85)", border: "#60A5FA", text: "#DBEAFE" };
  if (f.includes("cartridge")) return { bg: "rgba(153, 27, 27, 0.88)", border: "#F87171", text: "#FEE2E2" };
  return { bg: "rgba(17, 24, 39, 0.86)", border: "rgba(255,255,255,0.22)", text: "#E5E7EB" };
}

/* ============================================================================
   1. PLEX MEDIA POSTER CARD
============================================================================ */
export function MediaPosterCard({
  item,
  type = "movie",
  aspectRatio = "148%",
  onClick,
  onEdit,
  showCategoryBadge = false,
}) {
  const coverSrc = resolveCoverUrl(item.cover_url);
  const title = item.title || item.name || "Untitled";
  const year = item.release_year || item.publication_year || item.year || null;
  const subtitle =
    item.creator_label ||
    item.author ||
    item.director ||
    item.developer ||
    item.publisher ||
    item.network ||
    item.platform ||
    "";
  const formatLabel =
    item.format ||
    item.format_badge ||
    item.platform ||
    (type === "boardgame" && item.min_players
      ? `${item.min_players}â€“${item.max_players} Players`
      : null);

  const digital = isDigitalOwnership(item.ownership_type || item.ownership_badge, formatLabel);
  const ratingVal = item.rating ?? item.complexity_weight ?? null;
  const isComplexity = type === "boardgame" && item.rating == null && item.complexity_weight != null;
  const formatStyle = getFormatAccent(formatLabel);

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        group: "true",
        "&:hover .poster-frame": {
          borderColor: PLEX_GOLD,
          boxShadow: "0 16px 38px rgba(0,0,0,0.75), 0 0 0 1px #338CFF",
          transform: "translateY(-4px)",
        },
        "&:hover .poster-img": {
          transform: "scale(1.04)",
        },
        "&:hover .poster-quick-edit": {
          opacity: 1,
        },
      }}
    >
      {/* POSTER FRAME */}
      <Box
        className="poster-frame"
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: aspectRatio,
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: "#141821",
          border: "2px solid rgba(255, 255, 255, 0.07)",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.5)",
          transition: "all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* COVER IMAGE OR STYLIZED MEDIA CASE PLACEHOLDER */}
        {coverSrc ? (
          <Box
            className="poster-img"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${coverSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "transform 0.35s ease",
            }}
          />
        ) : (
          <Box
            className="poster-img"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(145deg, #1b202d 0%, #12151e 60%, #0d0f15 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 2.5,
              textAlign: "center",
              transition: "transform 0.35s ease",
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                bgcolor: "rgba(51, 140, 255, 0.12)",
                border: "1px solid rgba(51, 140, 255, 0.3)",
                color: PLEX_GOLD,
                display: "grid",
                placeItems: "center",
                mb: 1.5,
              }}
            >
              {getCategoryIcon(type, "large")}
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#E5E7EB",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mt: 0.5 }}
                noWrap
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* SUBTLE VIGNETTE OVERLAY FOR BADGE LEGIBILITY */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,12,16,0.65) 0%, transparent 28%, transparent 65%, rgba(10,12,16,0.88) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* TOP LEFT: FORMAT / MEDIUM RIBBON */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            right: 48,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.6,
            pointerEvents: "none",
          }}
        >
          {showCategoryBadge && (
            <Box
              sx={{
                px: 0.9,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                bgcolor: "rgba(51, 140, 255, 0.92)",
                color: "#FFFFFF",
                backdropFilter: "blur(6px)",
              }}
            >
              {item.type_label || type}
            </Box>
          )}
          {formatLabel && (
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.03em",
                bgcolor: formatStyle.bg,
                color: formatStyle.text,
                border: `1px solid ${formatStyle.border}`,
                backdropFilter: "blur(6px)",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {formatLabel}
            </Box>
          )}
        </Box>

        {/* TOP RIGHT: RATING OR COMPLEXITY BADGE */}
        {ratingVal != null && ratingVal !== "" && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              px: 0.9,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "rgba(13, 15, 20, 0.85)",
              border: "1px solid rgba(51, 140, 255, 0.45)",
              color: PLEX_GOLD,
              fontSize: "0.72rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              backdropFilter: "blur(6px)",
            }}
          >
            <StarIcon sx={{ fontSize: 13, color: PLEX_GOLD }} />
            {isComplexity ? `${ratingVal}/5` : ratingVal}
          </Box>
        )}

        {/* BOTTOM OVERLAY: OWNERSHIP TYPE (PHYSICAL / DIGITAL) + STATUS / PLATFORM */}
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            left: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.9,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.66rem",
              fontWeight: 700,
              bgcolor: digital
                ? "rgba(168, 85, 247, 0.24)"
                : "rgba(51, 140, 255, 0.22)",
              color: digital ? "#E9D5FF" : "#BFDBFE",
              border: digital
                ? "1px solid rgba(168, 85, 247, 0.45)"
                : "1px solid rgba(51, 140, 255, 0.45)",
              backdropFilter: "blur(8px)",
            }}
          >
            {digital ? (
              <CloudIcon sx={{ fontSize: 12 }} />
            ) : (
              <DiscIcon sx={{ fontSize: 12 }} />
            )}
            {item.ownership_type || (digital ? "Digital" : "Physical")}
          </Box>

          {item.status && (
            <Box
              sx={{
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                fontSize: "0.65rem",
                fontWeight: 700,
                bgcolor: "rgba(15, 17, 23, 0.82)",
                color: "#D1D5DB",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(6px)",
                maxWidth: "52%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.status}
            </Box>
          )}
        </Box>

        {/* HOVER QUICK EDIT BUTTON */}
        {onEdit && (
          <IconButton
            className="poster-quick-edit"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            sx={{
              position: "absolute",
              bottom: 38,
              right: 8,
              opacity: 0,
              transition: "opacity 0.2s",
              bgcolor: "rgba(13, 15, 20, 0.88)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": {
                bgcolor: PLEX_GOLD,
                color: "#FFFFFF",
              },
            }}
          >
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
        )}
      </Box>

      {/* PLEX POSTER CAPTION BELOW CARD */}
      <Box sx={{ pt: 1.1, px: 0.3 }}>
        <Tooltip title={title} enterDelay={600}>
          <Typography
            variant="subtitle2"
             noWrap
            sx={{
              fontWeight: 700,
              fontSize: "0.92rem",
              color: "#F3F4F6",
              lineHeight: 1.25,
            }}
          >
            {title}
          </Typography>
        </Tooltip>

        <Typography
          variant="caption"
          noWrap
          sx={{
            display: "block",
            color: "#9CA3AF",
            fontSize: "0.77rem",
            mt: 0.25,
          }}
        >
          {[year, subtitle, item.location ? `ðŸ“ ${item.location}` : null]
            .filter(Boolean)
            .join(" â€¢ ") || "Owned Media"}
        </Typography>
      </Box>
    </Box>
  );
}

/* ============================================================================
   2. MEDIA LEDGER INVENTORY TABLE VIEW
============================================================================ */
export function MediaLedgerTable({ items, type = "movie", onRowClick, onEditClick }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2.5,
        bgcolor: "rgba(22, 25, 34, 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                bgcolor: "rgba(13, 15, 20, 0.65)",
                color: "#9CA3AF",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                py: 1.5,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              },
            }}
          >
            <TableCell width={52}>Cover</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Creator / Studio</TableCell>
            <TableCell>Format / Medium</TableCell>
            <TableCell>Ownership</TableCell>
            <TableCell>Platform / Location</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Year</TableCell>
            <TableCell align="center">Rating</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const coverSrc = resolveCoverUrl(item.cover_url);
            const title = item.title || item.name;
            const creator =
              item.creator_label ||
              item.author ||
              item.director ||
              item.developer ||
              item.publisher ||
              item.creator ||
              "-";
            const format =
              item.format ||
              item.format_badge ||
              (type === "boardgame" && item.min_players
                ? `${item.min_players}-${item.max_players}P`
                : "-");
            const year = item.release_year || item.publication_year || item.year || "-";
            const rating = item.rating ?? item.complexity_weight ?? "-";
            const digital = isDigitalOwnership(item.ownership_type, format);

            return (
              <TableRow
                key={`${item.item_type || type}-${item.id}`}
                hover
                onClick={() => onRowClick && onRowClick(item)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(51, 140, 255, 0.06) !important",
                  },
                  "& td": {
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    py: 1.1,
                  },
                }}
              >
                <TableCell>
                  <Box
                    sx={{
                      width: 36,
                      height: 50,
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: "#1f2430",
                      backgroundImage: coverSrc ? `url("${coverSrc}")` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {!coverSrc && getCategoryIcon(item.item_type || type, "small")}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#F3F4F6" }}>
                    {title}
                  </Typography>
                  {item.edition && (
                    <Typography variant="caption" sx={{ color: PLEX_GOLD }}>
                      {item.edition}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {creator}
                  </Typography>
                </TableCell>
                <TableCell>
                  {format !== "-" ? (
                    <Chip
                      label={format}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.72rem",
                        bgcolor: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={
                      digital ? (
                        <CloudIcon sx={{ fontSize: "13px !important" }} />
                      ) : (
                        <DiscIcon sx={{ fontSize: "13px !important" }} />
                      )
                    }
                    label={item.ownership_type || (digital ? "Digital" : "Physical")}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.72rem",
                      bgcolor: digital
                        ? "rgba(168, 85, 247, 0.16)"
                        : "rgba(51, 140, 255, 0.16)",
                      color: digital ? "#E9D5FF" : "#BFDBFE",
                      border: digital
                        ? "1px solid rgba(168, 85, 247, 0.35)"
                        : "1px solid rgba(51, 140, 255, 0.35)",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {[item.platform, item.location].filter(Boolean).join(" â€¢ ") || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.status || "Owned"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" color="text.secondary">
                    {year}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {rating !== "-" ? (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.4,
                        color: PLEX_GOLD,
                        fontWeight: 700,
                        fontSize: "0.82rem",
                      }}
                    >
                      <StarIcon sx={{ fontSize: 14 }} />
                      {rating}
                    </Box>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell align="right">
                  {onEditClick && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(item);
                      }}
                      sx={{ color: "text.secondary", "&:hover": { color: PLEX_GOLD } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* ============================================================================
   3. PLEX LIBRARY CATEGORY TOOLBAR
============================================================================ */
export function LibraryToolbar({
  title,
  subtitle,
  icon,
  totalCount = 0,
  physicalCount = 0,
  digitalCount = 0,
  searchQuery,
  onSearchChange,
  ownershipFilter,
  onOwnershipFilterChange,
  formatFilter,
  onFormatFilterChange,
  availableFormats = [],
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  addLabel,
  onAddClick,
}) {
  return (
    <Box sx={{ mb: 3.5 }}>
      {/* TOP TITLE ROW */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
          mb: 2.5,
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
            {icon}
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#F9FAFB" }}>
                {title}
              </Typography>
              <Chip
                label={`${totalCount} Owned`}
                size="small"
                sx={{
                  bgcolor: "rgba(51, 140, 255, 0.16)",
                  color: PLEX_GOLD,
                  border: "1px solid rgba(51, 140, 255, 0.35)",
                  fontWeight: 800,
                }}
              />
              {physicalCount > 0 && (
                <Chip
                  icon={<DiscIcon sx={{ fontSize: "14px !important" }} />}
                  label={`${physicalCount} Physical`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.05)",
                    color: "#D1D5DB",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              )}
              {digitalCount > 0 && (
                <Chip
                  icon={<CloudIcon sx={{ fontSize: "14px !important" }} />}
                  label={`${digitalCount} Digital`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(168, 85, 247, 0.12)",
                    color: "#E9D5FF",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                  }}
                />
              )}
            </Box>
            {subtitle && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {onAddClick && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{
              bgcolor: PLEX_GOLD,
              color: "#FFFFFF",
              fontWeight: 800,
              px: 2.5,
              py: 1,
              boxShadow: "0 4px 18px rgba(51, 140, 255, 0.28)",
              "&:hover": {
                bgcolor: "#4D9BFF",
                boxShadow: "0 6px 24px rgba(51, 140, 255, 0.42)",
              },
            }}
          >
            {addLabel || "Add Item"}
          </Button>
        )}
      </Box>

      {/* FILTER & SEARCH BAR */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          p: 1.5,
          borderRadius: 2.5,
          bgcolor: "rgba(22, 25, 34, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
        }}
      >
        {/* SEARCH INPUT */}
        <TextField
          size="small"
          placeholder={`Search ${title.toLowerCase()} by title, creator, format, shelf location...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flex: "1 1 260px",
            maxWidth: { md: 420 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        {/* CONTROLS RIGHT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          {/* OWNERSHIP PILLS */}
          {onOwnershipFilterChange && (
            <Box
              sx={{
                display: "flex",
                bgcolor: "rgba(13, 15, 20, 0.65)",
                p: 0.4,
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {["all", "physical", "digital"].map((mode) => {
                const active = ownershipFilter === mode;
                return (
                  <Button
                    key={mode}
                    size="small"
                    onClick={() => onOwnershipFilterChange(mode)}
                    sx={{
                      minWidth: 0,
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
                    {mode === "all" ? "All" : mode === "physical" ? "Physical" : "Digital"}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* FORMAT FILTER */}
          {onFormatFilterChange && availableFormats.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={formatFilter}
                onChange={(e) => onFormatFilterChange(e.target.value)}
                displayEmpty
                sx={{ fontSize: "0.82rem", height: 36 }}
              >
                <MenuItem value="all">All Formats</MenuItem>
                {availableFormats.map((fmt) => (
                  <MenuItem key={fmt} value={fmt}>
                    {fmt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* SORT SELECT */}
          {onSortByChange && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                sx={{ fontSize: "0.82rem", height: 36 }}
              >
                <MenuItem value="recent">Recently Added</MenuItem>
                <MenuItem value="title_asc">Title (Aâ€“Z)</MenuItem>
                <MenuItem value="title_desc">Title (Zâ€“A)</MenuItem>
                <MenuItem value="year_desc">Release Year (Newest)</MenuItem>
                <MenuItem value="rating_desc">Rating (Highest)</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* VIEW MODE TOGGLE (POSTER GRID VS LEDGER TABLE) */}
          {onViewModeChange && (
            <Box
              sx={{
                display: "flex",
                bgcolor: "rgba(13, 15, 20, 0.65)",
                p: 0.4,
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Tooltip title="Poster Wall">
                <IconButton
                  size="small"
                  onClick={() => onViewModeChange("grid")}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: viewMode === "grid" ? "rgba(51, 140, 255, 0.2)" : "transparent",
                    color: viewMode === "grid" ? PLEX_GOLD : "text.secondary",
                  }}
                >
                  <GridViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ledger Inventory Table">
                <IconButton
                  size="small"
                  onClick={() => onViewModeChange("table")}
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
          )}
        </Box>
      </Box>
    </Box>
  );
}

/* ============================================================================
   4. FILTER & SORT HELPER FOR CATEGORY VIEWS
============================================================================ */
export function filterAndSortItems(
  items,
  { searchQuery = "", ownershipFilter = "all", formatFilter = "all", sortBy = "recent" }
) {
  return items
    .filter((item) => {
      const title = item.title || item.name || "";
      const format = item.format || item.platform || "";
      const digital = isDigitalOwnership(item.ownership_type, format);

      if (ownershipFilter === "physical" && digital) return false;
      if (ownershipFilter === "digital" && !digital) return false;

      if (formatFilter !== "all" && format !== formatFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          title,
          item.subtitle,
          item.author,
          item.director,
          item.studio,
          item.creator,
          item.network,
          item.developer,
          item.publisher,
          item.platform,
          item.format,
          item.genre,
          item.location,
          item.edition,
          item.isbn,
          item.barcode,
          item.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const titleA = (a.title || a.name || "").toLowerCase();
      const titleB = (b.title || b.name || "").toLowerCase();
      const yearA = Number(a.release_year || a.publication_year || 0);
      const yearB = Number(b.release_year || b.publication_year || 0);
      const ratingA = Number(a.rating ?? a.complexity_weight ?? -1);
      const ratingB = Number(b.rating ?? b.complexity_weight ?? -1);

      if (sortBy === "title_asc") return titleA.localeCompare(titleB);
      if (sortBy === "title_desc") return titleB.localeCompare(titleA);
      if (sortBy === "year_desc") return yearB - yearA;
      if (sortBy === "rating_desc") return ratingB - ratingA;
      return (b.id || 0) - (a.id || 0);
    });
}

/* ============================================================================
   5. PLEX DETAIL SCREEN LAYOUT (WITH COLLECTION ASSIGNMENT DIALOG)
============================================================================ */
export function PlexDetailView({
  item,
  itemType,
  typeLabel,
  backPath,
  backLabel,
  editPath,
  onDelete,
  primaryCreatorLabel,
  primaryCreatorValue,
  specs = [],
  aspectRatio = "150%",
}) {
  const navigate = useNavigate();
  const { collections, triggerRefresh, notifySuccess } = useApp();
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [itemCollections, setItemCollections] = useState(item?.collections || []);

  React.useEffect(() => {
    setItemCollections(item?.collections || []);
  }, [item]);

  if (!item) return null;

  const coverSrc = resolveCoverUrl(item.cover_url);
  const title = item.title || item.name;
  const year = item.release_year || item.publication_year;
  const digital = isDigitalOwnership(item.ownership_type, item.format);
  const ratingVal = item.rating ?? item.complexity_weight;

  const isInCollection = (colId) => itemCollections.some((c) => Number(c.id) === Number(colId));

  const handleToggleCollection = async (collection) => {
    const currentlyIn = isInCollection(collection.id);
    try {
      if (currentlyIn) {
        await fetch(`${API_URL}/collections/${collection.id}/items/${itemType}/${item.id}`, {
          method: "DELETE",
        });
        setItemCollections((prev) => prev.filter((c) => Number(c.id) !== Number(collection.id)));
        notifySuccess(`Removed from "${collection.name}"`);
      } else {
        await fetch(`${API_URL}/collections/${collection.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_type: itemType, item_id: item.id }),
        });
        setItemCollections((prev) => [...prev, collection]);
        notifySuccess(`Added to "${collection.name}"`);
      }
      triggerRefresh();
    } catch (err) {
      console.error("Failed toggling collection:", err);
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "85vh", pb: 6 }}>
      {/* ATMOSPHERIC BLURRED PLEX BACKDROP */}
      <Box
        sx={{
          position: "absolute",
          top: -24,
          left: -24,
          right: -24,
          height: 440,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {coverSrc && (
          <Box
            sx={{
              position: "absolute",
              inset: -40,
              backgroundImage: `url("${coverSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center 25%",
              filter: "blur(45px) saturate(1.3)",
              opacity: 0.28,
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(13,15,20,0.45) 0%, rgba(13,15,20,0.88) 70%, #0d0f14 100%)",
          }}
        />
      </Box>

      {/* CONTENT CONTAINER */}
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 1320, mx: "auto", pt: 1 }}>
        {/* TOP NAVIGATION BAR */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(backPath)}
            sx={{
              color: "#D1D5DB",
              bgcolor: "rgba(22, 25, 34, 0.75)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff" },
            }}
          >
            {backLabel || "Back to Library"}
          </Button>

          <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<CollectionsIcon />}
              onClick={() => setCollectionDialogOpen(true)}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#F3F4F6",
                bgcolor: "rgba(22, 25, 34, 0.75)",
                "&:hover": { borderColor: PLEX_GOLD, color: PLEX_GOLD },
              }}
            >
              Collections ({itemCollections.length})
            </Button>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(editPath)}
              sx={{
                bgcolor: PLEX_GOLD,
                color: "#FFFFFF",
                fontWeight: 800,
                "&:hover": { bgcolor: "#4D9BFF" },
              }}
            >
              Edit Details
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
              sx={{
                borderColor: "rgba(239, 68, 68, 0.45)",
                bgcolor: "rgba(239, 68, 68, 0.08)",
                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.18)", borderColor: "#EF4444" },
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* MAIN PLEX HERO LAYOUT */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3.5, md: 5 },
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          {/* LEFT: HIGH-RES POSTER */}
          <Box
            sx={{
              width: { xs: "75%", sm: 280, md: 320 },
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                paddingTop: aspectRatio,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#161922",
                border: "2px solid rgba(255,255,255,0.12)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
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
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                    textAlign: "center",
                    background: "linear-gradient(145deg, #1e2330 0%, #12151e 100%)",
                  }}
                >
                  <Box sx={{ color: PLEX_GOLD, mb: 1.5 }}>
                    {getCategoryIcon(itemType, "large")}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {title}
                  </Typography>
                </Box>
              )}

              {/* SPINE LIGHTING EFFECT */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 14,
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.22) 60%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>

          {/* RIGHT: METADATA & OWNERSHIP LEDGER DETAILS */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            {/* TOP BADGE STRIP */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
              <Chip
                icon={getCategoryIcon(itemType, "small")}
                label={typeLabel}
                size="small"
                sx={{
                  bgcolor: "rgba(51, 140, 255, 0.16)",
                  color: PLEX_GOLD,
                  border: "1px solid rgba(51, 140, 255, 0.4)",
                  fontWeight: 800,
                }}
              />
              <Chip
                icon={digital ? <CloudIcon fontSize="small" /> : <DiscIcon fontSize="small" />}
                label={`${item.ownership_type || (digital ? "Digital" : "Physical")} Ownership`}
                size="small"
                sx={{
                  bgcolor: digital
                    ? "rgba(168, 85, 247, 0.18)"
                    : "rgba(56, 189, 248, 0.16)",
                  color: digital ? "#E9D5FF" : "#BAE6FD",
                  border: digital
                    ? "1px solid rgba(168, 85, 247, 0.4)"
                    : "1px solid rgba(56, 189, 248, 0.35)",
                  fontWeight: 700,
                }}
              />
              {item.format && (
                <Chip
                  label={item.format}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#F9FAFB",
                    border: "1px solid rgba(255,255,255,0.18)",
                    fontWeight: 700,
                  }}
                />
              )}
              {item.status && (
                <Chip
                  icon={<CheckIcon fontSize="small" />}
                  label={item.status}
                  size="small"
                  sx={{
                    bgcolor: "rgba(16, 185, 129, 0.16)",
                    color: "#A7F3D0",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    fontWeight: 700,
                  }}
                />
              )}
              {item.location && (
                <Chip
                  icon={<PlaceIcon fontSize="small" />}
                  label={item.location}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.06)",
                    color: "#D1D5DB",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                />
              )}
            </Box>

            {/* TITLE & SUBTITLE */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.15,
                mb: 0.75,
                fontSize: { xs: "1.9rem", md: "2.5rem" },
              }}
            >
              {title}
            </Typography>

            {item.subtitle && (
              <Typography
                variant="h6"
                sx={{ color: "#9CA3AF", fontWeight: 500, mb: 1.5 }}
              >
                {item.subtitle}
              </Typography>
            )}

            {/* YEAR â€¢ CREATOR â€¢ RATING */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 3,
                color: "#D1D5DB",
              }}
            >
              {year && (
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {year}
                </Typography>
              )}
              {primaryCreatorValue && (
                <Typography variant="subtitle1" sx={{ color: "#9CA3AF" }}>
                  {primaryCreatorLabel ? `${primaryCreatorLabel}: ` : ""}
                  <Box component="span" sx={{ color: "#F3F4F6", fontWeight: 600 }}>
                    {primaryCreatorValue}
                  </Box>
                </Typography>
              )}
              {item.genre && (
                <Chip
                  label={item.genre}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.06)",
                    color: "#D1D5DB",
                  }}
                />
              )}
              {ratingVal != null && ratingVal !== "" && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 1.5,
                    bgcolor: "rgba(51, 140, 255, 0.18)",
                    border: "1px solid rgba(51, 140, 255, 0.45)",
                    color: PLEX_GOLD,
                    fontWeight: 800,
                  }}
                >
                  <StarIcon sx={{ fontSize: 18 }} />
                  {itemType === "boardgame" && item.rating == null
                    ? `Complexity: ${ratingVal} / 5`
                    : `${ratingVal} / 10`}
                </Box>
              )}
            </Box>

            {/* OWNERSHIP & COPY SPECIFICATIONS GRID */}
            <Paper
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                bgcolor: "rgba(22, 25, 34, 0.78)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: PLEX_GOLD,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  display: "block",
                  mb: 1.5,
                }}
              >
                Ownership & Media Ledger Specifications
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {specs
                  .filter((s) => s.value !== null && s.value !== undefined && s.value !== "")
                  .map((spec) => (
                    <Box key={spec.label}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 700,
                          fontSize: "0.68rem",
                        }}
                      >
                        {spec.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#F3F4F6", fontWeight: 600, mt: 0.25 }}
                      >
                        {spec.value}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Paper>

            {/* DESCRIPTION / NOTES */}
            <Paper
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                bgcolor: "rgba(22, 25, 34, 0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: "#9CA3AF",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  display: "block",
                  mb: 1,
                }}
              >
                Synopsis & Copy Notes
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#D1D5DB",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {item.description || "No description or copy notes added yet."}
              </Typography>
            </Paper>

            {/* COLLECTIONS SECTION */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "rgba(22, 25, 34, 0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "#9CA3AF",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  Collections
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setCollectionDialogOpen(true)}
                  sx={{ color: PLEX_GOLD }}
                >
                  Assign to Collection
                </Button>
              </Box>

              {itemCollections.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  This item is not assigned to any collections yet.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {itemCollections.map((col) => (
                    <Chip
                      key={col.id}
                      icon={<CollectionsIcon fontSize="small" />}
                      label={col.name}
                      onClick={() => navigate(`/collections/${col.id}`)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: "rgba(51, 140, 255, 0.14)",
                        color: "#BFDBFE",
                        border: "1px solid rgba(51, 140, 255, 0.35)",
                        "&:hover": { bgcolor: "rgba(51, 140, 255, 0.25)" },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* MANAGE COLLECTIONS DIALOG */}
      <Dialog
        open={collectionDialogOpen}
        onClose={() => setCollectionDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Assign "{title}" to Collections
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {collections.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You haven't created any collections yet.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setCollectionDialogOpen(false);
                  navigate("/add-collection");
                }}
              >
                Create First Collection
              </Button>
            </Box>
          ) : (
            <List>
              {collections.map((col) => {
                const checked = isInCollection(col.id);
                return (
                  <ListItemButton
                    key={col.id}
                    onClick={() => handleToggleCollection(col)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checked}
                        tabIndex={-1}
                        disableRipple
                        sx={{
                          color: "text.secondary",
                          "&.Mui-checked": { color: PLEX_GOLD },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={col.name}
                      secondary={col.description || `${col.item_count || 0} items`}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={() => setCollectionDialogOpen(false)} sx={{ color: PLEX_GOLD }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ============================================================================
   6. COVER UPLOAD & EXTERNAL URL PICKER FOR ADD/EDIT FORMS
============================================================================ */
export function CoverImagePicker({
  imageFile,
  onImageFileChange,
  coverUrlInput,
  onCoverUrlInputChange,
  previewUrl,
  onRemoveImage,
  aspectRatio = "148%",
  label = "Cover Poster",
}) {
  const displayUrl = previewUrl || (coverUrlInput?.trim() ? coverUrlInput.trim() : null);

  return (
    <Box sx={{ width: { xs: "100%", md: 310 }, flexShrink: 0 }}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: "rgba(22, 25, 34, 0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#E5E7EB" }}>
          {label}
        </Typography>

        {/* POSTER PREVIEW BOX */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: aspectRatio,
            borderRadius: 2.5,
            overflow: "hidden",
            bgcolor: "#11131a",
            border: "2px dashed rgba(255,255,255,0.15)",
            mb: 2,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: displayUrl ? `url("${displayUrl}")` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              p: 2,
              textAlign: "center",
            }}
          >
            {!displayUrl && (
              <>
                <UploadIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Poster Preview
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Upload a local file or paste an image URL below
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* UPLOAD FILE BUTTON */}
        <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
          <Button
            variant="contained"
            component="label"
            fullWidth
            startIcon={<UploadIcon />}
            sx={{
              bgcolor: PLEX_GOLD,
              color: "#FFFFFF",
              fontWeight: 700,
              "&:hover": { bgcolor: "#4D9BFF" },
            }}
          >
            Upload File
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) onImageFileChange(file);
              }}
            />
          </Button>

          {(displayUrl || imageFile) && (
            <Tooltip title="Remove Cover">
              <IconButton
                onClick={onRemoveImage}
                sx={{
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#F87171",
                  borderRadius: 2,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {imageFile && (
          <Typography variant="caption" sx={{ display: "block", color: PLEX_GOLD, mb: 1.5 }} noWrap>
            Selected: {imageFile.name}
          </Typography>
        )}

        {/* OR PASTE IMAGE URL */}
        {onCoverUrlInputChange && (
          <TextField
            fullWidth
            size="small"
            label="Or Paste Cover Image URL"
            placeholder="https://..."
            value={coverUrlInput || ""}
            onChange={(e) => onCoverUrlInputChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Paper>
    </Box>
  );
}
