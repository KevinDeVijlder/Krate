import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/movies";
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

// GET all movies
router.get("/", async (req, res) => {
  try {
    const rows = await db.allAsync(`SELECT * FROM movies ORDER BY added_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch movies:", err);
    res.status(500).json([]);
  }
});

// GET single movie
router.get("/:id", async (req, res) => {
  try {
    const row = await db.getAsync("SELECT * FROM movies WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Movie not found" });

    const collections = await db.allAsync(
      `SELECT c.id, c.name, c.cover_url
       FROM collections c
       INNER JOIN collection_items ci ON ci.collection_id = c.id
       WHERE ci.item_type = 'movie' AND ci.item_id = ?`,
      [req.params.id]
    );

    res.json({ ...row, collections });
  } catch (err) {
    console.error("Failed to fetch movie:", err);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

// POST create movie
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      director = null,
      studio = null,
      release_year = null,
      runtime = null,
      genre = null,
      format = null,
      ownership_type = "Physical",
      platform = null,
      edition = null,
      region_code = null,
      barcode = null,
      rating = null,
      status = "Owned",
      location = null,
      condition = null,
      description = null,
      cover_url_input = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const cover_url = req.file
      ? req.file.path.replace(/\\/g, "/")
      : cover_url_input?.trim() || null;

    const result = await db.runAsync(
      `INSERT INTO movies (
        title, director, studio, release_year, runtime, genre,
        format, ownership_type, platform, edition, region_code, barcode,
        rating, status, location, condition, description, cover_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        director || null,
        studio || null,
        release_year ? Number(release_year) : null,
        runtime ? Number(runtime) : null,
        genre || null,
        format || null,
        ownership_type || "Physical",
        platform || null,
        edition || null,
        region_code || null,
        barcode || null,
        rating !== "" && rating !== null ? Number(rating) : null,
        status || "Owned",
        location || null,
        condition || null,
        description || null,
        cover_url,
      ]
    );

    res.status(201).json({ message: "Movie created", id: result.lastID });
  } catch (err) {
    console.error("Failed to create movie:", err);
    res.status(500).json({ error: "Failed to create movie" });
  }
});

// PUT update movie
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM movies WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Movie not found" });

    const {
      title,
      director = null,
      studio = null,
      release_year = null,
      runtime = null,
      genre = null,
      format = null,
      ownership_type = "Physical",
      platform = null,
      edition = null,
      region_code = null,
      barcode = null,
      rating = null,
      status = "Owned",
      location = null,
      condition = null,
      description = null,
      cover_url_input = null,
      remove_cover = null,
      in_trash = 0,
    } = req.body;

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
      `UPDATE movies SET
        title = ?, director = ?, studio = ?, release_year = ?, runtime = ?, genre = ?,
        format = ?, ownership_type = ?, platform = ?, edition = ?, region_code = ?, barcode = ?,
        rating = ?, status = ?, location = ?, condition = ?, description = ?, cover_url = ?,
        updated_at = datetime('now'), in_trash = ?
       WHERE id = ?`,
      [
        title,
        director || null,
        studio || null,
        release_year ? Number(release_year) : null,
        runtime ? Number(runtime) : null,
        genre || null,
        format || null,
        ownership_type || "Physical",
        platform || null,
        edition || null,
        region_code || null,
        barcode || null,
        rating !== "" && rating !== null ? Number(rating) : null,
        status || "Owned",
        location || null,
        condition || null,
        description || null,
        cover_url,
        in_trash,
        id,
      ]
    );

    res.json({ message: "Movie updated" });
  } catch (err) {
    console.error("Failed to update movie:", err);
    res.status(500).json({ error: "Failed to update movie" });
  }
});

// DELETE movie
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM movies WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Movie not found" });

    removeLocalFile(existing.cover_url);
    await db.runAsync("DELETE FROM collection_items WHERE item_type = 'movie' AND item_id = ?", [id]);
    await db.runAsync("DELETE FROM movies WHERE id = ?", [id]);

    res.json({ message: "Movie deleted" });
  } catch (err) {
    console.error("Failed to delete movie:", err);
    res.status(500).json({ error: "Failed to delete movie" });
  }
});

export default router;
