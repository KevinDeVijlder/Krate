import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Chip,
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
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  RemoveCircleOutline as RemoveIcon,
  CollectionsBookmark as CollectionsIcon,
} from "@mui/icons-material";
import { useApp } from "../../AppContext";
import { API_URL, resolveCoverUrl } from "../../api/client";
import {
  PLEX_GOLD,
  MediaPosterCard,
  CoverImagePicker,
  getCategoryIcon,
} from "../common/PlexComponents";

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [collection, setCollection] = useState(null);
  const [vaultItems, setVaultItems] = useState([]);
  const [error, setError] = useState(null);

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  // Edit form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);

  const loadCollection = async () => {
    try {
      const res = await fetch(`${API_URL}/collections/${id}`);
      if (!res.ok) throw new Error("Failed");
      const colData = await res.json();
      setCollection(colData);
      setName(colData.name || "");
      setDescription(colData.description || "");
      if (colData.cover_url) {
        setPreviewUrl(resolveCoverUrl(colData.cover_url));
        if (colData.cover_url.startsWith("http")) setCoverUrlInput(colData.cover_url);
      } else {
        setPreviewUrl(null);
      }
    } catch {
      setError("Failed to load collection.");
    }
  };

  useEffect(() => {
    loadCollection();
    fetch(`${API_URL}/items`)
      .then((r) => r.json())
      .then((data) => setVaultItems(Array.isArray(data) ? data : []))
      .catch(() => setVaultItems([]));
  }, [id]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    setRemoveCover(false);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description);
    if (removeCover) formData.append("remove_cover", "true");
    if (coverUrlInput.trim()) formData.append("cover_url_input", coverUrlInput.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/collections/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        setError("Failed to update collection.");
        return;
      }
      setEditOpen(false);
      await loadCollection();
      triggerRefresh();
      notifySuccess("Collection updated!");
    } catch {
      setError("Failed to update collection.");
    }
  };

  const handleDeleteCollection = async () => {
    if (!window.confirm(`Delete collection "${collection?.name}"? (Items inside will remain in your vault)`))
      return;
    try {
      const res = await fetch(`${API_URL}/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerRefresh();
      notifySuccess("Collection deleted");
      navigate("/collection");
    } catch {
      setError("Failed to delete collection.");
    }
  };

  const isItemInCollection = (itemType, itemId) => {
    return (collection?.items || []).some(
      (i) => i.item_type === itemType && Number(i.item_id) === Number(itemId)
    );
  };

  const handleToggleItemInCollection = async (itemType, itemId, title) => {
    const exists = isItemInCollection(itemType, itemId);
    try {
      if (exists) {
        await fetch(`${API_URL}/collections/${id}/items/${itemType}/${itemId}`, {
          method: "DELETE",
        });
        notifySuccess(`Removed "${title}" from collection`);
      } else {
        await fetch(`${API_URL}/collections/${id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_type: itemType, item_id: itemId }),
        });
        notifySuccess(`Added "${title}" to collection`);
      }
      await loadCollection();
      triggerRefresh();
    } catch (err) {
      console.error("Failed updating collection items:", err);
    }
  };

  const filteredVaultItems = useMemo(() => {
    if (!pickerSearch.trim()) return vaultItems;
    const q = pickerSearch.toLowerCase();
    return vaultItems.filter((item) =>
      [item.title, item.type_label, item.format_badge, item.creator_label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [vaultItems, pickerSearch]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!collection) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

  const coverSrc =
    resolveCoverUrl(collection.cover_url) ||
    resolveCoverUrl(collection.items?.[0]?.cover_url);

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", pb: 6 }}>
      {/* TOP BAR */}
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
          onClick={() => navigate("/collection")}
          sx={{
            color: "#D1D5DB",
            bgcolor: "rgba(22, 25, 34, 0.75)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Back to Collections
        </Button>

        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddItemsOpen(true)}
            sx={{
              bgcolor: PLEX_GOLD,
              color: "#FFFFFF",
              fontWeight: 800,
            }}
          >
            Add / Remove Vault Items
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
            sx={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "#F3F4F6",
              "&:hover": { borderColor: PLEX_GOLD, color: PLEX_GOLD },
            }}
          >
            Edit Collection
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteCollection}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* PLEX COLLECTION HERO BANNER */}
      <Paper
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3.5,
          p: { xs: 3, md: 4.5 },
          mb: 4,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {coverSrc && (
          <Box
            sx={{
              position: "absolute",
              inset: -20,
              backgroundImage: `url("${coverSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(32px) brightness(0.35)",
              zIndex: 0,
            }}
          />
        )}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 3,
          }}
        >
          {resolveCoverUrl(collection.cover_url) && (
            <Box
              component="img"
              src={resolveCoverUrl(collection.cover_url)}
              alt={collection.name}
              sx={{
                width: { xs: "100%", sm: 200 },
                height: 135,
                objectFit: "cover",
                borderRadius: 2.5,
                border: "2px solid rgba(255,255,255,0.15)",
                boxShadow: "0 12px 28px rgba(0,0,0,0.6)",
              }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Chip
              icon={<CollectionsIcon fontSize="small" />}
              label={`CURATED COLLECTION â€¢ ${collection.items?.length || 0} ITEMS`}
              size="small"
              sx={{
                mb: 1,
                bgcolor: "rgba(51, 140, 255, 0.2)",
                color: PLEX_GOLD,
                border: "1px solid rgba(51, 140, 255, 0.45)",
                fontWeight: 800,
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#FFFFFF", mb: 0.75 }}>
              {collection.name}
            </Typography>
            <Typography variant="body1" sx={{ color: "#D1D5DB", maxWidth: 780 }}>
              {collection.description || "Custom collection of owned physical and digital media."}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* COLLECTION ITEMS GRID */}
      {!collection.items || collection.items.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "rgba(22, 25, 34, 0.6)",
            border: "1px dashed rgba(255,255,255,0.12)",
          }}
        >
          <CollectionsIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
            No Items in This Collection Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: "auto" }}>
            Click below to select owned movies, TV shows, videogames, books, or boardgames from your vault to include in "{collection.name}".
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddItemsOpen(true)}
          >
            Add Items from Vault
          </Button>
        </Paper>
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
              xl: "repeat(6, 1fr)",
            },
          }}
        >
          {collection.items.map((item) => (
            <Box
              key={`${item.item_type}-${item.item_id}`}
              sx={{ position: "relative" }}
            >
              <MediaPosterCard
                item={item}
                type={item.item_type}
                showCategoryBadge
                onClick={() => navigate(item.detail_path)}
              />
              <Tooltip title="Remove from Collection">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleItemInCollection(item.item_type, item.item_id, item.title);
                  }}
                  sx={{
                    position: "absolute",
                    top: 38,
                    right: 8,
                    bgcolor: "rgba(13, 15, 20, 0.85)",
                    color: "#F87171",
                    border: "1px solid rgba(248, 113, 113, 0.35)",
                    "&:hover": { bgcolor: "#EF4444", color: "#fff" },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}

      {/* DIALOG 1: ADD / REMOVE ITEMS FROM VAULT */}
      <Dialog
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Manage Items in "{collection.name}"
        </DialogTitle>
        <Box sx={{ px: 3, pb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Filter your owned vault items by title, category, or format..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Divider />
        <DialogContent sx={{ p: 0, maxHeight: 440 }}>
          {filteredVaultItems.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No matching items found in your vault.
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredVaultItems.map((vItem) => {
                const checked = isItemInCollection(vItem.item_type, vItem.item_id);
                return (
                  <ListItemButton
                    key={vItem.uid}
                    onClick={() =>
                      handleToggleItemInCollection(
                        vItem.item_type,
                        vItem.item_id,
                        vItem.title
                      )
                    }
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checked}
                        sx={{
                          color: "text.secondary",
                          "&.Mui-checked": { color: PLEX_GOLD },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {vItem.title}
                          </Typography>
                          <Chip
                            icon={getCategoryIcon(vItem.item_type, "small")}
                            label={vItem.type_label}
                            size="small"
                            sx={{ height: 20, fontSize: "0.68rem" }}
                          />
                        </Box>
                      }
                      secondary={
                        [vItem.format_badge, vItem.ownership_badge, vItem.year]
                          .filter(Boolean)
                          .join(" â€¢ ")
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={() => setAddItemsOpen(false)} sx={{ color: PLEX_GOLD }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: EDIT COLLECTION METADATA */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Collection</DialogTitle>
        <Divider />
        <DialogContent>
          <Box
            component="form"
            id="edit-collection-form"
            onSubmit={handleUpdateCollection}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              pt: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Collection Name *"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2.5 }}
              />
              <TextField
                fullWidth
                label="Description"
                size="small"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
            <CoverImagePicker
              imageFile={imageFile}
              onImageFileChange={setImageFile}
              coverUrlInput={coverUrlInput}
              onCoverUrlInputChange={(val) => {
                setCoverUrlInput(val);
                if (val.trim()) setRemoveCover(false);
              }}
              previewUrl={previewUrl}
              onRemoveImage={() => {
                setImageFile(null);
                setPreviewUrl(null);
                setCoverUrlInput("");
                setRemoveCover(true);
              }}
              aspectRatio="70%"
              label="Collection Cover"
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button type="submit" form="edit-collection-form" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
