import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MoveInspection } from "./MoveInspection";

describe("shared move inspection", () => {
  it("renders move facts and a host-provided badge without a battle catalog", () => {
    const html = renderToStaticMarkup(createElement(MoveInspection, {
      move: { name: "Ember", damageType: "Special", power: 40, accuracy: 100,
        cooldown: 1, description: "A small flame." },
      typeBadge: createElement("span", { className: "custom-type" }, "Fire"),
    }));
    assert.match(html, /<h3>Ember<\/h3><span class="custom-type">Fire<\/span>/);
    assert.match(html, /Category<\/dt><dd>Special<\/dd>/);
    assert.match(html, /Power<\/dt><dd>40<\/dd>/);
    assert.match(html, /Accuracy<\/dt><dd>100<\/dd>/);
    assert.match(html, /Cooldown<\/dt><dd>1 turn<\/dd>/);
    assert.match(html, /<\/dl><p>A small flame\.<\/p>/);
  });

  it("preserves unknown values, fallback names and descriptions", () => {
    const html = renderToStaticMarkup(createElement(MoveInspection, {
      move: {}, fallbackName: "unknown-move", typeBadge: null,
    }));
    assert.match(html, /<h3>unknown-move<\/h3>/);
    assert.match(html, /Category<\/dt><dd>Status<\/dd>/);
    assert.equal((html.match(/<dd>—<\/dd>/g) || []).length, 3);
    assert.match(html, /No description available\./);
  });

  it("keeps zero values distinct from missing values", () => {
    const html = renderToStaticMarkup(createElement(MoveInspection, {
      move: { damageType: "Physical", power: 0, accuracy: 0, cooldown: 0 }, typeBadge: null,
    }));
    assert.match(html, /Category<\/dt><dd>Physical<\/dd>/);
    assert.match(html, /Power<\/dt><dd>0<\/dd>/);
    assert.match(html, /Accuracy<\/dt><dd>0<\/dd>/);
    assert.match(html, /Cooldown<\/dt><dd>0 turns<\/dd>/);
  });
});
