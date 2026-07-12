import type { ToolDefinition } from "@/types/tools";

export const devTools: ToolDefinition[] = [
  {
    id: "json-formatter",
    slug: "json-formatter",
    slugAr: "منسق-json",
    category: "dev",
    icon: "Braces",
    mode: "client",
    name: { ar: "منسق JSON", en: "JSON Formatter" },
    shortDescription: {
      ar: "نسّق أو صغّر أكواد JSON مع تظليل الصيغة",
      en: "Format or minify JSON with syntax highlighting",
    },
    description: {
      ar: "منسق JSON أداة تعمل بالكامل داخل متصفحك لتنسيق أو ضغط بيانات JSON والتحقق من صحتها، دون رفع أي بيانات إلى الخادم.",
      en: "JSON Formatter runs entirely in your browser to format or minify JSON data and validate it, without uploading any data to a server.",
    },
    faq: [
      {
        question: { ar: "هل يتم إرسال بياناتي إلى الخادم؟", en: "Is my data sent to a server?" },
        answer: {
          ar: "لا، تتم كل المعالجة محليًا داخل متصفحك.",
          en: "No, all processing happens locally in your browser.",
        },
      },
    ],
  },
  {
    id: "base64",
    slug: "base64",
    slugAr: "base64",
    category: "dev",
    icon: "Binary",
    mode: "client",
    name: { ar: "ترميز وفك ترميز Base64", en: "Base64 Encoder/Decoder" },
    shortDescription: {
      ar: "شفّر أو فك تشفير النصوص والملفات بصيغة Base64",
      en: "Encode or decode text and files in Base64",
    },
    description: {
      ar: "أداة Base64 تتيح لك تحويل النصوص أو الملفات إلى ترميز Base64 والعكس، بالكامل داخل متصفحك دون رفع أي بيانات.",
      en: "The Base64 tool lets you convert text or files to and from Base64 encoding, entirely in your browser without uploading any data.",
    },
    faq: [
      {
        question: { ar: "هل يمكنني ترميز الملفات؟", en: "Can I encode files?" },
        answer: {
          ar: "نعم، يمكنك رفع أي ملف محليًا للحصول على نص Base64 الخاص به.",
          en: "Yes, you can load any file locally to get its Base64 representation.",
        },
      },
    ],
  },
  {
    id: "uuid-generator",
    slug: "uuid-generator",
    slugAr: "مولد-uuid",
    category: "dev",
    icon: "Fingerprint",
    mode: "client",
    name: { ar: "مولد UUID", en: "UUID Generator" },
    shortDescription: {
      ar: "أنشئ معرفات UUID من النوع v4 أو v7 دفعة واحدة",
      en: "Generate v4 or v7 UUIDs in bulk",
    },
    description: {
      ar: "مولد UUID أداة تنشئ معرفات فريدة عالمية من النوع الرابع أو السابع، مع دعم إنشاء دفعات متعددة دفعة واحدة.",
      en: "UUID Generator creates universally unique identifiers of version 4 or 7, with support for generating multiple at once.",
    },
    faq: [
      {
        question: { ar: "ما الفرق بين UUID v4 وv7؟", en: "What's the difference between UUID v4 and v7?" },
        answer: {
          ar: "الإصدار v4 عشوائي بالكامل، بينما v7 يتضمن طابعًا زمنيًا يجعله قابلاً للترتيب زمنيًا.",
          en: "Version 4 is fully random, while version 7 embeds a timestamp making it sortable by creation time.",
        },
      },
    ],
  },
  {
    id: "hash-generator",
    slug: "hash-generator",
    slugAr: "مولد-التجزئة",
    category: "dev",
    icon: "Hash",
    mode: "client",
    name: { ar: "مولد التجزئة (Hash)", en: "Hash Generator" },
    shortDescription: {
      ar: "احسب قيم MD5 وSHA-1 وSHA-256 وSHA-512 لأي نص",
      en: "Compute MD5, SHA-1, SHA-256, and SHA-512 hashes for any text",
    },
    description: {
      ar: "مولد التجزئة أداة تحسب بصمات التشفير لأي نص باستخدام خوارزميات MD5 وSHA-1 وSHA-256 وSHA-512، بالكامل داخل متصفحك.",
      en: "Hash Generator computes cryptographic digests for any text using MD5, SHA-1, SHA-256, and SHA-512 algorithms, entirely in your browser.",
    },
    faq: [
      {
        question: { ar: "هل هذه الأداة آمنة للبيانات الحساسة؟", en: "Is this tool safe for sensitive data?" },
        answer: {
          ar: "المعالجة تتم محليًا فقط، لكن يُنصح بعدم استخدام MD5 وSHA-1 لأغراض أمنية حساسة لأنهما ضعيفان تشفيريًا.",
          en: "Processing is local only, but MD5 and SHA-1 are not recommended for security-sensitive purposes as they are cryptographically weak.",
        },
      },
    ],
  },
];
