export const API_URL = "http://localhost:3001";

export function resolveCoverUrl(coverUrl) {
  if (!coverUrl) return null;
  if (
    coverUrl.startsWith("http://") ||
    coverUrl.startsWith("https://") ||
    coverUrl.startsWith("blob:") ||
    coverUrl.startsWith("data:")
  ) {
    return coverUrl;
  }
  const clean = coverUrl.replace(/^\/+/, "");
  return `${API_URL}/${clean}`;
}

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API GET ${path} failed: ${res.status}`);
  }
  return res.json();
}
