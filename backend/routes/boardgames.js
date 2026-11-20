import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/boardgames";
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

// GET all boardgames
router.get("/", async (req, res) => {
  try {
    const rows = await db.allAsync(`SELECT * FROM boardgames ORDER BY added_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch boardgames:", err);
    res.status(500).json([]);
  }
});

// GET single boardgame
router.get("/:id", async (req, res) => {
  try {
    const row = await db.getAsync("SELECT * FROM boardgames WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Boardgame not found" });

    const collections = await db.allAsync(
      `SELECT c.id, c.name, c.cover_url
       FROM collections c
       INNER JOIN collection_items ci ON ci.collection_id = c.id
       WHERE ci.item_type = 'boardgame' AND ci.item_id = ?`,
      [req.params.id]
    );

    res.json({ ...row, collections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch boardgame" });
  }
});

// POST create boardgame
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      title,
      description = null,
      publisher = null,
      designer = null,
      release_year = null,
      genre = null,
      min_players = null,
      max_players = null,
      avg_playtime = null,
      complexity_weight = null,
      format = "Base Game",
      ownership_type = "Physical",
      rating = null,
      status = "Owned",
      location = null,
      condition = null,
      cover_url_input = null,
    } = req.body;

    const finalName = (name || title || "").trim();
    if (!finalName) {
      return res.status(400).json({ error: "Name is required" });
    }

    const cover_url = req.file
      ? req.file.path.replace(/\\/g, "/")
      : cover_url_input?.trim() || null;

    const result = await db.runAsync(
      `INSERT INTO boardgames (
        name, description, cover_url, publisher, designer, release_year, genre,
        min_players, max_players, avg_playtime, complexity_weight,
        format, ownership_type, rating, status, location, condition
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalName,
        description || null,
        cover_url,
        publisher || null,
        designer || null,
        release_year ? Number(release_year) : null,
        genre || null,
        min_players !== "" && min_players !== null ? Number(min_players) : null,
        max_players !== "" && max_players !== null ? Number(max_players) : null,
        avg_playtime !== "" && avg_playtime !== null ? Number(avg_playtime) : null,
        complexity_weight !== "" && complexity_weight !== null ? Number(complexity_weight) : null,
        format || "Base Game",
        ownership_type || "Physical",
        rating !== "" && rating !== null ? Number(rating) : null,
        status || "Owned",
        location || null,
        condition || null,
      ]
    );

    res.status(201).json({ message: "Boardgame created", id: result.lastID });
  } catch (err) {
    console.error("Failed to create boardgame:", err);
    res.status(500).json({ error: "Failed to create boardgame" });
  }
});

// PUT update boardgame
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM boardgames WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Boardgame not found" });

    const {
      name,
      title,
      description = null,
      publisher = null,
      designer = null,
      release_year = null,
      genre = null,
      min_players = null,
      max_players = null,
      avg_playtime = null,
      complexity_weight = null,
      format = "Base Game",
      ownership_type = "Physical",
      rating = null,
      status = "Owned",
      location = null,
      condition = null,
      cover_url_input = null,
      remove_cover = null,
      in_trash = 0,
    } = req.body;

    const finalName = (name || title || "").trim();

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
      `UPDATE boardgames SET
        name = ?, description = ?, cover_url = ?, publisher = ?, designer = ?,
        release_year = ?, genre = ?, min_players = ?, max_players = ?,
        avg_playtime = ?, complexity_weight = ?, format = ?, ownership_type = ?,
        rating = ?, status = ?, location = ?, condition = ?,
        updated_at = datetime('now'), in_trash = ?
       WHERE id = ?`,
      [
        finalName,
        description || null,
        cover_url,
        publisher || null,
        designer || null,
        release_year ? Number(release_year) : null,
        genre || null,
        min_players !== "" && min_players !== null ? Number(min_players) : null,
        max_players !== "" && max_players !== null ? Number(max_players) : null,
        avg_playtime !== "" && avg_playtime !== null ? Number(avg_playtime) : null,
        complexity_weight !== "" && complexity_weight !== null ? Number(complexity_weight) : null,
        format || "Base Game",
        ownership_type || "Physical",
        rating !== "" && rating !== null ? Number(rating) : null,
        status || "Owned",
        location || null,
        condition || null,
        in_trash,
        id,
      ]
    );

    res.json({ message: "Boardgame updated" });
  } catch (err) {
    console.error("Failed to update boardgame:", err);
    res.status(500).json({ error: "Failed to update boardgame" });
  }
});

// DELETE boardgame
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM boardgames WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Boardgame not found" });

    removeLocalFile(existing.cover_url);
    await db.runAsync("DELETE FROM collection_items WHERE item_type = 'boardgame' AND item_id = ?", [id]);
    await db.runAsync("DELETE FROM boardgames WHERE id = ?", [id]);

    res.json({ message: "Boardgame deleted" });
  } catch (err) {
    console.error("Failed to delete boardgame:", err);
    res.status(500).json({ error: "Failed to delete boardgame" });
  }
});

export default router;
