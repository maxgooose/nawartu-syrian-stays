#!/usr/bin/env node
/**
 * Script to translate existing listings that are missing translations
 * Run this script to automatically translate all listings that have content in one language but not the other
 */

import { createClient } from '@supabase/supabase-js';

// Utility functions for language detection
function isArabic(text: string): boolean {
  if (!text) return false;
  // Extended Arabic character range check
  return /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);
}

function isEnglish(text: string): boolean {
  if (!text) return false;
  // Simple heuristic: if it contains Latin characters and no predominant Arabic characters
  return /[a-zA-Z]/.test(text) && !isArabic(text);
}

// Replace with your Supabase URL and anon key
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Listing {
  id: string;
  name?: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  location?: string;
  location_ar?: string;
  location_en?: string;
}

async function translateText(text: string, targetLang: 'en' | 'ar', sourceLang: 'en' | 'ar' | 'auto' = 'auto'): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: {
        text,
        sourceLang,
        targetLang
      }
    });

    if (error) {
      console.error('Translation error:', error);
      return text;
    }

    return data?.translatedText || text;
  } catch (error) {
    console.error('Translation service error:', error);
    return text;
  }
}

async function translateListing(listing: Listing): Promise<Partial<Listing>> {
  const updates: Partial<Listing> = {};
  let hasUpdates = false;

  // Helper to determine the best source for translation
  const getPrimarySource = (enField?: string, arField?: string, genericField?: string) => {
    if (enField && isEnglish(enField)) return { text: enField, lang: 'en' };
    if (arField && isArabic(arField)) return { text: arField, lang: 'ar' };
    if (genericField && isEnglish(genericField)) return { text: genericField, lang: 'en' };
    if (genericField && isArabic(genericField)) return { text: genericField, lang: 'ar' };
    return null;
  };

  // Process 'name' field - fix the logic completely
  let nameSource = getPrimarySource(listing.name_en, listing.name_ar, listing.name);

  if (nameSource) {
    // Only translate if the target field is missing OR contains wrong language content
    const needsArabicTranslation = !listing.name_ar || listing.name_ar === '' || isEnglish(listing.name_ar);
    const needsEnglishTranslation = !listing.name_en || listing.name_en === '' || isArabic(listing.name_en);

    if (needsArabicTranslation && nameSource.lang === 'en') {
      console.log(`Translating name to Arabic for listing ${listing.id}`);
      updates.name_ar = await translateText(nameSource.text, 'ar', 'en');
      updates.name_ar_auto_translated = true;
      hasUpdates = true;
    } else if (needsArabicTranslation && nameSource.lang === 'ar') {
      // Source is already Arabic, just copy it
      updates.name_ar = nameSource.text;
      hasUpdates = true;
    }

    if (needsEnglishTranslation && nameSource.lang === 'ar') {
      console.log(`Translating name to English for listing ${listing.id}`);
      updates.name_en = await translateText(nameSource.text, 'en', 'ar');
      updates.name_en_auto_translated = true;
      hasUpdates = true;
    } else if (needsEnglishTranslation && nameSource.lang === 'en') {
      // Source is already English, just copy it
      updates.name_en = nameSource.text;
      hasUpdates = true;
    }
  }

  // Process 'description' field - fix the logic completely
  let descriptionSource = getPrimarySource(listing.description_en, listing.description_ar, listing.description);

  if (descriptionSource) {
    const needsArabicTranslation = !listing.description_ar || listing.description_ar === '' || isEnglish(listing.description_ar);
    const needsEnglishTranslation = !listing.description_en || listing.description_en === '' || isArabic(listing.description_en);

    if (needsArabicTranslation && descriptionSource.lang === 'en') {
      console.log(`Translating description to Arabic for listing ${listing.id}`);
      updates.description_ar = await translateText(descriptionSource.text, 'ar', 'en');
      updates.description_ar_auto_translated = true;
      hasUpdates = true;
    } else if (needsArabicTranslation && descriptionSource.lang === 'ar') {
      updates.description_ar = descriptionSource.text;
      hasUpdates = true;
    }

    if (needsEnglishTranslation && descriptionSource.lang === 'ar') {
      console.log(`Translating description to English for listing ${listing.id}`);
      updates.description_en = await translateText(descriptionSource.text, 'en', 'ar');
      updates.description_en_auto_translated = true;
      hasUpdates = true;
    } else if (needsEnglishTranslation && descriptionSource.lang === 'en') {
      updates.description_en = descriptionSource.text;
      hasUpdates = true;
    }
  }

  // Process 'location' field - fix the logic completely
  let locationSource = getPrimarySource(listing.location_en, listing.location_ar, listing.location);

  if (locationSource) {
    const needsArabicTranslation = !listing.location_ar || listing.location_ar === '' || isEnglish(listing.location_ar);
    const needsEnglishTranslation = !listing.location_en || listing.location_en === '' || isArabic(listing.location_en);

    if (needsArabicTranslation && locationSource.lang === 'en') {
      console.log(`Translating location to Arabic for listing ${listing.id}`);
      updates.location_ar = await translateText(locationSource.text, 'ar', 'en');
      updates.location_ar_auto_translated = true;
      hasUpdates = true;
    } else if (needsArabicTranslation && locationSource.lang === 'ar') {
      updates.location_ar = locationSource.text;
      hasUpdates = true;
    }

    if (needsEnglishTranslation && locationSource.lang === 'ar') {
      console.log(`Translating location to English for listing ${listing.id}`);
      updates.location_en = await translateText(locationSource.text, 'en', 'ar');
      updates.location_en_auto_translated = true;
      hasUpdates = true;
    } else if (needsEnglishTranslation && locationSource.lang === 'en') {
      updates.location_en = locationSource.text;
      hasUpdates = true;
    }
  }
  
  // Update last_translation_update if any changes were made
  if (hasUpdates) {
    updates.last_translation_update = new Date().toISOString();
  }

  return updates;
}

async function translateAllListings() {
  console.log('Starting translation of existing listings...\n');

  try {
    // Fetch all listings
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, name, name_ar, name_en, description, description_ar, description_en, location, location_ar, location_en');

    if (error) {
      console.error('Error fetching listings:', error);
      return;
    }

    if (!listings || listings.length === 0) {
      console.log('No listings found');
      return;
    }

    console.log(`Found ${listings.length} listings to check\n`);

    let translatedCount = 0;
    let errorCount = 0;

    // Process listings in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, Math.min(i + batchSize, listings.length));
      
      const promises = batch.map(async (listing) => {
        try {
          const updates = await translateListing(listing);
          
          if (Object.keys(updates).length > 0) {
            // Update the listing in the database
            const { error: updateError } = await supabase
              .from('listings')
              .update(updates)
              .eq('id', listing.id);

            if (updateError) {
              console.error(`Error updating listing ${listing.id}:`, updateError);
              errorCount++;
            } else {
              console.log(`✓ Successfully translated listing ${listing.id}`);
              translatedCount++;
            }
          } else {
            console.log(`- Listing ${listing.id} already has all translations`);
          }
        } catch (err) {
          console.error(`Error processing listing ${listing.id}:`, err);
          errorCount++;
        }
      });

      await Promise.all(promises);

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < listings.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n=== Translation Summary ===');
    console.log(`Total listings processed: ${listings.length}`);
    console.log(`Listings translated: ${translatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Already translated: ${listings.length - translatedCount - errorCount}`);
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the script
console.log('=== Nawartu Listing Translation Script ===\n');
translateAllListings().then(() => {
  console.log('\nScript completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
