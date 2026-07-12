"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Textarea } from "@/components/ui/Textarea";
import { md5 } from "@/lib/md5";

const SUBTLE_ALGORITHMS = ["SHA-1", "SHA-256", "SHA-512"] as const;
const ALGORITHM_ORDER = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;

async function sha(algorithm: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function HashGenerator() {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function compute() {
      if (!input) {
        setHashes({});
        return;
      }
      const results: Record<string, string> = { MD5: md5(input) };
      for (const algo of SUBTLE_ALGORITHMS) {
        results[algo] = await sha(algo, input);
      }
      if (!cancelled) setHashes(results);
    }

    compute();
    return () => {
      cancelled = true;
    };
  }, [input]);

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder={t.toolLabels.inputText}
        dir="ltr"
      />
      <div className="flex flex-col gap-3">
        {ALGORITHM_ORDER.map((id) => (
          <div
            key={id}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
          >
            <span className="w-20 shrink-0 text-xs font-semibold text-[var(--color-muted)]">{id}</span>
            <code dir="ltr" className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--color-foreground)]">
              {hashes[id] ?? "—"}
            </code>
            <button
              type="button"
              disabled={!hashes[id]}
              onClick={() => copy(id, hashes[id])}
              className="shrink-0 rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
              aria-label={t.actions.copy}
            >
              {copiedKey === id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
