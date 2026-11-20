import { useEffect, useState } from "react";
import { Box, Alert, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import { PlexDetailView } from "../../common/PlexComponents";

export default function VideogameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/videogames/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setGame)
      .catch(() => setError("Failed to load videogame details."));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${game?.title}" from your vault?`)) return;
    try {
      const res = await fetch(`${API_URL}/videogames/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerRefresh();
      notifySuccess("Videogame removed from vault");
      navigate("/videogames");
    } catch {
      setError("Failed to delete videogame");
    }
  };

  if (!game) {
    return (
      <Box sx={{ p: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>}
      </Box>
    );
  }

  const specs = [
    { label: "Ownership", value: game.ownership_type || "Physical" },
    { label: "Platform / System", value: game.platform },
    { label: "Format / Medium", value: game.format },
    { label: "Edition", value: game.edition },
    { label: "Developer", value: game.developer },
    { label: "Publisher", value: game.publisher },
    { label: "Release Year", value: game.release_year },
    { label: "Genre", value: game.genre },
    { label: "Play Mode", value: game.mode },
    { label: "Status", value: game.status },
    { label: "Storage Location", value: game.location },
    { label: "Condition", value: game.condition },
  ];

  return (
    <PlexDetailView
      item={game}
      itemType="videogame"
      typeLabel="Videogame"
      backPath="/videogames"
      backLabel="Back to Videogames"
      editPath={`/videogames/${id}/edit`}
      onDelete={handleDelete}
      primaryCreatorLabel="Developed by"
      primaryCreatorValue={game.developer || game.publisher}
      specs={specs}
    />
  );
}
