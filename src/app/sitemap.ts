import type { MetadataRoute } from "next";
import { getAllTools } from "@/tools/registry";

const BASE_URL = "https://arabitools.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getAllTools();

  const toolEntries: MetadataRoute.Sitemap = tools.flatMap((tool) => [
    {
      url: `${BASE_URL}/${tool.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: { ar: `${BASE_URL}/${tool.slugAr}`, en: `${BASE_URL}/${tool.slug}` },
      },
    },
    {
      url: `${BASE_URL}/${tool.slugAr}`,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: { ar: `${BASE_URL}/${tool.slugAr}`, en: `${BASE_URL}/${tool.slug}` },
      },
    },
  ]);

  return [{ url: BASE_URL, changeFrequency: "daily", priority: 1 }, ...toolEntries];
}
