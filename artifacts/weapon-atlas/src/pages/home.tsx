import { useState, useRef, useEffect } from "react";
import { PART_CATEGORIES, renderWeaponToCanvas } from "@/lib/weaponRenderer";
import { exportZip } from "@/lib/zipExporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Lock, Unlock } from "lucide-react";

export default function Home() {
  const [seed, setSeed] = useState<number>(12345);
  const [seedLocked, setSeedLocked] = useState(false);
  const [rarity, setRarity] = useState("common");
  
  const [selectedParts, setSelectedParts] = useState<Record<string, any>>({
    sword_blade: PART_CATEGORIES.sword_blade[0],
    sword_guard: PART_CATEGORIES.sword_guard[0],
    sword_handle: PART_CATEGORIES.sword_handle[0],
    sword_pommel: PART_CATEGORIES.sword_pommel[0],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        renderWeaponToCanvas(ctx, Object.values(selectedParts), seed);
      }
    }
  }, [selectedParts, seed]);

  const handleRoll = () => {
    if (!seedLocked) {
      setSeed(Math.floor(Math.random() * 1000000));
    }
  };

  const handleExport = async () => {
    try {
      await exportZip(seed);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-primary tracking-wider uppercase">Part Browser</h2>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {Object.entries(PART_CATEGORIES).map(([cat, parts]) => (
              <div key={cat} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{cat.replace("_", " ")}</h3>
                <div className="space-y-1">
                  {parts.map(part => (
                    <div 
                      key={part.id}
                      onClick={() => setSelectedParts(prev => ({ ...prev, [cat]: part }))}
                      className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between
                        ${selectedParts[cat]?.id === part.id ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-accent hover:text-accent-foreground"}`}
                    >
                      <span>{part.name}</span>
                      <Badge variant="outline" className="text-[10px]">{part.material}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* CENTER PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <div className="flex gap-2">
            {["cursed_fire_sword", "ancient_forest_axe", "frostborn_staff", "void_hammer", "royal_guard_blade"].map(preset => (
              <Badge key={preset} variant="secondary" className="cursor-pointer hover:bg-secondary/80">{preset}</Badge>
            ))}
          </div>
        </div>

        <div className="relative w-[512px] h-[512px] border border-border bg-black/50 rounded-xl shadow-2xl flex items-center justify-center mb-8 isolate overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,40,20,0.4)_0%,transparent_70%)] pointer-events-none" />
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />
          
          <canvas 
            ref={canvasRef} 
            width={512} 
            height={512} 
            className="relative z-10 filter drop-shadow-[0_0_15px_rgba(200,120,30,0.3)]"
          />
        </div>

        <div className="flex items-center gap-4 w-full max-w-[512px] bg-card p-4 rounded-lg border border-border">
          <div className="flex-1 flex gap-2">
            <Input 
              value={seed} 
              onChange={e => setSeed(Number(e.target.value) || 0)} 
              disabled={seedLocked}
              className="font-mono text-primary"
            />
            <Button variant="outline" size="icon" onClick={() => setSeedLocked(!seedLocked)}>
              {seedLocked ? <Lock size={16} /> : <Unlock size={16} />}
            </Button>
          </div>
          
          <Select value={rarity} onValueChange={setRarity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="uncommon">Uncommon</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
              <SelectItem value="mythic">Mythic</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleRoll} variant="default" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCw size={16} />
            Roll
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary tracking-wider uppercase">Export</h2>
        </div>
        <div className="p-4 flex flex-col gap-6 flex-1">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Atlas Preview</h3>
            <div className="aspect-square border border-border bg-black/30 rounded-md relative flex items-center justify-center overflow-hidden">
              {/* Mini version of the canvas or a packed grid placeholder */}
              <div className="text-xs text-muted-foreground">Atlas Grid Preview</div>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Metadata</h3>
            <div className="bg-black/50 border border-border rounded-md p-3 font-mono text-[10px] text-muted-foreground h-full overflow-auto">
              {JSON.stringify({
                seed,
                rarity,
                parts: Object.values(selectedParts).map(p => p?.id)
              }, null, 2)}
            </div>
          </div>

          <Button onClick={handleExport} size="lg" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg">
            <Download size={20} />
            Export ZIP
          </Button>
        </div>
      </div>
    </div>
  );
}
