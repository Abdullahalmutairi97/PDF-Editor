import type { ToolDefinition } from "@/types/tools";

export const pdfTools: ToolDefinition[] = [
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    slugAr: "دمج-pdf",
    category: "pdf",
    icon: "FilesIcon",
    mode: "server",
    acceptedMimeTypes: ["application/pdf"],
    multiple: true,
    maxFiles: 20,
    name: { ar: "دمج ملفات PDF", en: "Merge PDF" },
    shortDescription: {
      ar: "ادمج عدة ملفات PDF في ملف واحد بالترتيب الذي تريده",
      en: "Combine multiple PDF files into one document in the order you choose",
    },
    description: {
      ar: "أداة دمج PDF تتيح لك رفع عدة ملفات PDF ودمجها في ملف واحد منظم، مع الحفاظ على جودة المحتوى الأصلي بالكامل باستخدام محرك qpdf الموثوق.",
      en: "Merge PDF lets you upload multiple PDF files and combine them into a single organized document, preserving full original quality using the reliable qpdf engine.",
    },
    faq: [
      {
        question: { ar: "هل يوجد حد لعدد الملفات؟", en: "Is there a limit on the number of files?" },
        answer: {
          ar: "يمكنك دمج حتى 20 ملف PDF في المرة الواحدة.",
          en: "You can merge up to 20 PDF files at once.",
        },
      },
      {
        question: { ar: "هل يتم الحفاظ على جودة الملفات؟", en: "Is the file quality preserved?" },
        answer: {
          ar: "نعم، الدمج لا يفقد أي جودة لأنه يعمل مباشرة على بنية الملفات دون إعادة ضغطها.",
          en: "Yes, merging does not lose any quality because it operates directly on the file structure without recompressing it.",
        },
      },
    ],
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    slugAr: "تقسيم-pdf",
    category: "pdf",
    icon: "Scissors",
    mode: "server",
    acceptedMimeTypes: ["application/pdf"],
    multiple: false,
    name: { ar: "تقسيم PDF", en: "Split PDF" },
    shortDescription: {
      ar: "قسّم ملف PDF إلى عدة ملفات حسب نطاقات الصفحات أو كل عدد صفحات",
      en: "Split a PDF into multiple files by page ranges or every N pages",
    },
    description: {
      ar: "أداة تقسيم PDF تتيح لك استخراج صفحات محددة أو تقسيم الملف إلى أجزاء متساوية، باستخدام qpdf للحصول على نتائج دقيقة وسريعة.",
      en: "Split PDF lets you extract specific pages or divide the file into equal parts, using qpdf for fast and accurate results.",
    },
    faq: [
      {
        question: { ar: "كيف يمكنني تحديد نطاق الصفحات؟", en: "How do I specify a page range?" },
        answer: {
          ar: "أدخل النطاقات مثل 1-3,5,7-9 أو اختر تقسيم كل عدد صفحات محدد.",
          en: "Enter ranges like 1-3,5,7-9 or choose to split every fixed number of pages.",
        },
      },
    ],
  },
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    slugAr: "ضغط-pdf",
    category: "pdf",
    icon: "FileArchive",
    mode: "server",
    acceptedMimeTypes: ["application/pdf"],
    multiple: false,
    name: { ar: "ضغط PDF", en: "Compress PDF" },
    shortDescription: {
      ar: "قلّل حجم ملف PDF مع الحفاظ على أفضل جودة ممكنة",
      en: "Reduce PDF file size while keeping the best possible quality",
    },
    description: {
      ar: "أداة ضغط PDF تستخدم Ghostscript لتقليل حجم الملف عبر مستويات جودة متعددة تناسب المشاركة عبر البريد الإلكتروني أو الطباعة أو العرض الرقمي.",
      en: "Compress PDF uses Ghostscript to reduce file size across multiple quality levels suited for email sharing, printing, or digital viewing.",
    },
    faq: [
      {
        question: { ar: "ما الفرق بين مستويات الضغط؟", en: "What is the difference between compression levels?" },
        answer: {
          ar: "الضغط العالي يقلل الحجم أكثر لكنه قد يخفض جودة الصور، بينما الضغط المنخفض يحافظ على جودة أعلى بحجم أكبر.",
          en: "High compression reduces size more but may lower image quality, while low compression keeps higher quality at a larger size.",
        },
      },
    ],
  },
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    slugAr: "تدوير-pdf",
    category: "pdf",
    icon: "RotateCw",
    mode: "server",
    acceptedMimeTypes: ["application/pdf"],
    multiple: false,
    name: { ar: "تدوير PDF", en: "Rotate PDF" },
    shortDescription: {
      ar: "دوّر جميع صفحات ملف PDF أو صفحات محددة بزاوية 90 أو 180 أو 270 درجة",
      en: "Rotate all or selected PDF pages by 90, 180, or 270 degrees",
    },
    description: {
      ar: "أداة تدوير PDF تتيح لك تصحيح اتجاه الصفحات الممسوحة ضوئيًا بشكل خاطئ، مع إمكانية اختيار صفحات محددة باستخدام qpdf.",
      en: "Rotate PDF lets you fix incorrectly oriented scanned pages, with the ability to target specific pages using qpdf.",
    },
    faq: [
      {
        question: { ar: "هل يمكن تدوير صفحات محددة فقط؟", en: "Can I rotate only specific pages?" },
        answer: {
          ar: "نعم، يمكنك إدخال أرقام الصفحات المطلوبة أو اختيار كل الصفحات.",
          en: "Yes, you can enter the specific page numbers or choose to rotate all pages.",
        },
      },
    ],
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    slugAr: "تحويل-pdf-الى-jpg",
    category: "pdf",
    icon: "ImageDown",
    mode: "server",
    acceptedMimeTypes: ["application/pdf"],
    multiple: false,
    name: { ar: "تحويل PDF إلى JPG", en: "PDF to JPG" },
    shortDescription: {
      ar: "حوّل صفحات ملف PDF إلى صور JPG عالية الجودة",
      en: "Convert PDF pages into high-quality JPG images",
    },
    description: {
      ar: "أداة تحويل PDF إلى JPG تستخدم poppler (pdftoppm) لإنتاج صورة لكل صفحة بدقة عالية، مع إمكانية تنزيل جميع الصور كملف مضغوط.",
      en: "PDF to JPG uses poppler (pdftoppm) to produce a high-resolution image per page, with the option to download all images as a zip.",
    },
    faq: [
      {
        question: { ar: "ما هي دقة الصور الناتجة؟", en: "What is the resolution of the output images?" },
        answer: {
          ar: "يتم إنتاج الصور بدقة 150 نقطة في البوصة لموازنة الجودة وحجم الملف.",
          en: "Images are produced at 150 DPI to balance quality and file size.",
        },
      },
    ],
  },
];
