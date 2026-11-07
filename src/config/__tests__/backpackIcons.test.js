const fs = require("fs");
const path = require("path");
const { backpackItemConfig, backpackItems } = require("../backpackConfig");

const itemsDir = path.join(__dirname, "../../../web/public/images/items");

test("every backpack icon names a file in the public item folder", () => {
  for (const item of Object.values(backpackItemConfig)) {
    if (!Object.prototype.hasOwnProperty.call(item, "icon")) continue;
    const file = path.join(itemsDir, item.icon);
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.statSync(file).size).toBeGreaterThan(0);
  }
});

test("Focus Band and Focus Sash keep two filenames for one emoji image", () => {
  const band = backpackItemConfig[backpackItems.FOCUS_BAND];
  const sash = backpackItemConfig[backpackItems.FOCUS_SASH];
  if (!band.icon || !sash.icon) return;
  expect(band.icon).not.toBe(sash.icon);
  const bandBytes = fs.readFileSync(path.join(itemsDir, band.icon));
  const sashBytes = fs.readFileSync(path.join(itemsDir, sash.icon));
  expect(Buffer.compare(bandBytes, sashBytes)).toBe(0);
});
