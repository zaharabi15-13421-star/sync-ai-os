import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Download, Wand2, Sparkles, Undo2, Redo2,
  Type as TypeIcon, Square, Circle as CircleIcon, Image as ImageIcon,
  Trash2, Copy, Loader2, Layers, Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/dashboard/creative/templates/editor/$templateId",
)({
  component: TemplateEditor,
  head: () => ({
    meta: [{ title: "Template Editor — BrandSync AI" }],
  }),
});

// ---------- Types ----------
type FabricNS = typeof import("fabric");
type FabricCanvas = import("fabric").Canvas;
type FabricObject = import("fabric").FabricObject;

type LayerInfo = {
  id: string;
  type: "text" | "rect" | "circle" | "image";
  label: string;
};

const FONT_FAMILIES = [
  "Inter", "Poppins", "Roboto", "Montserrat",
  "Playfair Display", "Bebas Neue", "Space Grotesk", "Lora",
];

const SWATCHES = [
  "#ffffff", "#0a0d16", "#7b6ef6", "#22d3ee",
  "#f43f5e", "#f59e0b", "#10b981", "#6366f1",
];

// ---------- Component ----------
function TemplateEditor() {
  const { templateId } = Route.useParams();
  const navigate = useNavigate();

  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricNS | null>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);

  const [ready, setReady] = useState(false);
  const [name, setName] = useState(`Untitled (${templateId})`);
  const [dirty, setDirty] = useState(false);
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, forceTick] = useState(0);
  const rerender = useCallback(() => forceTick((n) => n + 1), []);

  // Undo/Redo stack of JSON snapshots
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isRestoring = useRef(false);

  // Modals
  const [exportOpen, setExportOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState<null | "selected" | "all">(null);

  // ---- Initialize Fabric (client-only) ----
  useEffect(() => {
    let disposed = false;
    (async () => {
      const fabric = await import("fabric");
      if (disposed || !canvasElRef.current) return;
      fabricRef.current = fabric;

      const c = new fabric.Canvas(canvasElRef.current, {
        width: 900,
        height: 600,
        backgroundColor: "#11141d",
        preserveObjectStacking: true,
      });
      canvasRef.current = c;

      // Seed sample content so the user sees something immediately
      const bg = new fabric.Rect({
        left: 0, top: 0, width: 900, height: 600,
        fill: "#0f1320", selectable: false, evented: false,
      });
      (bg as FabricObject & { id?: string }).id = "bg";
      c.add(bg);

      const headline = new fabric.IText("Your Headline Here", {
        left: 60, top: 80, fontSize: 56, fontFamily: "Inter",
        fontWeight: "700", fill: "#ffffff",
      });
      (headline as FabricObject & { id?: string }).id = uid();
      c.add(headline);

      const sub = new fabric.IText("Click any element to edit its properties on the right.", {
        left: 60, top: 170, fontSize: 22, fontFamily: "Inter",
        fill: "#c8c2ff",
      });
      (sub as FabricObject & { id?: string }).id = uid();
      c.add(sub);

      const accent = new fabric.Rect({
        left: 60, top: 240, width: 220, height: 56, rx: 12, ry: 12,
        fill: "#7b6ef6",
      });
      (accent as FabricObject & { id?: string }).id = uid();
      c.add(accent);

      c.on("selection:created", () => syncSelection());
      c.on("selection:updated", () => syncSelection());
      c.on("selection:cleared", () => setSelectedId(null));
      c.on("object:modified", () => commit());
      c.on("object:added", () => { refreshLayers(); });
      c.on("object:removed", () => { refreshLayers(); });

      function syncSelection() {
        const obj = c.getActiveObject() as (FabricObject & { id?: string }) | null;
        setSelectedId(obj?.id ?? null);
        rerender();
      }

      refreshLayers();
      commit(true); // baseline snapshot
      setReady(true);
    })();
    return () => {
      disposed = true;
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Helpers ----
  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  const refreshLayers = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const next: LayerInfo[] = c.getObjects()
      .filter((o) => (o as FabricObject & { id?: string }).id !== "bg")
      .map((o) => {
        const id = (o as FabricObject & { id?: string }).id ?? uid();
        (o as FabricObject & { id?: string }).id = id;
        const t = o.type ?? "object";
        let kind: LayerInfo["type"] = "rect";
        let label = "Shape";
        if (t === "i-text" || t === "text" || t === "textbox") {
          kind = "text";
          const tx = (o as unknown as { text?: string }).text ?? "Text";
          label = tx.length > 24 ? tx.slice(0, 24) + "…" : tx;
        } else if (t === "circle") {
          kind = "circle"; label = "Circle";
        } else if (t === "image") {
          kind = "image"; label = "Image";
        } else {
          kind = "rect"; label = "Rectangle";
        }
        return { id, type: kind, label };
      })
      .reverse(); // top-of-stack first
    setLayers(next);
  }, []);

  const commit = useCallback((baseline = false) => {
    const c = canvasRef.current;
    if (!c || isRestoring.current) return;
    const json = JSON.stringify(c.toJSON());
    if (!baseline) {
      undoStack.current.push(json);
      redoStack.current = [];
      setDirty(true);
    } else {
      undoStack.current = [json];
    }
  }, []);

  const restore = useCallback(async (json: string) => {
    const c = canvasRef.current;
    if (!c) return;
    isRestoring.current = true;
    await c.loadFromJSON(JSON.parse(json));
    c.renderAll();
    isRestoring.current = false;
    refreshLayers();
    rerender();
  }, [refreshLayers, rerender]);

  const undo = useCallback(async () => {
    if (undoStack.current.length <= 1) return;
    const current = undoStack.current.pop()!;
    redoStack.current.push(current);
    const prev = undoStack.current[undoStack.current.length - 1];
    await restore(prev);
  }, [restore]);

  const redo = useCallback(async () => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(next);
    await restore(next);
  }, [restore]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault(); undo();
      } else if (meta && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault(); redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const c = canvasRef.current;
        const active = c?.getActiveObject() as (FabricObject & { id?: string }) | null;
        if (active && active.id !== "bg" && document.activeElement?.tagName !== "INPUT") {
          c?.remove(active); c?.discardActiveObject(); c?.renderAll(); commit();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, commit]);

  // ---- Add elements ----
  function addText() {
    const fabric = fabricRef.current; const c = canvasRef.current;
    if (!fabric || !c) return;
    const t = new fabric.IText("New text", {
      left: 120, top: 360, fontSize: 32, fontFamily: "Inter", fill: "#ffffff",
    });
    (t as FabricObject & { id?: string }).id = uid();
    c.add(t); c.setActiveObject(t); c.renderAll(); commit();
  }
  function addRect() {
    const fabric = fabricRef.current; const c = canvasRef.current;
    if (!fabric || !c) return;
    const r = new fabric.Rect({
      left: 320, top: 360, width: 160, height: 100, fill: "#22d3ee", rx: 8, ry: 8,
    });
    (r as FabricObject & { id?: string }).id = uid();
    c.add(r); c.setActiveObject(r); c.renderAll(); commit();
  }
  function addCircle() {
    const fabric = fabricRef.current; const c = canvasRef.current;
    if (!fabric || !c) return;
    const cc = new fabric.Circle({
      left: 520, top: 360, radius: 56, fill: "#f43f5e",
    });
    (cc as FabricObject & { id?: string }).id = uid();
    c.add(cc); c.setActiveObject(cc); c.renderAll(); commit();
  }
  function addImage() {
    const fabric = fabricRef.current; const c = canvasRef.current;
    if (!fabric || !c) return;
    const url = `https://picsum.photos/seed/edit-${Math.floor(Math.random() * 999)}/400/300.webp`;
    fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
      img.set({ left: 60, top: 400 });
      img.scaleToWidth(260);
      (img as FabricObject & { id?: string }).id = uid();
      c.add(img); c.setActiveObject(img); c.renderAll(); commit();
    });
  }

  function selectLayer(id: string) {
    const c = canvasRef.current; if (!c) return;
    const obj = c.getObjects().find((o) => (o as FabricObject & { id?: string }).id === id);
    if (obj) { c.setActiveObject(obj); c.renderAll(); }
  }

  function deleteSelected() {
    const c = canvasRef.current; if (!c) return;
    const a = c.getActiveObject() as (FabricObject & { id?: string }) | null;
    if (!a || a.id === "bg") return;
    c.remove(a); c.discardActiveObject(); c.renderAll(); commit();
  }

  function duplicateSelected() {
    const c = canvasRef.current; if (!c) return;
    const a = c.getActiveObject(); if (!a) return;
    a.clone().then((cl: FabricObject) => {
      cl.set({ left: (a.left ?? 0) + 20, top: (a.top ?? 0) + 20 });
      (cl as FabricObject & { id?: string }).id = uid();
      c.add(cl); c.setActiveObject(cl); c.renderAll(); commit();
    });
  }

  // ---- Mocked AI ----
  async function mockDelay(ms = 900) { return new Promise((r) => setTimeout(r, ms)); }

  const AI_SAMPLES = [
    "Bold ideas. Boldly shipped.",
    "Designed to convert. Built to scale.",
    "Your brand, amplified by AI.",
    "Stand out in every scroll.",
    "Where creativity meets velocity.",
    "Premium templates, instantly yours.",
  ];

  async function aiWriteSelected() {
    const c = canvasRef.current; if (!c) return;
    const a = c.getActiveObject() as (FabricObject & { id?: string; type?: string; set?: (k: string, v: string) => void }) | null;
    if (!a || !(a.type === "i-text" || a.type === "text" || a.type === "textbox")) {
      toast.info("Select a text layer to use AI Write.");
      return;
    }
    setAiBusy("selected");
    await mockDelay();
    const next = AI_SAMPLES[Math.floor(Math.random() * AI_SAMPLES.length)];
    (a as unknown as { set: (k: string, v: string) => void }).set("text", next);
    c.renderAll(); commit(); setAiBusy(null);
    toast.success("AI Write updated the selected text.");
  }

  async function aiEnhanceAll() {
    const c = canvasRef.current; if (!c) return;
    setAiBusy("all");
    await mockDelay(1200);
    c.getObjects().forEach((o, i) => {
      const t = o.type;
      if (t === "i-text" || t === "text" || t === "textbox") {
        const cur = (o as unknown as { text?: string }).text ?? "";
        const enhanced = cur.length > 40
          ? AI_SAMPLES[(i + 1) % AI_SAMPLES.length]
          : AI_SAMPLES[i % AI_SAMPLES.length];
        (o as unknown as { set: (k: string, v: string) => void }).set("text", enhanced);
      }
    });
    c.renderAll(); commit(); setAiBusy(null);
    toast.success("AI enhanced all text layers in the template.");
  }

  // ---- Export ----
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "svg">("png");
  const [exportQuality, setExportQuality] = useState<"standard" | "hd" | "4k">("hd");
  const [aiUpscale, setAiUpscale] = useState(false);
  const [aiCleanup, setAiCleanup] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function doExport() {
    const c = canvasRef.current; if (!c) return;
    setExporting(true);
    await mockDelay(800);
    const multiplier = exportQuality === "4k" ? 4 : exportQuality === "hd" ? 2 : 1;
    let dataUrl: string;
    if (exportFormat === "svg") {
      const svg = c.toSVG();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      dataUrl = URL.createObjectURL(blob);
    } else {
      dataUrl = c.toDataURL({
        format: exportFormat === "jpg" ? "jpeg" : "png",
        quality: 0.95,
        multiplier,
      });
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${name.replace(/[^\w-]+/g, "_") || "template"}.${exportFormat}`;
    document.body.appendChild(a); a.click(); a.remove();
    if (exportFormat === "svg") setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
    setExporting(false); setExportOpen(false);
    const extras = [aiUpscale && "upscaled", aiCleanup && "cleaned"].filter(Boolean).join(" + ");
    toast.success(`Downloaded ${exportFormat.toUpperCase()}${extras ? ` (${extras})` : ""}`);
    setDirty(false);
  }

  // ---- Active object accessors (for right panel) ----
  const activeObj = useMemo(() => {
    const c = canvasRef.current; if (!c || !selectedId) return null;
    return (c.getObjects().find((o) => (o as FabricObject & { id?: string }).id === selectedId) ?? null) as FabricObject | null;
  }, [selectedId, layers, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateActive(patch: Record<string, unknown>) {
    const c = canvasRef.current; const o = activeObj;
    if (!c || !o) return;
    o.set(patch);
    o.setCoords?.();
    c.renderAll();
    rerender();
  }

  // ---- Exit handling ----
  function handleExit() {
    if (dirty) { setExitOpen(true); return; }
    navigate({ to: "/dashboard/creative/templates" });
  }

  // ---- Render ----
  const activeType = (activeObj as (FabricObject & { type?: string }) | null)?.type ?? null;
  const isText = activeType === "i-text" || activeType === "text" || activeType === "textbox";

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0d16] text-foreground flex flex-col">
      {/* Top toolbar */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0d16]/95 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Templates
          </button>
          <span className="text-white/30">/</span>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setDirty(true); }}
            className="bg-transparent text-sm font-medium px-2 py-1 rounded hover:bg-white/5 focus:bg-white/5 outline-none min-w-0 w-64"
          />
          {dirty && <span className="text-xs text-amber-300/80">• Unsaved</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={undo} disabled={undoStack.current.length <= 1} className="text-white/70">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={redo} disabled={redoStack.current.length === 0} className="text-white/70">
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <Button size="sm" variant="outline" onClick={aiWriteSelected} disabled={aiBusy !== null}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            {aiBusy === "selected" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1.5" />}
            AI Write
          </Button>
          <Button size="sm" variant="outline" onClick={aiEnhanceAll} disabled={aiBusy !== null}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            {aiBusy === "all" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
            Enhance Whole Template
          </Button>
          <Button size="sm" onClick={() => setExportOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Body: 3 panels */}
      <div className="flex-1 grid grid-cols-[260px_1fr_300px] min-h-0">
        {/* Left: layers + add */}
        <aside className="border-r border-white/10 bg-[#0c1019] flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Add element</div>
            <div className="grid grid-cols-2 gap-1.5">
              <ToolBtn icon={TypeIcon} label="Text" onClick={addText} />
              <ToolBtn icon={Square} label="Rect" onClick={addRect} />
              <ToolBtn icon={CircleIcon} label="Circle" onClick={addCircle} />
              <ToolBtn icon={ImageIcon} label="Image" onClick={addImage} />
            </div>
          </div>
          <div className="p-3 flex-1 min-h-0 flex flex-col">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
              <Layers className="h-3 w-3" /> Layers
            </div>
            <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
              {layers.length === 0 && (
                <div className="text-xs text-white/40 px-2 py-3">No layers yet.</div>
              )}
              {layers.map((l) => (
                <button key={l.id} onClick={() => selectLayer(l.id)}
                  className={cn(
                    "w-full text-left text-xs px-2.5 py-2 rounded-md flex items-center gap-2 border transition-colors",
                    selectedId === l.id
                      ? "bg-indigo-500/15 border-indigo-400/30 text-white"
                      : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5",
                  )}
                >
                  <LayerIcon type={l.type} />
                  <span className="truncate">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: canvas */}
        <main className="relative overflow-auto bg-[#070912] grid place-items-center p-8">
          {!ready && (
            <div className="absolute inset-0 grid place-items-center text-white/50 text-sm">
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading editor…</div>
            </div>
          )}
          <div className="shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] rounded-md overflow-hidden ring-1 ring-white/10 bg-black">
            <canvas ref={canvasElRef} />
          </div>
        </main>

        {/* Right: properties */}
        <aside className="border-l border-white/10 bg-[#0c1019] overflow-y-auto">
          <div className="p-4">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
              <Palette className="h-3 w-3" /> Properties
            </div>
            {!activeObj && (
              <div className="text-xs text-white/40">
                Select an element on the canvas to edit it.
              </div>
            )}
            {activeObj && (
              <div className="space-y-4">
                {isText && (
                  <TextProps obj={activeObj} update={updateActive} commit={commit} />
                )}
                <FillProps obj={activeObj} update={updateActive} commit={commit} />
                <OpacityProps obj={activeObj} update={updateActive} commit={commit} />
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={duplicateSelected}
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10 flex-1">
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Duplicate
                  </Button>
                  <Button size="sm" variant="outline" onClick={deleteSelected}
                    className="border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {isText && (
                  <Button size="sm" onClick={aiWriteSelected} disabled={aiBusy !== null}
                    className="w-full bg-gradient-to-r from-indigo-500/80 to-purple-600/80 hover:from-indigo-500 hover:to-purple-600 text-white">
                    {aiBusy === "selected"
                      ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      : <Wand2 className="h-3.5 w-3.5 mr-1.5" />}
                    Enhance with AI
                  </Button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Export modal */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="bg-[#0e1322] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export template</DialogTitle>
            <DialogDescription className="text-white/60">
              Choose a format and quality. AI enhancements run before download.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-white/60">Format</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as typeof exportFormat)}>
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/60">Quality</Label>
                <Select value={exportQuality} onValueChange={(v) => setExportQuality(v as typeof exportQuality)}>
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (1×)</SelectItem>
                    <SelectItem value="hd">HD (2×)</SelectItem>
                    <SelectItem value="4k">4K (4×)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <div>
                <div className="text-sm">AI upscale</div>
                <div className="text-xs text-white/50">Improve perceived sharpness</div>
              </div>
              <Switch checked={aiUpscale} onCheckedChange={setAiUpscale} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <div>
                <div className="text-sm">AI cleanup</div>
                <div className="text-xs text-white/50">Remove visual artifacts</div>
              </div>
              <Switch checked={aiCleanup} onCheckedChange={setAiCleanup} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExportOpen(false)} className="text-white/70">Cancel</Button>
            <Button onClick={doExport} disabled={exporting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white">
              {exporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit confirmation */}
      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent className="bg-[#0e1322] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              You have unsaved edits on this template. Leaving will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate({ to: "/dashboard/creative/templates" })}
              className="bg-rose-500 hover:bg-rose-400 text-white">
              Discard & exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------- Subcomponents ----------
function ToolBtn({ icon: Icon, label, onClick }: { icon: typeof TypeIcon; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 text-xs px-2.5 py-2 rounded-md border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/10 hover:text-white transition-colors">
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function LayerIcon({ type }: { type: LayerInfo["type"] }) {
  const cls = "h-3.5 w-3.5 text-white/50";
  if (type === "text") return <TypeIcon className={cls} />;
  if (type === "circle") return <CircleIcon className={cls} />;
  if (type === "image") return <ImageIcon className={cls} />;
  return <Square className={cls} />;
}

function TextProps({ obj, update, commit }: { obj: FabricObject; update: (p: Record<string, unknown>) => void; commit: () => void }) {
  const o = obj as unknown as {
    text?: string; fontSize?: number; fontFamily?: string; fontWeight?: string | number;
    textAlign?: string;
  };
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-white/60">Text</Label>
        <Input value={o.text ?? ""} onChange={(e) => update({ text: e.target.value })}
          onBlur={commit}
          className="mt-1 bg-white/5 border-white/10 text-white" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-white/60">Font</Label>
          <Select value={o.fontFamily ?? "Inter"} onValueChange={(v) => { update({ fontFamily: v }); commit(); }}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-white/60">Size</Label>
          <Input type="number" value={Math.round(o.fontSize ?? 16)}
            onChange={(e) => update({ fontSize: Number(e.target.value) || 12 })}
            onBlur={commit}
            className="mt-1 bg-white/5 border-white/10 text-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-white/60">Weight</Label>
          <Select value={String(o.fontWeight ?? "400")} onValueChange={(v) => { update({ fontWeight: v }); commit(); }}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["300", "400", "500", "600", "700", "800"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-white/60">Align</Label>
          <Select value={o.textAlign ?? "left"} onValueChange={(v) => { update({ textAlign: v }); commit(); }}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["left", "center", "right"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function FillProps({ obj, update, commit }: { obj: FabricObject; update: (p: Record<string, unknown>) => void; commit: () => void }) {
  const fill = String((obj as unknown as { fill?: string }).fill ?? "#ffffff");
  return (
    <div>
      <Label className="text-xs text-white/60">Color</Label>
      <div className="mt-1 flex items-center gap-2">
        <input type="color" value={fill}
          onChange={(e) => update({ fill: e.target.value })}
          onBlur={commit}
          className="h-8 w-10 rounded border border-white/10 bg-transparent cursor-pointer" />
        <Input value={fill}
          onChange={(e) => update({ fill: e.target.value })}
          onBlur={commit}
          className="bg-white/5 border-white/10 text-white font-mono text-xs" />
      </div>
      <div className="mt-2 grid grid-cols-8 gap-1">
        {SWATCHES.map((s) => (
          <button key={s} onClick={() => { update({ fill: s }); commit(); }}
            style={{ background: s }}
            className="h-5 rounded border border-white/10 hover:scale-110 transition-transform" />
        ))}
      </div>
    </div>
  );
}

function OpacityProps({ obj, update, commit }: { obj: FabricObject; update: (p: Record<string, unknown>) => void; commit: () => void }) {
  const opacity = (obj as unknown as { opacity?: number }).opacity ?? 1;
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-white/60">Opacity</Label>
        <span className="text-xs text-white/50 tabular-nums">{Math.round(opacity * 100)}%</span>
      </div>
      <Slider value={[opacity * 100]} min={0} max={100} step={1}
        onValueChange={(v) => update({ opacity: (v[0] ?? 100) / 100 })}
        onValueCommit={commit}
        className="mt-2" />
    </div>
  );
}