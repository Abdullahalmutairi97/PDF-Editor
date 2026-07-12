"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function QrGenerator() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("https://arabitools.app");
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(280);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !text) {
      setError(null);
      return;
    }
    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: size,
        margin: 1,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      },
      (err) => setError(err ? String(err.message ?? err) : null)
    );
  }, [text, fgColor, bgColor, size, errorLevel]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <Textarea
          label={t.toolLabels.content}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          dir="ltr"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.toolLabels.foregroundColor}
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            className="h-11 p-1"
          />
          <Input
            label={t.toolLabels.backgroundColor}
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-11 p-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.toolLabels.size}
            type="number"
            min={128}
            max={1024}
            step={8}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
          <Select
            label={t.toolLabels.errorCorrectionLevel}
            value={errorLevel}
            onChange={(e) => setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")}
            options={[
              { value: "L", label: "L (7%)" },
              { value: "M", label: "M (15%)" },
              { value: "Q", label: "Q (25%)" },
              { value: "H", label: "H (30%)" },
            ]}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <canvas ref={canvasRef} className="max-w-full rounded-lg" />
        <Button onClick={download} disabled={!text}>
          <Download className="h-4 w-4" /> {t.actions.download}
        </Button>
      </div>
    </div>
  );
}
