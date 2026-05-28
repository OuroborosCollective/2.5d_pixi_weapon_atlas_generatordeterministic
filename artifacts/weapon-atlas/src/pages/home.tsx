import { useState, useEffect, useRef } from "react";
import { PART_CATEGORIES, ALL_PARTS, renderPartToCanvas, WeaponPart } from "@/lib/weaponRenderer";
import { exportZip } from "@/lib/zipExporter";
import {
  RarityLevel, ElementType,
  renderWithEffects,
  RARITY_AURA_COLORS, ELEMENT_COLORS, ELEMENT_LABELS
} from "@/lib/effects";
import {
  ALL_CHARACTERS, CHAR_CATEGORIES, CharacterDef, CharacterClass,
  renderCharacterThumb, renderCharacterSheet,
  CHAR_RARITY_COLORS, CharRarity,
} from "@/lib/characterRenderer";
import { exportCharacterZip } from "@/lib/characterExporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Download, Layers, Sparkles, Sword, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const RARITIES: RarityLevel[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
const ELEMENTS: ElementType[] = ["none", "fire", "ice", "electro", "wind"];

const rarityDotClass: Record<string, string> = {
  common: "bg-gray-400", uncommon: "bg-green-500", rare: "bg-blue-500",
  epic: "bg-purple-500", legendary: "bg-orange-500", mythic: "bg-pink-400",
};

// ─── WEAPON COMPONENTS ───────────────────────────────────────────────────────

