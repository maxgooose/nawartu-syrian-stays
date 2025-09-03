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
    if (sourceLang === targetLang && sourceLang !== 'auto') {
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

    return data?.translatedText || text;
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

  // Get name
  if (isArabic) {
    result.name = content.name_ar || '';
    if (!result.name && content.name_en && autoTranslate) {
      result.name = await translateText(content.name_en, 'ar', 'en');
      result.isAutoTranslated.name = true;
    }
    if (!result.name) {
      result.name = content.name || content.name_en || 'عقار بدون عنوان';
    }
  } else {
    result.name = content.name_en || '';
    if (!result.name && content.name_ar && autoTranslate) {
      result.name = await translateText(content.name_ar, 'en', 'ar');
      result.isAutoTranslated.name = true;
    }
    if (!result.name) {
      result.name = content.name || content.name_ar || 'Untitled Listing';
    }
  }

  // Get description
  if (isArabic) {
    result.description = content.description_ar || '';
    if (!result.description && content.description_en && autoTranslate) {
      result.description = await translateText(content.description_en, 'ar', 'en');
      result.isAutoTranslated.description = true;
    }
    if (!result.description) {
      result.description = content.description || content.description_en || 'لا يوجد وصف متاح';
    }
  } else {
    result.description = content.description_en || '';
    if (!result.description && content.description_ar && autoTranslate) {
      result.description = await translateText(content.description_ar, 'en', 'ar');
      result.isAutoTranslated.description = true;
    }
    if (!result.description) {
      result.description = content.description || content.description_ar || 'No description available';
    }
  }

  // Get location
  if (isArabic) {
    result.location = content.location_ar || '';
    if (!result.location && content.location_en && autoTranslate) {
      result.location = await translateText(content.location_en, 'ar', 'en');
      result.isAutoTranslated.location = true;
    }
    if (!result.location) {
      result.location = content.location || content.location_en || 'موقع غير متاح';
    }
  } else {
    result.location = content.location_en || '';
    if (!result.location && content.location_ar && autoTranslate) {
      result.location = await translateText(content.location_ar, 'en', 'ar');
      result.isAutoTranslated.location = true;
    }
    if (!result.location) {
      result.location = content.location || content.location_ar || 'Location not available';
    }
  }

  // If content has an ID and was auto-translated, update the database
  if (content.id && autoTranslate && (result.isAutoTranslated.name || result.isAutoTranslated.description || result.isAutoTranslated.location)) {
    try {
      const updates: any = {};
      
      if (result.isAutoTranslated.name) {
        if (isArabic) {
          updates.name_ar = result.name;
          updates.name_ar_auto_translated = true;
        } else {
          updates.name_en = result.name;
          updates.name_en_auto_translated = true;
        }
      }

      if (result.isAutoTranslated.description) {
        if (isArabic) {
          updates.description_ar = result.description;
          updates.description_ar_auto_translated = true;
        } else {
          updates.description_en = result.description;
          updates.description_en_auto_translated = true;
        }
      }

      if (result.isAutoTranslated.location) {
        if (isArabic) {
          updates.location_ar = result.location;
          updates.location_ar_auto_translated = true;
        } else {
          updates.location_en = result.location;
          updates.location_en_auto_translated = true;
        }
      }

      updates.last_translation_update = new Date().toISOString();

      // Update the database with translated content
      await supabase
        .from('listings')
        .update(updates)
        .eq('id', content.id);
    } catch (error) {
      console.error('Failed to save auto-translated content:', error);
    }
  }

  return result;
}