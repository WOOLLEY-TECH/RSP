import { StrictMode, Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./router";
import { initializeDatabase } from "./lib/neon";
import { initializeAuth } from "./lib/auth";
import "./styles.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem", padding: "1rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
            <p style={{ color: "#555", marginTop: "0.5rem" }}>The page hit an unexpected error.</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                borderRadius: "9999px",
                background: "#7c3aed",
                color: "#fff",
                padding: "0.6rem 1.5rem",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

initializeDatabase().catch((err) => console.error("Database init failed:", err));
initializeAuth().catch((err) => console.error("Auth init failed:", err));
