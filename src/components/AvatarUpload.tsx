import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUploaded: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export const AvatarUpload = ({ 
  currentAvatar, 
  onAvatarUploaded, 
  size = "lg" 
}: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32"
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large", 
        description: "Avatar image must be smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      if (currentAvatar) {
        const urlParts = currentAvatar.split('/storage/v1/object/public/profile-avatars/');
        if (urlParts.length > 1) {
          const oldPath = urlParts[1];
          await supabase.storage.from('profile-avatars').remove([oldPath]);
        }
      }

      // Upload new avatar
      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(data.path);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onAvatarUploaded(publicUrl);

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been successfully updated.",
      });

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadAvatar(files[0]);
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
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div
        className={`relative group cursor-pointer ${sizeClasses[size]}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Avatar className={`${sizeClasses[size]} ${dragOver ? 'ring-2 ring-primary' : ''}`}>
          <AvatarImage src={currentAvatar} alt="Profile picture" />
          <AvatarFallback className="text-lg">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${uploading ? 'opacity-100' : ''}`}>
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </div>

      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Change Photo
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        PNG, JPG, WEBP up to 2MB
      </p>
    </div>
  );
};