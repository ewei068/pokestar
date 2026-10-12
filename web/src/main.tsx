import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./style.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("previewBattle")) {
  void import("./battles/dev/BattleScreenPreview").then(({ BattleScreenPreview }) => {
    root.render(<React.StrictMode><BattleScreenPreview /></React.StrictMode>);
  });
} else {
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
