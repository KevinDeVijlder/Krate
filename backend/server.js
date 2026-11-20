import express from "express";
import cors from "cors";
import { initializeDatabase } from "./schema.js";

// Import routers
import collectionsRouter from "./routes/collections.js";
import boardgamesRouter from "./routes/boardgames.js";
import booksRouter from "./routes/books.js";
import videogamesRouter from "./routes/videogames.js";
import moviesRouter from "./routes/movies.js";
import tvshowsRouter from "./routes/tvshows.js";
import vaultRouter from "./routes/vault.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Initialize DB schema and migrations
initializeDatabase();

// Route assignments:
app.use("/collections", collectionsRouter);
app.use("/boardgames", boardgamesRouter);
app.use("/books", booksRouter);
app.use("/videogames", videogamesRouter);
app.use("/movies", moviesRouter);
app.use("/tvshows", tvshowsRouter);
app.use("/", vaultRouter);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "MediaLedger backend is running" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
