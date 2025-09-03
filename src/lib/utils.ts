
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

// Google Maps integration utilities
export const generateGoogleMapsUrls = (propertyData: {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}) => {
  const { name, location, latitude, longitude } = propertyData;
  
  // If we have coordinates, use them for more accurate results
  if (latitude && longitude) {
    return {
      mobile: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(name)})`,
      web: `https://www.google.com/maps?q=${latitude},${longitude}&t=m&z=15`,
      universal: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    };
  }
  
  // Fallback to address-based search - use just the location/address for better accuracy
  const searchQuery = location;
  return {
    mobile: `geo:0,0?q=${encodeURIComponent(searchQuery)}`,
    web: `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`,
    universal: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
  };
};

export const openInGoogleMaps = (propertyData: {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}) => {
  try {
    const urls = generateGoogleMapsUrls(propertyData);
    
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open Google Maps app first
      const appUrl = urls.mobile;
      const fallbackUrl = urls.universal;
      
      // Create a temporary link to try the app
      const link = document.createElement('a');
      link.href = appUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Fallback to web version after a short delay
      setTimeout(() => {
        window.open(fallbackUrl, '_blank');
      }, 1000);
    } else {
      // Desktop - open web version directly
      window.open(urls.universal, '_blank');
    }
  } catch (error) {
    console.error('Error opening Google Maps:', error);
    // Final fallback - use just the location/address
    const searchQuery = propertyData.location;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank');
  }
};
