// Vite inlines this at build time. On Render, set VITE_API_URL to your API (https://…/api), not localhost.
export const API_BASE =
  import.meta.env.VITE_API_URL || '/api';
