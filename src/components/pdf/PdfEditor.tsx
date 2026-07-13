"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import {
  MousePointer2,
  Type,
  PenTool,
  Highlighter,
  Square,
  Minus,
  ArrowUpRight,
  Signature as SignatureIcon,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationDict } from "@/i18n/translations";
import { uploadFiles, useProcessOnly } from "@/lib/useFileProcessor";
import { FileUpload } from "@/components/tools/FileUpload";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadResult } from "@/components/tools/DownloadResult";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { Annotation } from "@/lib/processing/edit";
import type { ToolDefinition } from "@/types/tools";

type ToolId = "select" | "text" | "pen" | "highlight" | "rectangle" | "line" | "arrow" | "signature" | "eraser";

const DRAWING_TOOLS: ToolId[] = ["text", "pen", "highlight", "rectangle", "line", "arrow"];

const TOOL_ICONS: { id: ToolId; Icon: typeof MousePointer2 }[] = [
  { id: "select", Icon: MousePointer2 },
  { id: "text", Icon: Type },
  { id: "pen", Icon: PenTool },
  { id: "highlight", Icon: Highlighter },
  { id: "rectangle", Icon: Square },
  { id: "line", Icon: Minus },
  { id: "arrow", Icon: ArrowUpRight },
  { id: "signature", Icon: SignatureIcon },
  { id: "eraser", Icon: Eraser },
];

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

interface DragState {
  kind: "move" | "pen" | "rect" | "line";
  id?: string;
  startX?: number;
  startY?: number;
  origX?: number;
  origY?: number;
}

function pct(value: number, dimension: number): number {
  return (value / 100) * dimension;
}

function formatTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

function boundingBox(ann: Annotation): { x: number; y: number; width: number; height: number } {
  if ((ann.type === "pen" || ann.type === "line" || ann.type === "arrow") && ann.points && ann.points.length > 0) {
    const xs = ann.points.map((p) => p.x);
    const ys = ann.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: Math.max(0.5, maxX - minX), height: Math.max(0.5, maxY - minY) };
  }
  if (ann.type === "text") {
    return { x: ann.x, y: ann.y, width: Math.max(ann.width, 10), height: Math.max(ann.height, 5) };
  }
  return { x: ann.x, y: ann.y, width: ann.width, height: ann.height };
}

