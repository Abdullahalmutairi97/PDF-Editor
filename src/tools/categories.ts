import type { ToolCategoryMeta } from "@/types/tools";

export const categories: ToolCategoryMeta[] = [
  {
    id: "pdf",
    name: { ar: "أدوات PDF", en: "PDF Tools" },
    description: {
      ar: "دمج وتقسيم وضغط وتدوير ملفات PDF وتحويلها إلى صور",
      en: "Merge, split, compress and rotate PDF files, and convert them to images",
    },
    icon: "FileText",
    accentColor: "#6366f1",
    accentColorFrom: "#6366f1",
    accentColorTo: "#818cf8",
  },
  {
    id: "image",
    name: { ar: "أدوات الصور", en: "Image Tools" },
    description: {
      ar: "ضغط وتحويل وتغيير حجم الصور بجودة عالية",
      en: "Compress, convert and resize images with high quality",
    },
    icon: "Image",
    accentColor: "#8b5cf6",
    accentColorFrom: "#8b5cf6",
    accentColorTo: "#a78bfa",
  },
  {
    id: "dev",
    name: { ar: "أدوات المطورين", en: "Developer Tools" },
    description: {
      ar: "أدوات تنسيق وتشفير وإنشاء تعمل بالكامل داخل متصفحك",
      en: "Formatting, encoding and generation utilities that run entirely in your browser",
    },
    icon: "Code2",
    accentColor: "#0ea5e9",
    accentColorFrom: "#0ea5e9",
    accentColorTo: "#38bdf8",
  },
  {
    id: "qr",
    name: { ar: "أدوات QR", en: "QR Tools" },
    description: {
      ar: "إنشاء رموز QR مخصصة لأي نص أو رابط",
      en: "Generate customized QR codes for any text or link",
    },
    icon: "QrCode",
    accentColor: "#f59e0b",
    accentColorFrom: "#f59e0b",
    accentColorTo: "#fbbf24",
  },
];

export function getCategoryMeta(id: string): ToolCategoryMeta | undefined {
  return categories.find((c) => c.id === id);
}
