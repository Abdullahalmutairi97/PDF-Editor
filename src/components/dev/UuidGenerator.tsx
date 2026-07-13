"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { generateUUID } from "@/lib/uuid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

function uuidV4(): string {
  return generateUUID();
}

function uuidV7(): string {
  const timestamp = BigInt(Date.now());
  const timeHex = timestamp.toString(16).padStart(12, "0");
  const randomBytes = crypto.getRandomValues(new Uint8Array(10));
  const randomHex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");

  const raw =
    timeHex +
    "7" +
    randomHex.slice(0, 3) +
    ((parseInt(randomHex.slice(3, 4), 16) & 0x3) | 0x8).toString(16) +
    randomHex.slice(4);

  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20, 32)}`;
}

export function UuidGenerator() {
  const { t } = useLanguage();
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const generator = version === "v4" ? uuidV4 : uuidV7;
    const total = Math.min(Math.max(count, 1), 100);
    setResults(Array.from({ length: total }, generator));
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(results.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-4">
        <Select
          label={t.toolLabels.version}
          value={version}
          onChange={(e) => setVersion(e.target.value as "v4" | "v7")}
          options={[
            { value: "v4", label: "UUID v4" },
            { value: "v7", label: "UUID v7" },
          ]}
          className="w-40"
        />
        <Input
          label={t.toolLabels.count}
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-28"
        />
      </div>

      <Button onClick={generate} className="self-start">
        {t.actions.generate}
      </Button>

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {results.length}
            </span>
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:underline"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {t.toolLabels.copyAll}
            </button>
          </div>
          <Textarea
            value={results.join("\n")}
            readOnly
            rows={Math.min(results.length + 1, 14)}
            dir="ltr"
            className="font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
