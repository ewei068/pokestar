import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./style.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("prototypeBattle")) {
  void import("./battles/prototype/PrototypeBattlePage").then(({ PrototypeBattlePage }) => {
    root.render(<React.StrictMode><PrototypeBattlePage /></React.StrictMode>);
  });
} else {
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
