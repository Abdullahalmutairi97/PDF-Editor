export type Locale = "ar" | "en";

export const locales: Locale[] = ["ar", "en"];
export const defaultLocale: Locale = "ar";

export interface TranslationDict {
  site: { name: string; nameEn: string; tagline: string; description: string };
  nav: {
    home: string;
    pdfTools: string;
    imageTools: string;
    devTools: string;
    qrTools: string;
    allTools: string;
    language: string;
    darkMode: string;
    lightMode: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    viewAll: string;
    noResults: string;
  };
  categories: {
    pdf: { name: string; description: string };
    image: { name: string; description: string };
    dev: { name: string; description: string };
    qr: { name: string; description: string };
  };
  upload: {
    dragDrop: string;
    orClick: string;
    browse: string;
    maxSize: string;
    selectedFiles: string;
    removeFile: string;
    uploading: string;
    addMore: string;
  };
  processing: {
    title: string;
    subtitle: string;
    uploading: string;
    processing: string;
    finalizing: string;
    error: string;
    tryAgain: string;
  };
  result: {
    title: string;
    subtitle: string;
    download: string;
    downloadAll: string;
    processAnother: string;
    expiryNotice: string;
  };
  actions: {
    submit: string;
    cancel: string;
    copy: string;
    copied: string;
    clear: string;
    download: string;
    generate: string;
  };
  faq: { title: string };
  footer: { rights: string; madeWith: string };
  errors: {
    fileTooLarge: string;
    invalidFileType: string;
    uploadFailed: string;
    processingFailed: string;
    noFilesSelected: string;
    minFilesRequired: string;
    invalidInput: string;
  };
  toolLabels: {
    format: string;
    minify: string;
    validJson: string;
    encode: string;
    decode: string;
    inputText: string;
    outputText: string;
    version: string;
    count: string;
    copyAll: string;
    content: string;
    foregroundColor: string;
    backgroundColor: string;
    size: string;
    errorCorrectionLevel: string;
    quality: string;
    compressionLevel: string;
    low: string;
    medium: string;
    high: string;
    rotationAngle: string;
    allPages: string;
    pages: string;
    specificPagesPlaceholder: string;
    width: string;
    height: string;
    maintainAspectRatio: string;
    splitMode: string;
    byRanges: string;
    everyNPages: string;
    pageRanges: string;
    pageRangesPlaceholder: string;
    pagesPerFile: string;
  };
}

