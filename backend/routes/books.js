import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/books";
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

// GET all books
router.get("/", async (req, res) => {
  try {
    const rows = await db.allAsync(`SELECT * FROM books ORDER BY added_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch books:", err);
    res.status(500).json([]);
  }
});

// GET single book
router.get("/:id", async (req, res) => {
  try {
    const row = await db.getAsync("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Book not found" });

    const collections = await db.allAsync(
      `SELECT c.id, c.name, c.cover_url
       FROM collections c
       INNER JOIN collection_items ci ON ci.collection_id = c.id
       WHERE ci.item_type = 'book' AND ci.item_id = ?`,
      [req.params.id]
    );

    res.json({ ...row, collections });
  } catch (err) {
    console.error("Failed to fetch book:", err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

// POST create book
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      subtitle = null,
      description = null,
      author = "Unknown Author",
      publisher = null,
      isbn = null,
      page_count = null,
      language = null,
      publication_year = null,
      format = null,
      genre = null,
      ownership_type = "Physical",
      platform = null,
      edition = null,
      rating = null,
      status = "Owned",
      location = null,
      condition = null,
      cover_url_input = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const cover_url = req.file
      ? req.file.path.replace(/\\/g, "/")
      : cover_url_input?.trim() || null;

    const result = await db.runAsync(
      `INSERT INTO books (
        title, subtitle, description, cover_url, author, publisher, isbn,
        page_count, language, publication_year, format, genre,
        ownership_type, platform, edition, rating, status, location, condition
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        subtitle || null,
        description || null,
        cover_url,
        author?.trim() || "Unknown Author",
        publisher || null,
        isbn || null,
        page_count ? Number(page_count) : null,
        language || null,
        publication_year ? Number(publication_year) : null,
        format || null,
        genre || null,
        ownership_type || "Physical",
        platform || null,
        edition || null,
        rating !== "" && rating !== null ? Number(rating) : null,
        status || "Owned",
        location || null,
        condition || null,
      ]
    );

    res.status(201).json({ message: "Book created", id: result.lastID });
  } catch (err) {
    console.error("Failed to create book:", err);
    res.status(500).json({ error: "Failed to create book" });
  }
});

// PUT update book
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM books WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Book not found" });

    const {
      title,
      subtitle = null,
      description = null,
      author = "Unknown Author",
      publisher = null,
      isbn = null,
      page_count = null,
      language = null,
      publication_year = null,
      format = null,
      genre = null,
      ownership_type = "Physical",
      platform = null,
      edition = null,
      rating = null,
      status = "Owned",
      location = null,
      condition = null,
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
      `UPDATE books SET
        title = ?, subtitle = ?, description = ?, cover_url = ?, author = ?,
        publisher = ?, isbn = ?, page_count = ?, language = ?, publication_year = ?,
        format = ?, genre = ?, ownership_type = ?, platform = ?, edition = ?,
        rating = ?, status = ?, location = ?, condition = ?,
        updated_at = datetime('now'), in_trash = ?
       WHERE id = ?`,
      [
        title,
        subtitle || null,
        description || null,
        cover_url,
        author?.trim() || "Unknown Author",
        publisher || null,
        isbn || null,
        page_count ? Number(page_count) : null,
        language || null,
        publication_year ? Number(publication_year) : null,
        format || null,
        genre || null,
        ownership_type || "Physical",
        platform || null,
        edition || null,
        rating !== "" && rating !== null ? Number(rating) : null,
        status || "Owned",
        location || null,
        condition || null,
        in_trash,
        id,
      ]
    );

    res.json({ message: "Book updated" });
  } catch (err) {
    console.error("Failed to update book:", err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// DELETE book
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getAsync("SELECT cover_url FROM books WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Book not found" });

    removeLocalFile(existing.cover_url);
    await db.runAsync("DELETE FROM collection_items WHERE item_type = 'book' AND item_id = ?", [id]);
    await db.runAsync("DELETE FROM books WHERE id = ?", [id]);

    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("Failed to delete book:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
