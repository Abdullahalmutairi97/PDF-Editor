import type { ToolCategory, ToolDefinition } from "@/types/tools";
import { categories, getCategoryMeta } from "./categories";
import { pdfTools } from "./pdf/definitions";
import { imageTools } from "./image/definitions";
import { devTools } from "./dev/definitions";
import { qrTools } from "./qr/definitions";

export const toolRegistry: ToolDefinition[] = [...pdfTools, ...imageTools, ...devTools, ...qrTools];

export { categories, getCategoryMeta };

export function getAllTools(): ToolDefinition[] {
  return toolRegistry;
}

export function getToolById(id: string): ToolDefinition | undefined {
  return toolRegistry.find((tool) => tool.id === id);
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  const decoded = decodeURIComponent(slug);
  return toolRegistry.find((tool) => tool.slug === decoded || tool.slugAr === decoded);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return toolRegistry.filter((tool) => tool.category === category);
}

export function getAllToolSlugs(): string[] {
  return toolRegistry.flatMap((tool) => [tool.slug, tool.slugAr]);
}
