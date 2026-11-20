import { useEffect, useState } from "react";
import { Box, Alert, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import { PlexDetailView } from "../../common/PlexComponents";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/movies/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setMovie)
      .catch(() => setError("Failed to load movie details."));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${movie?.title}" from your vault?`)) return;
    try {
      const res = await fetch(`${API_URL}/movies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerRefresh();
      notifySuccess("Movie removed from vault");
      navigate("/movies");
    } catch {
      setError("Failed to delete movie");
    }
  };

  if (!movie) {
    return (
      <Box sx={{ p: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>}
      </Box>
    );
  }

  const specs = [
    { label: "Ownership", value: movie.ownership_type || "Physical" },
    { label: "Format / Medium", value: movie.format },
    { label: "Platform / Store", value: movie.platform },
    { label: "Edition", value: movie.edition },
    { label: "Director", value: movie.director },
    { label: "Studio / Label", value: movie.studio },
    { label: "Release Year", value: movie.release_year },
    { label: "Runtime", value: movie.runtime ? `${movie.runtime} mins` : null },
    { label: "Genre", value: movie.genre },
    { label: "Storage Location", value: movie.location },
    { label: "Condition", value: movie.condition },
    { label: "Region Code", value: movie.region_code },
    { label: "UPC / Barcode", value: movie.barcode },
    { label: "Status", value: movie.status },
  ];

  return (
    <PlexDetailView
      item={movie}
      itemType="movie"
      typeLabel="Movie"
      backPath="/movies"
      backLabel="Back to Movies"
      editPath={`/movies/${id}/edit`}
      onDelete={handleDelete}
      primaryCreatorLabel="Directed by"
      primaryCreatorValue={movie.director || movie.studio}
      specs={specs}
    />
  );
}
