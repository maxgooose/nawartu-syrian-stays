import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateReviewProps {
  bookingId: string;
  listingId: string;
  guestId: string;
  listingName: string;
  onReviewCreated: () => void;
}

export const CreateReview = ({ 
  bookingId, 
  listingId, 
  guestId, 
  listingName, 
  onReviewCreated 
}: CreateReviewProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: language === 'ar' ? "التقييم مطلوب" : "Rating Required",
        description: language === 'ar' ? "يرجى اختيار تقييم بين 1 و 5 نجوم." : "Please select a rating between 1 and 5 stars.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast({
        title: language === 'ar' ? "التقييم غير مكتمل" : "Review Incomplete",
        description: language === 'ar' ? "يرجى تقديم عنوان وتعليق للتقييم." : "Please provide both a title and comment for your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          guest_id: guestId,
          listing_id: listingId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });

      if (error) throw error;

      toast({
        title: language === 'ar' ? "تم إرسال التقييم" : "Review Submitted",
        description: language === 'ar' ? "شكراً لك على تقييمك! سيساعد الضيوف الآخرين." : "Thank you for your review! It will help other guests.",
      });

      onReviewCreated();
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إرسال التقييم. يرجى المحاولة مرة أخرى." : "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="text-xl text-primary">
          {language === 'ar' ? 'قيّم إقامتك في' : 'Review Your Stay at'} {listingName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              {language === 'ar' ? 'التقييم العام' : 'Overall Rating'}
            </Label>
            <div className="flex space-x-1 rtl:space-x-reverse">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {language === 'ar' ? 'عنوان التقييم' : 'Review Title'}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'ar' ? "لخص تجربتك..." : "Summarize your experience..."}
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {language === 'ar' ? 'تقييمك' : 'Your Review'}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={language === 'ar' 
                ? "شارك تفاصيل عن إقامتك، ما أعجبك، وأي اقتراحات..." 
                : "Share details about your stay, what you liked, and any suggestions..."
              }
              className="min-h-[120px]"
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground">
              {comment.length}/1000 {language === 'ar' ? 'حرف' : 'characters'}
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (language === 'ar' ? "جاري الإرسال..." : "Submitting...") 
              : (language === 'ar' ? "إرسال التقييم" : "Submit Review")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};