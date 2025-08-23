import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  Home, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Eye,
  MessageSquare,
  BarChart3,
  MapPin,
  DollarSign,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  created_at: string;
}

interface Listing {
  id: string;
  name: string;
  location: string;
  price_per_night_usd: number;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  description: string;
  created_at: string;
  host: {
    full_name: string;
    email: string;
  };
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_amount_usd: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_method: 'stripe' | 'cash';
  created_at: string;
  guest: {
    full_name: string;
    email: string;
  };
  listing: {
    name: string;
    location: string;
  };
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock language - in real app this would come from context
  const language: 'ar' | 'en' = 'ar';

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate('/auth');
      return;
    }
    fetchAdminData();
  }, [user, profile]);

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch pending listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          host:profiles!listings_host_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Fetch all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          guest:profiles!bookings_guest_id_fkey(full_name, email),
          listing:listings!bookings_listing_id_fkey(name, location)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      setUsers(usersData || []);
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

  const handleApproval = async (
    type: 'listing' | 'booking',
    id: string,
    action: 'approve' | 'reject'
  ) => {
    setActionLoading(id);
    
    try {
      if (type === 'listing') {
        const { error } = await supabase
          .from('listings')
          .update({ 
            status: action === 'approve' ? 'approved' : 'rejected',
            admin_notes: adminNotes || null
          })
          .eq('id', id);

        if (error) throw error;

        // Create admin approval record
        await supabase
          .from('admin_approvals')
          .insert({
            admin_id: profile?.id,
            target_id: id,
            target_type: 'listing',
            action: action === 'approve' ? 'approved' : 'rejected',
            notes: adminNotes || null
          });

      } else if (type === 'booking') {
        const { error } = await supabase
          .from('bookings')
          .update({ 
            status: action === 'approve' ? 'confirmed' : 'cancelled',
            admin_notes: adminNotes || null
          })
          .eq('id', id);

        if (error) throw error;

        // Create admin approval record
        await supabase
          .from('admin_approvals')
          .insert({
            admin_id: profile?.id,
            target_id: id,
            target_type: 'booking',
            action: action === 'approve' ? 'confirmed' : 'cancelled',
            notes: adminNotes || null
          });
      }

      toast({
        title: "تم بنجاح",
        description: action === 'approve' ? "تم الموافقة بنجاح" : "تم الرفض بنجاح",
      });

      fetchAdminData();
      setDialogOpen(false);
      setAdminNotes('');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في العملية",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'guest' | 'host' | 'admin') => {
    setActionLoading(userId);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث دور المستخدم بنجاح",
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في تحديث الدور",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string, type: 'listing' | 'booking' | 'user') => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      confirmed: 'default',
      cancelled: 'destructive',
      guest: 'outline',
      host: 'secondary',
      admin: 'default'
    } as const;

    const labels = {
      pending: 'قيد المراجعة',
      approved: 'مُعتمد',
      rejected: 'مرفوض',
      confirmed: 'مؤكد',
      cancelled: 'ملغى',
      guest: 'ضيف',
      host: 'مضيف',
      admin: 'مدير'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const stats = {
    totalUsers: users.length,
    totalHosts: users.filter(u => u.role === 'host').length,
    totalListings: listings.length,
    pendingListings: listings.filter(l => l.status === 'pending').length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    totalRevenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.total_amount_usd, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pattern-geometric-stars">
      <div className="container-custom py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              لوحة الإدارة
            </h1>
            <p className="text-muted-foreground mt-2">إدارة المنصة والموافقات</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="pattern-subtle border border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="pattern-subtle border border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">العقارات</p>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                  <p className="text-xs text-orange-600">{stats.pendingListings} قيد المراجعة</p>
                </div>
                <Home className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="pattern-subtle border border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الحجوزات</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-xs text-orange-600">{stats.pendingBookings} قيد المراجعة</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="pattern-subtle border border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الإيرادات</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              العقارات ({listings.filter(l => l.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              الحجوزات ({bookings.filter(b => b.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمين ({stats.totalUsers})
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {listings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد عقارات</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.id} className="pattern-subtle border border-primary/5">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4" dir="rtl">
                        <div className="flex gap-4 flex-1">
                          {listing.images?.[0] && (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{listing.name}</h3>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {listing.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              بواسطة: {listing.host.full_name} ({listing.host.email})
                            </p>
                            <p className="text-primary font-semibold">${listing.price_per_night_usd}/ليلة</p>
                          </div>
                        </div>
                        {getStatusBadge(listing.status, 'listing')}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {listing.description}
                      </p>

                      <div className="flex gap-2 text-xs text-muted-foreground mb-4">
                        <Clock className="h-4 w-4" />
                        {new Date(listing.created_at).toLocaleDateString('ar-SA')}
                      </div>

                      {listing.status === 'pending' && (
                        <div className="flex gap-2">
                          <Dialog open={dialogOpen && selectedItem?.id === listing.id} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setSelectedItem({...listing, type: 'listing', action: 'approve'})}
                                disabled={actionLoading === listing.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                موافقة
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="pattern-subtle" dir="rtl">
                              <DialogHeader>
                                <DialogTitle>موافقة على العقار</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>ملاحظات (اختياري)</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="أضف ملاحظات حول الموافقة..."
                                    className="text-right"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApproval('listing', listing.id, 'approve')}
                                    disabled={actionLoading === listing.id}
                                    className="flex-1"
                                  >
                                    {actionLoading === listing.id ? "جاري المعالجة..." : "موافقة"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    className="flex-1"
                                  >
                                    إلغاء
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedItem({...listing, type: 'listing', action: 'reject'})}
                                disabled={actionLoading === listing.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                رفض
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="pattern-subtle" dir="rtl">
                              <DialogHeader>
                                <DialogTitle>رفض العقار</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>سبب الرفض *</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="اشرح سبب رفض العقار..."
                                    className="text-right"
                                    required
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleApproval('listing', listing.id, 'reject')}
                                    disabled={actionLoading === listing.id || !adminNotes.trim()}
                                    className="flex-1"
                                  >
                                    {actionLoading === listing.id ? "جاري المعالجة..." : "رفض"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setDialogOpen(false);
                                      setAdminNotes('');
                                    }}
                                    className="flex-1"
                                  >
                                    إلغاء
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/property/${listing.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            عرض
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="pattern-subtle border border-primary/5">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4" dir="rtl">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.listing.name}</h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.listing.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            الضيف: {booking.guest.full_name} ({booking.guest.email})
                          </p>
                        </div>
                        {getStatusBadge(booking.status, 'booking')}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4" dir="rtl">
                        <div>
                          <span className="text-muted-foreground block">تاريخ الوصول</span>
                          <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">تاريخ المغادرة</span>
                          <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">المبلغ</span>
                          <span className="font-medium">${booking.total_amount_usd}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">طريقة الدفع</span>
                          <span className="font-medium">{booking.payment_method === 'cash' ? 'نقداً' : 'بطاقة'}</span>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproval('booking', booking.id, 'approve')}
                            disabled={actionLoading === booking.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {actionLoading === booking.id ? "جاري المعالجة..." : "تأكيد"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleApproval('booking', booking.id, 'reject')}
                            disabled={actionLoading === booking.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            إلغاء
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {users.map((user) => (
                <Card key={user.id} className="pattern-subtle border border-primary/5">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4" dir="rtl">
                      <div>
                        <h3 className="font-semibold text-lg">{user.full_name || 'بدون اسم'}</h3>
                        <p className="text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          انضم في: {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      {getStatusBadge(user.role, 'user')}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={user.role === 'guest' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateUserRole(user.id, 'guest')}
                        disabled={actionLoading === user.id || user.role === 'guest'}
                      >
                        ضيف
                      </Button>
                      <Button
                        variant={user.role === 'host' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateUserRole(user.id, 'host')}
                        disabled={actionLoading === user.id || user.role === 'host'}
                      >
                        مضيف
                      </Button>
                      <Button
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateUserRole(user.id, 'admin')}
                        disabled={actionLoading === user.id || user.role === 'admin'}
                      >
                        مدير
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;