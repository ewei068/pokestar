/** Tiny, code-authored motifs for the focused tile studies. Drawn at 20–24px, then scaled without smoothing. */
type Motif = "fist" | "aura" | "poison";
const frames = new Map<Motif, HTMLCanvasElement[]>();

const makeCanvas = (size: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("VFX canvas is unavailable");
  return { canvas, ctx };
};

const makeFist = () => {
  const { canvas, ctx } = makeCanvas(20);
  const block = (color: string, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  // Three square knuckles, a tucked thumb, and a short cuff read as icon art at tile size.
  block("#632331", 4, 2, 12, 2);
  block("#632331", 2, 4, 16, 9);
  block("#632331", 4, 13, 12, 3);
  block("#632331", 8, 16, 6, 4);
  block("#bd3541", 3, 5, 14, 7);
  block("#bd3541", 5, 12, 10, 3);
  block("#bd3541", 9, 15, 4, 4);
  block("#ed6556", 4, 4, 12, 7);
  block("#faab76", 4, 5, 3, 4);
  block("#faab76", 8, 4, 4, 5);
  block("#faab76", 13, 5, 3, 4);
  block("#ffe1a8", 5, 5, 2, 2);
  block("#ffe1a8", 9, 4, 2, 2);
  block("#ffe1a8", 14, 5, 1, 2);
  block("#8d2c3b", 7, 5, 1, 6);
  block("#8d2c3b", 12, 5, 1, 6);
  block("#632331", 15, 10, 4, 2);
  block("#d74b48", 15, 11, 3, 2);
  block("#faab76", 14, 10, 3, 1);
  block("#632331", 7, 16, 1, 3);
  return canvas;
};

const makeOrb = (kind: "aura" | "poison", frame: number) => {
  const { canvas, ctx } = makeCanvas(24);
  const colors = kind === "aura" ?
    ["#24457e", "#216eb0", "#44b9dd", "#b5f3ef", "#f3ffed"] :
    ["#4d285f", "#763a94", "#ac55bd", "#e394de", "#ffe2ef"];
  for (let y = 1; y < 23; y++) for (let x = 1; x < 23; x++) {
    const dx = x - 11.5;
    const dy = y - 11.5;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const edge = 9.1 + Math.sin(angle * (kind === "aura" ? 5 : 4) + frame * .65) *
      (kind === "aura" ? .34 : .72);
    if (distance > edge) continue;
    const swirl = Math.sin(angle * 2.6 + distance * .65 - frame * .83);
    let color = distance > edge - 1.25 ? colors[0] :
      distance < 3.4 ? colors[4] : swirl > .36 ? colors[3] :
      distance < 6.5 ? colors[2] : colors[1];
    if (kind === "poison" && distance < 7 && ((x - 8) ** 2 + (y - 8 - frame % 2) ** 2 < 4 ||
      (x - 15) ** 2 + (y - 13 + frame % 3) ** 2 < 3)) color = colors[0];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }
  if (kind === "poison") {
    ctx.fillStyle = colors[1];
    ctx.fillRect(11, 20, 2, 2 + frame % 3);
    ctx.fillRect(16, 19, 1, 2 + (frame + 2) % 3);
  }
  return canvas;
};

const getFrame = (motif: Motif, ms: number) => {
  let available = frames.get(motif);
  if (!available) {
    available = motif === "fist" ? [makeFist()] :
      Array.from({ length: 8 }, (_, frame) => makeOrb(motif, frame));
    frames.set(motif, available);
  }
  return available[Math.floor(Math.max(0, ms) / 80) % available.length];
};

export const drawPixelMotif = (ctx: CanvasRenderingContext2D, motif: Motif,
  x: number, y: number, size: number, alpha: number, ms: number, angle = 0, flip = false) => {
  if (alpha <= 0 || size <= 0) return;
  const image = getFrame(motif, ms);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (flip) ctx.scale(-1, 1);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
};
