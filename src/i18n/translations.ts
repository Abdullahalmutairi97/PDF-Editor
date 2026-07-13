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
    colorMode: string;
    color: string;
    grayscale: string;
    imageDpi: string;
    imageQuality: string;
    estimatedReduction: string;
    originalSize: string;
    newSize: string;
    estimatedSize: string;
    outputFormat: string;
    keepOriginal: string;
    pageSize: string;
    letter: string;
    autoFit: string;
    orientation: string;
    portrait: string;
    landscape: string;
    auto: string;
    margin: string;
    none: string;
    small: string;
    large: string;
    imageFit: string;
    contain: string;
    cover: string;
    stretch: string;
    presets: string;
    percentageMode: string;
    percentage: string;
    estimatedDimensions: string;
    original: string;
  };
  pdf: {
    preview: {
      loading: string;
      selectAll: string;
      selectNone: string;
      selectOdd: string;
      selectEven: string;
      selectRange: string;
      rangePlaceholder: string;
      apply: string;
      rotate: string;
      delete: string;
      duplicate: string;
      page: string;
      selected: string;
      dragHint: string;
      blankPage: string;
    };
    organize: {
      addBlankPage: string;
      reverseOrder: string;
      extractSelected: string;
      rotateSelected: string;
      deleteSelected: string;
      duplicateSelected: string;
      addPageNumbers: string;
      numberFormat: string;
      numberFormatSimple: string;
      numberFormatWithTotal: string;
      numberPosition: string;
      numberColor: string;
      numberSize: string;
      outputFilename: string;
      applyChanges: string;
      noPagesLeft: string;
      pagesRemaining: string;
    };
    watermark: {
      type: string;
      text: string;
      image: string;
      textContent: string;
      textPlaceholder: string;
      fontSize: string;
      opacity: string;
      color: string;
      rotation: string;
      position: string;
      positions: {
        center: string;
        diagonal: string;
        tile: string;
        topLeft: string;
        topCenter: string;
        topRight: string;
        bottomLeft: string;
        bottomCenter: string;
        bottomRight: string;
      };
      uploadLogo: string;
      applyTo: string;
      allPages: string;
      selectedPages: string;
      scale: string;
    };
    split: {
      extractMode: string;
      rangesMode: string;
      everyNMode: string;
      previewGroups: string;
      group: string;
      extractedPages: string;
    };
    compress: {
      extreme: string;
      estimatedSize: string;
      originalSize: string;
      compressedSize: string;
      reduction: string;
      colorMode: string;
      color: string;
      grayscale: string;
      imageDpi: string;
      imageQuality: string;
    };
    toJpg: {
      outputFormat: string;
      dpi: string;
      zipOutput: string;
      singleOutput: string;
      selectedOnly: string;
      convertAll: string;
    };
    merge: {
      outputFilename: string;
      pageSizeNormalize: string;
      normalizeNone: string;
      normalizeA4: string;
      normalizeLetter: string;
      normalizeFitFirst: string;
    };
    rotate: {
      rotateAll: string;
      rotateSelected: string;
      reset: string;
    };
    editor: {
      toolbar: {
        select: string;
        text: string;
        pen: string;
        highlight: string;
        rectangle: string;
        line: string;
        arrow: string;
        signature: string;
        eraser: string;
      };
      actions: {
        undo: string;
        redo: string;
        save: string;
        clear: string;
        previousPage: string;
        nextPage: string;
        pageOf: string;
        zoom: string;
        fitToWidth: string;
      };
      properties: {
        title: string;
        color: string;
        opacity: string;
        strokeWidth: string;
        fontSize: string;
        delete: string;
      };
      signature: {
        title: string;
        drawHere: string;
        clear: string;
        done: string;
        cancel: string;
      };
      textInput: {
        placeholder: string;
        add: string;
        cancel: string;
      };
      emptyState: string;
      saving: string;
      noAnnotations: string;
    };
  };
  imageTools: {
    batch: string;
    beforeAfter: string;
    before: string;
    after: string;
    maxDimension: string;
    outputFormat: string;
    pageSize: string;
    orientation: string;
    portrait: string;
    landscape: string;
    auto: string;
    margins: string;
    marginNone: string;
    marginSmall: string;
    marginLarge: string;
    fit: string;
    fitContain: string;
    fitCover: string;
    fitStretch: string;
    backgroundColor: string;
    presets: string;
    custom: string;
    estimatedSize: string;
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
      colorMode: "نمط الألوان",
      color: "ملون",
      grayscale: "تدرج رمادي",
      imageDpi: "دقة الصور (DPI)",
      imageQuality: "جودة الصور",
      estimatedReduction: "التخفيض المقدر",
      originalSize: "الحجم الأصلي",
      newSize: "الحجم الجديد",
      estimatedSize: "الحجم المقدر",
      outputFormat: "صيغة الإخراج",
      keepOriginal: "الاحتفاظ بالصيغة الأصلية",
      pageSize: "حجم الصفحة",
      letter: "Letter",
      autoFit: "ملائمة تلقائية",
      orientation: "الاتجاه",
      portrait: "عمودي",
      landscape: "أفقي",
      auto: "تلقائي",
      margin: "الهامش",
      none: "بدون",
      small: "صغير",
      large: "كبير",
      imageFit: "ملائمة الصورة",
      contain: "احتواء",
      cover: "تغطية",
      stretch: "تمديد",
      presets: "إعدادات مسبقة",
      percentageMode: "وضع النسبة المئوية",
      percentage: "النسبة المئوية",
      estimatedDimensions: "الأبعاد المقدرة",
      original: "الأصلي",
    },
    pdf: {
      preview: {
        loading: "جارٍ تجهيز معاينة الصفحات...",
        selectAll: "تحديد الكل",
        selectNone: "إلغاء التحديد",
        selectOdd: "الصفحات الفردية",
        selectEven: "الصفحات الزوجية",
        selectRange: "تحديد نطاق",
        rangePlaceholder: "مثال: 1-3,5",
        apply: "تطبيق",
        rotate: "تدوير",
        delete: "حذف",
        duplicate: "تكرار",
        page: "صفحة",
        selected: "محددة",
        dragHint: "اسحب لإعادة الترتيب",
        blankPage: "صفحة فارغة",
      },
      organize: {
        addBlankPage: "إضافة صفحة فارغة",
        reverseOrder: "عكس الترتيب",
        extractSelected: "استخراج المحدد فقط",
        rotateSelected: "تدوير المحدد",
        deleteSelected: "حذف المحدد",
        duplicateSelected: "تكرار المحدد",
        addPageNumbers: "إضافة ترقيم الصفحات",
        numberFormat: "تنسيق الترقيم",
        numberFormatSimple: "1, 2, 3",
        numberFormatWithTotal: "1 / 10",
        numberPosition: "موضع الترقيم",
        numberColor: "لون الترقيم",
        numberSize: "حجم الترقيم",
        outputFilename: "اسم الملف الناتج",
        applyChanges: "تطبيق التغييرات وتنزيل",
        noPagesLeft: "لا توجد صفحات متبقية",
        pagesRemaining: "صفحة متبقية",
      },
      watermark: {
        type: "نوع العلامة المائية",
        text: "نص",
        image: "شعار (صورة)",
        textContent: "نص العلامة المائية",
        textPlaceholder: "مثال: CONFIDENTIAL",
        fontSize: "حجم الخط",
        opacity: "الشفافية",
        color: "اللون",
        rotation: "زاوية الدوران",
        position: "الموضع",
        positions: {
          center: "منتصف",
          diagonal: "قطري",
          tile: "متكرر على كامل الصفحة",
          topLeft: "أعلى اليسار",
          topCenter: "أعلى الوسط",
          topRight: "أعلى اليمين",
          bottomLeft: "أسفل اليسار",
          bottomCenter: "أسفل الوسط",
          bottomRight: "أسفل اليمين",
        },
        uploadLogo: "رفع صورة الشعار",
        applyTo: "تطبيق على",
        allPages: "كل الصفحات",
        selectedPages: "الصفحات المحددة فقط",
        scale: "الحجم النسبي",
      },
      split: {
        extractMode: "استخراج صفحات محددة",
        rangesMode: "تقسيم حسب النطاقات",
        everyNMode: "كل عدد صفحات",
        previewGroups: "معاينة المجموعات",
        group: "مجموعة",
        extractedPages: "الصفحات المستخرجة",
      },
      compress: {
        extreme: "أقصى ضغط",
        estimatedSize: "الحجم المتوقع",
        originalSize: "الحجم الأصلي",
        compressedSize: "الحجم بعد الضغط",
        reduction: "نسبة التوفير",
        colorMode: "وضع الألوان",
        color: "ملون",
        grayscale: "تدرج رمادي",
        imageDpi: "دقة الصور (DPI)",
        imageQuality: "جودة الصور",
      },
      toJpg: {
        outputFormat: "صيغة الإخراج",
        dpi: "الدقة (DPI)",
        zipOutput: "ملف مضغوط (ZIP)",
        singleOutput: "دمج في مستند واحد",
        selectedOnly: "الصفحات المحددة فقط",
        convertAll: "كل الصفحات",
      },
      merge: {
        outputFilename: "اسم الملف الناتج",
        pageSizeNormalize: "توحيد حجم الصفحات",
        normalizeNone: "بدون تغيير",
        normalizeA4: "A4",
        normalizeLetter: "Letter",
        normalizeFitFirst: "حسب الملف الأول",
      },
      rotate: {
        rotateAll: "تدوير الكل",
        rotateSelected: "تدوير المحدد",
        reset: "إعادة تعيين",
      },
      editor: {
        toolbar: {
          select: "تحديد ونقل",
          text: "نص",
          pen: "قلم حر",
          highlight: "تظليل",
          rectangle: "مستطيل",
          line: "خط",
          arrow: "سهم",
          signature: "توقيع",
          eraser: "ممحاة",
        },
        actions: {
          undo: "تراجع",
          redo: "إعادة",
          save: "حفظ وتنزيل",
          clear: "مسح الكل",
          previousPage: "الصفحة السابقة",
          nextPage: "الصفحة التالية",
          pageOf: "صفحة {current} من {total}",
          zoom: "التكبير",
          fitToWidth: "ملاءمة العرض",
        },
        properties: {
          title: "خصائص العنصر",
          color: "اللون",
          opacity: "الشفافية",
          strokeWidth: "سمك الخط",
          fontSize: "حجم الخط",
          delete: "حذف",
        },
        signature: {
          title: "ارسم توقيعك",
          drawHere: "ارسم هنا بالماوس أو باللمس",
          clear: "مسح",
          done: "تم",
          cancel: "إلغاء",
        },
        textInput: {
          placeholder: "اكتب النص هنا...",
          add: "إضافة",
          cancel: "إلغاء",
        },
        emptyState: "ارفع ملف PDF لبدء التحرير",
        saving: "جارٍ حفظ التعديلات...",
        noAnnotations: "لم تقم بإضافة أي تعديلات بعد",
      },
    },
    imageTools: {
      batch: "معالجة عدة صور دفعة واحدة",
      beforeAfter: "قبل وبعد",
      before: "قبل",
      after: "بعد",
      maxDimension: "الحد الأقصى للأبعاد",
      outputFormat: "صيغة الإخراج",
      pageSize: "حجم الصفحة",
      orientation: "الاتجاه",
      portrait: "عمودي",
      landscape: "أفقي",
      auto: "تلقائي",
      margins: "الهوامش",
      marginNone: "بدون",
      marginSmall: "صغير",
      marginLarge: "كبير",
      fit: "طريقة الملاءمة",
      fitContain: "احتواء",
      fitCover: "تغطية",
      fitStretch: "تمديد",
      backgroundColor: "لون الخلفية",
      presets: "إعدادات مسبقة",
      custom: "مخصص",
      estimatedSize: "الحجم المتوقع",
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
      colorMode: "Color mode",
      color: "Color",
      grayscale: "Grayscale",
      imageDpi: "Image DPI",
      imageQuality: "Image quality",
      estimatedReduction: "Estimated reduction",
      originalSize: "Original size",
      newSize: "New size",
      estimatedSize: "Estimated size",
      outputFormat: "Output format",
      keepOriginal: "Keep original",
      pageSize: "Page size",
      letter: "Letter",
      autoFit: "Auto-fit",
      orientation: "Orientation",
      portrait: "Portrait",
      landscape: "Landscape",
      auto: "Auto",
      margin: "Margin",
      none: "None",
      small: "Small",
      large: "Large",
      imageFit: "Image fit",
      contain: "Contain",
      cover: "Cover",
      stretch: "Stretch",
      presets: "Presets",
      percentageMode: "Percentage mode",
      percentage: "Percentage",
      estimatedDimensions: "Estimated dimensions",
      original: "Original",
    },
    pdf: {
      preview: {
        loading: "Generating page previews...",
        selectAll: "Select all",
        selectNone: "Select none",
        selectOdd: "Odd pages",
        selectEven: "Even pages",
        selectRange: "Select range",
        rangePlaceholder: "e.g. 1-3,5",
        apply: "Apply",
        rotate: "Rotate",
        delete: "Delete",
        duplicate: "Duplicate",
        page: "Page",
        selected: "selected",
        dragHint: "Drag to reorder",
        blankPage: "Blank page",
      },
      organize: {
        addBlankPage: "Add blank page",
        reverseOrder: "Reverse order",
        extractSelected: "Extract selected only",
        rotateSelected: "Rotate selected",
        deleteSelected: "Delete selected",
        duplicateSelected: "Duplicate selected",
        addPageNumbers: "Add page numbers",
        numberFormat: "Number format",
        numberFormatSimple: "1, 2, 3",
        numberFormatWithTotal: "1 / 10",
        numberPosition: "Number position",
        numberColor: "Number color",
        numberSize: "Number size",
        outputFilename: "Output filename",
        applyChanges: "Apply changes & download",
        noPagesLeft: "No pages left",
        pagesRemaining: "pages remaining",
      },
      watermark: {
        type: "Watermark type",
        text: "Text",
        image: "Logo (image)",
        textContent: "Watermark text",
        textPlaceholder: "e.g. CONFIDENTIAL",
        fontSize: "Font size",
        opacity: "Opacity",
        color: "Color",
        rotation: "Rotation angle",
        position: "Position",
        positions: {
          center: "Center",
          diagonal: "Diagonal",
          tile: "Tiled across page",
          topLeft: "Top left",
          topCenter: "Top center",
          topRight: "Top right",
          bottomLeft: "Bottom left",
          bottomCenter: "Bottom center",
          bottomRight: "Bottom right",
        },
        uploadLogo: "Upload logo image",
        applyTo: "Apply to",
        allPages: "All pages",
        selectedPages: "Selected pages only",
        scale: "Relative size",
      },
      split: {
        extractMode: "Extract specific pages",
        rangesMode: "Split by ranges",
        everyNMode: "Every N pages",
        previewGroups: "Preview groups",
        group: "Group",
        extractedPages: "Extracted pages",
      },
      compress: {
        extreme: "Extreme",
        estimatedSize: "Estimated size",
        originalSize: "Original size",
        compressedSize: "Compressed size",
        reduction: "Reduction",
        colorMode: "Color mode",
        color: "Color",
        grayscale: "Grayscale",
        imageDpi: "Image DPI",
        imageQuality: "Image quality",
      },
      toJpg: {
        outputFormat: "Output format",
        dpi: "DPI",
        zipOutput: "ZIP archive",
        singleOutput: "Combine into one document",
        selectedOnly: "Selected pages only",
        convertAll: "All pages",
      },
      merge: {
        outputFilename: "Output filename",
        pageSizeNormalize: "Normalize page size",
        normalizeNone: "No change",
        normalizeA4: "A4",
        normalizeLetter: "Letter",
        normalizeFitFirst: "Match first file",
      },
      rotate: {
        rotateAll: "Rotate all",
        rotateSelected: "Rotate selected",
        reset: "Reset",
      },
      editor: {
        toolbar: {
          select: "Select & move",
          text: "Text",
          pen: "Pen",
          highlight: "Highlight",
          rectangle: "Rectangle",
          line: "Line",
          arrow: "Arrow",
          signature: "Signature",
          eraser: "Eraser",
        },
        actions: {
          undo: "Undo",
          redo: "Redo",
          save: "Save & download",
          clear: "Clear all",
          previousPage: "Previous page",
          nextPage: "Next page",
          pageOf: "Page {current} of {total}",
          zoom: "Zoom",
          fitToWidth: "Fit to width",
        },
        properties: {
          title: "Properties",
          color: "Color",
          opacity: "Opacity",
          strokeWidth: "Stroke width",
          fontSize: "Font size",
          delete: "Delete",
        },
        signature: {
          title: "Draw your signature",
          drawHere: "Draw here with your mouse or touch",
          clear: "Clear",
          done: "Done",
          cancel: "Cancel",
        },
        textInput: {
          placeholder: "Type your text here...",
          add: "Add",
          cancel: "Cancel",
        },
        emptyState: "Upload a PDF to start editing",
        saving: "Saving your edits...",
        noAnnotations: "You haven't added any edits yet",
      },
    },
    imageTools: {
      batch: "Batch process multiple images",
      beforeAfter: "Before & after",
      before: "Before",
      after: "After",
      maxDimension: "Maximum dimension",
      outputFormat: "Output format",
      pageSize: "Page size",
      orientation: "Orientation",
      portrait: "Portrait",
      landscape: "Landscape",
      auto: "Auto",
      margins: "Margins",
      marginNone: "None",
      marginSmall: "Small",
      marginLarge: "Large",
      fit: "Fit method",
      fitContain: "Contain",
      fitCover: "Cover",
      fitStretch: "Stretch",
      backgroundColor: "Background color",
      presets: "Presets",
      custom: "Custom",
      estimatedSize: "Estimated size",
    },
  },
};

export function getTranslations(locale: Locale): TranslationDict {
  return translations[locale];
}
