import express from "express";
import db from "../db.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/collections";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

function removeLocalFile(filePath) {
  if (
    filePath &&
    !filePath.startsWith("http://") &&
    !filePath.startsWith("https://") &&
    fs.existsSync(filePath)
  ) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Failed to remove local cover file:", e);
    }
  }
}

async function resolveCollectionItem(link) {
  const { item_type, item_id, added_at } = link;
  let row = null;

  if (item_type === "movie") {
    row = await db.getAsync("SELECT * FROM movies WHERE id = ?", [item_id]);
    if (row) {
      return {
        ...row,
        item_id: row.id,
        item_type: "movie",
        type_label: "Movie",
        title: row.title,
        subtitle: row.director || row.studio || "",
        year: row.release_year,
        detail_path: `/movies/${row.id}`,
        linked_at: added_at,
      };
    }
  } else if (item_type === "tvshow") {
    row = await db.getAsync("SELECT * FROM tvshows WHERE id = ?", [item_id]);
    if (row) {
      return {
        ...row,
        item_id: row.id,
        item_type: "tvshow",
        type_label: "TV Show",
        title: row.title,
        subtitle: row.seasons_owned || row.network || row.creator || "",
        year: row.release_year,
        detail_path: `/tvshows/${row.id}`,
        linked_at: added_at,
      };
    }
  } else if (item_type === "videogame") {
    row = await db.getAsync("SELECT * FROM videogames WHERE id = ?", [item_id]);
    if (row) {
      return {
        ...row,
        item_id: row.id,
        item_type: "videogame",
        type_label: "Videogame",
        title: row.title,
        subtitle: row.platform || row.developer || row.publisher || "",
        year: row.release_year,
        detail_path: `/videogames/${row.id}`,
        linked_at: added_at,
      };
    }
  } else if (item_type === "book") {
    row = await db.getAsync("SELECT * FROM books WHERE id = ?", [item_id]);
    if (row) {
      return {
        ...row,
        item_id: row.id,
        item_type: "book",
        type_label: "Book",
        title: row.title,
        subtitle: row.author || row.publisher || "",
        year: row.publication_year,
        detail_path: `/books/${row.id}`,
        linked_at: added_at,
      };
    }
  } else if (item_type === "boardgame") {
    row = await db.getAsync("SELECT * FROM boardgames WHERE id = ?", [item_id]);
    if (row) {
      return {
        ...row,
        item_id: row.id,
        item_type: "boardgame",
        type_label: "Boardgame",
        title: row.name,
        subtitle: row.publisher || (row.min_players ? `${row.min_players}-${row.max_players} Players` : ""),
        year: row.release_year,
        detail_path: `/boardgames/${row.id}`,
        linked_at: added_at,
      };
    }
  }

  return null;
}

// GET all collections with item counts and preview covers
router.get("/", async (req, res) => {
  try {
    const collections = await db.allAsync("SELECT * FROM collections ORDER BY id DESC");
    const enriched = [];

    for (const col of collections) {
      const links = await db.allAsync(
        "SELECT * FROM collection_items WHERE collection_id = ? ORDER BY added_at DESC",
        [col.id]
      );
      const resolvedItems = [];
      for (const link of links) {
        const item = await resolveCollectionItem(link);
        if (item) resolvedItems.push(item);
      }

      const previewCovers = resolvedItems
        .map((i) => i.cover_url)
        .filter(Boolean)
        .slice(0, 4);

      enriched.push({
        ...col,
        item_count: resolvedItems.length,
        preview_covers: previewCovers,
      });
    }

    res.json(enriched);
  } catch (err) {
    console.error("Failed to fetch collections:", err);
    res.status(500).json([]);
  }
});

// POST new collection with optional image
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description = "", cover_url_input = null } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const cover_url = req.file
      ? req.file.path.replace(/\\/g, "/")
      : cover_url_input?.trim() || null;

    const result = await db.runAsync(
      "INSERT INTO collections (name, description, cover_url) VALUES (?, ?, ?)",
      [name.trim(), description, cover_url]
    );

    res.status(201).json({ message: "Collection created", id: result.lastID });
  } catch (err) {
    console.error("Failed to add collection:", err);
    res.status(500).json({ error: "Failed to add collection (name might already exist)" });
  }
});

// GET single collection with full resolved items across all media tables
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const collection = await db.getAsync("SELECT * FROM collections WHERE id = ?", [id]);
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const links = await db.allAsync(
      "SELECT * FROM collection_items WHERE collection_id = ? ORDER BY added_at DESC",
      [id]
    );

    const items = [];
    for (const link of links) {
      const resolved = await resolveCollectionItem(link);
      if (resolved) {
        items.push(resolved);
      } else {
        // Clean up orphaned reference if item was deleted previously
        await db.runAsync("DELETE FROM collection_items WHERE id = ?", [link.id]);
      }
    }

    res.json({ ...collection, items, item_count: items.length });
  } catch (err) {
    console.error("Failed to fetch collection:", err);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

// PUT update collection
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, description = "", cover_url_input = null, remove_cover = null } = req.body;

  try {
    const existing = await db.getAsync("SELECT cover_url FROM collections WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Collection not found" });

    let cover_url = existing.cover_url;

    if (req.file) {
      removeLocalFile(cover_url);
      cover_url = req.file.path.replace(/\\/g, "/");
    } else if (remove_cover === "true") {
      removeLocalFile(cover_url);
      cover_url = null;
    } else if (cover_url_input && cover_url_input.trim()) {
      cover_url = cover_url_input.trim();
    }

    await db.runAsync(
      `UPDATE collections
       SET name = ?, description = ?, cover_url = ?
       WHERE id = ?`,
      [name.trim(), description, cover_url, id]
    );

    res.json({ message: "Collection updated" });
  } catch (err) {
    console.error("Update collection failed:", err);
    res.status(500).json({ error: "Failed to update collection" });
  }
});

// POST add item to collection
router.post("/:id/items", async (req, res) => {
  const { id } = req.params;
  const { item_type, item_id } = req.body;

  if (!item_type || !item_id) {
    return res.status(400).json({ error: "item_type and item_id are required" });
  }

  try {
    await db.runAsync(
      `INSERT OR IGNORE INTO collection_items (collection_id, item_type, item_id)
       VALUES (?, ?, ?)`,
      [id, item_type, Number(item_id)]
    );
    res.status(201).json({ message: "Item added to collection" });
  } catch (err) {
    console.error("Failed to add item to collection:", err);
    res.status(500).json({ error: "Failed to add item to collection" });
  }
});

// DELETE remove item from collection
router.delete("/:id/items/:itemType/:itemId", async (req, res) => {
  const { id, itemType, itemId } = req.params;
  try {
    await db.runAsync(
      `DELETE FROM collection_items
       WHERE collection_id = ? AND item_type = ? AND item_id = ?`,
      [id, itemType, Number(itemId)]
    );
    res.json({ message: "Item removed from collection" });
  } catch (err) {
    console.error("Failed to remove item from collection:", err);
    res.status(500).json({ error: "Failed to remove item from collection" });
  }
});

// DELETE collection and remove its items links + image
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const collection = await db.getAsync("SELECT * FROM collections WHERE id = ?", [id]);
    if (collection?.cover_url) {
      removeLocalFile(collection.cover_url);
    }

    await db.runAsync("DELETE FROM collection_items WHERE collection_id = ?", [id]);
    await db.runAsync("DELETE FROM collections WHERE id = ?", [id]);

    res.json({ message: "Collection deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

export default router;
