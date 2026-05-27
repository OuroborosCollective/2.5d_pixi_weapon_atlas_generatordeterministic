// weaponRenderer.ts
import { mulberry32 } from "./seedSystem";

export type Material = "iron" | "steel" | "void" | "royal" | "cursed" | "crystal" | "bone" | "wood" | "leather" | "gold";

export interface WeaponPart {
  category: string;
  id: string;
  name: string;
  material: Material;
  render: (ctx: CanvasRenderingContext2D, seed: number) => void;
}

export const PART_CATEGORIES = {
  sword_blade: [
    { id: "sword_blade_iron_01", name: "Iron Blade", material: "iron" },
    { id: "sword_blade_steel_01", name: "Steel Blade", material: "steel" },
    { id: "sword_blade_void_01", name: "Void Blade", material: "void" },
    { id: "sword_blade_royal_01", name: "Royal Blade", material: "royal" },
    { id: "sword_blade_cursed_01", name: "Cursed Blade", material: "cursed" }
  ],
  sword_guard: [
    { id: "sword_guard_iron_01", name: "Simple Guard", material: "iron" },
    { id: "sword_guard_gold_01", name: "Ornate Wings", material: "gold" }
  ],
  sword_handle: [
    { id: "sword_handle_leather_01", name: "Leather Grip", material: "leather" },
    { id: "sword_handle_bone_01", name: "Bone Grip", material: "bone" }
  ],
  sword_pommel: [
    { id: "sword_pommel_iron_01", name: "Ball Pommel", material: "iron" },
    { id: "sword_pommel_crystal_01", name: "Gem Pommel", material: "crystal" }
  ],
  axe_head: [
    { id: "axe_head_iron_01", name: "Single Bit", material: "iron" },
    { id: "axe_head_void_01", name: "Void Crescent", material: "void" }
  ],
  axe_handle: [
    { id: "axe_handle_wood_01", name: "Short Haft", material: "wood" },
    { id: "axe_handle_bone_01", name: "Bone Inlaid", material: "bone" }
  ]
} as const;

export function renderPart(ctx: CanvasRenderingContext2D, part: any, seed: number) {
  const rand = mulberry32(seed);
  
  ctx.save();
  ctx.translate(32, 32);
  
  // Base iso transform
  ctx.scale(1, 0.5);
  ctx.rotate(45 * Math.PI / 180);

  // Simplified render logic based on category
  const category = part.id.split("_").slice(0, 2).join("_");
  
  let gradient = ctx.createLinearGradient(-10, -10, 10, 10);
  switch (part.material) {
    case "iron":
      gradient.addColorStop(0, "#888");
      gradient.addColorStop(1, "#444");
      break;
    case "steel":
      gradient.addColorStop(0, "#fff");
      gradient.addColorStop(0.5, "#aaa");
      gradient.addColorStop(1, "#fff");
      break;
    case "void":
      gradient.addColorStop(0, "#202");
      gradient.addColorStop(1, "#408");
      break;
    case "royal":
    case "gold":
      gradient.addColorStop(0, "#ffd700");
      gradient.addColorStop(1, "#b8860b");
      break;
    case "cursed":
      gradient.addColorStop(0, "#4a0000");
      gradient.addColorStop(1, "#1a0000");
      break;
    case "crystal":
      gradient.addColorStop(0, "#0ff");
      gradient.addColorStop(1, "#008");
      break;
    case "bone":
      gradient.addColorStop(0, "#ffe");
      gradient.addColorStop(1, "#ccb");
      break;
    case "wood":
      gradient.addColorStop(0, "#642");
      gradient.addColorStop(1, "#321");
      break;
    case "leather":
      gradient.addColorStop(0, "#842");
      gradient.addColorStop(1, "#521");
      break;
    default:
      gradient.addColorStop(0, "#f0f");
      gradient.addColorStop(1, "#404");
  }

  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  ctx.beginPath();
  
  // Just drawing some placeholder geometry for the parts
  if (category === "sword_blade") {
    ctx.moveTo(0, -20);
    ctx.lineTo(4, -10);
    ctx.lineTo(4, 20);
    ctx.lineTo(0, 24);
    ctx.lineTo(-4, 20);
    ctx.lineTo(-4, -10);
  } else if (category === "sword_guard") {
    ctx.moveTo(-15, -4);
    ctx.lineTo(15, -4);
    ctx.lineTo(15, 4);
    ctx.lineTo(-15, 4);
  } else if (category === "sword_handle") {
    ctx.moveTo(-3, -15);
    ctx.lineTo(3, -15);
    ctx.lineTo(3, 15);
    ctx.lineTo(-3, 15);
  } else if (category === "sword_pommel") {
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
  } else if (category === "axe_head") {
    ctx.moveTo(-5, -15);
    ctx.lineTo(15, -10);
    ctx.lineTo(15, 10);
    ctx.lineTo(-5, 15);
  } else if (category === "axe_handle") {
    ctx.moveTo(-2, -30);
    ctx.lineTo(2, -30);
    ctx.lineTo(2, 30);
    ctx.lineTo(-2, 30);
  } else {
    ctx.rect(-10, -10, 20, 20);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Highlight edge
  ctx.beginPath();
  if (category === "sword_blade") {
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 24);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.stroke();
  }

  ctx.restore();
}

export function renderWeaponToCanvas(ctx: CanvasRenderingContext2D, parts: any[], seed: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Scale up for viewing in forge
  ctx.save();
  ctx.scale(ctx.canvas.width / 64, ctx.canvas.height / 64);
  
  // Render parts in correct Z-order (e.g. handle, pommel, guard, blade)
  const zOrder = ["sword_handle", "sword_pommel", "axe_handle", "sword_guard", "sword_blade", "axe_head"];
  
  const sortedParts = [...parts].sort((a, b) => {
    const catA = a.id.split("_").slice(0, 2).join("_");
    const catB = b.id.split("_").slice(0, 2).join("_");
    return zOrder.indexOf(catA) - zOrder.indexOf(catB);
  });

  for (const part of sortedParts) {
    if (part) {
      renderPart(ctx, part, seed);
    }
  }
  
  ctx.restore();
}
