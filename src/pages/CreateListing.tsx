import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Upload, MapPin, Home, Users, Bed, Bath, DollarSign, MessageCircle, Phone } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import GoogleMap from "@/components/GoogleMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageUpload } from "@/components/ImageUpload";
import { AMENITIES, getAmenityLabel } from "@/lib/amenities";
import { getPublicImageUrl } from "@/lib/utils";

const CreateListing = () => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    price_per_night_usd: '',
    price_per_night_syp: '',
    max_guests: '2',
    bedrooms: '1',
    bathrooms: '1',
    amenities: [] as string[],
    images: [] as string[],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || profile?.role !== 'host') {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يجب أن تكون مضيفاً لإضافة عقار" : "You must be a host to add a property",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sanitize images: drop any blob: entries and normalize keys to public URLs
      const sanitizedImages = (formData.images || [])
        .map((img) => getPublicImageUrl(img) || '')
        .filter((u) => !!u);

      const { error } = await supabase
        .from('listings')
        .insert({
          host_id: profile.id,
          name: formData.name,
          description: formData.description,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          price_per_night_usd: parseFloat(formData.price_per_night_usd),
          price_per_night_syp: formData.price_per_night_syp ? parseFloat(formData.price_per_night_syp) : null,
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          amenities: formData.amenities,
          images: sanitizedImages,
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
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم إضافة العقار بنجاح وهو قيد المراجعة. تم إرسال تأكيد على بريدك الإلكتروني." : "Property added successfully and is under review. A confirmation has been sent to your email.",
      });

      navigate('/host-dashboard');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في إضافة العقار" : "An error occurred while adding the property"),
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
            {language === 'ar' ? 'العودة للوحة المضيف' : 'Back to Host Dashboard'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Home className="h-6 w-6" />
              {language === 'ar' ? 'إضافة عقار جديد' : 'Add New Property'}
            </CardTitle>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'أضف تفاصيل عقارك لبدء استقبال الضيوف' 
                : 'Add your property details to start hosting guests'
              }
            </p>
          </CardHeader>
          <CardContent>
            {/* WhatsApp Contact Option */}
            <Alert className="mb-6 border-primary/20 bg-primary/5">
              <MessageCircle className="h-4 w-4" />
              <AlertDescription className="w-full">
                <div className="flex flex-col gap-4 w-full">
                  <div>
                    <p className="font-medium mb-1">
                      {language === 'ar' 
                        ? 'تفضل المساعدة المباشرة؟' 
                        : 'Prefer direct assistance?'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'يمكن لفريقنا إضافة عقارك نيابة عنك - تواصل معنا عبر واتساب' 
                        : 'Our team can add your property for you - contact us on WhatsApp'
                      }
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full overflow-hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex items-center justify-center gap-2 w-full sm:flex-1 min-w-0 text-sm"
                    >
                      <a
                        href={`https://wa.me/19296679792?text=${encodeURIComponent(
                          language === 'ar' 
                            ? 'مرحباً، أرغب في المساعدة لإضافة عقاري إلى منصة نورتوا'
                            : 'Hello, I would like help adding my property to the Nawartu platform'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full"
                      >
                        <MessageCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{language === 'ar' ? 'واتساب US' : 'WhatsApp US'}</span>
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex items-center justify-center gap-2 w-full sm:flex-1 min-w-0 text-sm"
                    >
                      <a
                        href={`https://wa.me/963969864741?text=${encodeURIComponent(
                          language === 'ar' 
                            ? 'مرحباً، أرغب في المساعدة لإضافة عقاري إلى منصة نورتوا'
                            : 'Hello, I would like help adding my property to the Nawartu platform'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full"
                      >
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{language === 'ar' ? 'واتساب سوريا' : 'WhatsApp Syria'}</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{language === 'ar' ? 'اسم العقار *' : 'Property Name *'}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={language === 'ar' ? 'مثال: شقة فاخرة في وسط المدينة' : 'Example: Luxury apartment in city center'}
                      required
                    />
                  </div>
                  
                  <div>
                    <LocationAutocomplete
                      onLocationSelect={(location) => {
                        setFormData(prev => ({
                          ...prev,
                          location: location.address,
                          latitude: location.lat,
                          longitude: location.lng
                        }));
                      }}
                      defaultValue={formData.location}
                      placeholder={language === 'ar' ? 'البحث عن الموقع...' : 'Search for location...'}
                      label={language === 'ar' ? 'الموقع *' : 'Location *'}
                      language={language as 'ar' | 'en'}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'ar' 
                        ? 'ابحث عن العنوان الكامل للعقار وحدد الموقع على الخريطة' 
                        : 'Search for the complete property address and select location on map'}
                    </p>

                    {/* Map Preview */}
                    {formData.latitude && formData.longitude && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">
                          {language === 'ar' ? 'موقع العقار على الخريطة' : 'Property Location on Map'}
                        </Label>
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          <GoogleMap
                            lat={formData.latitude}
                            lng={formData.longitude}
                            zoom={15}
                            height="200px"
                            markers={[{
                              lat: formData.latitude,
                              lng: formData.longitude,
                              title: formData.name || 'موقع العقار',
                              info: formData.location
                            }]}
                            enableGeocoding={true}
                            onLocationSelect={(lat, lng, address) => {
                              setFormData(prev => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng,
                                location: address || prev.location
                              }));
                            }}
                            clickable={true}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'ar' 
                            ? 'يمكنك النقر على الخريطة لضبط الموقع بدقة أكبر' 
                            : 'Click on the map to adjust the location more precisely'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{language === 'ar' ? 'الوصف *' : 'Description *'}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'اكتب وصفاً جذاباً لعقارك...' : 'Write an attractive description of your property...'}
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === 'ar' ? 'تفاصيل العقار' : 'Property Details'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="max_guests">{language === 'ar' ? 'عدد الضيوف الأقصى *' : 'Max Guests *'}</Label>
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
                    <Label htmlFor="bedrooms">{language === 'ar' ? 'عدد غرف النوم' : 'Bedrooms'}</Label>
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
                    <Label htmlFor="bathrooms">{language === 'ar' ? 'عدد الحمامات' : 'Bathrooms'}</Label>
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
                  {language === 'ar' ? 'التسعير' : 'Pricing'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_per_night_usd">{language === 'ar' ? 'السعر بالدولار/ليلة *' : 'Price in USD/night *'}</Label>
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
                    <Label htmlFor="price_per_night_syp">{language === 'ar' ? 'السعر بالليرة السورية/ليلة' : 'Price in Syrian Pounds/night'}</Label>
                    <Input
                      id="price_per_night_syp"
                      name="price_per_night_syp"
                      type="number"
                      min="0"
                      value={formData.price_per_night_syp}
                      onChange={handleInputChange}
                      placeholder={language === 'ar' ? 'اختياري' : 'Optional'}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{language === 'ar' ? 'الخدمات والمرافق' : 'Amenities & Facilities'}</h3>
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
                        {getAmenityLabel(amenity.value, language)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {language === 'ar' ? 'صور العقار' : 'Property Images'}
                </h3>
                <ImageUpload
                  onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                  existingImages={formData.images}
                  maxImages={10}
                  bucketName="property-images"
                  folder="listings"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/host-dashboard')}
                  className="flex-1"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading 
                    ? (language === 'ar' ? "جاري الحفظ..." : "Saving...") 
                    : (language === 'ar' ? "إضافة العقار" : "Add Property")
                  }
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