export type SpriteOffset = { x: number; y: number };
const centered: SpriteOffset = { x: 0, y: 0 };

/** Read alpha bounds only; the original artwork is never rewritten or cropped. */
export const spriteOffset = (pixels: ArrayLike<number>, width: number, height: number): SpriteOffset => {
  let left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (pixels[(y * width + x) * 4 + 3] > 0) {
      left = Math.min(left, x); right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  if (right < left) return centered;
  const size = Math.max(width, height);
  return { x: (.5 - ((size - width) / 2 + (left + right + 1) / 2) / size) * 100,
    y: (.87 - ((size - height) / 2 + bottom + 1) / size) * 100 };
};

const ready = new Map<string, SpriteOffset>();
const pending = new Map<string, Promise<SpriteOffset>>();
export const cachedSpriteOffset = (url: string) => ready.get(url) || centered;

/** Analyze each URL once. CORS/decode failures keep the normally displayed image centered. */
export const loadSpriteOffset = (url: string): Promise<SpriteOffset> => {
  if (pending.has(url)) return pending.get(url)!;
  const work = (async () => {
    let bitmap: ImageBitmap | undefined;
    try {
      if (typeof createImageBitmap !== 'function') return centered;
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return centered;
      bitmap = await createImageBitmap(await response.blob());
      const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return centered;
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return spriteOffset(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    } catch { return centered; }
    finally { bitmap?.close(); }
  })().then(offset => { ready.set(url, offset); return offset; });
  pending.set(url, work); return work;
};
