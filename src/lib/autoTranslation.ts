import { supabase } from '@/integrations/supabase/client';

interface TranslationResult {
  translatedText: string;
  isAutoTranslated: boolean;
}

interface ListingTranslations {
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  location_en?: string;
  location_ar?: string;
  name_en_auto_translated?: boolean;
  name_ar_auto_translated?: boolean;
  description_en_auto_translated?: boolean;
  description_ar_auto_translated?: boolean;
  location_en_auto_translated?: boolean;
  location_ar_auto_translated?: boolean;
}

/**
 * Translate text using the Supabase Edge Function
 */
export async function translateText(
  text: string,
  targetLang: 'en' | 'ar',
  sourceLang: 'en' | 'ar' | 'auto' = 'auto'
): Promise<string> {
  try {
    if (!text || text.trim() === '') {
      return '';
    }

    // Skip translation if text is already in target language (basic check)
    if (sourceLang === targetLang) {
      return text;
    }

    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: {
        text,
        sourceLang,
        targetLang
      }
    });

    if (error) {
      console.error('Translation error:', error);
      return text; // Return original text as fallback
    }

    const translatedText = data?.translatedText || text;
    
    // Filter out MyMemory warnings and return clean text
    if (translatedText && typeof translatedText === 'string') {
      // Remove MyMemory warnings and clean up the text
      const cleanText = translatedText
        .replace(/^MYMEMORY WARNING:.*?\n/i, '')
        .replace(/MYMEMORY WARNING:.*?$/i, '')
        .trim();
      
      return cleanText || text; // Return original if cleaning resulted in empty string
    }

    return translatedText || text;
  } catch (error) {
    console.error('Translation service error:', error);
    return text; // Return original text as fallback
  }
}

/**
 * Auto-translate missing listing fields
 */
export async function autoTranslateListing(
  listing: Partial<ListingTranslations>
): Promise<ListingTranslations> {
  const translations: ListingTranslations = { ...listing };
  const translationPromises: Promise<void>[] = [];

  // Translate name
  if (listing.name_en && (!listing.name_ar || listing.name_ar === '')) {
    translationPromises.push(
      translateText(listing.name_en, 'ar', 'en').then(translated => {
        translations.name_ar = translated;
        translations.name_ar_auto_translated = true;
      })
    );
  } else if (listing.name_ar && (!listing.name_en || listing.name_en === '')) {
    translationPromises.push(
      translateText(listing.name_ar, 'en', 'ar').then(translated => {
        translations.name_en = translated;
        translations.name_en_auto_translated = true;
      })
    );
  }

  // Translate description
  if (listing.description_en && (!listing.description_ar || listing.description_ar === '')) {
    translationPromises.push(
      translateText(listing.description_en, 'ar', 'en').then(translated => {
        translations.description_ar = translated;
        translations.description_ar_auto_translated = true;
      })
    );
  } else if (listing.description_ar && (!listing.description_en || listing.description_en === '')) {
    translationPromises.push(
      translateText(listing.description_ar, 'en', 'ar').then(translated => {
        translations.description_en = translated;
        translations.description_en_auto_translated = true;
      })
    );
  }

  // Translate location
  if (listing.location_en && (!listing.location_ar || listing.location_ar === '')) {
    translationPromises.push(
      translateText(listing.location_en, 'ar', 'en').then(translated => {
        translations.location_ar = translated;
        translations.location_ar_auto_translated = true;
      })
    );
  } else if (listing.location_ar && (!listing.location_en || listing.location_en === '')) {
    translationPromises.push(
      translateText(listing.location_ar, 'en', 'ar').then(translated => {
        translations.location_en = translated;
        translations.location_en_auto_translated = true;
      })
    );
  }

  // Wait for all translations to complete
  await Promise.all(translationPromises);

  return translations;
}

/**
 * Batch translate multiple listings
 */
export async function batchTranslateListings(
  listings: Array<any>
): Promise<Array<any>> {
  const translationPromises = listings.map(async (listing) => {
    const needsTranslation = 
      (!listing.name_en && listing.name_ar) ||
      (!listing.name_ar && listing.name_en) ||
      (!listing.description_en && listing.description_ar) ||
      (!listing.description_ar && listing.description_en) ||
      (!listing.location_en && listing.location_ar) ||
      (!listing.location_ar && listing.location_en);

    if (needsTranslation) {
      const translations = await autoTranslateListing(listing);
      return { ...listing, ...translations };
    }

    return listing;
  });

  return Promise.all(translationPromises);
}

