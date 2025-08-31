
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns a public URL for a Supabase Storage image reference.
// Accepts:
// - Full http(s) URLs (returned as-is)
// - Bucket-relative keys like "userId/listings/file.jpg"
// - Keys accidentally saved with bucket prefix "listing-images/userId/..."
// - Public path strings "/storage/v1/object/public/listing-images/userId/..."
export function getPublicImageUrl(
  imagePath?: string | null,
  bucketName: string = 'listing-images',
  options?: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill' }
): string | null {
  if (!imagePath) return null

  const trimmed = imagePath.trim()
  if (trimmed.length === 0) return null

  // If it's already a full URL, return as is
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  // Blob URLs are not shareable; treat as invalid so callers can fallback
  if (trimmed.startsWith('blob:')) return null

  // Normalize paths that may contain bucket prefix or public path
  let key = trimmed

  const bucketPrefix = `${bucketName}/`
  const bucketIdx = key.indexOf(bucketPrefix)
  if (bucketIdx !== -1) {
    key = key.substring(bucketIdx + bucketPrefix.length)
  }

  const publicPathPrefix = '/storage/v1/object/public/'
  const publicIdx = key.indexOf(publicPathPrefix)
  if (publicIdx !== -1) {
    const afterPublic = key.substring(publicIdx + publicPathPrefix.length)
    const afterBucketIdx = afterPublic.indexOf(bucketPrefix)
    if (afterBucketIdx !== -1) {
      key = afterPublic.substring(afterBucketIdx + bucketPrefix.length)
    }
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(key)
  let url = data.publicUrl
  if (!url) return null
  if (options) {
    url = url.replace('/object/public/', '/render/image/public/')
    const params = new URLSearchParams()
    if (options.width) params.append('width', options.width.toString())
    if (options.height) params.append('height', options.height.toString())
    if (options.quality) params.append('quality', options.quality.toString())
    if (options.resize) params.append('resize', options.resize)
    if (params.toString()) {
      url += `?${params.toString()}`
    }
  }
  return url
}

/**
 * Generates Google Maps URLs for opening locations in Google Maps app or web
 * @param latitude - Property latitude
 * @param longitude - Property longitude 
 * @param address - Fallback address string
 * @param propertyName - Property name for the marker label
 * @returns Object with mobile app URL and web URL
 */
export function generateGoogleMapsUrls({
  latitude,
  longitude,
  address,
  propertyName
}: {
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  propertyName?: string;
}) {
  // If we have coordinates, use them for precise location
  if (latitude && longitude) {
    const coords = `${latitude},${longitude}`;
    const label = propertyName ? encodeURIComponent(propertyName) : '';
    
    return {
      // Mobile app URL (opens Google Maps app if installed)
      mobile: `geo:${coords}?q=${coords}(${label})`,
      // Web URL (works on all platforms)
      web: `https://www.google.com/maps?q=${coords}&t=m&z=15`,
      // Universal URL that works on both mobile and desktop
      universal: `https://www.google.com/maps/search/?api=1&query=${coords}`
    };
  }
  
  // Fallback to address search if no coordinates
  const encodedAddress = encodeURIComponent(address);
  const encodedName = propertyName ? encodeURIComponent(propertyName) : '';
  const query = encodedName ? `${encodedName}, ${encodedAddress}` : encodedAddress;
  
  return {
    mobile: `geo:0,0?q=${query}`,
    web: `https://www.google.com/maps/search/${query}`,
    universal: `https://www.google.com/maps/search/?api=1&query=${query}`
  };
}

/**
 * Opens Google Maps with the property location
 * Uses the best URL based on device capabilities
 */
export function openInGoogleMaps({
  latitude,
  longitude,
  address,
  propertyName
}: {
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  propertyName?: string;
}) {
  // Validate that we have either coordinates or address
  if ((!latitude || !longitude) && (!address || address.trim() === '')) {
    console.warn('openInGoogleMaps: No valid location data provided');
    return;
  }
  
  const urls = generateGoogleMapsUrls({ latitude, longitude, address, propertyName });
  
  // Detect if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  try {
    // On mobile, try to open the app first, fallback to web
    if (isMobile) {
      // Try to open the mobile app URL
      const link = document.createElement('a');
      link.href = urls.mobile;
      link.click();
      
      // Fallback to universal URL after a short delay if app doesn't open
      setTimeout(() => {
        window.open(urls.universal, '_blank');
      }, 1000);
    } else {
      // On desktop, open the web version in a new tab
      window.open(urls.universal, '_blank');
    }
  } catch (error) {
    console.error('Error opening Google Maps:', error);
    // Final fallback - try to open basic Google Maps search
    const fallbackQuery = encodeURIComponent(address || propertyName || 'location');
    window.open(`https://www.google.com/maps/search/${fallbackQuery}`, '_blank');
  }
}

// Favorites functionality
export const getFavorites = (): string[] => {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

export const toggleFavorite = (propertyId: string) => {
  const favorites = getFavorites();
  const index = favorites.indexOf(propertyId);
  if (index !== -1) {
    // Remove the property from favorites
    const newFavorites = [...favorites];
    newFavorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  } else {
    // Add the property to favorites
    localStorage.setItem('favorites', JSON.stringify([...favorites, propertyId]));
  }
};
