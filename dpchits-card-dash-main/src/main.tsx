import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDatabase } from "./lib/initDb";

// Initialize database
initializeDatabase();

createRoot(document.getElementById("root")!).render(<App />);
