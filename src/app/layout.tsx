import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arabitools.app"),
  title: {
    default: "أدوات عربي | ArabiTools — أدوات مجانية لملفات PDF والصور",
    template: "%s | أدوات عربي",
  },
  description:
    "منصة عربية مجانية لدمج وضغط وتحويل ملفات PDF والصور، مع أدوات مطورين وأدوات QR، بدون تسجيل دخول.",
  applicationName: "أدوات عربي",
  alternates: {
    languages: {
      ar: "/",
      en: "/",
    },
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('arabitools-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-arabic)] bg-[var(--color-background)] text-[var(--color-foreground)]">
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
