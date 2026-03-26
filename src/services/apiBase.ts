/** In dev, use same-origin `/api` so Vite can proxy to the backend (fixes WSL / LAN / non-loopback hosts). */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api');
