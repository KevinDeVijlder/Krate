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

const MOVIE_FORMATS = [
  "4K UHD Blu-ray",
  "Blu-ray",
  "DVD",
  "Steelbook (4K / Blu-ray)",
  "VHS",
  "LaserDisc",
  "Digital 4K UHD",
  "Digital HD",
];

const MOVIE_PLATFORMS = [
  "Physical Shelf",
  "Apple TV / iTunes",
  "Prime Video",
  "Movies Anywhere",
  "Vudu / Fandango at Home",
  "Google TV / YouTube",
  "Microsoft Store",
  "Personal NAS / Local Media Server",
];

const MOVIE_STATUSES = [
  "Owned",
  "Owned â€¢ Watched",
  "Owned â€¢ Unwatched",
  "Loaned Out",
  "Wishlist",
];

export default function AddMovie() {
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [studio, setStudio] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [runtime, setRuntime] = useState("");
  const [genre, setGenre] = useState("");
  const [format, setFormat] = useState("4K UHD Blu-ray");
  const [ownershipType, setOwnershipType] = useState("Physical");
  const [platform, setPlatform] = useState("Physical Shelf");
  const [edition, setEdition] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [barcode, setBarcode] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("Owned");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

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

    if (!title.trim()) return setError("Movie title is required.");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("director", director);
    formData.append("studio", studio);
    formData.append("release_year", releaseYear);
    formData.append("runtime", runtime);
    formData.append("genre", genre);
    formData.append("format", format);
    formData.append("ownership_type", ownershipType);
    formData.append("platform", platform);
    formData.append("edition", edition);
    formData.append("region_code", regionCode);
    formData.append("barcode", barcode);
    formData.append("rating", rating);
    formData.append("status", status);
    formData.append("location", location);
    formData.append("condition", condition);
    formData.append("description", description);
    if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/movies`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to create movie");

      triggerRefresh();
      notifySuccess(`"${title.trim()}" added to your Movie Vault!`);
      navigate("/movies");
    } catch (err) {
      console.error(err);
      setError("Failed to add movie.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Add Movie to Vault
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Record a physical disc (4K UHD, Blu-ray, DVD, Steelbook) or digital movie purchase.
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
        {/* FORM */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{ flex: 1, p: { xs: 2.5, md: 3.5 }, borderRadius: 3, width: "100%" }}
        >
          <Typography variant="overline" sx={{ color: PLEX_GOLD, fontWeight: 800 }}>
            Film Metadata
          </Typography>

          <TextField
            fullWidth
            label="Movie Title *"
            size="small"
            sx={{ mt: 1, mb: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              label="Director"
              size="small"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
            />
            <TextField
              label="Studio / Distributor (e.g. Warner Bros., A24, Criterion)"
              size="small"
              value={studio}
              onChange={(e) => setStudio(e.target.value)}
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
              label="Runtime (mins)"
              type="number"
              size="small"
              value={runtime}
              onChange={(e) => setRuntime(e.target.value)}
            />
            <TextField
              label="Genre"
              size="small"
              placeholder="Sci-Fi, Action..."
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <TextField
              label="Personal Rating (0-10)"
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 10 }}
              size="small"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </Box>

          <Typography variant="overline" sx={{ color: PLEX_GOLD, fontWeight: 800 }}>
            Ownership & Format Details
          </Typography>

          {/* QUICK FORMAT CHIPS */}
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1, mb: 2 }}>
            {MOVIE_FORMATS.map((fmt) => (
              <Chip
                key={fmt}
                label={fmt}
                size="small"
                onClick={() => {
                  setFormat(fmt);
                  if (fmt.toLowerCase().includes("digital")) {
                    setOwnershipType("Digital");
                    if (platform === "Physical Shelf") setPlatform("Apple TV / iTunes");
                  } else {
                    setOwnershipType("Physical");
                    setPlatform("Physical Shelf");
                  }
                }}
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
              select
              label="Ownership Type"
              size="small"
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value)}
            >
              <MenuItem value="Physical">Physical Media (Disc / Tape)</MenuItem>
              <MenuItem value="Digital">Digital License / Purchase</MenuItem>
              <MenuItem value="Physical + Digital">Combo (Physical + Digital Code)</MenuItem>
            </TextField>

            <TextField
              label="Format / Medium"
              size="small"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="4K UHD Blu-ray, DVD, Digital..."
            />

            <TextField
              label="Platform / Storefront"
              size="small"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Physical Shelf, Apple TV, Prime Video..."
            />
          </Box>

          {/* Quick Platform suggestions */}
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2.5 }}>
            {MOVIE_PLATFORMS.map((plat) => (
              <Chip
                key={plat}
                label={plat}
                size="small"
                variant="outlined"
                onClick={() => setPlatform(plat)}
                sx={{
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  borderColor: platform === plat ? PLEX_GOLD : "rgba(255,255,255,0.12)",
                  color: platform === plat ? PLEX_GOLD : "text.secondary",
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
            <TextField
              label="Edition (Steelbook, Criterion, Director's Cut)"
              size="small"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {MOVIE_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Shelf / Storage Location"
              size="small"
              placeholder="Living Room Media Rack..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2.5 }}>
            <TextField
              label="Condition (Mint, Sealed, Like New)"
              size="small"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
            <TextField
              label="Region Code (Region Free, A, B, 1, 2)"
              size="small"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
            />
            <TextField
              label="UPC / Barcode"
              size="small"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Synopsis & Copy Notes (Special features, slipcover notes, etc.)"
            size="small"
            sx={{ mb: 3 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button type="submit" variant="contained" sx={{ px: 3 }}>
              Save Movie to Vault
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/movies")}
              sx={{ borderColor: "rgba(255,255,255,0.2)", color: "#D1D5DB" }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>

        {/* COVER PICKER */}
        <CoverImagePicker
          imageFile={imageFile}
          onImageFileChange={setImageFile}
          coverUrlInput={coverUrlInput}
          onCoverUrlInputChange={setCoverUrlInput}
          previewUrl={previewUrl}
          onRemoveImage={handleRemoveImage}
          label="Movie Poster / Case Art"
        />
      </Box>
    </Box>
  );
}