/**
 * Get translated content for display (enhanced version)
 * This replaces the basic getTranslatedContent with automatic translation
 */
export async function getTranslatedContentWithAuto(
  content: {
    id?: string;
    name?: string;
    name_ar?: string;
    name_en?: string;
    description?: string;
    description_ar?: string;
    description_en?: string;
    location?: string;
    location_ar?: string;
    location_en?: string;
    [key: string]: any;
  },
  language: 'ar' | 'en',
  autoTranslate: boolean = true
): Promise<{
  name: string;
  description: string;
  location: string;
  isAutoTranslated?: {
    name?: boolean;
    description?: boolean;
    location?: boolean;
  };
}> {
  const isArabic = language === 'ar';
  let result = {
    name: '',
    description: '',
    location: '',
    isAutoTranslated: {
      name: false,
      description: false,
      location: false
    }
  };

  // Helper function to detect if text is Arabic
  const isArabicText = (text: string) => /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);
  
  // Collect all texts that need translation
  const textsToTranslate: Array<{text: string, field: 'name' | 'description' | 'location', sourceLang: 'en' | 'ar'}> = [];
  
  // Get name
  if (isArabic) {
    result.name = content.name_ar || '';
    // If name_ar is empty OR contains English text, translate from name_en
    if ((!result.name || !isArabicText(result.name)) && content.name_en && autoTranslate) {
      textsToTranslate.push({text: content.name_en, field: 'name', sourceLang: 'en'});
    }
    if (!result.name) {
      result.name = content.name || content.name_en || 'عقار بدون عنوان';
    }
  } else {
    result.name = content.name_en || '';
    // If name_en is empty OR contains Arabic text, translate from name_ar
    if ((!result.name || isArabicText(result.name)) && content.name_ar && autoTranslate) {
      textsToTranslate.push({text: content.name_ar, field: 'name', sourceLang: 'ar'});
    }
    if (!result.name) {
      result.name = content.name || content.name_ar || 'Untitled Listing';
    }
  }

  // Get description
  if (isArabic) {
    result.description = content.description_ar || '';
    // If description_ar is empty OR contains English text, translate from description_en
    if ((!result.description || !isArabicText(result.description)) && content.description_en && autoTranslate) {
      textsToTranslate.push({text: content.description_en, field: 'description', sourceLang: 'en'});
    }
    if (!result.description) {
      result.description = content.description || content.description_en || 'لا يوجد وصف متاح';
    }
  } else {
    result.description = content.description_en || '';
    // If description_en is empty OR contains Arabic text, translate from description_ar
    if ((!result.description || isArabicText(result.description)) && content.description_ar && autoTranslate) {
      textsToTranslate.push({text: content.description_ar, field: 'description', sourceLang: 'ar'});
    }
    if (!result.description) {
      result.description = content.description || content.description_ar || 'No description available';
    }
  }

  // Get location
  if (isArabic) {
    result.location = content.location_ar || '';
    // If location_ar is empty OR contains English text, translate from location_en
    if ((!result.location || !isArabicText(result.location)) && content.location_en && autoTranslate) {
      textsToTranslate.push({text: content.location_en, field: 'location', sourceLang: 'en'});
    }
    if (!result.location) {
      result.location = content.location || content.location_en || 'موقع غير متاح';
    }
  } else {
    result.location = content.location_en || '';
    // If location_en is empty OR contains Arabic text, translate from location_ar
    if ((!result.location || isArabicText(result.location)) && content.location_ar && autoTranslate) {
      textsToTranslate.push({text: content.location_ar, field: 'location', sourceLang: 'ar'});
    }
    if (!result.location) {
      result.location = content.location || content.location_ar || 'Location not available';
    }
  }

  // Batch translate all texts that need translation
  if (textsToTranslate.length > 0) {
    const translationPromises = textsToTranslate.map(async ({text, field, sourceLang}) => {
      const translated = await translateText(text, language, sourceLang);
      return {field, translated};
    });
    
    const translations = await Promise.all(translationPromises);
    
    // Apply translations to result
    translations.forEach(({field, translated}) => {
      result[field] = translated;
      result.isAutoTranslated[field] = true;
    });
  }

  return result;
}