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
  "Owned â€¢ Unread",
  "Owned â€¢ Reading",
  "Owned â€¢ Read",
  "Loaned Out",
  "Wishlist",
];

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [language, setLanguage] = useState("English");
  const [publicationYear, setPublicationYear] = useState("");
  const [format, setFormat] = useState("Hardcover");
  const [genre, setGenre] = useState("");
  const [ownershipType, setOwnershipType] = useState("Physical");
  const [platform, setPlatform] = useState("Bookshelf");
  const [edition, setEdition] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("Owned â€¢ Unread");
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
    if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/books`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Create failed");

      triggerRefresh();
      notifySuccess(`"${title.trim()}" added to your Book Vault!`);
      navigate("/books");
    } catch (err) {
      console.error(err);
      setError("Failed to add book");
    }
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: "auto", pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Add Book to Vault
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Catalog a physical book (hardcover, paperback, signed copy) or digital eBook / audiobook.
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
                onClick={() => {
                  setFormat(fmt);
                  if (/ebook|kindle|audio/i.test(fmt)) {
                    setOwnershipType("Digital");
                    setPlatform(fmt.toLowerCase().includes("audio") ? "Audible" : "Kindle");
                  } else {
                    setOwnershipType("Physical");
                    setPlatform("Bookshelf");
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
              <MenuItem value="Physical">Physical Book</MenuItem>
              <MenuItem value="Digital">Digital (eBook / Audiobook)</MenuItem>
            </TextField>

            <TextField
              label="Format (Hardcover, Paperback...)"
              size="small"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            />

            <TextField
              label="Genre (Sci-Fi, Philosophy, Fantasy...)"
              size="small"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 2.5 }}>
            <TextField
              label="Edition (1st Ed, Signed, Deluxe)"
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
              placeholder="Study Bookshelf, Kindle..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <TextField
              label="Condition (Mint, Good...)"
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
              Save Book to Vault
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/books")}
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
          aspectRatio="155%"
          label="Book Jacket / Cover"
        />
      </Box>
    </Box>
  );
}
