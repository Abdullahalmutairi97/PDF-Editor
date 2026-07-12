import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllToolSlugs, getToolBySlug } from "@/tools/registry";
import { ToolPage } from "@/components/tools/ToolPage";

export async function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ toolSlug: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ toolSlug: string }>;
}): Promise<Metadata> {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  if (!tool) return {};

  const locale = decodeURIComponent(toolSlug) === tool.slugAr ? "ar" : "en";
  const title = tool.name[locale];
  const description = tool.shortDescription[locale];

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale === "ar" ? tool.slugAr : tool.slug}`,
      languages: {
        ar: `/${tool.slugAr}`,
        en: `/${tool.slug}`,
      },
    },
    openGraph: { title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ toolSlug: string }> }) {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  if (!tool) {
    notFound();
  }

  return <ToolPage tool={tool} />;
}
