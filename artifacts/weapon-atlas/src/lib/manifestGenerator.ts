export function generateManifest(partsInfo: any[]) {
  const parts: Record<string, any> = {};
  
  for (const info of partsInfo) {
    parts[info.id] = {
      name: info.name,
      x: info.x,
      y: info.y,
      w: info.w,
      h: info.h,
      category: info.category,
      material: info.material,
      rarity: info.rarity,
      tags: info.tags
    };
  }

  return {
    version: "2.0.0",
    atlas: "atlas.png",
    tileSize: 128,
    parts,
    assembly_rules: {
      "sword_blade_*": ["sword_guard_*"],
      "axe_head_*": ["axe_handle_*"]
    },
    rarity_levels: {
      "common": { color: "#8a8a8a" },
      "uncommon": { color: "#4caf50" },
      "rare": { color: "#2196f3" },
      "epic": { color: "#9c27b0" },
      "legendary": { color: "#ff9800" },
      "mythic": { color: "#f44336" }
    }
  };
}
