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
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL, resolveCoverUrl } from "../../../api/client";
import { CoverImagePicker, PLEX_GOLD } from "../../common/PlexComponents";

const TV_FORMATS = [
  "Blu-ray Box Set",
  "4K UHD Box Set",
  "DVD Box Set",
  "Blu-ray (Individual Seasons)",
  "DVD (Individual Seasons)",
  "Steelbook Series",
  "Digital Season Pass",
];

const TV_STATUSES = [
  "Owned â€¢ Complete Series",
  "Owned â€¢ Partial Seasons",
  "Owned â€¢ Watched",
  "Owned â€¢ Unwatched",
  "Loaned Out",
  "Wishlist",
];

export default function EditTvShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [network, setNetwork] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [seasonsOwned, setSeasonsOwned] = useState("");
  const [totalSeasons, setTotalSeasons] = useState("");
  const [episodesCount, setEpisodesCount] = useState("");
  const [genre, setGenre] = useState("");
  const [format, setFormat] = useState("");
  const [ownershipType, setOwnershipType] = useState("Physical");
  const [platform, setPlatform] = useState("");
  const [edition, setEdition] = useState("");
  const [barcode, setBarcode] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("Owned");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/tvshows/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setTitle(data.title || "");
        setCreator(data.creator || "");
        setNetwork(data.network || "");
        setReleaseYear(data.release_year ?? "");
        setSeasonsOwned(data.seasons_owned || "");
        setTotalSeasons(data.total_seasons ?? "");
        setEpisodesCount(data.episodes_count ?? "");
        setGenre(data.genre || "");
        setFormat(data.format || "");
        setOwnershipType(data.ownership_type || "Physical");
        setPlatform(data.platform || "");
        setEdition(data.edition || "");
        setBarcode(data.barcode || "");
        setRating(data.rating ?? "");
        setStatus(data.status || "Owned");
        setLocation(data.location || "");
        setCondition(data.condition || "");
        setDescription(data.description || "");
        if (data.cover_url) {
          setPreviewUrl(resolveCoverUrl(data.cover_url));
          if (data.cover_url.startsWith("http")) setCoverUrlInput(data.cover_url);
        }
      })
      .catch(() => setError("Failed to load TV Show"));
  }, [id]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    setRemoveCover(false);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setCoverUrlInput("");
    setRemoveCover(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Series title is required.");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("creator", creator);
    formData.append("network", network);
    formData.append("release_year", releaseYear);
    formData.append("seasons_owned", seasonsOwned);
    formData.append("total_seasons", totalSeasons);
    formData.append("episodes_count", episodesCount);
    formData.append("genre", genre);
    formData.append("format", format);
    formData.append("ownership_type", ownershipType);
    formData.append("platform", platform);
    formData.append("edition", edition);
    formData.append("barcode", barcode);
    formData.append("rating", rating);
    formData.append("status", status);
    formData.append("location", location);
    formData.append("condition", condition);
    formData.append("description", description);
    if (removeCover) formData.append("remove_cover", "true");
    if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/tvshows/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update TV show");

      triggerRefresh();
      notifySuccess("TV Show updated!");
      navigate(`/tvshows/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update TV Show.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Edit TV Show / Box Set
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
            Series Metadata
          </Typography>

          <TextField
            fullWidth
            label="Series Title *"
            size="small"
            sx={{ mt: 1, mb: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              label="Showrunner / Creator"
              size="small"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
            />
            <TextField
              label="Original Network / Studio"
              size="small"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
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
              label="Total Seasons"
              type="number"
              size="small"
              value={totalSeasons}
              onChange={(e) => setTotalSeasons(e.target.value)}
            />
            <TextField
              label="Genre"
              size="small"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
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
            Owned Seasons & Format
          </Typography>

          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1, mb: 2 }}>
            {TV_FORMATS.map((fmt) => (
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

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              label="Seasons Owned"
              size="small"
              value={seasonsOwned}
              onChange={(e) => setSeasonsOwned(e.target.value)}
            />
            <TextField
              label="Edition"
              size="small"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
            <TextField
              select
              label="Ownership Type"
              size="small"
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value)}
            >
              <MenuItem value="Physical">Physical Media (Discs / Box Set)</MenuItem>
              <MenuItem value="Digital">Digital Season Pass / Purchase</MenuItem>
            </TextField>

            <TextField
              label="Format / Medium"
              size="small"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            />

            <TextField
              label="Platform / Storefront"
              size="small"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2.5 }}>
            <TextField
              select
              label="Status"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {TV_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Shelf / Storage Location"
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <TextField
              label="Condition"
              size="small"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Synopsis & Box Set Notes"
            size="small"
            sx={{ mb: 3 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button type="submit" variant="contained" sx={{ px: 3 }}>
              Save Changes
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/tvshows/${id}`)}
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
          onCoverUrlInputChange={(val) => {
            setCoverUrlInput(val);
            if (val.trim()) setRemoveCover(false);
          }}
          previewUrl={previewUrl}
          onRemoveImage={handleRemoveImage}
          label="Series Poster / Box Set Art"
        />
      </Box>
    </Box>
  );
}
