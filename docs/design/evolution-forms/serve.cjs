// Local review server for the static prototype. Only these files are served.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const fixtures = require("./fixtures.cjs");

const assets = new Map([
  ["/", ["index.html", "text/html"]],
  ["/study.js", ["study.js", "text/javascript"]],
  ["/study.css", ["study.css", "text/css"]],
  ["/ui.css", ["../../../web/src/ui.css", "text/css"]],
  ["/upgrade-tabs.css", ["../../../web/src/upgrades/upgrade-tabs.css", "text/css"]],
  ["/style.css", ["../../../web/src/style.css", "text/css"]],
  ["/battles/arena/assets/battle-background.webp", ["../../../web/src/battles/arena/assets/battle-background.webp", "image/webp"]],
]);
const port = Number(process.env.POKESTAR_STUDY_PORT || 61813);

http.createServer((request, response) => {
  const route = new URL(request.url, "http://localhost").pathname;
  if (route === "/fixtures.json") {
    response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(JSON.stringify(fixtures));
    return;
  }
  const asset = assets.get(route);
  if (!asset) {
    response.writeHead(404).end();
    return;
  }
  const [file, type] = asset;
  response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  fs.createReadStream(path.join(__dirname, file)).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`Study available at http://127.0.0.1:${port}/`));