function PartThumbnail({
  part, isSelected, onClick, showAura, activeElement
}: {
  part: WeaponPart; isSelected: boolean; onClick: () => void;
  showAura: boolean; activeElement: ElementType;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 64, 64);
    ctx.save();
    ctx.scale(0.5, 0.5);
    renderWithEffects(ctx, part.draw, part.rarity as RarityLevel, showAura, activeElement);
    ctx.restore();
  }, [part, showAura, activeElement]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={`relative flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
            isSelected ? "border-amber-500 bg-amber-500/10" : "border-border bg-card hover:border-amber-500/50 hover:bg-accent"
          }`}
        >
          <canvas ref={canvasRef} width={64} height={64} className="mb-2 drop-shadow-md" />
          <span className="text-[10px] font-medium text-center truncate w-full text-foreground">{part.name}</span>
          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${rarityDotClass[part.rarity] ?? "bg-gray-400"}`} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <p className="font-bold">{part.name}</p>
          <p className="text-muted-foreground">{part.id}</p>
          <p className="capitalize" style={{ color: RARITY_AURA_COLORS[part.rarity as RarityLevel] }}>{part.rarity}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function LargePartView({ part, showAura, activeElement }: {
  part: WeaponPart; showAura: boolean; activeElement: ElementType;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderWithEffects(ctx, part.draw, part.rarity as RarityLevel, showAura, activeElement);
  }, [part, showAura, activeElement]);

  const auraColor = RARITY_AURA_COLORS[part.rarity as RarityLevel] ?? "#888";
  return (
    <div className="relative group cursor-crosshair">
      <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors rounded-xl border border-transparent group-hover:border-amber-500/30 z-0" />
      {showAura && (
        <div className="absolute inset-0 rounded-xl pointer-events-none z-0 transition-opacity"
          style={{ boxShadow: `0 0 18px 2px ${auraColor}55, inset 0 0 8px 1px ${auraColor}22` }} />
      )}
      <canvas ref={canvasRef} width={128} height={128}
        className="relative z-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all" />
      <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 rounded text-[10px] text-amber-400 z-20 pointer-events-none">
        {part.id}
      </div>
    </div>
  );
}

// ─── CHARACTER COMPONENTS ────────────────────────────────────────────────────

function CharThumbnail({ char, isSelected, onClick }: {
  char: CharacterDef; isSelected: boolean; onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 72, 96);
    const frame = renderCharacterThumb(char);
    ctx.drawImage(frame, 0, 0, 72, 96);
  }, [char]);

  const rarityColor = CHAR_RARITY_COLORS[char.rarity];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={`relative flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
            isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-card hover:border-emerald-500/50 hover:bg-accent"
          }`}
        >
          <div className="w-[72px] h-[96px] flex items-center justify-center mb-1 relative">
            <canvas ref={canvasRef} width={72} height={96}
              style={{ imageRendering: "pixelated" }}
              className="drop-shadow-md" />
          </div>
          <span className="text-[10px] font-medium text-center truncate w-full text-foreground">{char.name}</span>
          <span className="text-[9px] text-zinc-500 capitalize">{char.class} · {char.race}</span>
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: rarityColor }} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-0.5">
          <p className="font-bold">{char.name}</p>
          <p className="text-muted-foreground">{char.id}</p>
          <p className="capitalize">{char.class} · {char.race} · {char.armorTier}</p>
          <p className="capitalize font-semibold" style={{ color: rarityColor }}>{char.rarity}</p>
          <p className="text-zinc-500">{char.tags.join(', ')}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function LargeCharView({ char }: { char: CharacterDef }) {
  const sheetRef = useRef<HTMLCanvasElement>(null);
  const rarityColor = CHAR_RARITY_COLORS[char.rarity];

  useEffect(() => {
    const canvas = sheetRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sheet = renderCharacterSheet(char);
    ctx.drawImage(sheet, 0, 0);
  }, [char]);

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `0 0 16px 2px ${rarityColor}44` }} />
        <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-3 group-hover:border-zinc-600 transition-colors">
          <canvas
            ref={sheetRef}
            width={192}
            height={384}
            style={{ imageRendering: "pixelated", width: 96, height: 192 }}
            className="drop-shadow-md"
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-zinc-200">{char.name}</p>
        <p className="text-[10px] capitalize" style={{ color: rarityColor }}>{char.rarity}</p>
        <p className="text-[9px] text-zinc-500 capitalize">{char.class} · {char.race} · {char.armorTier}</p>
        <p className="text-[8px] text-zinc-700 mt-0.5 font-mono">{char.id}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Home() {
  const [mode, setMode] = useState<"weapons" | "characters">("weapons");

  // Weapon state
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [showAura, setShowAura] = useState(false);
  const [activeElement, setActiveElement] = useState<ElementType>("none");
  const [exporting, setExporting] = useState(false);

  // Character state
  const [charSearch, setCharSearch] = useState("");
  const [charTab, setCharTab] = useState<"All" | CharacterClass>("All");
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [exportingChar, setExportingChar] = useState(false);

  const weaponTabs = ["All","Swords","Daggers","Axes","Hammers","Maces","Spears","Bows","Knuckles","Staffs","Shields","Crystals"];
  const charClassTabs: Array<"All" | CharacterClass> = ["All","warrior","mage","rogue","ranger","paladin","berserker"];

  const filteredParts = ALL_PARTS.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    let mt = true;
    if (activeTab === "Swords")    mt = p.category.includes("sword");
    else if (activeTab === "Daggers")   mt = p.category.includes("dagger");
    else if (activeTab === "Axes")      mt = p.category.includes("axe");
    else if (activeTab === "Hammers")   mt = p.category.includes("hammer");
    else if (activeTab === "Maces")     mt = p.category.includes("mace");
    else if (activeTab === "Spears")    mt = p.category.includes("spear");
    else if (activeTab === "Bows")      mt = p.category.includes("bow");
    else if (activeTab === "Knuckles")  mt = p.category.includes("knuckle");
    else if (activeTab === "Staffs")    mt = p.category.includes("staff");
    else if (activeTab === "Shields")   mt = p.category.includes("shield");
    else if (activeTab === "Crystals")  mt = p.category.includes("crystal");
    return ms && mt;
  });

  const filteredChars = ALL_CHARACTERS.filter(c => {
    const ms = c.name.toLowerCase().includes(charSearch.toLowerCase()) ||
               c.id.toLowerCase().includes(charSearch.toLowerCase()) ||
               c.tags.some(t => t.includes(charSearch.toLowerCase()));
    const mt = charTab === "All" || c.class === charTab;
    return ms && mt;
  });

  const handleExport = async () => {
    setExporting(true);
    try { await exportZip(); } catch (e) { console.error(e); } finally { setExporting(false); }
  };

  const handleExportChars = async () => {
    setExportingChar(true);
    try { await exportCharacterZip(); } catch (e) { console.error(e); } finally { setExportingChar(false); }
  };

  // What's shown in the main atlas area
  const charCategoriesToShow = charTab === "All"
    ? Object.entries(CHAR_CATEGORIES) as [CharacterClass, CharacterDef[]][]
    : [[charTab, CHAR_CATEGORIES[charTab]] as [CharacterClass, CharacterDef[]]];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden selection:bg-amber-500/30">

      {/* LEFT PANEL */}
      <div className="w-[340px] flex flex-col border-r border-zinc-800 bg-[#111111] z-10 shadow-xl">

        {/* MODE SWITCHER */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setMode("weapons")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-bold tracking-widest uppercase transition-colors ${
              mode === "weapons" ? "bg-amber-600/20 text-amber-400 border-b-2 border-amber-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <Sword className="w-3.5 h-3.5" /> Weapons
          </button>
          <button
            onClick={() => setMode("characters")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-bold tracking-widest uppercase transition-colors ${
              mode === "characters" ? "bg-emerald-600/20 text-emerald-400 border-b-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Characters
          </button>
        </div>

        {mode === "weapons" ? (
          <>
            <div className="p-4 border-b border-zinc-800">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500/50" />
              </div>
              <div className="flex flex-wrap gap-1">
                {weaponTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors ${
                      activeTab === tab ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >{tab}</button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-3 gap-3">
                {filteredParts.map(part => (
                  <PartThumbnail key={part.id} part={part}
                    isSelected={selectedPartId === part.id} onClick={() => setSelectedPartId(part.id)}
                    showAura={showAura} activeElement={activeElement} />
                ))}
              </div>
              {filteredParts.length === 0 && <div className="text-center text-zinc-500 mt-10 text-sm">No parts found.</div>}
            </ScrollArea>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-zinc-800">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input placeholder="Search characters..." value={charSearch} onChange={e => setCharSearch(e.target.value)}
                  className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50" />
              </div>
              <div className="flex flex-wrap gap-1">
                {charClassTabs.map(tab => (
                  <button key={tab} onClick={() => setCharTab(tab)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors capitalize ${
                      charTab === tab ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >{tab}</button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-3">
                {filteredChars.map(char => (
                  <CharThumbnail key={char.id} char={char}
                    isSelected={selectedCharId === char.id} onClick={() => setSelectedCharId(char.id)} />
                ))}
              </div>
              {filteredChars.length === 0 && <div className="text-center text-zinc-500 mt-10 text-sm">No characters found.</div>}
            </ScrollArea>
          </>
        )}
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 to-zinc-900/90 pointer-events-none" />

        {/* HEADER */}
        <header className="relative z-10 p-5 flex justify-between items-center border-b border-zinc-800/50 bg-black/40 backdrop-blur-sm">
          <div>
            {mode === "weapons" ? (
              <>
                <h1 className="text-2xl font-black text-amber-500 tracking-wider flex items-center gap-2">
                  <Layers className="w-6 h-6" /> WEAPON ATLAS
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5 tracking-widest uppercase">Modular Parts • PixiJS Ready</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black text-emerald-400 tracking-wider flex items-center gap-2">
                  <User className="w-6 h-6" /> CHARACTER ATLAS
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5 tracking-widest uppercase">Sprite Sheets • PixiJS Ready • GPL-3.0</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {mode === "weapons" ? (
              <>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400 px-3 py-1">{ALL_PARTS.length} Parts</Badge>
                <Button onClick={handleExport} disabled={exporting}
                  className="bg-amber-600 hover:bg-amber-500 text-black font-bold border-none shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_20px_rgba(217,119,6,0.5)] transition-all disabled:opacity-60">
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? "Exporting…" : "Export ZIP"}
                </Button>
              </>
            ) : (
              <>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400 px-3 py-1">{ALL_CHARACTERS.length} Characters</Badge>
                <Button onClick={handleExportChars} disabled={exportingChar}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold border-none shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:shadow-[0_0_20px_rgba(5,150,105,0.5)] transition-all disabled:opacity-60">
                  <Download className="w-4 h-4 mr-2" />
                  {exportingChar ? "Exporting…" : "Export ZIP"}
                </Button>
              </>
            )}
          </div>
        </header>

        {/* WEAPONS: EFFECTS BAR */}
        {mode === "weapons" && (
          <div className="relative z-10 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-zinc-800/60 bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Rarity Aura</span>
              <div className="flex gap-1 ml-1">
                {[false, true].map(v => (
                  <button key={String(v)} onClick={() => setShowAura(v)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
                      showAura === v ? (v ? "bg-zinc-200 text-black" : "bg-zinc-600 text-white") : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                    }`}
                  >{v ? "On" : "Off"}</button>
                ))}
              </div>
              {showAura && (
                <div className="flex items-center gap-2 ml-2">
                  {RARITIES.map(r => (
                    <div key={r} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_AURA_COLORS[r] }} />
                      <span className="text-[10px] text-zinc-500 capitalize">{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Element</span>
              <div className="flex gap-1">
                {ELEMENTS.map(el => {
                  const isActive = activeElement === el;
                  const color = ELEMENT_COLORS[el];
                  return (
                    <button key={el} onClick={() => setActiveElement(el)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all border ${
                        isActive ? "text-black font-bold" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                      }`}
                      style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                    >{ELEMENT_LABELS[el]}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CHARACTERS: INFO BAR */}
        {mode === "characters" && (
          <div className="relative z-10 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-zinc-800/60 bg-black/30 backdrop-blur-sm">
            <span className="text-[11px] text-zinc-500">
              Sprite sheet: <span className="text-zinc-300">192×384 px</span> per character &nbsp;·&nbsp;
              Frame: <span className="text-zinc-300">48×64 px</span> &nbsp;·&nbsp;
              Animations: <span className="text-zinc-300">walk_south · walk_west · walk_east · walk_north · idle · attack</span>
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {(Object.entries(CHAR_RARITY_COLORS) as [CharRarity, string][]).map(([r, col]) => (
                <div key={r} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                  <span className="text-[10px] text-zinc-500 capitalize">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEAPONS ATLAS GRID */}
        {mode === "weapons" && (
          <ScrollArea className="flex-1 relative z-10 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
              {Object.entries(PART_CATEGORIES).map(([catKey, parts]) => {
                if (parts.length === 0) return null;
                const title = catKey.replace(/_/g, " ").toUpperCase();
                return (
                  <section key={catKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-lg font-bold text-zinc-200 tracking-widest">{title}</h2>
                      <div className="h-px bg-gradient-to-r from-zinc-800 to-transparent flex-1" />
                      <span className="text-xs text-zinc-600">{parts.length} parts</span>
                    </div>
                    <div className="flex flex-wrap gap-8">
                      {parts.map(part => (
                        <LargePartView key={part.id} part={part} showAura={showAura} activeElement={activeElement} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* CHARACTERS ATLAS GRID */}
        {mode === "characters" && (
          <ScrollArea className="flex-1 relative z-10 p-8">
            <div className="max-w-6xl mx-auto space-y-14 pb-20">
              {charTab === "All" ? (
                charCategoriesToShow.map(([cls, chars]) => {
                  if (!chars || chars.length === 0) return null;
                  const filtered = chars.filter(c =>
                    c.name.toLowerCase().includes(charSearch.toLowerCase()) ||
                    c.id.toLowerCase().includes(charSearch.toLowerCase()) ||
                    c.tags.some(t => t.includes(charSearch.toLowerCase()))
                  );
                  if (filtered.length === 0) return null;
                  return (
                    <section key={cls} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                      <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-lg font-bold text-zinc-200 tracking-widest capitalize">{cls}s</h2>
                        <div className="h-px bg-gradient-to-r from-zinc-800 to-transparent flex-1" />
                        <span className="text-xs text-zinc-600">{filtered.length} characters</span>
                      </div>
                      <div className="flex flex-wrap gap-10">
                        {filtered.map(char => <LargeCharView key={char.id} char={char} />)}
                      </div>
                    </section>
                  );
                })
              ) : (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-zinc-200 tracking-widest capitalize">{charTab}s</h2>
                    <div className="h-px bg-gradient-to-r from-zinc-800 to-transparent flex-1" />
                    <span className="text-xs text-zinc-600">{filteredChars.length} characters</span>
                  </div>
                  <div className="flex flex-wrap gap-10">
                    {filteredChars.map(char => <LargeCharView key={char.id} char={char} />)}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
