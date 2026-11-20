import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/videogames";
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

// GET all videogames
router.get("/", async (req, res) => {
  try {
    const rows = await db.allAsync(`SELECT * FROM videogames ORDER BY added_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch videogames:", err);
    res.status(500).json([]);
  }
});

// GET single videogame
router.get("/:id", async (req, res) => {
  try {
    const row = await db.getAsync("SELECT * FROM videogames WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Videogame not found" });

    const collections = await db.allAsync(
      `SELECT c.id, c.name, c.cover_url
       FROM collections c
       INNER JOIN collection_items ci ON ci.collection_id = c.id
       WHERE ci.item_type = 'videogame' AND ci.item_id = ?`,
      [req.params.id]
    );

    res.json({ ...row, collections });
  } catch (err) {
    console.error("Failed to fetch videogame:", err);
    res.status(500).json({ error: "Failed to fetch videogame" });
  }
});

// POST create videogame
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description = null,
      developer = null,
      publisher = null,
      release_year = null,
      platform = null,
      genre = null,
      mode = null,
      rating = null,
      ownership_type = "Physical",
      status = "Owned",
      format = null,
      edition = null,
      location = null,
      condition = null,
      barcode = null,
      cover_url_input = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const cover_url = req.file
      ? req.file.path.replace(/\\/g, "/")
      : cover_url_input?.trim() || null;

    const result = await db.runAsync(
      `INSERT INTO videogames (
        title, description, cover_url, developer, publisher, release_year,
        platform, genre, mode, rating, ownership_type, status,
        format, edition, location, condition, barcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description || null,
        cover_url,
        developer || null,
        publisher || null,
        release_year ? Number(release_year) : null,
        platform || null,
        genre || null,
        mode || null,
        rating !== "" && rating !== null ? Number(rating) : null,
        ownership_type || "Physical",
        status || "Owned",
        format || null,
        edition || null,
        location || null,
        condition || null,
        barcode || null,
      ]
    );

    res.status(201).json({ message: "Videogame created", id: result.lastID });
  } catch (err) {
    console.error("Failed to create videogame:", err);
    res.status(500).json({ error: "Failed to create videogame" });
  }
});

// PUT update videogame
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM videogames WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Videogame not found" });

    const {
      title,
      description = null,
      developer = null,
      publisher = null,
      release_year = null,
      platform = null,
      genre = null,
      mode = null,
      rating = null,
      ownership_type = "Physical",
      status = "Owned",
      format = null,
      edition = null,
      location = null,
      condition = null,
      barcode = null,
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
      `UPDATE videogames SET
        title = ?, description = ?, cover_url = ?, developer = ?, publisher = ?,
        release_year = ?, platform = ?, genre = ?, mode = ?, rating = ?,
        ownership_type = ?, status = ?, format = ?, edition = ?, location = ?,
        condition = ?, barcode = ?, updated_at = datetime('now'), in_trash = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        cover_url,
        developer || null,
        publisher || null,
        release_year ? Number(release_year) : null,
        platform || null,
        genre || null,
        mode || null,
        rating !== "" && rating !== null ? Number(rating) : null,
        ownership_type || "Physical",
        status || "Owned",
        format || null,
        edition || null,
        location || null,
        condition || null,
        barcode || null,
        in_trash,
        id,
      ]
    );

    res.json({ message: "Videogame updated" });
  } catch (err) {
    console.error("Failed to update videogame:", err);
    res.status(500).json({ error: "Failed to update videogame" });
  }
});

// DELETE videogame
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM videogames WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Videogame not found" });

    removeLocalFile(existing.cover_url);
    await db.runAsync("DELETE FROM collection_items WHERE item_type = 'videogame' AND item_id = ?", [id]);
    await db.runAsync("DELETE FROM videogames WHERE id = ?", [id]);

    res.json({ message: "Videogame deleted" });
  } catch (err) {
    console.error("Failed to delete videogame:", err);
    res.status(500).json({ error: "Failed to delete videogame" });
  }
});

export default router;
