import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicImageUrl } from "@/lib/utils";

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
  bucketName?: string;
  folder?: string;
}

export const ImageUpload = ({ 
  onImagesUploaded, 
  existingImages = [], 
  maxImages = 10,
  bucketName = "property-images",
  folder = "listings"
}: ImageUploadProps) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !user) return;

    const newFiles = Array.from(files);
    const totalImages = images.length + newFiles.length;

    if (totalImages > maxImages) {
      toast({
        title: "Too Many Images",
        description: `Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`,
        variant: "destructive",
      });
      return;
    }

    uploadImages(newFiles);
  };

  const uploadImages = async (files: File[]) => {
    if (!user) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 5MB.`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${user.id}/${folder}/${crypto.randomUUID()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesUploaded(newImages);

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedUrls.length} image(s).`,
      });

    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Extract path from URL - handle both Supabase URL formats
      let imagePath = '';
      
      // Try different URL patterns
      if (imageUrl.includes('/storage/v1/object/public/')) {
        const urlParts = imageUrl.split(`/storage/v1/object/public/${bucketName}/`);
        if (urlParts.length > 1) {
          imagePath = urlParts[1];
        }
      } else if (imageUrl.includes('.supabase.co/storage/v1/object/public/')) {
        const urlParts = imageUrl.split(`/storage/v1/object/public/${bucketName}/`);
        if (urlParts.length > 1) {
          imagePath = urlParts[1];
        }
      }

      // Only try to delete from storage if we have a valid path
      if (imagePath) {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([imagePath]);

        if (error) {
          console.warn('Failed to delete file from storage:', error);
          // Don't throw error - still remove from UI even if storage deletion fails
        } else {
          console.log('Successfully deleted file from storage:', imagePath);
        }
      } else {
        console.warn('Could not extract file path from URL:', imageUrl);
      }

      // Always update the UI state regardless of storage deletion success
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesUploaded(newImages);

      toast({
        title: "Image Removed",
        description: "Image has been successfully removed.",
      });

    } catch (error) {
      console.error('Error removing image:', error);
      
      // Still remove from UI even if there was an error
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesUploaded(newImages);
      
      toast({
        title: "Image Removed",
        description: "Image removed from listing (storage cleanup may have failed).",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-2">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
          )}
          
          <div>
            <p className="text-lg font-medium">
              {uploading ? "Uploading..." : "Drop images here or click to upload"}
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP up to 5MB each (max {maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={getPublicImageUrl(imageUrl, bucketName) || '/placeholder.svg'}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Add More Button */}
          {images.length < maxImages && (
            <div 
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Add More</p>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {images.length}/{maxImages} images uploaded
      </p>
    </div>
  );
};