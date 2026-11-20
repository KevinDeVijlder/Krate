import { useEffect, useState } from "react";
import { Box, Alert, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import { PlexDetailView } from "../../common/PlexComponents";

export default function TvShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [show, setShow] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/tvshows/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setShow)
      .catch(() => setError("Failed to load TV Show details."));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${show?.title}" from your vault?`)) return;
    try {
      const res = await fetch(`${API_URL}/tvshows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerRefresh();
      notifySuccess("TV Show removed from vault");
      navigate("/tvshows");
    } catch {
      setError("Failed to delete TV Show");
    }
  };

  if (!show) {
    return (
      <Box sx={{ p: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>}
      </Box>
    );
  }

  const specs = [
    { label: "Ownership", value: show.ownership_type || "Physical" },
    { label: "Format / Box Set", value: show.format },
    { label: "Seasons Owned", value: show.seasons_owned },
    { label: "Total Seasons", value: show.total_seasons },
    { label: "Platform / Store", value: show.platform },
    { label: "Edition", value: show.edition },
    { label: "Creator", value: show.creator },
    { label: "Network", value: show.network },
    { label: "Release Year", value: show.release_year },
    { label: "Genre", value: show.genre },
    { label: "Storage Location", value: show.location },
    { label: "Condition", value: show.condition },
    { label: "Status", value: show.status },
  ];

  return (
    <PlexDetailView
      item={show}
      itemType="tvshow"
      typeLabel="TV Series"
      backPath="/tvshows"
      backLabel="Back to TV Shows"
      editPath={`/tvshows/${id}/edit`}
      onDelete={handleDelete}
      primaryCreatorLabel="Created by"
      primaryCreatorValue={show.creator || show.network}
      specs={specs}
    />
  );
}
