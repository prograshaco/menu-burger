import { createClient } from "@libsql/client";

export const db = createClient({
  url: import.meta.env.VITE_TURSO_DB_URL,
  authToken: import.meta.env.VITE_TURSO_DB_TOKEN,
});
