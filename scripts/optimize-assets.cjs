const fs = require("node:fs");
const path = require("node:path");
let sharp;
try { sharp = require("sharp"); }
catch { sharp = require(path.join(path.dirname(process.execPath), "../node_modules/sharp")); }

const images = path.resolve(__dirname, "../images");
const jobs = [
  ["picture.png", "portrait.webp", 449],
  ["angelo.png", "about-portrait.webp", 480],
  ["diskarte-ph-desktop-2x.png", "diskarte-desktop.webp", 1440],
  ["diskarte-ph-mobile-3x.png", "diskarte-mobile.webp", 585],
  ["aws-disaster-recovery.png", "aws-disaster-recovery.webp", 1200],
  ["vendomed.png", "vendomed.webp", 1200],
  ["libtech.png", "libtech.webp", 900],
];

(async () => {
  for (const [source, target, width] of jobs) {
    await sharp(path.join(images, source)).resize({width, withoutEnlargement: true})
      .webp({quality: 88}).toFile(path.join(images, target));
    console.log(target + ": " + fs.statSync(path.join(images, target)).size + " bytes");
  }
  for (const size of [48, 192, 512]) {
    const target = size === 48 ? "favicon-48.png" : "app-icon-" + size + ".png";
    await sharp(path.join(images, "icon.png")).resize(size, size).png({compressionLevel: 9})
      .toFile(path.join(images, target));
    console.log(target + ": " + fs.statSync(path.join(images, target)).size + " bytes");
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
