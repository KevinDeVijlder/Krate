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

const BOARDGAME_FORMATS = [
  "Base Game",
  "Deluxe / Collector's Edition",
  "Expansion",
  "Big Box / All-In Edition",
  "Card / Travel Game",
];

const BOARDGAME_STATUSES = [
  "Owned â€¢ Played",
  "Owned â€¢ Unplayed (Shelf of Opportunity)",
  "Loaned Out",
  "Wishlist",
];

export default function AddBoardgame() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [publisher, setPublisher] = useState("");
  const [designer, setDesigner] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [genre, setGenre] = useState("");
  const [minPlayers, setMinPlayers] = useState(1);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [avgPlaytime, setAvgPlaytime] = useState(45);
  const [complexityWeight, setComplexityWeight] = useState(2.5);
  const [format, setFormat] = useState("Base Game");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("Owned â€¢ Played");
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

    if (!name.trim()) return setError("Boardgame name is required.");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description);
    formData.append("publisher", publisher);
    formData.append("designer", designer);
    formData.append("release_year", releaseYear);
    formData.append("genre", genre);
    formData.append("min_players", minPlayers);
    formData.append("max_players", maxPlayers);
    formData.append("avg_playtime", avgPlaytime);
    formData.append("complexity_weight", complexityWeight);
    formData.append("format", format);
    formData.append("rating", rating);
    formData.append("status", status);
    formData.append("location", location);
    formData.append("condition", condition);
    if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/boardgames`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Create failed");

      triggerRefresh();
      notifySuccess(`"${name.trim()}" added to your Boardgame Vault!`);
      navigate("/boardgames");
    } catch (err) {
      console.error(err);
      setError("Failed to add boardgame");
    }
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Add Boardgame to Vault
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Record a tabletop boardgame, expansion, or collector box set in your physical inventory.
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
            Tabletop Metadata
          </Typography>

          <TextField
            fullWidth
            label="Boardgame Name *"
            size="small"
            sx={{ mt: 1, mb: 2 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              label="Publisher (e.g. Stonemaier Games, Catan Studio, Leder Games)"
              size="small"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
            <TextField
              label="Game Designer"
              size="small"
              value={designer}
              onChange={(e) => setDesigner(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(6, 1fr)" }, gap: 2, mb: 3 }}>
            <TextField
              type="number"
              label="Min Players"
              size="small"
              value={minPlayers}
              onChange={(e) => setMinPlayers(e.target.value)}
            />
            <TextField
              type="number"
              label="Max Players"
              size="small"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
            />
            <TextField
              type="number"
              label="Playtime (mins)"
              size="small"
              value={avgPlaytime}
              onChange={(e) => setAvgPlaytime(e.target.value)}
            />
            <TextField
              type="number"
              inputProps={{ step: 0.1, min: 1, max: 5 }}
              label="Complexity (1-5)"
              size="small"
              value={complexityWeight}
              onChange={(e) => setComplexityWeight(e.target.value)}
            />
            <TextField
              type="number"
              label="Release Year"
              size="small"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
            />
            <TextField
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 10 }}
              label="Rating (0-10)"
              size="small"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </Box>

          <Typography variant="overline" sx={{ color: PLEX_GOLD, fontWeight: 800 }}>
            Box Edition & Storage Details
          </Typography>

          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1, mb: 2 }}>
            {BOARDGAME_FORMATS.map((fmt) => (
              <Chip
                key={fmt}
                label={fmt}
                size="small"
                onClick={() => setFormat(fmt)}
                sx={{
                  cursor: "pointer",
                  bgcolor: format === fmt ? PLEX_GOLD : "rgba(255,255,255,0.06)",
                  color: format === fmt ? "#FFFFFF" : "#D1D5DB",
                  fontWeight: 700,
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
            <TextField
              label="Box Format / Edition"
              size="small"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            />
            <TextField
              label="Category / Mechanism (Strategy, Deckbuilder, Co-op...)"
              size="small"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {BOARDGAME_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2.5 }}>
            <TextField
              label="Shelf Location (e.g. Kallax Row 2, Game Closet)"
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <TextField
              label="Component Condition (Sleeved, Mint, Punched, Sealed)"
              size="small"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description & Box Notes (Included expansions in box, custom inserts, sleeves...)"
            size="small"
            sx={{ mb: 3 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button type="submit" variant="contained" sx={{ px: 3 }}>
              Save Boardgame to Vault
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/boardgames")}
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
          aspectRatio="105%"
          label="Boardgame Box Cover"
        />
      </Box>
    </Box>
  );
}
