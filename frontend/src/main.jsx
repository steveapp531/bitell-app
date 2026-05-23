// src/main.jsx — React Application Entry Point
// WHY: This is the single DOM mount point. Strict mode double-invokes
// effects in development to help catch side-effect bugs early.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Tailwind base styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);