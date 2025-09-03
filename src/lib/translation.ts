// Simple translation mappings for common real estate terms
// This is a basic implementation - in production, you'd use a proper translation service

interface TranslationMap {
  [key: string]: string;
}

// English to Arabic translations for common real estate terms
const enToArTranslations: TranslationMap = {
  // Property types
  'apartment': 'شقة',
  'house': 'منزل',
  'villa': 'فيلا',
  'studio': 'استوديو',
  'penthouse': 'بنتهاوس',
  'duplex': 'دوبلكس',
  'townhouse': 'تاون هاوس',
  
  // Location terms
  'city center': 'وسط المدينة',
  'downtown': 'وسط البلد',
  'old city': 'المدينة القديمة',
  'new city': 'المدينة الجديدة',
  'neighborhood': 'الحي',
  'district': 'المنطقة',
  'street': 'شارع',
  'avenue': 'جادة',
  'road': 'طريق',
  'square': 'ساحة',
  
  // Common adjectives
  'luxury': 'فاخر',
  'modern': 'عصري',
  'traditional': 'تقليدي',
  'spacious': 'واسع',
  'cozy': 'مريح',
  'beautiful': 'جميل',
  'stunning': 'مذهل',
  'comfortable': 'مريح',
  'elegant': 'أنيق',
  'bright': 'مشرق',
  'quiet': 'هادئ',
  'central': 'مركزي',
  'furnished': 'مفروش',
  'unfurnished': 'غير مفروش',
  
  // Common phrases
  'with': 'مع',
  'near': 'بالقرب من',
  'close to': 'قريب من',
  'walking distance': 'مسافة المشي',
  'minutes from': 'دقائق من',
  'overlooking': 'يطل على',
  'facing': 'يواجه',
  'terrace': 'تراس',
  'balcony': 'شرفة',
  'garden': 'حديقة',
  'parking': 'موقف سيارات',
  'garage': 'كراج',
  'pool': 'مسبح',
  'gym': 'نادي رياضي',
  'security': 'أمن',
  'elevator': 'مصعد',
  
  // Syrian cities and regions
  'damascus': 'دمشق',
  'aleppo': 'حلب',
  'homs': 'حمص',
  'latakia': 'اللاذقية',
  'tartous': 'طرطوس',
  'hama': 'حماة',
  'deir ez-zor': 'دير الزور',
  'raqqa': 'الرقة',
  'daraa': 'درعا',
  'sweida': 'السويداء',
  'quneitra': 'القنيطرة',
  'idlib': 'إدلب',
  'hasaka': 'الحسكة',
  'malki': 'المالكي',
  'mezzeh': 'المزة',
  'kafarsouseh': 'كفرسوسة',
  'jaramana': 'جرمانا',
  'old damascus': 'دمشق القديمة',
};

// Arabic to English translations (reverse mapping)
const arToEnTranslations: TranslationMap = Object.fromEntries(
  Object.entries(enToArTranslations).map(([en, ar]) => [ar, en])
);

// Additional Arabic to English mappings
Object.assign(arToEnTranslations, {
  'شقة فاخرة': 'luxury apartment',
  'منزل جميل': 'beautiful house',
  'فيلا عصرية': 'modern villa',
  'في وسط المدينة': 'in city center',
  'قريب من': 'close to',
  'مع إطلالة': 'with view',
  'مفروش بالكامل': 'fully furnished',
  'غرفة نوم': 'bedroom',
  'غرف نوم': 'bedrooms',
  'حمام': 'bathroom',
  'مطبخ': 'kitchen',
  'صالون': 'living room',
  'صالة': 'living room',
});

export function translateText(text: string, fromLang: 'en' | 'ar', toLang: 'en' | 'ar'): string {
  if (!text || fromLang === toLang) return text;
  
  const translations = fromLang === 'en' ? enToArTranslations : arToEnTranslations;
  let translatedText = text.toLowerCase();
  
  // Replace known terms
  for (const [original, translation] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translatedText = translatedText.replace(regex, translation);
  }
  
  // Capitalize first letter if translating to English
  if (toLang === 'en') {
    translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
  }
  
  return translatedText;
}

export function getTranslatedContent(
  content: {
    name?: string;
    name_ar?: string;
    name_en?: string;
    description?: string;
    description_ar?: string;
    description_en?: string;
    location?: string;
    location_ar?: string;
    location_en?: string;
  },
  language: 'ar' | 'en'
) {
  const isArabic = language === 'ar';
  
  // Get name with translation fallback
  let name: string;
  if (isArabic) {
    name = content.name_ar || content.name || '';
    if (!name && content.name_en) {
      name = translateText(content.name_en, 'en', 'ar');
    }
  } else {
    name = content.name_en || content.name || '';
    if (!name && content.name_ar) {
      name = translateText(content.name_ar, 'ar', 'en');
    }
  }
  
  // Get description with translation fallback
  let description: string;
  if (isArabic) {
    description = content.description_ar || content.description || '';
    if (!description && content.description_en) {
      description = translateText(content.description_en, 'en', 'ar');
    }
  } else {
    description = content.description_en || content.description || '';
    if (!description && content.description_ar) {
      description = translateText(content.description_ar, 'ar', 'en');
    }
  }
  
  // Get location with translation fallback
  let location: string;
  if (isArabic) {
    location = content.location_ar || content.location || '';
    if (!location && content.location_en) {
      location = translateText(content.location_en, 'en', 'ar');
    }
  } else {
    location = content.location_en || content.location || '';
    if (!location && content.location_ar) {
      location = translateText(content.location_ar, 'ar', 'en');
    }
  }
  
  return {
    name: name || (isArabic ? 'عقار بدون عنوان' : 'Untitled Listing'),
    description: description || (isArabic ? 'لا يوجد وصف متاح' : 'No description available'),
    location: location || (isArabic ? 'موقع غير متاح' : 'Location not available')
  };
}