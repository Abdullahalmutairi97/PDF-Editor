"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, RotateCw, Trash2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { generateUUID } from "@/lib/uuid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

export type PageRotation = 0 | 90 | 180 | 270;

export interface PdfPreviewItem {
  id: string;
  /** 1-based original page number; 0 marks an inserted blank page. */
  pageNum: number;
  rotation: PageRotation;
}

export function createBlankItem(): PdfPreviewItem {
  return { id: generateUUID(), pageNum: 0, rotation: 0 };
}

export function createInitialItems(pageCount: number): PdfPreviewItem[] {
  return Array.from({ length: pageCount }, (_, i) => ({
    id: generateUUID(),
    pageNum: i + 1,
    rotation: 0 as PageRotation,
  }));
}

export interface PdfPagePreviewProps {
  fileId: string;
  items: PdfPreviewItem[];
  onItemsChange: (items: PdfPreviewItem[]) => void;
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
  enableReorder?: boolean;
  enableRotate?: boolean;
  enableDelete?: boolean;
  enableSelection?: boolean;
  className?: string;
}

interface PreviewApiResponse {
  success: boolean;
  pageCount?: number;
  pages?: { pageNum: number; thumbUrl: string }[];
  error?: string;
}

export function PdfPagePreview({
  fileId,
  items,
  onItemsChange,
  selectedIds,
  onSelectedIdsChange,
  enableReorder = true,
  enableRotate = true,
  enableDelete = true,
  enableSelection = true,
  className,
}: PdfPagePreviewProps) {
  const { t } = useLanguage();
  const [thumbs, setThumbs] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    let cancelled = false;

    // Clear stale state when fileId changes
    setThumbs(new Map());
    setLoadError(null);
    setLoading(true);

    fetch("/api/pdf/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const text = await res.text();
        try {
          return JSON.parse(text) as PreviewApiResponse;
        } catch {
          throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
        }
      })
      .then((data: PreviewApiResponse) => {
        if (cancelled) return;
        if (!data.success || !data.pages) {
          setLoadError(data.error ?? "Preview API returned error");
          return;
        }
        const map = new Map<number, string>();
        for (const p of data.pages) map.set(p.pageNum, p.thumbUrl);
        setThumbs(map);
        if (data.pageCount) {
          onItemsChange(createInitialItems(data.pageCount));
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(`Failed to load preview: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedIdsChange(next);
  };

  const selectByPosition = (pred: (position: number) => boolean) => {
    onSelectedIdsChange(new Set(items.filter((_, idx) => pred(idx + 1)).map((it) => it.id)));
  };

  const applyRange = () => {
    const positions = new Set<number>();
    for (const part of rangeInput.split(",").map((s) => s.trim()).filter(Boolean)) {
      const [aStr, bStr] = part.split("-").map((s) => s.trim());
      const a = parseInt(aStr, 10);
      const b = bStr ? parseInt(bStr, 10) : a;
      if (Number.isNaN(a) || Number.isNaN(b)) continue;
      for (let n = Math.min(a, b); n <= Math.max(a, b); n++) positions.add(n);
    }
    selectByPosition((pos) => positions.has(pos));
  };

  const rotateItem = (id: string) => {
    onItemsChange(
      items.map((it) => (it.id === id ? { ...it, rotation: (((it.rotation + 90) % 360) as PageRotation) } : it))
    );
  };

  const deleteItem = (id: string) => {
    onItemsChange(items.filter((it) => it.id !== id));
    if (selectedIds.has(id)) {
      const next = new Set(selectedIds);
      next.delete(id);
      onSelectedIdsChange(next);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onItemsChange(arrayMove(items, oldIndex, newIndex));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Spinner className="h-8 w-8 text-indigo-500" />
        <p className="text-sm text-[var(--color-muted)]">{t.pdf.preview.loading}</p>
      </div>
    );
  }

  if (loadError) {
    return <p className="py-8 text-center text-sm text-red-500">{loadError}</p>;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {enableSelection && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onSelectedIdsChange(new Set(items.map((it) => it.id)))}>
            {t.pdf.preview.selectAll}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onSelectedIdsChange(new Set())}>
            {t.pdf.preview.selectNone}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => selectByPosition((pos) => pos % 2 === 1)}>
            {t.pdf.preview.selectOdd}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => selectByPosition((pos) => pos % 2 === 0)}>
            {t.pdf.preview.selectEven}
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder={t.pdf.preview.rangePlaceholder}
              dir="ltr"
              className="h-9 w-32"
            />
            <Button type="button" variant="outline" size="sm" onClick={applyRange}>
              {t.pdf.preview.selectRange}
            </Button>
          </div>
          <span className="ms-auto text-xs text-[var(--color-muted)]">
            {selectedIds.size} {t.pdf.preview.selected}
          </span>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((it) => it.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((item, index) => (
              <PreviewCard
                key={item.id}
                item={item}
                index={index}
                thumbUrl={thumbs.get(item.pageNum)}
                selected={selectedIds.has(item.id)}
                onToggle={() => toggle(item.id)}
                onRotate={() => rotateItem(item.id)}
                onDelete={() => deleteItem(item.id)}
                enableReorder={enableReorder}
                enableRotate={enableRotate}
                enableDelete={enableDelete}
                enableSelection={enableSelection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface PreviewCardProps {
  item: PdfPreviewItem;
  index: number;
  thumbUrl: string | undefined;
  selected: boolean;
  onToggle: () => void;
  onRotate: () => void;
  onDelete: () => void;
  enableReorder: boolean;
  enableRotate: boolean;
  enableDelete: boolean;
  enableSelection: boolean;
}

function PreviewCard({
  item,
  index,
  thumbUrl,
  selected,
  onToggle,
  onRotate,
  onDelete,
  enableReorder,
  enableRotate,
  enableDelete,
  enableSelection,
}: PreviewCardProps) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !enableReorder,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2",
        isDragging && "z-10 opacity-50"
      )}
    >
      <div className="absolute top-3 start-3 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
        {index + 1}
      </div>

      {enableSelection && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={t.pdf.preview.selected}
          className="absolute top-3 end-3 z-10"
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md border-2 shadow-sm",
              selected ? "border-indigo-500 bg-indigo-500" : "border-white bg-white/80"
            )}
          >
            {selected && <Check className="h-3.5 w-3.5 text-white" />}
          </span>
        </button>
      )}

      <div
        {...(enableReorder ? { ...attributes, ...listeners } : {})}
        className={cn(
          "flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-black/[0.03] dark:bg-white/[0.03]",
          enableReorder && "cursor-grab active:cursor-grabbing"
        )}
      >
        {item.pageNum === 0 ? (
          <span className="text-xs text-[var(--color-muted)]">{t.pdf.preview.blankPage}</span>
        ) : thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic per-page thumbnail from an internal API route
          <img
            src={thumbUrl}
            alt={`${t.pdf.preview.page} ${index + 1}`}
            style={{ transform: `rotate(${item.rotation}deg)` }}
            className="max-h-full max-w-full object-contain transition-transform duration-150"
            draggable={false}
          />
        ) : (
          <Spinner className="h-5 w-5 text-indigo-500" />
        )}
      </div>

      {(enableRotate || enableDelete) && (
        <div className="mt-1.5 flex items-center justify-center gap-1">
          {enableRotate && (
            <button
              type="button"
              onClick={onRotate}
              aria-label={t.pdf.preview.rotate}
              className="rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-black/5 hover:text-indigo-500 dark:hover:bg-white/5"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          )}
          {enableDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={t.pdf.preview.delete}
              className="rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-black/5 hover:text-red-500 dark:hover:bg-white/5"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
