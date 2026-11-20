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

const BOOK_FORMATS = [
  "Hardcover",
  "Paperback",
  "Mass Market Paperback",
  "Deluxe / Illustrated Hardcover",
  "Manga / Graphic Novel",
  "eBook (Kindle / EPUB)",
  "Audiobook (Audible)",
];

const BOOK_STATUSES = [
  "Owned",
  "Owned â€¢ Unread",
  "Owned â€¢ Reading",
  "Owned â€¢ Read",
  "Loaned Out",
  "Wishlist",
];

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [language, setLanguage] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [format, setFormat] = useState("");
  const [genre, setGenre] = useState("");
  const [ownershipType, setOwnershipType] = useState("Physical");
  const [platform, setPlatform] = useState("");
  const [edition, setEdition] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("Owned");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/books/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Book not found");
        return r.json();
      })
      .then((data) => {
        setTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setDescription(data.description || "");
        setAuthor(data.author || "");
        setPublisher(data.publisher || "");
        setIsbn(data.isbn || "");
        setPageCount(data.page_count ?? "");
        setLanguage(data.language || "");
        setPublicationYear(data.publication_year ?? "");
        setFormat(data.format || "");
        setGenre(data.genre || "");
        setOwnershipType(data.ownership_type || "Physical");
        setPlatform(data.platform || "");
        setEdition(data.edition || "");
        setRating(data.rating ?? "");
        setStatus(data.status || "Owned");
        setLocation(data.location || "");
        setCondition(data.condition || "");

        if (data.cover_url) {
          setPreviewUrl(resolveCoverUrl(data.cover_url));
          if (data.cover_url.startsWith("http")) setCoverUrlInput(data.cover_url);
        }
      })
      .catch(() => setError("Failed to load book"));
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

    if (!title.trim()) return setError("Title is required.");
    if (!author.trim()) return setError("Author is required.");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subtitle", subtitle);
    formData.append("description", description);
    formData.append("author", author.trim());
    formData.append("publisher", publisher);
    formData.append("isbn", isbn);
    formData.append("page_count", pageCount);
    formData.append("language", language);
    formData.append("publication_year", publicationYear);
    formData.append("format", format);
    formData.append("genre", genre);
    formData.append("ownership_type", ownershipType);
    formData.append("platform", platform);
    formData.append("edition", edition);
    formData.append("rating", rating);
    formData.append("status", status);
    formData.append("location", location);
    formData.append("condition", condition);
    if (removeCover) formData.append("remove_cover", "true");
    if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/books/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Update failed");

      triggerRefresh();
      notifySuccess("Book updated!");
      navigate(`/books/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update book");
    }
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Edit Book
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
            Bibliographic Metadata
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "3fr 2fr" }, gap: 2, mt: 1, mb: 2 }}>
            <TextField
              label="Book Title *"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Subtitle"
              size="small"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              label="Author *"
              size="small"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <TextField
              label="Publisher"
              size="small"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" }, gap: 2, mb: 3 }}>
            <TextField
              label="ISBN"
              size="small"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
            <TextField
              type="number"
              label="Page Count"
              size="small"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
            />
            <TextField
              type="number"
              label="Publication Year"
              size="small"
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
            />
            <TextField
              label="Language"
              size="small"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
            <TextField
              type="number"
              label="Rating (0-10)"
              inputProps={{ step: 0.1, min: 0, max: 10 }}
              size="small"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </Box>

          <Typography variant="overline" sx={{ color: PLEX_GOLD, fontWeight: 800 }}>
            Format & Ownership Details
          </Typography>

          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1, mb: 2 }}>
            {BOOK_FORMATS.map((fmt) => (
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
              select
              label="Ownership Type"
              size="small"
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value)}
            >
              <MenuItem value="Physical">Physical Book</MenuItem>
              <MenuItem value="Digital">Digital (eBook / Audiobook)</MenuItem>
            </TextField>

            <TextField
              label="Format"
              size="small"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            />

            <TextField
              label="Genre"
              size="small"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 2.5 }}>
            <TextField
              label="Edition"
              size="small"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            />
            <TextField
              select
              label="Reading Status"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {BOOK_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Bookshelf / Location"
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
            label="Synopsis & Copy Notes"
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
              onClick={() => navigate(`/books/${id}`)}
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
          aspectRatio="155%"
          label="Book Jacket / Cover"
        />
      </Box>
    </Box>
  );
}
