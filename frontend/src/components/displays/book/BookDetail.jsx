import { useEffect, useState } from "react";
import { Box, Alert, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../../AppContext";
import { API_URL } from "../../../api/client";
import { PlexDetailView } from "../../common/PlexComponents";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh, notifySuccess } = useApp();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/books/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setBook)
      .catch(() => setError("Failed to load book"));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${book?.title}" from your vault?`)) return;
    try {
      const res = await fetch(`${API_URL}/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerRefresh();
      notifySuccess("Book removed from vault");
      navigate("/books");
    } catch {
      setError("Failed to delete book");
    }
  };

  if (!book) {
    return (
      <Box sx={{ p: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>}
      </Box>
    );
  }

  const specs = [
    { label: "Ownership", value: book.ownership_type || "Physical" },
    { label: "Format / Binding", value: book.format },
    { label: "Author", value: book.author },
    { label: "Publisher", value: book.publisher },
    { label: "Publication Year", value: book.publication_year },
    { label: "Pages", value: book.page_count != null ? `${book.page_count} pages` : null },
    { label: "Language", value: book.language },
    { label: "ISBN", value: book.isbn },
    { label: "Genre", value: book.genre },
    { label: "Edition", value: book.edition },
    { label: "Bookshelf Location", value: book.location },
    { label: "Condition", value: book.condition },
    { label: "Reading Status", value: book.status },
  ];

  return (
    <PlexDetailView
      item={book}
      itemType="book"
      typeLabel="Book"
      backPath="/books"
      backLabel="Back to Books"
      editPath={`/books/${id}/edit`}
      onDelete={handleDelete}
      primaryCreatorLabel="Written by"
      primaryCreatorValue={book.author}
      specs={specs}
      aspectRatio="155%"
    />
  );
}
