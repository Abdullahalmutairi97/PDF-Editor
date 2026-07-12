"use client";

import { useState } from "react";
import { Braces, Check, Copy, Minimize2, Trash2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function JsonFormatter() {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(false);
  const [copied, setCopied] = useState(false);

  const format = (indent: number | null) => {
    try {
      const parsed = JSON.parse(input);
      setInput(indent === null ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent));
      setError(null);
      setValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.invalidInput);
      setValid(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => {
    setInput("");
    setError(null);
    setValid(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setValid(false);
          setError(null);
        }}
        rows={14}
        placeholder='{ "key": "value" }'
        className="font-mono text-sm"
        dir="ltr"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {valid && !error && (
        <p className="flex items-center gap-1.5 text-sm text-green-500">
          <Check className="h-4 w-4" /> {t.toolLabels.validJson}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => format(2)}>
          <Braces className="h-4 w-4" /> {t.toolLabels.format}
        </Button>
        <Button variant="secondary" onClick={() => format(null)}>
          <Minimize2 className="h-4 w-4" /> {t.toolLabels.minify}
        </Button>
        <Button variant="ghost" onClick={copy} disabled={!input}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t.actions.copied : t.actions.copy}
        </Button>
        <Button variant="ghost" onClick={clear} disabled={!input}>
          <Trash2 className="h-4 w-4" /> {t.actions.clear}
        </Button>
      </div>
    </div>
  );
}
