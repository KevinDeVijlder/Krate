import express from "express";
import db from "../db.js";

const router = express.Router();

export async function getAllUnifiedItems() {
  const [movies, tvshows, videogames, books, boardgames] = await Promise.all([
    db.allAsync("SELECT * FROM movies ORDER BY added_at DESC").catch(() => []),
    db.allAsync("SELECT * FROM tvshows ORDER BY added_at DESC").catch(() => []),
    db.allAsync("SELECT * FROM videogames ORDER BY added_at DESC").catch(() => []),
    db.allAsync("SELECT * FROM books ORDER BY added_at DESC").catch(() => []),
    db.allAsync("SELECT * FROM boardgames ORDER BY added_at DESC").catch(() => []),
  ]);

  const normalizedMovies = movies.map((m) => ({
    ...m,
    uid: `movie-${m.id}`,
    item_id: m.id,
    item_type: "movie",
    type: "movie",
    type_label: "Movie",
    title: m.title,
    creator_label: m.director || m.studio || "",
    year: m.release_year,
    format_badge: m.format || "Movie",
    ownership_badge: m.ownership_type || "Physical",
    platform_badge: m.platform || "",
    detail_path: `/movies/${m.id}`,
  }));

  const normalizedTv = tvshows.map((t) => ({
    ...t,
    uid: `tvshow-${t.id}`,
    item_id: t.id,
    item_type: "tvshow",
    type: "tvshow",
    type_label: "TV Show",
    title: t.title,
    creator_label: t.seasons_owned || t.network || t.creator || "",
    year: t.release_year,
    format_badge: t.format || "TV Series",
    ownership_badge: t.ownership_type || "Physical",
    platform_badge: t.platform || "",
    detail_path: `/tvshows/${t.id}`,
  }));

  const normalizedGames = videogames.map((g) => ({
    ...g,
    uid: `videogame-${g.id}`,
    item_id: g.id,
    item_type: "videogame",
    type: "videogame",
    type_label: "Videogame",
    title: g.title,
    creator_label: g.developer || g.publisher || "",
    year: g.release_year,
    format_badge: g.format || g.platform || "Game",
    ownership_badge: g.ownership_type || "Physical",
    platform_badge: g.platform || "",
    detail_path: `/videogames/${g.id}`,
  }));

  const normalizedBooks = books.map((b) => ({
    ...b,
    uid: `book-${b.id}`,
    item_id: b.id,
    item_type: "book",
    type: "book",
    type_label: "Book",
    title: b.title,
    creator_label: b.author || b.publisher || "",
    year: b.publication_year,
    format_badge: b.format || "Book",
    ownership_badge: b.ownership_type || (b.format && /ebook|kindle|audio|digital/i.test(b.format) ? "Digital" : "Physical"),
    platform_badge: b.platform || b.language || "",
    detail_path: `/books/${b.id}`,
  }));

  const normalizedBoardgames = boardgames.map((bg) => ({
    ...bg,
    uid: `boardgame-${bg.id}`,
    item_id: bg.id,
    item_type: "boardgame",
    type: "boardgame",
    type_label: "Boardgame",
    title: bg.name,
    creator_label: bg.publisher || bg.designer || "",
    year: bg.release_year,
    format_badge: bg.format || (bg.min_players && bg.max_players ? `${bg.min_players}–${bg.max_players}P` : "Tabletop"),
    ownership_badge: bg.ownership_type || "Physical",
    platform_badge: bg.avg_playtime ? `${bg.avg_playtime}m` : "",
    detail_path: `/boardgames/${bg.id}`,
  }));

  const allItems = [
    ...normalizedMovies,
    ...normalizedTv,
    ...normalizedGames,
    ...normalizedBooks,
    ...normalizedBoardgames,
  ].sort((a, b) => {
    const dateA = a.added_at ? new Date(a.added_at).getTime() : 0;
    const dateB = b.added_at ? new Date(b.added_at).getTime() : 0;
    return dateB - dateA;
  });

  return {
    allItems,
    movies: normalizedMovies,
    tvshows: normalizedTv,
    videogames: normalizedGames,
    books: normalizedBooks,
    boardgames: normalizedBoardgames,
  };
}

// GET /vault - full aggregated media vault + stats
router.get("/vault", async (req, res) => {
  try {
    const data = await getAllUnifiedItems();
    const collections = await db.allAsync("SELECT * FROM collections").catch(() => []);

    const physicalCount = data.allItems.filter(
      (i) => !i.ownership_badge || /physical|disc|cartridge|hardcover|paperback|box|blu-ray|dvd|steelbook/i.test(i.ownership_badge)
    ).length;

    const digitalCount = data.allItems.filter(
      (i) => i.ownership_badge && /digital|ebook|audiobook|cloud|steam/i.test(i.ownership_badge)
    ).length;

    res.json({
      ...data,
      stats: {
        total: data.allItems.length,
        physical: physicalCount,
        digital: digitalCount,
        movies: data.movies.length,
        tvshows: data.tvshows.length,
        videogames: data.videogames.length,
        books: data.books.length,
        boardgames: data.boardgames.length,
        collections: collections.length,
      },
    });
  } catch (err) {
    console.error("Failed to fetch vault:", err);
    res.status(500).json({ error: "Failed to fetch vault" });
  }
});

// GET /items - flat unified list for backwards compatibility
router.get("/items", async (req, res) => {
  try {
    const { allItems } = await getAllUnifiedItems();
    res.json(allItems);
  } catch (err) {
    console.error("Failed to fetch items:", err);
    res.status(500).json([]);
  }
});

// Configuration endpoints: /platforms, /media-types, /tags
const presetTables = {
  platforms: "platforms",
  "media-types": "media_types",
  tags: "tags",
};

for (const [routePath, tableName] of Object.entries(presetTables)) {
  router.get(`/${routePath}`, async (req, res) => {
    try {
      const rows = await db.allAsync(`SELECT * FROM ${tableName} ORDER BY name ASC`);
      res.json(rows);
    } catch (err) {
      console.error(`Failed to fetch ${tableName}:`, err);
      res.status(500).json([]);
    }
  });

  router.post(`/${routePath}`, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
      const result = await db.runAsync(
        `INSERT INTO ${tableName} (name) VALUES (?)`,
        [name.trim()]
      );
      res.status(201).json({ id: result.lastID, name: name.trim() });
    } catch (err) {
      console.error(`Failed to add to ${tableName}:`, err);
      res.status(400).json({ error: "Already exists or invalid name" });
    }
  });

  router.delete(`/${routePath}/:id`, async (req, res) => {
    try {
      await db.runAsync(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error(`Failed to delete from ${tableName}:`, err);
      res.status(500).json({ error: "Failed to delete" });
    }
  });
}

export default router;
