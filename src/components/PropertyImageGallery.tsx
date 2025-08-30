import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2,
  Image as ImageIcon
} from "lucide-react";
import { getPublicImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PropertyImageGalleryProps {
  images: string[];
  propertyName: string;
  className?: string;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  propertyName,
  className
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle swipe gestures for mobile
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left' && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (direction === 'right' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [currentImageIndex, images.length]);

  // Enhanced touch event handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = isMobile ? 30 : 50; // Smaller threshold for mobile
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleSwipe('left');
      } else {
        handleSwipe('right');
      }
    }
  };

  // Keyboard navigation for desktop
  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentImageIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1));
          break;
        case 'Escape':
          setIsFullscreenOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, images.length]);

  if (!images || images.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="aspect-[16/10] bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'ar' ? 'لا توجد صور متاحة' : 'No images available'}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (images.length === 1) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="aspect-[16/10] relative group">
          <img
            src={getPublicImageUrl(images[0], 'property-images', { width: 800, quality: 80 }) || '/placeholder.svg'}
            alt={propertyName}
            className="w-full h-full object-cover"
          />
          <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 bg-background/90 hover:bg-background text-foreground rounded-full p-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity md:block"
                aria-label={language === 'ar' ? 'عرض الصورة بالحجم الكامل' : 'View full size'}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreenOpen(false)}
                  className="absolute top-4 right-4 z-10 bg-background/20 hover:bg-background/40 text-white rounded-full p-2 h-10 w-10"
                  aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
                >
                  <X className="h-5 w-5" />
                </Button>
                <img
                  src={getPublicImageUrl(images[0], 'property-images', { width: 1200, quality: 90 }) || '/placeholder.svg'}
                  alt={propertyName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative">
        {/* Main Carousel */}
        <Carousel
          className="w-full"
          onSelect={(api) => {
            if (api) {
              setCurrentImageIndex(api.selectedScrollSnap());
            }
          }}
          opts={{
            loop: false,
            align: "start",
            skipSnaps: false,
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div 
                  className="aspect-[16/10] relative"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <img
                    src={getPublicImageUrl(image, 'property-images', { width: 800, quality: 80 }) || '/placeholder.svg'}
                    alt={`${propertyName} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows - Responsive positioning */}
          <CarouselPrevious 
            className={cn(
              "h-8 w-8 md:h-10 md:w-10 bg-background/80 hover:bg-background text-foreground border-0 shadow-lg",
              isMobile ? "left-2" : "left-3"
            )} 
          />
          <CarouselNext 
            className={cn(
              "h-8 w-8 md:h-10 md:w-10 bg-background/80 hover:bg-background text-foreground border-0 shadow-lg",
              isMobile ? "right-2" : "right-3"
            )} 
          />
        </Carousel>

        {/* Image Counter */}
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-full text-xs md:text-sm font-medium">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* View All Pictures Button */}
        <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size={isMobile ? "sm" : "default"}
              className={cn(
                "absolute bottom-3 right-3 bg-background/90 hover:bg-background text-foreground border shadow-lg",
                isMobile ? "text-xs px-2 py-1 h-7" : "px-3 py-2"
              )}
            >
              {language === 'ar' ? 'عرض جميع الصور' : 'View All Pictures'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-0">
            <div className="relative w-full h-full">
              {/* Fullscreen Gallery Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="font-semibold text-sm md:text-base">{propertyName}</h3>
                    <p className="text-xs md:text-sm text-white/80">
                      {currentImageIndex + 1} of {images.length}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreenOpen(false)}
                    className="bg-background/20 hover:bg-background/40 text-white border-0 h-8 w-8 md:h-10 md:w-10"
                    aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
                  >
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>

              {/* Fullscreen Image Display */}
              <div className="w-full h-full flex items-center justify-center p-3 md:p-4">
                <img
                  src={getPublicImageUrl(images[currentImageIndex], 'property-images', { width: 1200, quality: 90 }) || '/placeholder.svg'}
                  alt={`${propertyName} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Fullscreen Navigation - Responsive sizing */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentImageIndex === 0}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-white border-0 rounded-full",
                  isMobile ? "left-2 h-10 w-10" : "left-4 h-12 w-12"
                )}
                aria-label={language === 'ar' ? 'الصورة السابقة' : 'Previous image'}
              >
                <ChevronLeft className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                disabled={currentImageIndex === images.length - 1}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-white border-0 rounded-full",
                  isMobile ? "right-2 h-10 w-10" : "right-4 h-12 w-12"
                )}
                aria-label={language === 'ar' ? 'الصورة التالية' : 'Next image'}
              >
                <ChevronRight className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
              </Button>

              {/* Thumbnail Navigation - Responsive layout */}
              <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="flex gap-1 md:gap-2 bg-background/20 backdrop-blur-sm p-1 md:p-2 rounded-lg max-w-full overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                        isMobile ? "w-12 h-9" : "w-16 h-12",
                        index === currentImageIndex
                          ? "border-white scale-110"
                          : "border-transparent hover:border-white/50"
                      )}
                      aria-label={`${language === 'ar' ? 'انتقل إلى الصورة' : 'Go to image'} ${index + 1}`}
                    >
                      <img
                        src={getPublicImageUrl(image, 'property-images', { width: 100, quality: 60 }) || '/placeholder.svg'}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
