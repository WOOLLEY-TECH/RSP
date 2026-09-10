import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./router";
import { initializeDatabase } from "./lib/neon";
import { initializeAuth } from "./lib/auth";
import "./styles.css";

async function init() {
  await initializeDatabase();
  await initializeAuth();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();
