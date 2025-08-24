import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Upload, MapPin, Home, Users, Bed, Bath, DollarSign } from "lucide-react";

const AMENITIES = [
  { id: 'wifi', label: 'واي فاي', value: 'wifi' },
  { id: 'parking', label: 'موقف سيارات', value: 'parking' },
  { id: 'pool', label: 'مسبح', value: 'pool' },
  { id: 'gym', label: 'صالة رياضية', value: 'gym' },
  { id: 'kitchen', label: 'مطبخ مجهز', value: 'kitchen' },
  { id: 'ac', label: 'تكييف', value: 'air_conditioning' },
  { id: 'balcony', label: 'شرفة', value: 'balcony' },
  { id: 'garden', label: 'حديقة', value: 'garden' },
  { id: 'security', label: 'أمن 24/7', value: 'security' },
  { id: 'elevator', label: 'مصعد', value: 'elevator' },
];

const CreateListing = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    price_per_night_usd: '',
    price_per_night_syp: '',
    max_guests: '2',
    bedrooms: '1',
    bathrooms: '1',
    amenities: [] as string[],
    images: [] as string[],
    latitude: '',
    longitude: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For now, we'll just store placeholder URLs
    // In a real app, you'd upload to Supabase Storage
    const newImages = Array.from(files).map((file, index) => 
      URL.createObjectURL(file)
    );
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10) // Max 10 images
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || profile?.role !== 'host') {
      toast({
        title: "خطأ",
        description: "يجب أن تكون مضيفاً لإضافة عقار",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('listings')
        .insert({
          host_id: profile.id,
          name: formData.name,
          description: formData.description,
          location: formData.location,
          price_per_night_usd: parseFloat(formData.price_per_night_usd),
          price_per_night_syp: formData.price_per_night_syp ? parseFloat(formData.price_per_night_syp) : null,
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          amenities: formData.amenities,
          images: formData.images,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          status: 'pending'
        });

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-listing-confirmation', {
          body: {
            hostEmail: profile.email,
            hostName: profile.full_name || profile.email,
            listingName: formData.name,
            listingLocation: formData.location,
            listingId: `${Date.now()}` // Simple ID for reference
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the listing creation if email fails
      }

      toast({
        title: "تم بنجاح",
        description: "تم إضافة العقار بنجاح وهو قيد المراجعة. تم إرسال تأكيد على بريدك الإلكتروني.",
      });

      navigate('/host-dashboard');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في إضافة العقار",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/host-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للوحة المضيف
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Home className="h-6 w-6" />
              إضافة عقار جديد
            </CardTitle>
            <p className="text-muted-foreground">
              أضف تفاصيل عقارك لبدء استقبال الضيوف
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  المعلومات الأساسية
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">اسم العقار *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="مثال: شقة فاخرة في وسط المدينة"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">الموقع *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="المدينة، الحي"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">الوصف *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="اكتب وصفاً جذاباً لعقارك..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  تفاصيل العقار
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="max_guests">عدد الضيوف الأقصى *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="max_guests"
                        name="max_guests"
                        type="number"
                        min="1"
                        value={formData.max_guests}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bedrooms">عدد غرف النوم</Label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bathrooms">عدد الحمامات</Label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        min="1"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  التسعير
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_per_night_usd">السعر بالدولار/ليلة *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price_per_night_usd"
                        name="price_per_night_usd"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.price_per_night_usd}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="50.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="price_per_night_syp">السعر بالليرة السورية/ليلة</Label>
                    <Input
                      id="price_per_night_syp"
                      name="price_per_night_syp"
                      type="number"
                      min="0"
                      value={formData.price_per_night_syp}
                      onChange={handleInputChange}
                      placeholder="اختياري"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الخدمات والمرافق</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox
                        id={amenity.id}
                        checked={formData.amenities.includes(amenity.value)}
                        onCheckedChange={(checked) => 
                          handleAmenityChange(amenity.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={amenity.id} className="text-sm font-normal">
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  صور العقار
                </h3>
                <div>
                  <Label htmlFor="images">رفع الصور (حتى 10 صور)</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    يُنصح برفع صور عالية الجودة تُظهر العقار بأفضل شكل
                  </p>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Coordinates (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  الإحداثيات (اختياري)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">خط العرض</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="33.5138"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">خط الطول</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="36.2765"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/host-dashboard')}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "جاري الحفظ..." : "إضافة العقار"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;