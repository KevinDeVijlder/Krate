import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  MenuItem,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import { CoverImagePicker, PLEX_GOLD } from "../../common/PlexComponents";

const GAME_PLATFORMS = [
  "PlayStation 5",
  "PlayStation 4",
  "Nintendo Switch",
  "Xbox Series X|S",
  "PC (Steam)",
  "PC (GOG)",
  "PC (Epic Games)",
  "Nintendo 3DS / DS",
  "PlayStation 2 / 3",
  "Retro Console",
];

const GAME_FORMATS = [
  "Physical Disc",
  "Physical Cartridge",
  "Collector's Box Set",
  "Steelbook Edition",
  "Digital License",
];

const GAME_STATUSES = [
  "Owned â€¢ Backlog",
  "Owned â€¢ Playing",
  "Owned â€¢ Completed",
  "Owned â€¢ 100% / Platinum",
  "Loaned Out",
  "Wishlist",
];

export default function AddVideogame() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [developer, setDeveloper] = useState("");
  const [publisher, setPublisher] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [platform, setPlatform] = useState("PlayStation 5");
  const [format, setFormat] = useState("Physical Disc");
  const [edition, setEdition] = useState("");
  const [genre, setGenre] = useState("");
  const [mode, setMode] = useState("Singleplayer");
  const [rating, setRating] = useState("");
  const [ownershipType, setOwnershipType] = useState("Physical");
  const [status, setStatus] = useState("Owned â€¢ Backlog");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const { triggerRefresh, notifySuccess } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setCoverUrlInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Game title is required.");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description);
    formData.append("developer", developer);
    formData.append("publisher", publisher);
    formData.append("release_year", releaseYear);
    formData.append("platform", platform);
    formData.append("format", format);
    formData.append("edition", edition);
    formData.append("genre", genre);
    formData.append("mode", mode);
    formData.append("rating", rating);
    formData.append("ownership_type", ownershipType);
    formData.append("status", status);
    formData.append("location", location);
    formData.append("condition", condition);
    if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/videogames`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Create failed");

      triggerRefresh();
      notifySuccess(`"${title.trim()}" added to your Videogame Vault!`);
      navigate("/videogames");
    } catch (err) {
      console.error(err);
      setError("Failed to add videogame");
    }
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Add Videogame to Vault
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Catalog a physical console disc, cartridge, collector's edition, or digital storefront license.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 3.5,
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
        }}
      >
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{ flex: 1, p: { xs: 2.5, md: 3.5 }, borderRadius: 3, width: "100%" }}
        >
          <Typography variant="overline" sx={{ color: PLEX_GOLD, fontWeight: 800 }}>
            Game Metadata
          </Typography>

          <TextField
            fullWidth
            label="Game Title *"
            size="small"
            sx={{ mt: 1, mb: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              label="Developer (e.g. FromSoftware, Nintendo, Larian)"
              size="small"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
            />
            <TextField
              label="Publisher"
              size="small"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
            <TextField
              label="Release Year"
              type="number"
              size="small"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
            />
            <TextField
              label="Genre (Action RPG, Horror...)"
              size="small"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <TextField
              label="Mode (Singleplayer, Co-op...)"
              size="small"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            />
            <TextField
              label="Rating (0-10)"
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 10 }}
              size="small"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </Box>

          <Typography variant="overline" sx={{ color: PLEX_GOLD, fontWeight: 800 }}>
            Platform & Ownership Format
          </Typography>

          {/* QUICK PLATFORM CHIPS */}
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1, mb: 2 }}>
            {GAME_PLATFORMS.map((p) => (
              <Chip
                key={p}
                label={p}
                size="small"
                onClick={() => {
                  setPlatform(p);
                  if (p.includes("Steam") || p.includes("GOG") || p.includes("Epic")) {
                    setOwnershipType("Digital");
                    setFormat("Digital License");
                  } else if (p.includes("Switch") || p.includes("3DS")) {
                    setOwnershipType("Physical");
                    setFormat("Physical Cartridge");
                  }
                }}
                sx={{
                  cursor: "pointer",
                  bgcolor: platform === p ? PLEX_GOLD : "rgba(255,255,255,0.06)",
                  color: platform === p ? "#FFFFFF" : "#D1D5DB",
                  fontWeight: 700,
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
            <TextField
              select
              label="Ownership Type"
              size="small"
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value)}
            >
              <MenuItem value="Physical">Physical Media (Disc / Cartridge)</MenuItem>
              <MenuItem value="Digital">Digital Storefront License</MenuItem>
            </TextField>

            <TextField
              label="Platform / System"
              size="small"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />

            <TextField
              label="Format / Medium"
              size="small"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="Physical Disc, Cartridge, Digital..."
            />
          </Box>

          {/* Quick Format chips */}
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
            {GAME_FORMATS.map((fmt) => (
              <Chip
                key={fmt}
                label={fmt}
                size="small"
                variant="outlined"
                onClick={() => setFormat(fmt)}
                sx={{
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  borderColor: format === fmt ? PLEX_GOLD : "rgba(255,255,255,0.12)",
                  color: format === fmt ? PLEX_GOLD : "text.secondary",
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 2.5 }}>
            <TextField
              label="Edition (Standard, GOTY, Collector's)"
              size="small"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            />
            <TextField
              select
              label="Play Status"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {GAME_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Shelf / Account Location"
              size="small"
              placeholder="TV Game Rack, Steam..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <TextField
              label="Condition (CIB, Sealed, Loose)"
              size="small"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description & Copy Notes (DLC included, manual condition, etc.)"
            size="small"
            sx={{ mb: 3 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button type="submit" variant="contained" sx={{ px: 3 }}>
              Save Videogame to Vault
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/videogames")}
              sx={{ borderColor: "rgba(255,255,255,0.2)", color: "#D1D5DB" }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>

        <CoverImagePicker
          imageFile={imageFile}
          onImageFileChange={setImageFile}
          coverUrlInput={coverUrlInput}
          onCoverUrlInputChange={setCoverUrlInput}
          previewUrl={previewUrl}
          onRemoveImage={handleRemoveImage}
          label="Game Box Art / Cover"
        />
      </Box>
    </Box>
  );
}
