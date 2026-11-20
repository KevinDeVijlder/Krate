import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_URL } from "./api/client";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);
  const [collections, setCollections] = useState([]);
  const [presets, setPresets] = useState({
    platforms: [],
    mediaTypes: [],
    tags: [],
  });

  const triggerRefresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  const notifySuccess = useCallback((message) => {
    setSuccessMessage(message);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/collections`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/platforms`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/media-types`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/tags`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([cols, platforms, mediaTypes, tags]) => {
      setCollections(Array.isArray(cols) ? cols : []);
      setPresets({
        platforms: Array.isArray(platforms) ? platforms : [],
        mediaTypes: Array.isArray(mediaTypes) ? mediaTypes : [],
        tags: Array.isArray(tags) ? tags : [],
      });
    });
  }, [refreshToken]);

  return (
    <AppContext.Provider
      value={{
        refreshToken,
        triggerRefresh,
        successMessage,
        notifySuccess,
        clearSuccess,
        collections,
        presets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
