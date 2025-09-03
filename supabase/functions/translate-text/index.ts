import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  text: string;
  sourceLang: 'en' | 'ar' | 'auto';
  targetLang: 'en' | 'ar';
}

// Google Translate API (using free translate endpoint)
async function translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    // Use Google's free translation API endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract translated text from the response
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join('');
    }
    
    throw new Error('Invalid response from translation service');
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Alternative: Use MyMemory Translation API (free tier with better quality for Arabic)
async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Invalid response from MyMemory');
  } catch (error) {
    console.error('MyMemory translation error:', error);
    // Fallback to Google Translate
    return translateWithGoogle(text, sourceLang, targetLang);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, sourceLang = 'auto', targetLang } = await req.json() as TranslateRequest;

    if (!text || !targetLang) {
      throw new Error('Missing required parameters: text and targetLang');
    }

    if (text.length > 5000) {
      throw new Error('Text too long. Maximum 5000 characters allowed.');
    }

    // Skip translation if source and target are the same
    if (sourceLang === targetLang && sourceLang !== 'auto') {
      return new Response(
        JSON.stringify({ translatedText: text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use MyMemory for better Arabic translations, with Google as fallback
    const translatedText = await translateWithMyMemory(
      text,
      sourceLang === 'auto' ? 'auto-detect' : sourceLang,
      targetLang
    );

    return new Response(
      JSON.stringify({ 
        translatedText,
        sourceLang,
        targetLang
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translation function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Translation failed',
        fallbackText: '' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});