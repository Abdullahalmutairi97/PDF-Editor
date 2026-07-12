export type ToolCategory = "pdf" | "image" | "dev" | "qr";

export type ToolExecutionMode = "server" | "client";

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface ToolFaqItem {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface ToolDefinition {
  /** Stable unique id, used for the /api/tools/[toolId] route and registry lookups */
  id: string;
  /** English slug, used for /[slug] route, e.g. "merge-pdf" */
  slug: string;
  /** Arabic slug, resolves to the same tool page, e.g. "دمج-pdf" */
  slugAr: string;
  category: ToolCategory;
  /** Lucide icon name, resolved in ToolCard/Sidebar */
  icon: string;
  mode: ToolExecutionMode;
  name: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  faq: ToolFaqItem[];
  /** Accepted upload mime types, only relevant for server-mode tools */
  acceptedMimeTypes?: string[];
  /** Allow selecting multiple files at once */
  multiple?: boolean;
  /** Max files allowed when multiple is true */
  maxFiles?: number;
}

export interface ToolCategoryMeta {
  id: ToolCategory;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  accentColor: string;
  accentColorFrom: string;
  accentColorTo: string;
}

export interface UploadedFileMeta {
  fileId: string;
  originalName: string;
  storedPath: string;
  size: number;
  mimeType: string;
}

export interface ProcessResultFile {
  fileId: string;
  filename: string;
  size: number;
  downloadUrl: string;
}

export interface ProcessResponse {
  success: boolean;
  files?: ProcessResultFile[];
  error?: string;
}
