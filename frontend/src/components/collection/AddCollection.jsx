import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../AppContext";
import { API_URL } from "../../api/client";
import { CoverImagePicker, PLEX_GOLD } from "../common/PlexComponents";

export default function AddCollection() {
  const [name, setName] = useState("");
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

    if (!name.trim()) {
      setError("Collection name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description);
      if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${API_URL}/collections`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || "Failed to add collection");
        return;
      }

      triggerRefresh();
      notifySuccess(`Collection "${name.trim()}" created!`);
      navigate("/collection");
    } catch (err) {
      console.error(err);
      setError("Failed to add collection");
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Create New Collection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Bundle owned movies, TV box sets, videogames, books, or boardgames into a curated collection.
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
            Collection Details
          </Typography>

          <TextField
            label="Collection Name *"
            placeholder="e.g. 4K Steelbook Wall, Middle-earth Saga, FromSoftware Collection"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1, mb: 2.5 }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            size="small"
            placeholder="Optional description or notes about this collection..."
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button type="submit" variant="contained" sx={{ px: 3 }}>
              Create Collection
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/collection")}
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
          aspectRatio="75%"
          label="Collection Banner / Cover (Optional)"
        />
      </Box>
    </Box>
  );
}
