// atlasPacker.ts
import { PART_CATEGORIES, renderPart } from "./weaponRenderer";

export async function packAtlas(seed: number): Promise<{ atlasCanvas: HTMLCanvasElement, partsInfo: any[] }> {
  const partsInfo: any[] = [];
  
  const allParts = Object.values(PART_CATEGORIES).flat();
  const TILE_SIZE = 64;
  const cols = Math.ceil(Math.sqrt(allParts.length));
  const rows = Math.ceil(allParts.length / cols);
  
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = cols * TILE_SIZE;
  atlasCanvas.height = rows * TILE_SIZE;
  
  const ctx = atlasCanvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = TILE_SIZE;
  tempCanvas.height = TILE_SIZE;
  const tempCtx = tempCanvas.getContext("2d")!;
  
  allParts.forEach((part, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;
    
    tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    renderPart(tempCtx, part, seed + index);
    
    ctx.drawImage(tempCanvas, x, y);
    
    partsInfo.push({
      ...part,
      category: part.id.split("_").slice(0, 2).join("_"),
      x, y, w: TILE_SIZE, h: TILE_SIZE,
      rarity_tags: ["common"],
      biome_tags: ["any"],
      elemental_tags: ["physical"],
      animation_groups: ["idle", "swing", "slash"]
    });
  });
  
  return { atlasCanvas, partsInfo };
}
