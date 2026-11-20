import { Box, Snackbar, Alert } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Create from "./components/create";
import Collection from "./components/collection/Collection";
import AddCollection from "./components/collection/AddCollection";
import CollectionDetail from "./components/collection/CollectionDetail";
import Configuration from "./components/configuration";

import Movies from "./components/displays/movie/movies";
import AddMovie from "./components/displays/movie/AddMovie";
import MovieDetail from "./components/displays/movie/MovieDetail";
import EditMovie from "./components/displays/movie/EditMovie";

import TvShows from "./components/displays/tvshow/tvshows";
import AddTvShow from "./components/displays/tvshow/AddTvShow";
import TvShowDetail from "./components/displays/tvshow/TvShowDetail";
import EditTvShow from "./components/displays/tvshow/EditTvShow";

import Videogames from "./components/displays/videogame/Videogame";
import AddVideogame from "./components/displays/videogame/AddVideogame";
import VideogameDetail from "./components/displays/videogame/VideogameDetail";
import EditVideogame from "./components/displays/videogame/EditVideogame";

import Books from "./components/displays/book/Book";
import AddBook from "./components/displays/book/AddBook";
import BookDetail from "./components/displays/book/BookDetail";
import EditBook from "./components/displays/book/EditBook";

import Boardgames from "./components/displays/boardgame/Boardgame";
import AddBoardgame from "./components/displays/boardgame/AddBoardgame";
import BoardgameDetail from "./components/displays/boardgame/BoardgameDetail";
import EditBoardgame from "./components/displays/boardgame/EditBoardgame";

import { useApp } from "./AppContext";
import { PLEX_GOLD } from "./components/common/PlexComponents";

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const stored = localStorage.getItem("sidebarExpanded");
    return stored === null ? true : stored === "true";
  });

  const { successMessage, clearSuccess } = useApp();

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      localStorage.setItem("sidebarExpanded", !prev);
      return !prev;
    });
  };

  const sidebarWidth = isSidebarExpanded ? 230 : 68;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0d0f14" }}>
      <Sidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          ml: `${sidebarWidth}px`,
          transition: "margin-left 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          minWidth: 0,
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<Create />} />

          {/* Movies */}
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/add" element={<AddMovie />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/movies/:id/edit" element={<EditMovie />} />

          {/* TV Shows */}
          <Route path="/tvshows" element={<TvShows />} />
          <Route path="/tvshows/add" element={<AddTvShow />} />
          <Route path="/tvshows/:id" element={<TvShowDetail />} />
          <Route path="/tvshows/:id/edit" element={<EditTvShow />} />

          {/* Videogames */}
          <Route path="/videogames" element={<Videogames />} />
          <Route path="/videogames/add" element={<AddVideogame />} />
          <Route path="/videogames/:id" element={<VideogameDetail />} />
          <Route path="/videogames/:id/edit" element={<EditVideogame />} />

          {/* Books */}
          <Route path="/books" element={<Books />} />
          <Route path="/books/add" element={<AddBook />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<EditBook />} />

          {/* Boardgames */}
          <Route path="/boardgames" element={<Boardgames />} />
          <Route path="/boardgames/add" element={<AddBoardgame />} />
          <Route path="/boardgames/:id" element={<BoardgameDetail />} />
          <Route path="/boardgames/:id/edit" element={<EditBoardgame />} />

          {/* Collections */}
          <Route path="/collection" element={<Collection />} />
          <Route path="/collections" element={<Collection />} />
          <Route path="/add-collection" element={<AddCollection />} />
          <Route path="/collections/add" element={<AddCollection />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />

          {/* Configuration */}
          <Route path="/configuration" element={<Configuration />} />
        </Routes>
      </Box>

      {/* Global Toast Notification */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={clearSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={clearSuccess}
          severity="success"
          variant="filled"
          sx={{
            bgcolor: "#161922",
            color: "#FFFFFF",
            border: `1px solid ${PLEX_GOLD}`,
            boxShadow: "0 12px 32px rgba(0,0,0,0.7)",
            "& .MuiAlert-icon": { color: PLEX_GOLD },
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
