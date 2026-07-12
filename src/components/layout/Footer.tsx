"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { categories, getAllTools } from "@/tools/registry";

export function Footer() {
  const { t, locale } = useLanguage();
  const tools = getAllTools();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-foreground)]">{cat.name[locale]}</h3>
            <ul className="space-y-2">
              {tools
                .filter((tool) => tool.category === cat.id)
                .map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={`/${locale === "ar" ? tool.slugAr : tool.slug}`}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                    >
                      {tool.name[locale]}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--color-border)] py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--color-muted)]">
          <p>
            &copy; {new Date().getFullYear()} {t.site.name} — {t.footer.rights}
          </p>
          <p className="flex items-center gap-1.5">
            {t.footer.madeWith} <Heart className="h-3.5 w-3.5 fill-current text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