function renderVisual(ann: Annotation, dims: { width: number; height: number }) {
  const x = pct(ann.x, dims.width);
  const y = pct(ann.y, dims.height);
  const w = pct(ann.width, dims.width);
  const h = pct(ann.height, dims.height);
  const opacity = ann.opacity;
  const color = ann.color;

  switch (ann.type) {
    case "text": {
      const fontSize = ann.fontSize ?? 18;
      const lines = (ann.text ?? "").split("\n");
      return (
        <text x={x} y={y + fontSize * 0.85} fontSize={fontSize} fill={color} opacity={opacity} fontFamily="'Noto Sans Arabic', Arial, sans-serif">
          {lines.map((line, i) => (
            <tspan key={i} x={x} dy={i === 0 ? 0 : fontSize * 1.2}>
              {line}
            </tspan>
          ))}
        </text>
      );
    }
    case "pen": {
      const points = (ann.points ?? [])
        .map((p) => `${pct(p.x, dims.width).toFixed(2)},${pct(p.y, dims.height).toFixed(2)}`)
        .join(" ");
      return (
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={ann.strokeWidth ?? 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={opacity}
        />
      );
    }
    case "highlight":
      return <rect x={x} y={y} width={w} height={h} fill={color} opacity={opacity} />;
    case "rectangle":
      return <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth={ann.strokeWidth ?? 2} opacity={opacity} />;
    case "line":
    case "arrow": {
      const points =
        ann.points && ann.points.length >= 2
          ? ann.points
          : [
              { x: ann.x, y: ann.y },
              { x: ann.x + ann.width, y: ann.y + ann.height },
            ];
      const [p1, p2] = points;
      const x1 = pct(p1.x, dims.width);
      const y1 = pct(p1.y, dims.height);
      const x2 = pct(p2.x, dims.width);
      const y2 = pct(p2.y, dims.height);
      const strokeW = ann.strokeWidth ?? 2;
      return (
        <g opacity={opacity}>
          {ann.type === "arrow" && (
            <marker id={`arrow-${ann.id}`} markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill={color} />
            </marker>
          )}
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            markerEnd={ann.type === "arrow" ? `url(#arrow-${ann.id})` : undefined}
          />
        </g>
      );
    }
    case "signature":
      return ann.dataUrl ? <image href={ann.dataUrl} x={x} y={y} width={w} height={h} opacity={opacity} preserveAspectRatio="none" /> : null;
    default:
      return null;
  }
}

function SignatureModal({
  labels,
  onDone,
  onCancel,
}: {
  labels: TranslationDict["pdf"]["editor"]["signature"];
  onDone: (dataUrl: string, aspect: number) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#111827");
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    lastPointRef.current = getPos(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const p = getPos(e);
    const last = lastPointRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (last) ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
    setHasDrawn(true);
  };

  const end = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const done = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onDone(canvas.toDataURL("image/png"), canvas.width / canvas.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-base font-semibold text-[var(--color-foreground)]">{labels.title}</h3>
        <p className="mb-2 text-xs text-[var(--color-muted)]">{labels.drawHere}</p>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full touch-none rounded-xl border border-[var(--color-border)] bg-white"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={clear}>
              {labels.clear}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              {labels.cancel}
            </Button>
            <Button type="button" size="sm" onClick={done} disabled={!hasDrawn}>
              {labels.done}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PdfEditor({ tool }: { tool: ToolDefinition }) {
  const { t } = useLanguage();

  const [files, setFiles] = useState<File[]>([]);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nativeSize, setNativeSize] = useState({ width: 600, height: 800 });
  const [displaySize, setDisplaySize] = useState({ width: 600, height: 800 });
  const [zoom, setZoom] = useState<number | "fit">(1);
  const [effectiveScale, setEffectiveScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId>("select");
  const [draftAnnotation, setDraftAnnotation] = useState<Annotation | null>(null);

  const [color, setColor] = useState("#ef4444");
  const [opacity, setOpacity] = useState(100);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(18);

  const [pendingText, setPendingText] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [pendingSignaturePos, setPendingSignaturePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const renderTaskRef = useRef<ReturnType<PDFPageProxy["render"]> | null>(null);
  const pdfjsLibRef = useRef<typeof import("pdfjs-dist") | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const { stage, error, resultFiles, run, reset } = useProcessOnly(tool.id);

  const ensurePdfjs = async () => {
    if (!pdfjsLibRef.current) {
      const lib = await import("pdfjs-dist");
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      pdfjsLibRef.current = lib;
    }
    return pdfjsLibRef.current;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;

    (async () => {
      const page = await pdfDoc.getPage(currentPage);
      if (cancelled) return;
      const unscaled = page.getViewport({ scale: 1 });
      setNativeSize({ width: unscaled.width, height: unscaled.height });

      const scale = zoom === "fit" ? Math.max(0.1, (containerWidth - 48) / unscaled.width) : zoom;
      setEffectiveScale(scale);

      const viewport = page.getViewport({ scale });
      setDisplaySize({ width: viewport.width, height: viewport.height });

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderTaskRef.current?.cancel();
      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch (err) {
        if (!(err instanceof Error) || err.name !== "RenderingCancelledException") {
          throw err;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage, zoom, containerWidth]);

  const handleFilesChange = async (next: File[]) => {
    setFiles(next);
    if (next.length !== 1) return;
    setUploading(true);
    setUploadError(null);
    try {
      const [id] = await uploadFiles(next);
      const arrayBuffer = await next[0].arrayBuffer();
      const pdfjsLib = await ensurePdfjs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setFileId(id);
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setAnnotations([]);
      setUndoStack([]);
      setRedoStack([]);
      setSelectedId(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    reset();
    setFiles([]);
    setFileId(null);
    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(1);
    setAnnotations([]);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedId(null);
    setActiveTool("select");
  };

  const handleSave = () => {
    if (!fileId || annotations.length === 0) return;
    run([fileId], { annotations });
  };

  const commit = (next: Annotation[]) => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations(next);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, annotations]);
    setAnnotations(last);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations(last);
  };

  const deleteAnnotation = (id: string) => {
    commit(annotations.filter((a) => a.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteAnnotation(selectedId);
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setPendingText(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const beginUndoGroup = () => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
  };

  const handleClearAll = () => {
    if (annotations.length === 0) return;
    commit([]);
    setSelectedId(null);
  };

  const updateSelected = (patch: Partial<Annotation>) => {
    if (!selectedId) return;
    setAnnotations((prev) => prev.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)));
  };

  const handleToolClick = (id: ToolId) => {
    setActiveTool(id);
    setSelectedId(null);
    if (id === "signature") {
      setPendingSignaturePos(null);
      setSignatureModalOpen(true);
    }
  };

  const zoomIn = () => {
    setZoom((z) => {
      const cur = z === "fit" ? effectiveScale : z;
      return ZOOM_STEPS.find((s) => s > cur + 0.001) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1];
    });
  };

  const zoomOut = () => {
    setZoom((z) => {
      const cur = z === "fit" ? effectiveScale : z;
      const reversed = [...ZOOM_STEPS].reverse();
      return reversed.find((s) => s < cur - 0.001) ?? ZOOM_STEPS[0];
    });
  };

  const goPrev = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
    setSelectedId(null);
  };

  const goNext = () => {
    setCurrentPage((p) => Math.min(numPages, p + 1));
    setSelectedId(null);
  };

  const toPercent = (clientX: number, clientY: number) => {
    const el = overlayRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  };

  const confirmText = () => {
    if (!pendingText || !textInputValue.trim()) {
      setPendingText(null);
      return;
    }
    const heightPercent = nativeSize.height > 0 ? ((fontSize * 1.4) / nativeSize.height) * 100 : 5;
    commit([
      ...annotations,
      {
        id: crypto.randomUUID(),
        type: "text",
        page: currentPage,
        x: pendingText.x,
        y: pendingText.y,
        width: 30,
        height: heightPercent,
        color,
        opacity: opacity / 100,
        fontSize,
        text: textInputValue,
      },
    ]);
    setPendingText(null);
    setTextInputValue("");
  };

  const handleSignatureDone = (dataUrl: string, aspect: number) => {
    const widthPercent = 30;
    const heightPercent =
      nativeSize.height > 0 ? (widthPercent * nativeSize.width) / (aspect * nativeSize.height) : widthPercent / aspect;
    const centerX = pendingSignaturePos?.x ?? 50;
    const centerY = pendingSignaturePos?.y ?? 50;
    const x = Math.min(Math.max(0, centerX - widthPercent / 2), Math.max(0, 100 - widthPercent));
    const y = Math.min(Math.max(0, centerY - heightPercent / 2), Math.max(0, 100 - heightPercent));
    commit([
      ...annotations,
      {
        id: crypto.randomUUID(),
        type: "signature",
        page: currentPage,
        x,
        y,
        width: widthPercent,
        height: heightPercent,
        color: "#000000",
        opacity: 1,
        dataUrl,
      },
    ]);
    setSignatureModalOpen(false);
    setPendingSignaturePos(null);
    setActiveTool("select");
  };

  const handleShapePointerDown = (e: React.PointerEvent<SVGRectElement>, ann: Annotation) => {
    if (activeTool === "eraser") {
      e.stopPropagation();
      deleteAnnotation(ann.id);
      return;
    }
    if (activeTool !== "select") return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(ann.id);
    const p = toPercent(e.clientX, e.clientY);
    beginUndoGroup();
    dragRef.current = { kind: "move", id: ann.id, startX: p.x, startY: p.y, origX: ann.x, origY: ann.y };
  };

  const handleBackgroundPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.target !== e.currentTarget) return;
    const p = toPercent(e.clientX, e.clientY);

    if (activeTool === "select") {
      setSelectedId(null);
      return;
    }
    if (activeTool === "eraser") return;
    if (activeTool === "text") {
      setPendingText(p);
      setTextInputValue("");
      return;
    }
    if (activeTool === "signature") {
      setPendingSignaturePos(p);
      setSignatureModalOpen(true);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    if (activeTool === "pen") {
      dragRef.current = { kind: "pen" };
      setDraftAnnotation({
        id: "draft",
        type: "pen",
        page: currentPage,
        x: p.x,
        y: p.y,
        width: 0,
        height: 0,
        color,
        opacity: opacity / 100,
        strokeWidth,
        points: [p],
      });
    } else if (activeTool === "highlight" || activeTool === "rectangle") {
      dragRef.current = { kind: "rect", startX: p.x, startY: p.y };
      setDraftAnnotation({
        id: "draft",
        type: activeTool,
        page: currentPage,
        x: p.x,
        y: p.y,
        width: 0,
        height: 0,
        color,
        opacity: opacity / 100,
        strokeWidth,
      });
    } else if (activeTool === "line" || activeTool === "arrow") {
      dragRef.current = { kind: "line", startX: p.x, startY: p.y };
      setDraftAnnotation({
        id: "draft",
        type: activeTool,
        page: currentPage,
        x: p.x,
        y: p.y,
        width: 0,
        height: 0,
        color,
        opacity: opacity / 100,
        strokeWidth,
        points: [p, p],
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toPercent(e.clientX, e.clientY);

    if (drag.kind === "move" && drag.id) {
      const dx = p.x - (drag.startX ?? 0);
      const dy = p.y - (drag.startY ?? 0);
      setAnnotations((prev) =>
        prev.map((a) => (a.id === drag.id ? { ...a, x: (drag.origX ?? 0) + dx, y: (drag.origY ?? 0) + dy } : a))
      );
    } else if (drag.kind === "pen") {
      setDraftAnnotation((prev) => (prev ? { ...prev, points: [...(prev.points ?? []), p] } : prev));
    } else if (drag.kind === "rect") {
      const x = Math.min(drag.startX ?? 0, p.x);
      const y = Math.min(drag.startY ?? 0, p.y);
      const width = Math.abs(p.x - (drag.startX ?? 0));
      const height = Math.abs(p.y - (drag.startY ?? 0));
      setDraftAnnotation((prev) => (prev ? { ...prev, x, y, width, height } : prev));
    } else if (drag.kind === "line") {
      setDraftAnnotation((prev) =>
        prev ? { ...prev, points: [{ x: drag.startX ?? 0, y: drag.startY ?? 0 }, p] } : prev
      );
    }
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.kind === "move") return;

    const draft = draftAnnotation;
    setDraftAnnotation(null);
    if (!draft) return;

    if (draft.type === "pen") {
      if ((draft.points?.length ?? 0) < 2) return;
      const bbox = boundingBox(draft);
      commit([...annotations, { ...draft, id: crypto.randomUUID(), ...bbox }]);
    } else if (draft.type === "highlight" || draft.type === "rectangle") {
      if (draft.width < 1 || draft.height < 1) return;
      commit([...annotations, { ...draft, id: crypto.randomUUID() }]);
    } else if (draft.type === "line" || draft.type === "arrow") {
      const [p1, p2] = draft.points ?? [];
      if (!p1 || !p2) return;
      if (Math.hypot(p2.x - p1.x, p2.y - p1.y) < 1) return;
      const bbox = boundingBox(draft);
      commit([...annotations, { ...draft, id: crypto.randomUUID(), ...bbox }]);
    }
  };

  if (stage === "processing") return <ProcessingStatus stage="processing" />;
  if (stage === "error") return <ProcessingStatus stage="error" errorMessage={error ?? undefined} onRetry={handleSave} />;
  if (stage === "done") return <DownloadResult files={resultFiles} onReset={handleReset} />;

  if (!fileId || !pdfDoc) {
    return (
      <div className="flex flex-col gap-6">
        <FileUpload
          accept={tool.acceptedMimeTypes}
          multiple={false}
          files={files}
          onFilesChange={handleFilesChange}
          uploading={uploading}
        />
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Spinner className="h-4 w-4" /> {t.processing.uploading}
          </div>
        )}
      </div>
    );
  }

  const pageAnnotations = annotations.filter((a) => a.page === currentPage);
  const selectedAnnotation = annotations.find((a) => a.id === selectedId) ?? null;
  const targetType = selectedAnnotation ? selectedAnnotation.type : activeTool;
  const showPanel = selectedAnnotation !== null || DRAWING_TOOLS.includes(activeTool);
  const showColor = showPanel && targetType !== "signature";
  const showStroke = targetType === "pen" || targetType === "rectangle" || targetType === "line" || targetType === "arrow";
  const showFontSize = targetType === "text";
  const overlayCursor =
    activeTool === "select" ? "default" : activeTool === "eraser" ? "pointer" : activeTool === "signature" ? "pointer" : "crosshair";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        <div className="flex items-center gap-1">
          {TOOL_ICONS.map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleToolClick(id)}
              title={t.pdf.editor.toolbar[id]}
              aria-label={t.pdf.editor.toolbar[id]}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                activeTool === id
                  ? "bg-indigo-500 text-white"
                  : "text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </button>
          ))}
        </div>

        <div className="mx-1 h-6 w-px bg-[var(--color-border)]" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
            title={t.pdf.editor.actions.undo}
            aria-label={t.pdf.editor.actions.undo}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5"
          >
            <Undo2 className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
            title={t.pdf.editor.actions.redo}
            aria-label={t.pdf.editor.actions.redo}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5"
          >
            <Redo2 className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={annotations.length === 0}
            title={t.pdf.editor.actions.clear}
            aria-label={t.pdf.editor.actions.clear}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-black/5 hover:text-red-500 disabled:opacity-30 dark:hover:bg-white/5"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-[var(--color-border)]" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            title={t.pdf.editor.actions.zoom}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ZoomOut className="h-4.5 w-4.5" />
          </button>
          <Select
            value={zoom === "fit" ? "fit" : String(zoom)}
            onChange={(e) => setZoom(e.target.value === "fit" ? "fit" : Number(e.target.value))}
            options={[
              { value: "0.25", label: "25%" },
              { value: "0.5", label: "50%" },
              { value: "0.75", label: "75%" },
              { value: "1", label: "100%" },
              { value: "1.25", label: "125%" },
              { value: "1.5", label: "150%" },
              { value: "2", label: "200%" },
              { value: "fit", label: t.pdf.editor.actions.fitToWidth },
            ]}
            className="h-9 w-28"
          />
          <button
            type="button"
            onClick={zoomIn}
            title={t.pdf.editor.actions.zoom}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ZoomIn className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={goPrev} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="whitespace-nowrap text-xs text-[var(--color-muted)]">
            {formatTemplate(t.pdf.editor.actions.pageOf, { current: currentPage, total: numPages })}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={goNext} disabled={currentPage >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button type="button" size="sm" onClick={handleSave} disabled={annotations.length === 0}>
          <Save className="h-4 w-4" />
          {t.pdf.editor.actions.save}
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative flex max-h-[75vh] items-start justify-center overflow-auto rounded-xl bg-black/[0.04] p-6 dark:bg-white/[0.02]"
      >
        <div
          className="relative shrink-0 bg-white shadow-lg"
          style={{ width: displaySize.width, height: displaySize.height }}
        >
          <canvas ref={canvasRef} className="block" />
          <svg
            ref={overlayRef}
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${nativeSize.width} ${nativeSize.height}`}
            preserveAspectRatio="none"
            style={{ cursor: overlayCursor }}
            onPointerDown={handleBackgroundPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {pageAnnotations.map((ann) => {
              const bbox = boundingBox(ann);
              const interactive = activeTool === "select" || activeTool === "eraser";
              return (
                <g key={ann.id}>
                  <g style={{ pointerEvents: "none" }}>{renderVisual(ann, nativeSize)}</g>
                  <rect
                    x={pct(bbox.x, nativeSize.width)}
                    y={pct(bbox.y, nativeSize.height)}
                    width={Math.max(pct(bbox.width, nativeSize.width), 4)}
                    height={Math.max(pct(bbox.height, nativeSize.height), 4)}
                    fill="transparent"
                    stroke={selectedId === ann.id ? "#6366f1" : "none"}
                    strokeDasharray="4 3"
                    strokeWidth={selectedId === ann.id ? 1.5 : 0}
                    vectorEffect="non-scaling-stroke"
                    style={{
                      cursor: activeTool === "select" ? "move" : activeTool === "eraser" ? "pointer" : "default",
                      pointerEvents: interactive ? "all" : "none",
                    }}
                    onPointerDown={(e) => handleShapePointerDown(e, ann)}
                  />
                </g>
              );
            })}
            {draftAnnotation && <g style={{ pointerEvents: "none" }}>{renderVisual(draftAnnotation, nativeSize)}</g>}
          </svg>

          {pendingText && (
            <div
              className="absolute z-20 flex w-64 flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg"
              style={{ left: `${pendingText.x}%`, top: `${pendingText.y}%` }}
            >
              <Textarea
                autoFocus
                rows={2}
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                placeholder={t.pdf.editor.textInput.placeholder}
                className="text-sm"
                dir="auto"
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[var(--color-border)]"
                />
                <Slider
                  min={8}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Button type="button" size="sm" variant="outline" onClick={() => setPendingText(null)}>
                  {t.pdf.editor.textInput.cancel}
                </Button>
                <Button type="button" size="sm" onClick={confirmText}>
                  {t.pdf.editor.textInput.add}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPanel && (
        <div className="flex flex-wrap items-center gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="text-xs font-semibold text-[var(--color-muted)]">
            {selectedAnnotation ? t.pdf.editor.properties.title : t.pdf.editor.toolbar[activeTool]}
          </span>

          {showColor && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--color-muted)]">{t.pdf.editor.properties.color}</label>
              <input
                type="color"
                value={selectedAnnotation ? selectedAnnotation.color : color}
                onChange={(e) =>
                  selectedAnnotation ? updateSelected({ color: e.target.value }) : setColor(e.target.value)
                }
                className="h-9 w-12 cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              />
            </div>
          )}

          <Slider
            label={t.pdf.editor.properties.opacity}
            valueLabel={`${Math.round((selectedAnnotation ? selectedAnnotation.opacity : opacity / 100) * 100)}%`}
            min={0}
            max={100}
            value={selectedAnnotation ? Math.round(selectedAnnotation.opacity * 100) : opacity}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (selectedAnnotation) updateSelected({ opacity: v / 100 });
              else setOpacity(v);
            }}
            className="w-40"
          />

          {showStroke && (
            <Slider
              label={t.pdf.editor.properties.strokeWidth}
              valueLabel={String(selectedAnnotation ? selectedAnnotation.strokeWidth ?? 2 : strokeWidth)}
              min={1}
              max={20}
              value={selectedAnnotation ? selectedAnnotation.strokeWidth ?? 2 : strokeWidth}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (selectedAnnotation) updateSelected({ strokeWidth: v });
                else setStrokeWidth(v);
              }}
              className="w-40"
            />
          )}

          {showFontSize && (
            <Slider
              label={t.pdf.editor.properties.fontSize}
              valueLabel={String(selectedAnnotation ? selectedAnnotation.fontSize ?? 18 : fontSize)}
              min={8}
              max={72}
              value={selectedAnnotation ? selectedAnnotation.fontSize ?? 18 : fontSize}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (selectedAnnotation) updateSelected({ fontSize: v });
                else setFontSize(v);
              }}
              className="w-40"
            />
          )}

          {selectedAnnotation && (
            <Button type="button" variant="danger" size="sm" onClick={() => deleteAnnotation(selectedAnnotation.id)}>
              <Trash2 className="h-4 w-4" />
              {t.pdf.editor.properties.delete}
            </Button>
          )}
        </div>
      )}

      {signatureModalOpen && (
        <SignatureModal
          labels={t.pdf.editor.signature}
          onDone={handleSignatureDone}
          onCancel={() => {
            setSignatureModalOpen(false);
            setActiveTool("select");
          }}
        />
      )}
    </div>
  );
}
