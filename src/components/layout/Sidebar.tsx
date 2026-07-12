"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getCategoryMeta, getToolsByCategory } from "@/tools/registry";
import type { ToolCategory } from "@/types/tools";
import { cn } from "@/lib/cn";
import * as Icons from "lucide-react";

export function Sidebar({ category, activeToolId }: { category: ToolCategory; activeToolId: string }) {
  const { locale, t } = useLanguage();
  const meta = getCategoryMeta(category);
  const tools = getToolsByCategory(category);

  if (!meta) return null;

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24">
        <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-2">
          {meta.name[locale]}
        </h2>
        <nav className="flex flex-col gap-0.5">
          {tools.map((tool) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.FileText;
            const active = tool.id === activeToolId;
            return (
              <Link
                key={tool.id}
                href={`/${locale === "ar" ? tool.slugAr : tool.slug}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-medium"
                    : "text-[var(--color-foreground)]/80 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tool.name[locale]}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          href="/"
          className="mt-4 inline-block px-3 text-sm text-indigo-500 hover:underline"
        >
          {t.nav.allTools}
        </Link>
      </div>
    </aside>
  );
}
