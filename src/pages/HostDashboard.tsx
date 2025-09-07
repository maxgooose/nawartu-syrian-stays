import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HostAvailabilityManager } from "@/components/HostAvailabilityManager";
import { Plus, Home, Calendar, Eye, Edit, ArrowLeft, Settings, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getPublicImageUrl } from "@/lib/utils";

interface Listing {
  id: string;
  name: string;
  location: string;
  price_per_night_usd: number;
  status: 'pending' | 'approved' | 'rejected';
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  created_at: string;
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_nights: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  guest: {
    full_name: string;
    email: string;
  };
  listing: {
    name: string;
  };
}

const HostDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  // Use shared image URL helper
  const getImageUrl = (imagePath: string) => getPublicImageUrl(imagePath);

  useEffect(() => {
    console.log('HostDashboard useEffect - authLoading:', authLoading, 'user:', user, 'profile:', profile);
    
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // Wait for profile to load before checking role
    if (!profile) {
      console.log('Profile not loaded yet, waiting...');
      return;
    }

    console.log('Profile loaded, role:', profile.role);

    if (profile.role !== 'host') {
      console.log('User is not a host, redirecting to become-host');
      navigate('/become-host');
      return;
    }

    fetchHostData();
  }, [user, profile, authLoading, navigate]);

  const fetchHostData = async () => {
    try {
      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('host_id', profile?.id);

      if (listingsError) throw listingsError;

      // Fetch bookings for host's listings (excluding payment data for security)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in_date,
          check_out_date,
          total_nights,
          status,
          special_requests,
          guest:profiles!bookings_guest_id_fkey(full_name, email),
          listing:listings!bookings_listing_id_fkey(name)
        `)
        .in('listing_id', listingsData?.map(l => l.id) || []);

      if (bookingsError) throw bookingsError;

      setListings(listingsData || []);
      setBookings(bookingsData || []);
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حدث خطأ في تحميل البيانات" : "Error loading data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'secondary'
    } as const;
    
    const labels = {
      pending: language === 'ar' ? 'قيد المراجعة' : 'Pending',
      approved: language === 'ar' ? 'مُعتمد' : 'Approved',
      rejected: language === 'ar' ? 'مرفوض' : 'Rejected',
      confirmed: language === 'ar' ? 'مؤكد' : 'Confirmed',
      cancelled: language === 'ar' ? 'ملغى' : 'Cancelled',
      completed: language === 'ar' ? 'مكتمل' : 'Completed'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Show loading while auth is loading OR while we're waiting for profile OR while fetching data
  if (authLoading || loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ar' ? 'لوحة المضيف' : 'Host Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar' ? 'إدارة عقاراتك وحجوزاتك' : 'Manage your properties and bookings'}
            </p>
          </div>
          <Button onClick={() => navigate('/create-listing')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة عقار جديد' : 'Add New Listing'}
          </Button>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {language === 'ar' ? 'عقاراتي' : 'My Properties'} ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {language === 'ar' ? 'الحجوزات' : 'Bookings'} ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {language === 'ar' ? 'إدارة التوفر' : 'Availability'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'لا توجد عقارات بعد' : 'No properties yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'ar' ? 'ابدأ بإضافة عقارك الأول' : 'Start by adding your first listing'}
                  </p>
                  <Button onClick={() => navigate('/create-listing')}>
                    {language === 'ar' ? 'إضافة عقار جديد' : 'Add New Listing'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {listing.images?.[0] ? (
                        <img 
                          src={getImageUrl(listing.images[0]) || '/placeholder.svg'} 
                          alt={listing.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(listing.status)}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{listing.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{listing.location}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-primary">
                          ${listing.price_per_night_usd}/{language === 'ar' ? 'ليلة' : 'night'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {listing.max_guests} {language === 'ar' ? 'ضيوف' : 'guests'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/property/${listing.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {language === 'ar' ? 'عرض' : 'View'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/edit-listing/${listing.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {language === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedListingId(listing.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {language === 'ar' ? 'إدارة' : 'Manage'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'ستظهر الحجوزات هنا عندما يحجز الضيوف عقاراتك' : 'Bookings will appear here when guests book your properties'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.listing.name}</h3>
                          <p className="text-muted-foreground">
                            {language === 'ar' ? 'ضيف:' : 'Guest:'} {booking.guest.full_name} ({booking.guest.email})
                          </p>
                        </div>
                        <div className="text-left">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'تاريخ الوصول' : 'Check-in Date'}
                          </span>
                          <span className="font-medium">
                            {new Date(booking.check_in_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'تاريخ المغادرة' : 'Check-out Date'}
                          </span>
                          <span className="font-medium">
                            {new Date(booking.check_out_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'عدد الليالي' : 'Nights'}
                          </span>
                          <span className="font-medium">{booking.total_nights}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'طلبات خاصة' : 'Special Requests'}
                          </span>
                          <span className="font-medium">
                            {booking.special_requests || (language === 'ar' ? 'لا توجد' : 'None')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'لا توجد عقارات للإدارة' : 'No properties to manage'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'ar' ? 'أضف عقاراً أولاً لإدارة التوفر والأسعار' : 'Add a property first to manage availability and pricing'}
                  </p>
                  <Button onClick={() => navigate('/create-listing')}>
                    {language === 'ar' ? 'إضافة عقار جديد' : 'Add New Listing'}
                  </Button>
                </CardContent>
              </Card>
            ) : selectedListingId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedListingId(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'العودة لقائمة العقارات' : 'Back to Properties'}
                  </Button>
                </div>
                
                <HostAvailabilityManager
                  listingId={selectedListingId}
                  listing={listings.find(l => l.id === selectedListingId)!}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'اختر عقاراً لإدارة توفره' : 'Select a property to manage availability'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'يمكنك إدارة التوفر والأسعار وقواعد الحجز لكل عقار' : 'Manage availability, pricing, and booking rules for each property'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.filter(listing => listing.status === 'approved').map((listing) => (
                    <Card key={listing.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedListingId(listing.id)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{listing.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            ${listing.price_per_night_usd}/{language === 'ar' ? 'ليلة' : 'night'}
                          </span>
                          <Button size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            {language === 'ar' ? 'إدارة' : 'Manage'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {listings.filter(listing => listing.status === 'approved').length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {language === 'ar' ? 'لا توجد عقارات معتمدة بعد. يجب الموافقة على العقار قبل إدارة التوفر.' : 'No approved properties yet. Properties must be approved before managing availability.'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostDashboard;