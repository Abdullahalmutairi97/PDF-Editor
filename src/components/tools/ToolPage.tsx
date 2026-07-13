"use client";

import type { ComponentType } from "react";
import * as Icons from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardBody } from "@/components/ui/Card";
import { getCategoryMeta } from "@/tools/registry";
import type { ToolDefinition } from "@/types/tools";

import { JsonFormatter } from "@/components/dev/JsonFormatter";
import { Base64Tool } from "@/components/dev/Base64Tool";
import { UuidGenerator } from "@/components/dev/UuidGenerator";
import { HashGenerator } from "@/components/dev/HashGenerator";
import { QrGenerator } from "@/components/qr/QrGenerator";
import { MergePdf } from "@/components/pdf/MergePdf";
import { SplitPdf } from "@/components/pdf/SplitPdf";
import { CompressPdf } from "@/components/pdf/CompressPdf";
import { RotatePdf } from "@/components/pdf/RotatePdf";
import { PdfToJpg } from "@/components/pdf/PdfToJpg";
import { OrganizePdf } from "@/components/pdf/OrganizePdf";
import { WatermarkPdf } from "@/components/pdf/WatermarkPdf";
import { CompressImage } from "@/components/image/CompressImage";
import { ImageToPdf } from "@/components/image/ImageToPdf";
import { ResizeImage } from "@/components/image/ResizeImage";

const TOOL_COMPONENTS: Record<string, ComponentType<{ tool: ToolDefinition }>> = {
  "json-formatter": JsonFormatter,
  base64: Base64Tool,
  "uuid-generator": UuidGenerator,
  "hash-generator": HashGenerator,
  "qr-generator": QrGenerator,
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "compress-pdf": CompressPdf,
  "rotate-pdf": RotatePdf,
  "pdf-to-jpg": PdfToJpg,
  "organize-pdf": OrganizePdf,
  "watermark-pdf": WatermarkPdf,
  "compress-image": CompressImage,
  "image-to-pdf": ImageToPdf,
  "resize-image": ResizeImage,
};

export function ToolPage({ tool }: { tool: ToolDefinition }) {
  const { locale, t } = useLanguage();
  const meta = getCategoryMeta(tool.category);
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.FileText;
  const ToolComponent = TOOL_COMPONENTS[tool.id];

  return (
    <div className="mx-auto flex w-full max-w-7xl items-start gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <Sidebar category={tool.category} activeToolId={tool.id} />
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${meta?.accentColorFrom ?? "#6366f1"}, ${meta?.accentColorTo ?? "#818cf8"})`,
            }}
          >
            <Icon className="h-5.5 w-5.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{tool.name[locale]}</h1>
            <p className="text-sm text-[var(--color-muted)]">{tool.shortDescription[locale]}</p>
          </div>
        </div>

        <Card>
          <CardBody>{ToolComponent ? <ToolComponent tool={tool} /> : null}</CardBody>
        </Card>

        <section className="mt-10">
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{tool.description[locale]}</p>
        </section>

        {tool.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-[var(--color-foreground)]">{t.faq.title}</h2>
            <div className="flex flex-col gap-3">
              {tool.faq.map((item, i) => (
                <Card key={i} className="p-4">
                  <h3 className="text-sm font-medium text-[var(--color-foreground)]">{item.question[locale]}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-muted)]">{item.answer[locale]}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
