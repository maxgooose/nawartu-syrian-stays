import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, Save } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { ImageUpload } from "@/components/ImageUpload";
import { AMENITIES } from "@/lib/amenities";
import { getPublicImageUrl } from "@/lib/utils";

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  });

  useEffect(() => {
    if (!user || profile?.role !== 'host') {
      navigate('/host-dashboard');
      return;
    }
    
    if (id) {
      fetchListing();
    }
  }, [id, user, profile]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('host_id', profile?.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: language === 'ar' ? "خطأ" : "Error",
          description: language === 'ar' ? "العقار غير موجود" : "Property not found",
          variant: "destructive",
        });
        navigate('/host-dashboard');
        return;
      }

      setFormData({
        name: data.name || '',
        description: data.description || '',
        location: data.location || '',
        price_per_night_usd: data.price_per_night_usd?.toString() || '',
        price_per_night_syp: data.price_per_night_syp?.toString() || '',
        max_guests: data.max_guests?.toString() || '2',
        bedrooms: data.bedrooms?.toString() || '1',
        bathrooms: data.bathrooms?.toString() || '1',
        amenities: data.amenities || [],
        images: data.images || [],

      });
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/host-dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Sanitize images before saving: remove blob: URLs and normalize to public URLs
      const sanitizedImages = (formData.images || [])
        .map((img) => getPublicImageUrl(img) || '')
        .filter((u) => !!u);

      const { error } = await supabase
        .from('listings')
        .update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          price_per_night_usd: parseFloat(formData.price_per_night_usd),
          price_per_night_syp: formData.price_per_night_syp ? parseFloat(formData.price_per_night_syp) : null,
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          amenities: formData.amenities,
          images: sanitizedImages,

        })
        .eq('id', id)
        .eq('host_id', profile?.id);

      if (error) throw error;

      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' 
          ? "تم تحديث العقار بنجاح" 
          : "Property updated successfully",
      });

      navigate('/host-dashboard');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

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
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة للوحة المضيف' : 'Back to Dashboard'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Home className="h-6 w-6" />
              {language === 'ar' ? 'تعديل العقار' : 'Edit Property'}
            </CardTitle>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'قم بتحديث تفاصيل عقارك' 
                : 'Update your property details'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      {language === 'ar' ? 'اسم العقار *' : 'Property Name *'}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={language === 'ar' 
                        ? "مثال: شقة فاخرة في وسط المدينة" 
                        : "Example: Luxury apartment in city center"
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">{language === 'ar' ? 'الموقع *' : 'Location *'}</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder={language === 'ar' ? 'مثال: دمشق، المالكي، شارع الجلاء' : 'Example: Damascus, Malki, Jalaa Street'}
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'ar' 
                        ? 'أدخل العنوان الكامل للعقار بما في ذلك المدينة والحي والشارع' 
                        : 'Enter the complete address including city, neighborhood, and street'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">
                    {language === 'ar' ? 'الوصف *' : 'Description *'}
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={language === 'ar'
                      ? "اكتب وصفاً مفصلاً عن عقارك..."
                      : "Write a detailed description of your property..."
                    }
                    rows={5}
                    required
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? 'تفاصيل العقار' : 'Property Details'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="max_guests">
                      {language === 'ar' ? 'عدد الضيوف الأقصى' : 'Maximum Guests'}
                    </Label>
                    <Input
                      id="max_guests"
                      name="max_guests"
                      type="number"
                      min="1"
                      value={formData.max_guests}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bedrooms">
                      {language === 'ar' ? 'عدد غرف النوم' : 'Bedrooms'}
                    </Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bathrooms">
                      {language === 'ar' ? 'عدد دورات المياه' : 'Bathrooms'}
                    </Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? 'التسعير' : 'Pricing'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_per_night_usd">
                      {language === 'ar' ? 'السعر بالدولار (لليلة) *' : 'Price in USD (per night) *'}
                    </Label>
                    <Input
                      id="price_per_night_usd"
                      name="price_per_night_usd"
                      type="number"
                      min="1"
                      value={formData.price_per_night_usd}
                      onChange={handleInputChange}
                      placeholder="$50"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price_per_night_syp">
                      {language === 'ar' ? 'السعر بالليرة السورية (اختياري)' : 'Price in SYP (optional)'}
                    </Label>
                    <Input
                      id="price_per_night_syp"
                      name="price_per_night_syp"
                      type="number"
                      min="1"
                      value={formData.price_per_night_syp}
                      onChange={handleInputChange}
                      placeholder="500000"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? 'المرافق' : 'Amenities'}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={formData.amenities.includes(amenity.value)}
                        onCheckedChange={(checked) => 
                          handleAmenityChange(amenity.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={amenity.id} className="cursor-pointer">
                        {language === 'ar' ? amenity.label : amenity.value}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? 'صور العقار' : 'Property Images'}
                </h3>
                
                <ImageUpload
                  existingImages={formData.images}
                  onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                  maxImages={10}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="min-w-[150px]"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditListing;
