import db from "./db.js";

async function ensureColumns(tableName, columns) {
  try {
    const existingCols = await db.allAsync(`PRAGMA table_info(${tableName})`);
    const existingNames = new Set(existingCols.map((c) => c.name));

    for (const [colName, colDef] of Object.entries(columns)) {
      if (!existingNames.has(colName)) {
        await db.runAsync(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colDef}`);
      }
    }
  } catch (err) {
    console.error(`Failed ensuring columns on ${tableName}:`, err);
  }
}

async function seedPresetsIfEmpty() {
  try {
    const pCount = await db.getAsync("SELECT COUNT(*) as count FROM platforms");
    if (pCount && pCount.count === 0) {
      const defaultPlatforms = [
        "Physical Shelf",
        "PlayStation 5",
        "PlayStation 4",
        "Nintendo Switch",
        "Xbox Series X|S",
        "PC (Steam)",
        "PC (GOG)",
        "PC (Epic Games)",
        "Apple TV / iTunes",
        "Prime Video",
        "Movies Anywhere",
        "Kindle",
        "Audible",
        "Kobo",
      ];
      for (const name of defaultPlatforms) {
        await db.runAsync("INSERT OR IGNORE INTO platforms (name) VALUES (?)", [name]);
      }
    }

    const mCount = await db.getAsync("SELECT COUNT(*) as count FROM media_types");
    if (mCount && mCount.count === 0) {
      const defaultFormats = [
        "4K UHD Blu-ray",
        "Blu-ray",
        "DVD",
        "Steelbook",
        "VHS",
        "Physical Disc",
        "Physical Cartridge",
        "Digital License",
        "Hardcover",
        "Paperback",
        "eBook",
        "Audiobook",
        "Board Game Box",
        "Collector's Edition",
      ];
      for (const name of defaultFormats) {
        await db.runAsync("INSERT OR IGNORE INTO media_types (name) VALUES (?)", [name]);
      }
    }

    const tCount = await db.getAsync("SELECT COUNT(*) as count FROM tags");
    if (tCount && tCount.count === 0) {
      const defaultTags = [
        "Living Room Shelf",
        "Home Theater Rack",
        "Study Bookshelf",
        "Kallax Game Shelf",
        "Collector's Edition",
        "Steelbook",
        "Criterion Collection",
        "First Edition",
        "Signed Copy",
        "Sealed / Mint",
        "Loaned Out",
      ];
      for (const name of defaultTags) {
        await db.runAsync("INSERT OR IGNORE INTO tags (name) VALUES (?)", [name]);
      }
    }
  } catch (err) {
    console.error("Failed seeding presets:", err);
  }
}

export async function initializeDatabase() {
  try {
    // 1. Collections
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        cover_url TEXT,
        created_at DATETIME DEFAULT (datetime('now'))
      );
    `);

    await ensureColumns("collections", {
      created_at: "DATETIME",
    });

    // 2. Collection Items (Polymorphic link across all owned media tables)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS collection_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        item_type TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT (datetime('now')),
        UNIQUE(collection_id, item_type, item_id),
        FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE
      );
    `);

    // 3. Movies
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        director TEXT,
        studio TEXT,
        release_year INTEGER,
        runtime INTEGER,
        genre TEXT,
        format TEXT,
        ownership_type TEXT DEFAULT 'Physical',
        platform TEXT,
        edition TEXT,
        region_code TEXT,
        barcode TEXT,
        rating REAL,
        status TEXT DEFAULT 'Owned',
        location TEXT,
        condition TEXT,
        description TEXT,
        cover_url TEXT,
        added_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME,
        in_trash INTEGER DEFAULT 0
      );
    `);

    // 4. TV Shows
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS tvshows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        creator TEXT,
        network TEXT,
        release_year INTEGER,
        seasons_owned TEXT,
        total_seasons INTEGER,
        episodes_count INTEGER,
        genre TEXT,
        format TEXT,
        ownership_type TEXT DEFAULT 'Physical',
        platform TEXT,
        edition TEXT,
        barcode TEXT,
        rating REAL,
        status TEXT DEFAULT 'Owned',
        location TEXT,
        condition TEXT,
        description TEXT,
        cover_url TEXT,
        added_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME,
        in_trash INTEGER DEFAULT 0
      );
    `);

    // 5. Videogames
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS videogames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        cover_url TEXT,
        developer TEXT,
        publisher TEXT,
        release_year INTEGER,
        platform TEXT,
        genre TEXT,
        mode TEXT,
        rating REAL,
        ownership_type TEXT DEFAULT 'Physical',
        status TEXT DEFAULT 'Owned',
        format TEXT,
        edition TEXT,
        location TEXT,
        condition TEXT,
        barcode TEXT,
        added_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME,
        in_trash INTEGER DEFAULT 0
      );
    `);

    await ensureColumns("videogames", {
      format: "TEXT",
      edition: "TEXT",
      location: "TEXT",
      condition: "TEXT",
      barcode: "TEXT",
    });

    // 6. Books
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        cover_url TEXT,
        author TEXT NOT NULL,
        publisher TEXT,
        isbn TEXT,
        page_count INTEGER,
        language TEXT,
        publication_year INTEGER,
        format TEXT,
        genre TEXT,
        ownership_type TEXT DEFAULT 'Physical',
        platform TEXT,
        edition TEXT,
        rating REAL,
        status TEXT DEFAULT 'Owned',
        location TEXT,
        condition TEXT,
        added_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME,
        in_trash INTEGER DEFAULT 0
      );
    `);

    await ensureColumns("books", {
      ownership_type: "TEXT DEFAULT 'Physical'",
      platform: "TEXT",
      edition: "TEXT",
      rating: "REAL",
      status: "TEXT DEFAULT 'Owned'",
      location: "TEXT",
      condition: "TEXT",
    });

    // 7. Boardgames
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS boardgames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        cover_url TEXT,
        publisher TEXT,
        designer TEXT,
        release_year INTEGER,
        genre TEXT,
        min_players INTEGER,
        max_players INTEGER,
        avg_playtime INTEGER,
        complexity_weight REAL,
        format TEXT DEFAULT 'Base Game',
        ownership_type TEXT DEFAULT 'Physical',
        rating REAL,
        status TEXT DEFAULT 'Owned',
        location TEXT,
        condition TEXT,
        added_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME,
        in_trash INTEGER DEFAULT 0
      );
    `);

    await ensureColumns("boardgames", {
      designer: "TEXT",
      release_year: "INTEGER",
      genre: "TEXT",
      format: "TEXT DEFAULT 'Base Game'",
      ownership_type: "TEXT DEFAULT 'Physical'",
      rating: "REAL",
      status: "TEXT DEFAULT 'Owned'",
      location: "TEXT",
      condition: "TEXT",
    });

    // 8. Configuration Presets: Platforms, Media Formats, Tags/Locations
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS media_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);

    await seedPresetsIfEmpty();

    console.log("Database initialized and migrated successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}
