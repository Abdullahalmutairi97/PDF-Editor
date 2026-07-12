"use client";

import Link from "next/link";
import { useState } from "react";
import { Languages, Menu, Moon, Sun, Wrench, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useTheme } from "@/components/ThemeProvider";
import { categories } from "@/tools/registry";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { t, locale, toggleLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-background)]/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">{t.site.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/#${cat.id}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-foreground)]/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-foreground)] transition-colors"
            >
              {cat.name[locale]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLocale}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label={t.nav.language}
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.language}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden !px-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-[var(--color-border)] px-4 py-2 flex flex-col">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/#${cat.id}`}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            >
              {cat.name[locale]}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
