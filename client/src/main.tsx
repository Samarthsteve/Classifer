import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Diagnostic for debugging blank screen issues
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    document.body.innerHTML = '<div style="color:white;padding:20px;">Error: Root element not found</div>';
  } else {
    createRoot(rootElement).render(<App />);
  }
} catch (error) {
  console.error("React initialization error:", error);
  document.body.innerHTML = `<div style="color:white;padding:20px;background:#1e293b;min-height:100vh;">
    <h1>App Failed to Load</h1>
    <p>${error instanceof Error ? error.message : "Unknown error"}</p>
    <pre style="font-size:12px;overflow:auto;">${error instanceof Error ? error.stack : ""}</pre>
  </div>`;
}
