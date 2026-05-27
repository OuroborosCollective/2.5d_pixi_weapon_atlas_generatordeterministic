import { PART_CATEGORIES, renderPartToCanvas, WeaponPart } from "./weaponRenderer";

export async function packAtlas(): Promise<{ atlasCanvas: HTMLCanvasElement, partsInfo: any[] }> {
  const partsInfo: any[] = [];
  
  const allParts = Object.values(PART_CATEGORIES).flat();
  const TILE_SIZE = 128;
  const cols = Math.ceil(Math.sqrt(allParts.length));
  const rows = Math.ceil(allParts.length / cols);
  
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = cols * TILE_SIZE;
  atlasCanvas.height = rows * TILE_SIZE;
  
  const ctx = atlasCanvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  
  allParts.forEach((part, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;
    
    const partCanvas = renderPartToCanvas(part);
    ctx.drawImage(partCanvas, x, y);
    
    partsInfo.push({
      id: part.id,
      name: part.name,
      category: part.category,
      material: part.material,
      rarity: part.rarity,
      tags: part.tags,
      x, y, w: TILE_SIZE, h: TILE_SIZE,
    });
  });
  
  return { atlasCanvas, partsInfo };
}
