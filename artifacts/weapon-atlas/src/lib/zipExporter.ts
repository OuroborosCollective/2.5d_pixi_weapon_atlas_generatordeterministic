// zipExporter.ts
import JSZip from "jszip";
import { packAtlas } from "./atlasPacker";
import { generateManifest } from "./manifestGenerator";

export async function exportZip(seed: number) {
  const { atlasCanvas, partsInfo } = await packAtlas(seed);
  
  const manifest = generateManifest(partsInfo);
  
  const zip = new JSZip();
  const folder = zip.folder("weapons");
  
  if (!folder) throw new Error("Could not create zip folder");

  folder.file("manifest.json", JSON.stringify(manifest, null, 2));
  folder.file("parts.json", JSON.stringify(partsInfo, null, 2));
  folder.file("animations.json", JSON.stringify({ idle: [0, 1, 2, 3], swing: [4, 5, 6, 7] }, null, 2));
  
  // Convert canvas to blob
  const blob = await new Promise<Blob | null>(resolve => atlasCanvas.toBlob(resolve, "image/png"));
  if (blob) {
    folder.file("atlas.png", blob);
  }
  
  const content = await zip.generateAsync({ type: "blob" });
  
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `weapon-atlas-${seed}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
