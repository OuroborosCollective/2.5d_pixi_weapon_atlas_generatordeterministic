import { useState, useEffect, useRef } from "react";
import { PART_CATEGORIES, ALL_PARTS, renderPartToCanvas, WeaponPart } from "@/lib/weaponRenderer";
import { exportZip } from "@/lib/zipExporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Download, Layers } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function PartThumbnail({ part, isSelected, onClick }: { part: WeaponPart, isSelected: boolean, onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 64, 64);
        ctx.save();
        ctx.scale(0.5, 0.5); // Scale 128 down to 64
        part.draw(ctx);
        ctx.restore();
      }
    }
  }, [part]);

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-orange-500"
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          onClick={onClick}
          className={`relative flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-card hover:border-amber-500/50 hover:bg-accent'}`}
        >
          <canvas ref={canvasRef} width={64} height={64} className="mb-2 drop-shadow-md" />
          <span className="text-[10px] font-medium text-center truncate w-full text-foreground">{part.name}</span>
          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${rarityColors[part.rarity] || "bg-gray-500"}`} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <p className="font-bold">{part.name}</p>
          <p className="text-muted-foreground">{part.id}</p>
          <p className="capitalize text-amber-500">{part.rarity}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function LargePartView({ part }: { part: WeaponPart }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 128, 128);
        part.draw(ctx);
      }
    }
  }, [part]);

  return (
    <div className="relative group cursor-crosshair">
      <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors rounded-xl border border-transparent group-hover:border-amber-500/30 z-0" />
      <canvas ref={canvasRef} width={128} height={128} className="relative z-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all" />
      <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 rounded text-[10px] text-amber-400 z-20 pointer-events-none">
        {part.id}
      </div>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const tabs = ["All", "Swords", "Daggers", "Axes", "Hammers", "Maces", "Spears", "Bows", "Knuckles", "Staffs", "Shields", "Crystals"];

  const filteredParts = ALL_PARTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    let matchesTab = true;
    if (activeTab === "Swords")   matchesTab = p.category.includes("sword");
    else if (activeTab === "Daggers")  matchesTab = p.category.includes("dagger");
    else if (activeTab === "Axes")     matchesTab = p.category.includes("axe");
    else if (activeTab === "Hammers")  matchesTab = p.category.includes("hammer");
    else if (activeTab === "Maces")    matchesTab = p.category.includes("mace");
    else if (activeTab === "Spears")   matchesTab = p.category.includes("spear");
    else if (activeTab === "Bows")     matchesTab = p.category.includes("bow");
    else if (activeTab === "Knuckles") matchesTab = p.category.includes("knuckle");
    else if (activeTab === "Staffs")   matchesTab = p.category.includes("staff");
    else if (activeTab === "Shields")  matchesTab = p.category.includes("shield");
    else if (activeTab === "Crystals") matchesTab = p.category.includes("crystal");

    return matchesSearch && matchesTab;
  });

  const handleExport = async () => {
    try {
      await exportZip();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden selection:bg-amber-500/30">
      {/* LEFT PANEL - BROWSER */}
      <div className="w-[340px] flex flex-col border-r border-zinc-800 bg-[#111111] z-10 shadow-xl">
        <div className="p-4 border-b border-zinc-800">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search parts..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors ${activeTab === tab ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-3 gap-3">
            {filteredParts.map(part => (
              <PartThumbnail 
                key={part.id} 
                part={part} 
                isSelected={selectedPartId === part.id}
                onClick={() => setSelectedPartId(part.id)}
              />
            ))}
          </div>
          {filteredParts.length === 0 && (
            <div className="text-center text-zinc-500 mt-10 text-sm">No parts found.</div>
          )}
        </ScrollArea>
      </div>

      {/* MAIN PANEL - ATLAS VIEW */}
      <div className="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-zinc-950 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 to-zinc-900/90 pointer-events-none" />
        
        <header className="relative z-10 p-6 flex justify-between items-center border-b border-zinc-800/50 bg-black/40 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-wider flex items-center gap-2">
              <Layers className="w-6 h-6" /> WEAPON ATLAS
            </h1>
            <p className="text-xs text-zinc-400 mt-1 tracking-widest uppercase">Modular Parts • PixiJS Ready</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-zinc-700 text-zinc-400 px-3 py-1">
              {ALL_PARTS.length} Parts
            </Badge>
            <Button onClick={handleExport} className="bg-amber-600 hover:bg-amber-500 text-black font-bold border-none shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_20px_rgba(217,119,6,0.5)] transition-all">
              <Download className="w-4 h-4 mr-2" /> Export ZIP
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 relative z-10 p-8">
          <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {Object.entries(PART_CATEGORIES).map(([catKey, parts]) => {
              if (parts.length === 0) return null;
              
              const title = catKey.replace("_", " ").toUpperCase();
              
              return (
                <section key={catKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-200 tracking-widest">{title}</h2>
                    <div className="h-px bg-gradient-to-r from-zinc-800 to-transparent flex-1" />
                  </div>
                  
                  <div className="flex flex-wrap gap-8">
                    {parts.map(part => (
                      <LargePartView key={part.id} part={part} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
