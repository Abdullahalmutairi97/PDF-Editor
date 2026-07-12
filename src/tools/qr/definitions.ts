import type { ToolDefinition } from "@/types/tools";

export const qrTools: ToolDefinition[] = [
  {
    id: "qr-generator",
    slug: "qr-generator",
    slugAr: "مولد-qr",
    category: "qr",
    icon: "QrCode",
    mode: "client",
    name: { ar: "مولد رمز QR", en: "QR Generator" },
    shortDescription: {
      ar: "أنشئ رمز QR مخصص لأي نص أو رابط مع تخصيص اللون والحجم",
      en: "Generate a customized QR code for any text or link with color and size options",
    },
    description: {
      ar: "مولد رمز QR يتيح لك إنشاء رموز QR لأي نص أو رابط مع التحكم الكامل في اللون والحجم ومستوى تصحيح الأخطاء، ثم تنزيل الرمز كصورة PNG.",
      en: "QR Generator lets you create QR codes for any text or link with full control over color, size, and error-correction level, then download the code as a PNG image.",
    },
    faq: [
      {
        question: { ar: "هل يمكنني تغيير لون رمز QR؟", en: "Can I change the QR code color?" },
        answer: {
          ar: "نعم، يمكنك اختيار لون المقدمة والخلفية بحرية.",
          en: "Yes, you can freely choose the foreground and background colors.",
        },
      },
      {
        question: { ar: "ما هو مستوى تصحيح الأخطاء؟", en: "What is the error correction level?" },
        answer: {
          ar: "يحدد مدى قدرة الرمز على العمل حتى لو كان جزء منه تالفًا؛ كلما زاد المستوى زادت المتانة.",
          en: "It determines how much of the code can be damaged while still scanning correctly; higher levels increase robustness.",
        },
      },
    ],
  },
];
