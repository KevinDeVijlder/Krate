import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import {
  Tune as TuneIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Download as DownloadIcon,
  Devices as DevicesIcon,
  Album as DiscIcon,
  LocalOffer as TagIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { API_URL } from "../api/client";
import { useApp } from "../AppContext";
import { PLEX_GOLD } from "./common/PlexComponents";

export default function Configuration() {
  const [tabIndex, setTabIndex] = useState(0);
  const { triggerRefresh, notifySuccess } = useApp();

  const [platforms, setPlatforms] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [vaultStats, setVaultStats] = useState(null);

  const [platformInput, setPlatformInput] = useState("");
  const [mediaTypeInput, setMediaTypeInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchData("platforms", setPlatforms),
      fetchData("media-types", setMediaTypes),
      fetchData("tags", setTags),
      fetch(`${API_URL}/vault`)
        .then((r) => r.json())
        .then(setVaultStats)
        .catch(() => null),
    ]);
  };

  const fetchData = async (endpoint, setter) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`);
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      const data = await res.json().catch(() => []);
      setter(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setter([]);
    }
  };

  const addItem = async (endpoint, value, setter, inputSetter, label) => {
    if (!value.trim()) return;
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value.trim() }),
      });
      if (res.ok) {
        inputSetter("");
        await fetchData(endpoint, setter);
        triggerRefresh();
        notifySuccess(`Added ${label}: "${value.trim()}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (endpoint, id, setter) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData(endpoint, setter);
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJson = () => {
    if (!vaultStats) return;
    const blob = new Blob([JSON.stringify(vaultStats, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krate-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifySuccess("Exported Krate vault backup as JSON");
  };

  const handleExportCsv = () => {
    if (!vaultStats?.allItems) return;
    const headers = [
      "Category",
      "Title",
      "Creator",
      "Year",
      "Ownership",
      "Format",
      "Platform",
      "Edition",
      "Location",
      "Status",
      "Rating",
    ];
    const rows = vaultStats.allItems.map((i) =>
      [
        i.type_label || i.item_type,
        i.title || i.name,
        i.creator_label || "",
        i.year || "",
        i.ownership_type || i.ownership_badge || "Physical",
        i.format || i.format_badge || "",
        i.platform || "",
        i.edition || "",
        i.location || "",
        i.status || "Owned",
        i.rating ?? i.complexity_weight ?? "",
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krate-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notifySuccess("Exported Krate inventory as CSV spreadsheet");
  };

  const renderChipGrid = (items, setter, endpoint) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, mt: 2 }}>
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.name}
          onDelete={() => deleteItem(endpoint, item.id, setter)}
          deleteIcon={<DeleteIcon fontSize="small" />}
          sx={{
            py: 2,
            px: 0.5,
            fontSize: "0.85rem",
            bgcolor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            "& .MuiChip-deleteIcon": {
              color: "#9CA3AF",
              "&:hover": { color: "#EF4444" },
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", pb: 6 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, mb: 3 }}>
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
          <TuneIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
            Krate Settings & Vault Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage custom platforms, physical/digital formats, shelf tags, and export your Krate vault backup
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            pt: 1,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            "& .MuiTab-root": { fontWeight: 700, minHeight: 54 },
            "& .Mui-selected": { color: `${PLEX_GOLD} !important` },
            "& .MuiTabs-indicator": { backgroundColor: PLEX_GOLD, height: 3 },
          }}
        >
          <Tab icon={<DevicesIcon fontSize="small" />} iconPosition="start" label="Platforms & Storefronts" />
          <Tab icon={<DiscIcon fontSize="small" />} iconPosition="start" label="Media Formats" />
          <Tab icon={<TagIcon fontSize="small" />} iconPosition="start" label="Shelf Locations & Tags" />
          <Tab icon={<StorageIcon fontSize="small" />} iconPosition="start" label="Vault Backup & Export" />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {/* TAB 0: PLATFORMS */}
          {tabIndex === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Platforms & Digital Storefronts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Consoles, hardware systems, and digital platforms where you own media (e.g., PlayStation 5, Nintendo Switch, Steam, Apple TV, Kindle, Physical Shelf).
              </Typography>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  addItem("platforms", platformInput, setPlatforms, setPlatformInput, "Platform");
                }}
                sx={{ display: "flex", gap: 1.5, mb: 3, maxWidth: 560 }}
              >
                <TextField
                  size="small"
                  label="Add New Platform or Storefront"
                  placeholder="e.g. PlayStation 5, Steam, Apple TV..."
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained" startIcon={<AddIcon />}>
                  Add
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />
              {renderChipGrid(platforms, setPlatforms, "platforms")}
            </Box>
          )}

          {/* TAB 1: MEDIA FORMATS */}
          {tabIndex === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Physical & Digital Formats
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Physical media formats and bindings (e.g., 4K UHD Blu-ray, Blu-ray, DVD, Steelbook, Hardcover, Paperback, Cartridge, Digital License).
              </Typography>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  addItem(
                    "media-types",
                    mediaTypeInput,
                    setMediaTypes,
                    setMediaTypeInput,
                    "Media Format"
                  );
                }}
                sx={{ display: "flex", gap: 1.5, mb: 3, maxWidth: 560 }}
              >
                <TextField
                  size="small"
                  label="Add New Media Format"
                  placeholder="e.g. 4K UHD Blu-ray, Steelbook, Hardcover..."
                  value={mediaTypeInput}
                  onChange={(e) => setMediaTypeInput(e.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained" startIcon={<AddIcon />}>
                  Add
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />
              {renderChipGrid(mediaTypes, setMediaTypes, "media-types")}
            </Box>
          )}

          {/* TAB 2: SHELF LOCATIONS & TAGS */}
          {tabIndex === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Storage Locations, Shelves & Tags
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Track where physical items live in your home or special edition tags (e.g., Living Room Media Rack, Study Bookshelf, Kallax Row 1, Signed Copy).
              </Typography>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  addItem("tags", tagInput, setTags, setTagInput, "Tag / Location");
                }}
                sx={{ display: "flex", gap: 1.5, mb: 3, maxWidth: 560 }}
              >
                <TextField
                  size="small"
                  label="Add New Shelf Location or Tag"
                  placeholder="e.g. Living Room Shelf, Collector's Edition..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained" startIcon={<AddIcon />}>
                  Add
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />
              {renderChipGrid(tags, setTags, "tags")}
            </Box>
          )}

          {/* TAB 3: VAULT EXPORT & STATS */}
          {tabIndex === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Krate Inventory Summary & Backup
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Export your entire catalog of owned physical and digital media for safekeeping or spreadsheet analysis.
              </Typography>

              {vaultStats?.stats && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                    gap: 2,
                    mb: 3.5,
                  }}
                >
                  {[
                    { label: "Total Cataloged Items", val: vaultStats.stats.total },
                    { label: "Physical Media Assets", val: vaultStats.stats.physical },
                    { label: "Digital Licenses", val: vaultStats.stats.digital },
                    { label: "Curated Collections", val: vaultStats.stats.collections },
                    { label: "Movies", val: vaultStats.stats.movies },
                    { label: "TV Shows", val: vaultStats.stats.tvshows },
                    { label: "Videogames", val: vaultStats.stats.videogames },
                    { label: "Books & Boardgames", val: (vaultStats.stats.books || 0) + (vaultStats.stats.boardgames || 0) },
                  ].map((s) => (
                    <Paper
                      key={s.label}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: "rgba(13, 15, 20, 0.55)",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 800, color: PLEX_GOLD }}>
                        {s.val}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {s.label}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCsv}
                >
                  Export Inventory as CSV (Excel / Sheets)
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportJson}
                  sx={{ borderColor: PLEX_GOLD, color: PLEX_GOLD }}
                >
                  Download Full Vault Backup (.JSON)
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
