"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories, getToolsByCategory } from "@/tools/registry";
import { ToolCard } from "@/components/tools/ToolCard";

export default function Home() {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredByCategory = useMemo(() => {
    return categories.map((cat) => {
      const tools = getToolsByCategory(cat.id).filter((tool) => {
        if (!normalizedQuery) return true;
        return (
          tool.name.ar.toLowerCase().includes(normalizedQuery) ||
          tool.name.en.toLowerCase().includes(normalizedQuery) ||
          tool.shortDescription[locale].toLowerCase().includes(normalizedQuery)
        );
      });
      return { cat, tools };
    });
  }, [normalizedQuery, locale]);

  const hasResults = filteredByCategory.some((group) => group.tools.length > 0);

  return (
    <div className="flex flex-col flex-1">
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-b from-indigo-500/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-foreground)] animate-fade-in-up">
            {t.home.heroTitle}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[var(--color-muted)] max-w-2xl mx-auto animate-fade-in-up">
            {t.home.heroSubtitle}
          </p>

          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted)] start-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="w-full h-13 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] ps-12 pe-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-16 flex flex-col gap-14">
        {!hasResults && (
          <p className="text-center text-[var(--color-muted)] py-12">{t.home.noResults}</p>
        )}
        {filteredByCategory.map(
          ({ cat, tools }) =>
            tools.length > 0 && (
              <div key={cat.id} id={cat.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="h-8 w-1.5 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${cat.accentColorFrom}, ${cat.accentColorTo})` }}
                  />
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-foreground)]">{cat.name[locale]}</h2>
                    <p className="text-sm text-[var(--color-muted)]">{cat.description[locale]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            )
        )}
      </section>
    </div>
  );
}
