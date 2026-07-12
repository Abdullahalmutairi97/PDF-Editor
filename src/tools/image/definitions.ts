import type { ToolDefinition } from "@/types/tools";

export const imageTools: ToolDefinition[] = [
  {
    id: "compress-image",
    slug: "compress-image",
    slugAr: "ضغط-الصورة",
    category: "image",
    icon: "FileArchive",
    mode: "server",
    acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    multiple: false,
    name: { ar: "ضغط الصورة", en: "Compress Image" },
    shortDescription: {
      ar: "قلّل حجم الصورة مع التحكم في مستوى الجودة",
      en: "Reduce image file size with adjustable quality control",
    },
    description: {
      ar: "أداة ضغط الصور تستخدم ImageMagick لتقليل حجم ملفات JPG وPNG وWebP عبر شريط تحكم بالجودة، مثالية لتسريع المواقع وتوفير المساحة.",
      en: "Compress Image uses ImageMagick to reduce JPG, PNG, and WebP file sizes via a quality slider, ideal for faster websites and saving storage.",
    },
    faq: [
      {
        question: { ar: "هل تدعم صيغة PNG؟", en: "Does it support PNG format?" },
        answer: {
          ar: "نعم، تدعم الأداة صيغ JPG وPNG وWebP.",
          en: "Yes, the tool supports JPG, PNG, and WebP formats.",
        },
      },
    ],
  },
  {
    id: "image-to-pdf",
    slug: "image-to-pdf",
    slugAr: "صورة-الى-pdf",
    category: "image",
    icon: "FileText",
    mode: "server",
    acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    multiple: true,
    maxFiles: 30,
    name: { ar: "تحويل الصور إلى PDF", en: "Image to PDF" },
    shortDescription: {
      ar: "اجمع عدة صور في ملف PDF واحد بالترتيب الذي تختاره",
      en: "Combine multiple images into a single PDF in the order you choose",
    },
    description: {
      ar: "أداة تحويل الصور إلى PDF تستخدم ImageMagick لدمج صورك في مستند PDF واحد مرتب، مناسبة لإنشاء التقارير والمستندات الممسوحة ضوئيًا.",
      en: "Image to PDF uses ImageMagick to combine your images into a single organized PDF document, ideal for creating reports and scanned documents.",
    },
    faq: [
      {
        question: { ar: "هل يمكنني ترتيب الصور؟", en: "Can I reorder the images?" },
        answer: {
          ar: "نعم، يمكنك إعادة ترتيب الصور بالسحب قبل التحويل.",
          en: "Yes, you can drag to reorder images before conversion.",
        },
      },
    ],
  },
  {
    id: "resize-image",
    slug: "resize-image",
    slugAr: "تغيير-حجم-الصورة",
    category: "image",
    icon: "Maximize",
    mode: "server",
    acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    multiple: false,
    name: { ar: "تغيير حجم الصورة", en: "Resize Image" },
    shortDescription: {
      ar: "غيّر أبعاد الصورة بالعرض والارتفاع مع خيار قفل النسبة",
      en: "Change image width and height with an aspect-ratio lock option",
    },
    description: {
      ar: "أداة تغيير حجم الصورة تتيح لك تحديد عرض وارتفاع جديدين مع خيار قفل نسبة الأبعاد تلقائيًا، باستخدام ImageMagick لنتائج عالية الجودة.",
      en: "Resize Image lets you set a new width and height with an automatic aspect-ratio lock option, using ImageMagick for high-quality results.",
    },
    faq: [
      {
        question: { ar: "ماذا يحدث عند قفل نسبة الأبعاد؟", en: "What happens when the aspect ratio is locked?" },
        answer: {
          ar: "عند تفعيل القفل، يتم حساب أحد البعدين تلقائيًا للحفاظ على النسبة الأصلية.",
          en: "When locked, one dimension is automatically calculated to preserve the original ratio.",
        },
      },
    ],
  },
];
