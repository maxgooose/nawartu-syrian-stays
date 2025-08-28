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
// - Keys accidentally saved with bucket prefix "property-images/userId/..."
// - Public path strings "/storage/v1/object/public/property-images/userId/..."
export function getPublicImageUrl(
  imagePath?: string | null,
  bucketName: string = 'property-images'
): string | null {
  if (!imagePath) return null

  const trimmed = imagePath.trim()
  if (trimmed.length === 0) return null

  // If it's already a full URL, return as is
  if (/^https?:\/\//i.test(trimmed)) return trimmed

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
  return data.publicUrl || null
}