export const translations: Record<Locale, TranslationDict> = {
  ar: {
    site: {
      name: "أدوات عربي",
      nameEn: "ArabiTools",
      tagline: "أدوات عربية مجانية لمعالجة المستندات والصور",
      description:
        "منصة عربية مجانية لتحرير ودمج وضغط وتحويل ملفات PDF والصور، بالإضافة إلى أدوات مطورين وأدوات QR — بدون تسجيل دخول.",
    },
    nav: {
      home: "الرئيسية",
      pdfTools: "أدوات PDF",
      imageTools: "أدوات الصور",
      devTools: "أدوات المطورين",
      qrTools: "أدوات QR",
      allTools: "كل الأدوات",
      language: "English",
      darkMode: "الوضع الداكن",
      lightMode: "الوضع الفاتح",
    },
    home: {
      heroTitle: "كل أدوات المستندات التي تحتاجها في مكان واحد",
      heroSubtitle:
        "دمج وتقسيم وضغط ملفات PDF، تحويل الصور، وأدوات مطورين — كلها مجانية وسريعة وآمنة، بدون تسجيل دخول.",
      searchPlaceholder: "ابحث عن أداة...",
      viewAll: "عرض الكل",
      noResults: "لم يتم العثور على أدوات مطابقة",
    },
    categories: {
      pdf: { name: "أدوات PDF", description: "دمج وتقسيم وضغط وتدوير ملفات PDF" },
      image: { name: "أدوات الصور", description: "ضغط وتحويل وتغيير حجم الصور" },
      dev: { name: "أدوات المطورين", description: "أدوات تنسيق وتشفير للمطورين" },
      qr: { name: "أدوات QR", description: "إنشاء رموز QR مخصصة" },
    },
    upload: {
      dragDrop: "اسحب وأفلت الملفات هنا",
      orClick: "أو انقر لاختيار الملفات",
      browse: "اختر ملفات",
      maxSize: "الحد الأقصى لحجم الملف",
      selectedFiles: "الملفات المختارة",
      removeFile: "إزالة",
      uploading: "جارٍ الرفع...",
      addMore: "إضافة المزيد",
    },
    processing: {
      title: "جارٍ المعالجة",
      subtitle: "يرجى الانتظار بينما نعالج ملفاتك",
      uploading: "جارٍ رفع الملفات",
      processing: "جارٍ المعالجة",
      finalizing: "جارٍ الإنهاء",
      error: "حدث خطأ",
      tryAgain: "حاول مرة أخرى",
    },
    result: {
      title: "اكتملت المعالجة بنجاح",
      subtitle: "ملفك جاهز للتنزيل",
      download: "تنزيل",
      downloadAll: "تنزيل الكل",
      processAnother: "معالجة ملف آخر",
      expiryNotice: "سيتم حذف الملفات تلقائيًا بعد ساعة واحدة",
    },
    actions: {
      submit: "بدء المعالجة",
      cancel: "إلغاء",
      copy: "نسخ",
      copied: "تم النسخ!",
      clear: "مسح",
      download: "تنزيل",
      generate: "إنشاء",
    },
    faq: {
      title: "الأسئلة الشائعة",
    },
    footer: {
      rights: "جميع الحقوق محفوظة",
      madeWith: "صُنع بحب للمجتمع العربي",
    },
    errors: {
      fileTooLarge: "حجم الملف كبير جدًا",
      invalidFileType: "نوع الملف غير مدعوم",
      uploadFailed: "فشل رفع الملف",
      processingFailed: "فشلت معالجة الملف",
      noFilesSelected: "لم يتم اختيار أي ملفات",
      minFilesRequired: "يجب اختيار ملفين على الأقل",
      invalidInput: "مدخل غير صالح",
    },
    toolLabels: {
      format: "تنسيق",
      minify: "ضغط الكود",
      validJson: "JSON صالح",
      encode: "ترميز",
      decode: "فك الترميز",
      inputText: "أدخل النص هنا",
      outputText: "الناتج",
      version: "الإصدار",
      count: "العدد",
      copyAll: "نسخ الكل",
      content: "المحتوى",
      foregroundColor: "لون المقدمة",
      backgroundColor: "لون الخلفية",
      size: "الحجم",
      errorCorrectionLevel: "مستوى تصحيح الأخطاء",
      quality: "الجودة",
      compressionLevel: "مستوى الضغط",
      low: "منخفض",
      medium: "متوسط",
      high: "عالٍ",
      rotationAngle: "زاوية التدوير",
      allPages: "كل الصفحات",
      pages: "الصفحات",
      specificPagesPlaceholder: "مثال: 1,3,5",
      width: "العرض",
      height: "الارتفاع",
      maintainAspectRatio: "الحفاظ على نسبة الأبعاد",
      splitMode: "طريقة التقسيم",
      byRanges: "حسب نطاقات الصفحات",
      everyNPages: "كل عدد صفحات",
      pageRanges: "نطاقات الصفحات",
      pageRangesPlaceholder: "مثال: 1-3,5,7-9",
      pagesPerFile: "عدد الصفحات لكل ملف",
    },
  },
  en: {
    site: {
      name: "ArabiTools",
      nameEn: "ArabiTools",
      tagline: "Free Arabic-first document and image tools",
      description:
        "A free Arabic-first platform to edit, merge, compress and convert PDF files and images, plus developer utilities and QR tools — no login required.",
    },
    nav: {
      home: "Home",
      pdfTools: "PDF Tools",
      imageTools: "Image Tools",
      devTools: "Developer Tools",
      qrTools: "QR Tools",
      allTools: "All Tools",
      language: "العربية",
      darkMode: "Dark mode",
      lightMode: "Light mode",
    },
    home: {
      heroTitle: "Every document tool you need, in one place",
      heroSubtitle:
        "Merge, split and compress PDFs, convert images, and use developer utilities — all free, fast and secure, no login required.",
      searchPlaceholder: "Search for a tool...",
      viewAll: "View all",
      noResults: "No matching tools found",
    },
    categories: {
      pdf: { name: "PDF Tools", description: "Merge, split, compress and rotate PDF files" },
      image: { name: "Image Tools", description: "Compress, convert and resize images" },
      dev: { name: "Developer Tools", description: "Formatting and encoding utilities for developers" },
      qr: { name: "QR Tools", description: "Generate customized QR codes" },
    },
    upload: {
      dragDrop: "Drag & drop files here",
      orClick: "or click to browse",
      browse: "Browse files",
      maxSize: "Maximum file size",
      selectedFiles: "Selected files",
      removeFile: "Remove",
      uploading: "Uploading...",
      addMore: "Add more",
    },
    processing: {
      title: "Processing",
      subtitle: "Please wait while we process your files",
      uploading: "Uploading files",
      processing: "Processing",
      finalizing: "Finalizing",
      error: "An error occurred",
      tryAgain: "Try again",
    },
    result: {
      title: "Processing completed successfully",
      subtitle: "Your file is ready to download",
      download: "Download",
      downloadAll: "Download all",
      processAnother: "Process another file",
      expiryNotice: "Files are automatically deleted after one hour",
    },
    actions: {
      submit: "Start processing",
      cancel: "Cancel",
      copy: "Copy",
      copied: "Copied!",
      clear: "Clear",
      download: "Download",
      generate: "Generate",
    },
    faq: {
      title: "Frequently Asked Questions",
    },
    footer: {
      rights: "All rights reserved",
      madeWith: "Made with love for the Arabic community",
    },
    errors: {
      fileTooLarge: "File size is too large",
      invalidFileType: "Unsupported file type",
      uploadFailed: "File upload failed",
      processingFailed: "File processing failed",
      noFilesSelected: "No files selected",
      minFilesRequired: "At least two files are required",
      invalidInput: "Invalid input",
    },
    toolLabels: {
      format: "Format",
      minify: "Minify",
      validJson: "Valid JSON",
      encode: "Encode",
      decode: "Decode",
      inputText: "Enter text here",
      outputText: "Output",
      version: "Version",
      count: "Count",
      copyAll: "Copy all",
      content: "Content",
      foregroundColor: "Foreground color",
      backgroundColor: "Background color",
      size: "Size",
      errorCorrectionLevel: "Error correction level",
      quality: "Quality",
      compressionLevel: "Compression level",
      low: "Low",
      medium: "Medium",
      high: "High",
      rotationAngle: "Rotation angle",
      allPages: "All pages",
      pages: "Pages",
      specificPagesPlaceholder: "e.g. 1,3,5",
      width: "Width",
      height: "Height",
      maintainAspectRatio: "Maintain aspect ratio",
      splitMode: "Split mode",
      byRanges: "By page ranges",
      everyNPages: "Every N pages",
      pageRanges: "Page ranges",
      pageRangesPlaceholder: "e.g. 1-3,5,7-9",
      pagesPerFile: "Pages per file",
    },
  },
};

export function getTranslations(locale: Locale): TranslationDict {
  return translations[locale];
}
