import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  host_response: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  };
}

interface ReviewsListProps {
  listingId: string;
  isHost?: boolean;
}

export const ReviewsList = ({ listingId, isHost = false }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          host_response,
          created_at,
          guest_id
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch guest profiles separately
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', review.guest_id)
            .single();
          
          return {
            ...review,
            profiles: {
              full_name: profileData?.full_name || null
            }
          };
        })
      );
      
      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_listing_average_rating', { listing_uuid: listingId });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAverageRating(data[0].average_rating);
        setReviewCount(data[0].review_count);
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const handleHostResponse = async (reviewId: string) => {
    if (!response.trim()) {
      toast({
        title: "Response Required",
        description: "Please enter a response before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ host_response: response.trim() })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Response Submitted",
        description: "Your response has been added to the review.",
      });

      setRespondingTo(null);
      setResponse("");
      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating Summary */}
      {averageRating && reviewCount > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-primary">
                {averageRating}
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  {renderStars(Math.round(averageRating))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {review.profiles.full_name?.charAt(0)?.toUpperCase() || 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{review.title}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          by {review.profiles.full_name || 'Guest'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">{review.comment}</p>
                
                {/* Host Response */}
                {review.host_response && (
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Host Response:</h5>
                    <p className="text-sm text-foreground">{review.host_response}</p>
                  </div>
                )}

                {/* Add Response (Host Only) */}
                {isHost && !review.host_response && profile?.role === 'host' && (
                  <div className="space-y-3">
                    {respondingTo === review.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Write your response..."
                          className="min-h-[80px]"
                        />
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleHostResponse(review.id)}
                          >
                            Submit Response
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setRespondingTo(null);
                              setResponse("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setRespondingTo(review.id)}
                      >
                        Respond to Review
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};