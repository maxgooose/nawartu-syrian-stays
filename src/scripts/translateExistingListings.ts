#!/usr/bin/env node
/**
 * Script to translate existing listings that are missing translations
 * Run this script to automatically translate all listings that have content in one language but not the other
 */

import { createClient } from '@supabase/supabase-js';

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

  // Translate name
  if (listing.name_en && (!listing.name_ar || listing.name_ar === '')) {
    console.log(`Translating name to Arabic for listing ${listing.id}`);
    updates.name_ar = await translateText(listing.name_en, 'ar', 'en');
    updates.name_ar_auto_translated = true;
    hasUpdates = true;
  } else if (listing.name_ar && (!listing.name_en || listing.name_en === '')) {
    console.log(`Translating name to English for listing ${listing.id}`);
    updates.name_en = await translateText(listing.name_ar, 'en', 'ar');
    updates.name_en_auto_translated = true;
    hasUpdates = true;
  }

  // Translate description
  if (listing.description_en && (!listing.description_ar || listing.description_ar === '')) {
    console.log(`Translating description to Arabic for listing ${listing.id}`);
    updates.description_ar = await translateText(listing.description_en, 'ar', 'en');
    updates.description_ar_auto_translated = true;
    hasUpdates = true;
  } else if (listing.description_ar && (!listing.description_en || listing.description_en === '')) {
    console.log(`Translating description to English for listing ${listing.id}`);
    updates.description_en = await translateText(listing.description_ar, 'en', 'ar');
    updates.description_en_auto_translated = true;
    hasUpdates = true;
  }

  // Translate location
  if (listing.location_en && (!listing.location_ar || listing.location_ar === '')) {
    console.log(`Translating location to Arabic for listing ${listing.id}`);
    updates.location_ar = await translateText(listing.location_en, 'ar', 'en');
    updates.location_ar_auto_translated = true;
    hasUpdates = true;
  } else if (listing.location_ar && (!listing.location_en || listing.location_en === '')) {
    console.log(`Translating location to English for listing ${listing.id}`);
    updates.location_en = await translateText(listing.location_ar, 'en', 'ar');
    updates.location_en_auto_translated = true;
    hasUpdates = true;
  }

  // Handle fallback from old fields if new bilingual fields are empty
  if (!listing.name_en && !listing.name_ar && listing.name) {
    // Detect language of the name field
    const isArabic = /[\u0600-\u06FF]/.test(listing.name);
    if (isArabic) {
      updates.name_ar = listing.name;
      updates.name_en = await translateText(listing.name, 'en', 'ar');
      updates.name_en_auto_translated = true;
    } else {
      updates.name_en = listing.name;
      updates.name_ar = await translateText(listing.name, 'ar', 'en');
      updates.name_ar_auto_translated = true;
    }
    hasUpdates = true;
  }

  if (!listing.description_en && !listing.description_ar && listing.description) {
    const isArabic = /[\u0600-\u06FF]/.test(listing.description);
    if (isArabic) {
      updates.description_ar = listing.description;
      updates.description_en = await translateText(listing.description, 'en', 'ar');
      updates.description_en_auto_translated = true;
    } else {
      updates.description_en = listing.description;
      updates.description_ar = await translateText(listing.description, 'ar', 'en');
      updates.description_ar_auto_translated = true;
    }
    hasUpdates = true;
  }

  if (!listing.location_en && !listing.location_ar && listing.location) {
    const isArabic = /[\u0600-\u06FF]/.test(listing.location);
    if (isArabic) {
      updates.location_ar = listing.location;
      updates.location_en = await translateText(listing.location, 'en', 'ar');
      updates.location_en_auto_translated = true;
    } else {
      updates.location_en = listing.location;
      updates.location_ar = await translateText(listing.location, 'ar', 'en');
      updates.location_ar_auto_translated = true;
    }
    hasUpdates = true;
  }

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