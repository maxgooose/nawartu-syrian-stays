import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Home, Calendar, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || profile?.role !== 'host') {
      navigate('/auth');
      return;
    }
    fetchHostData();
  }, [user, profile]);

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
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
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
      pending: 'قيد المراجعة',
      approved: 'مُعتمد',
      rejected: 'مرفوض',
      confirmed: 'مؤكد',
      cancelled: 'ملغى',
      completed: 'مكتمل'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة المضيف</h1>
            <p className="text-muted-foreground mt-2">إدارة عقاراتك وحجوزاتك</p>
          </div>
          <Button onClick={() => navigate('/create-listing')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة عقار جديد
          </Button>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              عقاراتي ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              الحجوزات ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد عقارات بعد</h3>
                  <p className="text-muted-foreground mb-4">ابدأ بإضافة عقارك الأول</p>
                  <Button onClick={() => navigate('/create-listing')}>
                    إضافة عقار جديد
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
                          src={listing.images[0]} 
                          alt={listing.name}
                          className="w-full h-full object-cover"
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
                          ${listing.price_per_night_usd}/ليلة
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {listing.max_guests} ضيوف
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          عرض
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          تعديل
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
                  <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات بعد</h3>
                  <p className="text-muted-foreground">ستظهر الحجوزات هنا عندما يحجز الضيوف عقاراتك</p>
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
                            ضيف: {booking.guest.full_name} ({booking.guest.email})
                          </p>
                        </div>
                        <div className="text-left">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">تاريخ الوصول</span>
                          <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">تاريخ المغادرة</span>
                          <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">عدد الليالي</span>
                          <span className="font-medium">{booking.total_nights}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">طلبات خاصة</span>
                          <span className="font-medium">{booking.special_requests || 'لا توجد'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostDashboard;