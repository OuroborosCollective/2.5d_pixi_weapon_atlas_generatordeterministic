// manifestGenerator.ts
export function generateManifest(partsInfo: any[]) {
  const parts: Record<string, any> = {};
  
  for (const info of partsInfo) {
    parts[info.id] = {
      x: info.x,
      y: info.y,
      w: info.w,
      h: info.h,
      category: info.category,
      rarity_tags: info.rarity_tags,
      biome_tags: info.biome_tags,
      elemental_tags: info.elemental_tags,
      animation_groups: info.animation_groups,
      material: info.material
    };
  }

  return {
    version: "1.0.0",
    atlas: "atlas.png",
    tileSize: 64,
    parts,
    assembly_rules: {
      "sword_blade_*": ["sword_guard_*"],
      "axe_head_*": ["axe_handle_*"]
    },
    rarity_levels: {
      "common": { color: "#888888" },
      "uncommon": { color: "#00ff00" },
      "rare": { color: "#0000ff" },
      "epic": { color: "#800080" },
      "legendary": { color: "#ffa500" },
      "mythic": { color: "#ff0000" }
    }
  };
}
