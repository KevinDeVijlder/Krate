import { useEffect, useState } from "react";
import { Box, Alert, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import { PlexDetailView } from "../../common/PlexComponents";

export default function BoardgameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/boardgames/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setGame)
      .catch(() => setError("Failed to load boardgame"));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${game?.name}" from your vault?`)) return;
    try {
      const res = await fetch(`${API_URL}/boardgames/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerRefresh();
      notifySuccess("Boardgame removed from vault");
      navigate("/boardgames");
    } catch {
      setError("Failed to delete boardgame");
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
    { label: "Box Format", value: game.format || "Base Game" },
    { label: "Publisher", value: game.publisher },
    { label: "Designer", value: game.designer },
    {
      label: "Player Count",
      value:
        game.min_players != null && game.max_players != null
          ? `${game.min_players} – ${game.max_players} Players`
          : null,
    },
    {
      label: "Avg Playtime",
      value: game.avg_playtime != null ? `${game.avg_playtime} mins` : null,
    },
    {
      label: "Complexity Weight",
      value: game.complexity_weight != null ? `${game.complexity_weight} / 5.0` : null,
    },
    { label: "Release Year", value: game.release_year },
    { label: "Genre / Mechanism", value: game.genre },
    { label: "Shelf Location", value: game.location },
    { label: "Condition", value: game.condition },
    { label: "Status", value: game.status },
  ];

  return (
    <PlexDetailView
      item={game}
      itemType="boardgame"
      typeLabel="Boardgame"
      backPath="/boardgames"
      backLabel="Back to Boardgames"
      editPath={`/boardgames/${id}/edit`}
      onDelete={handleDelete}
      primaryCreatorLabel="Published by"
      primaryCreatorValue={game.publisher || game.designer}
      specs={specs}
      aspectRatio="105%"
    />
  );
}
