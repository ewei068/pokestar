import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AudioSettingsProvider } from "./settings/AudioSettings";
import "./style.css";
import "./play/play.css";
import "./bag/bag.css";
import "./collection/collection.css";
import "./upgrades/upgrades.css";
import "./upgrades/item-nature.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("previewBattle")) {
  void import("./battles/dev/BattleScreenPreview").then(({ BattleScreenPreview }) => {
    root.render(<React.StrictMode><AudioSettingsProvider><BattleScreenPreview /></AudioSettingsProvider></React.StrictMode>);
  });
} else {
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
