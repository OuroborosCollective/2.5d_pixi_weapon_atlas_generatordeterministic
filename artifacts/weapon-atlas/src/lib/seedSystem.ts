// seedSystem.ts

export function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function createSeededRandom(seedFactors: Record<string, string | number>) {
  const seedString = Object.entries(seedFactors).map(([k, v]) => `${k}:${v}`).join('|');
  const masterSeed = hashString(seedString);
  const randomFunc = mulberry32(masterSeed);
  
  return {
    next: randomFunc,
    nextRange: (min: number, max: number) => min + randomFunc() * (max - min),
    nextChoice: <T>(arr: T[]) => arr[Math.floor(randomFunc() * arr.length)],
    masterSeed
  };
}
