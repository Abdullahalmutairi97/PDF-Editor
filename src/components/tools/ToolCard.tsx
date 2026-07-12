"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getCategoryMeta } from "@/tools/registry";
import type { ToolDefinition } from "@/types/tools";
import { Card } from "@/components/ui/Card";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const { locale } = useLanguage();
  const meta = getCategoryMeta(tool.category);
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.FileText;

  return (
    <Link href={`/${locale === "ar" ? tool.slugAr : tool.slug}`} className="group block h-full">
      <Card className="h-full p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-transparent">
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${meta?.accentColorFrom ?? "#6366f1"}, ${meta?.accentColorTo ?? "#818cf8"})`,
          }}
        >
          <Icon className="h-5.5 w-5.5" />
        </div>
        <h3 className="font-semibold text-[var(--color-foreground)] group-hover:text-indigo-500 transition-colors">
          {tool.name[locale]}
        </h3>
        <p className="mt-1.5 text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
          {tool.shortDescription[locale]}
        </p>
      </Card>
    </Link>
  );
}
