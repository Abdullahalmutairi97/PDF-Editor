"use client";

import { useRef, useState } from "react";
import { Check, Copy, Upload } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function Base64Tool() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const run = () => {
    try {
      setOutput(mode === "encode" ? toBase64(input) : fromBase64(input.trim()));
      setError(null);
    } catch {
      setError(t.errors.invalidInput);
      setOutput("");
    }
  };

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      setMode("encode");
      setInput(file.name);
      setOutput(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="inline-flex self-start rounded-xl border border-[var(--color-border)] p-1">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
            mode === "encode" ? "bg-indigo-500 text-white" : "text-[var(--color-muted)]"
          )}
        >
          {t.toolLabels.encode}
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
            mode === "decode" ? "bg-indigo-500 text-white" : "text-[var(--color-muted)]"
          )}
        >
          {t.toolLabels.decode}
        </button>
      </div>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder={t.toolLabels.inputText}
        dir="ltr"
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={run} disabled={!input}>
          {t.actions.submit}
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" /> {t.upload.browse}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setInput("");
            setOutput("");
            setError(null);
          }}
        >
          {t.actions.clear}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) loadFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {output && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {t.toolLabels.outputText}
            </span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:underline"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t.actions.copied : t.actions.copy}
            </button>
          </div>
          <Textarea value={output} readOnly rows={6} dir="ltr" className="font-mono text-sm" />
        </div>
      )}
    </div>
  );
}
