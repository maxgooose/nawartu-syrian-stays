import React, { useState } from "react";
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
import { ArrowRight, Upload, MapPin, Home, Users, Bed, Bath, DollarSign, MessageCircle, Phone, Languages } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";

import { useLanguage } from "@/contexts/LanguageContext";
import { ImageUpload } from "@/components/ImageUpload";
import { AMENITIES, getAmenityLabel } from "@/lib/amenities";
import { getPublicImageUrl } from "@/lib/utils";
import SyrianGovernorateDropdown from "@/components/SyrianGovernorateDropdown";
import { SyrianGovernorate } from "@/lib/syrianGovernorates";
import { translateText } from "@/lib/autoTranslation";

const CreateListing = () => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  // Redirect non-hosts to become host page
  React.useEffect(() => {
    if (!user) {
      toast({
        title: language === 'ar' ? "تسجيل الدخول مطلوب" : "Sign In Required",
        description: language === 'ar' ? "يجب تسجيل الدخول لإضافة عقار" : "Please sign in to add a listing",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (profile && profile.role !== 'host') {
      toast({
        title: language === 'ar' ? "ترقية مطلوبة" : "Host Upgrade Required",
        description: language === 'ar' ? "يجب أن تصبح مضيفاً أولاً" : "You need to become a host first",
      });
      navigate('/become-host');
      return;
    }
  }, [user, profile, navigate, toast, language]);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    location_en: '',
    location_ar: '',
    latitude: null as number | null,
    longitude: null as number | null,
    governorate: null as SyrianGovernorate | null,
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

  // Auto-translate missing fields
  const handleAutoTranslate = async () => {
    setTranslating(true);
    try {
      const updates: any = {};

      // Translate name
      if (formData.name_en && !formData.name_ar) {
        updates.name_ar = await translateText(formData.name_en, 'ar', 'en');
      } else if (formData.name_ar && !formData.name_en) {
        updates.name_en = await translateText(formData.name_ar, 'en', 'ar');
      }

      // Translate description
      if (formData.description_en && !formData.description_ar) {
        updates.description_ar = await translateText(formData.description_en, 'ar', 'en');
      } else if (formData.description_ar && !formData.description_en) {
        updates.description_en = await translateText(formData.description_ar, 'en', 'ar');
      }

      // Translate location
      if (formData.location_en && !formData.location_ar) {
        updates.location_ar = await translateText(formData.location_en, 'ar', 'en');
      } else if (formData.location_ar && !formData.location_en) {
        updates.location_en = await translateText(formData.location_ar, 'en', 'ar');
      }

      setFormData(prev => ({ ...prev, ...updates }));
      
      toast({
        title: language === 'ar' ? "تمت الترجمة" : "Translation Complete",
        description: language === 'ar' 
          ? "تمت ترجمة الحقول الفارغة تلقائياً" 
          : "Empty fields have been auto-translated",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: language === 'ar' ? "خطأ في الترجمة" : "Translation Error",
        description: language === 'ar' 
          ? "حدث خطأ أثناء الترجمة التلقائية" 
          : "An error occurred during auto-translation",
        variant: "destructive",
      });
    } finally {
      setTranslating(false);
    }
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
    
    if (!user) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يجب تسجيل الدخول أولاً" : "Please sign in first",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (profile?.role !== 'host') {
      toast({
        title: language === 'ar' ? "ترقية مطلوبة" : "Host Upgrade Required",
        description: language === 'ar' ? "يجب أن تصبح مضيفاً أولاً لإضافة عقار" : "You need to become a host first to add a listing",
        variant: "destructive",
      });
      navigate('/become-host');
      return;
    }

    setLoading(true);

    try {
      // Auto-translate missing fields before submission
      let finalFormData = { ...formData };
      
      // Check and translate missing fields
      if (finalFormData.name_en && !finalFormData.name_ar) {
        finalFormData.name_ar = await translateText(finalFormData.name_en, 'ar', 'en');
      } else if (finalFormData.name_ar && !finalFormData.name_en) {
        finalFormData.name_en = await translateText(finalFormData.name_ar, 'en', 'ar');
      }

      if (finalFormData.description_en && !finalFormData.description_ar) {
        finalFormData.description_ar = await translateText(finalFormData.description_en, 'ar', 'en');
      } else if (finalFormData.description_ar && !finalFormData.description_en) {
        finalFormData.description_en = await translateText(finalFormData.description_ar, 'en', 'ar');
      }

      if (finalFormData.location_en && !finalFormData.location_ar) {
        finalFormData.location_ar = await translateText(finalFormData.location_en, 'ar', 'en');
      } else if (finalFormData.location_ar && !finalFormData.location_en) {
        finalFormData.location_en = await translateText(finalFormData.location_ar, 'en', 'ar');
      }

      // Sanitize images: drop any blob: entries and normalize keys to public URLs
      const sanitizedImages = (finalFormData.images || [])
        .map((img) => getPublicImageUrl(img) || '')
        .filter((u) => !!u);

      const { error } = await supabase
        .from('listings')
        .insert({
          host_id: profile.id,
          name_en: finalFormData.name_en,
          name_ar: finalFormData.name_ar,
          description_en: finalFormData.description_en,
          description_ar: finalFormData.description_ar,
          location_en: finalFormData.location_en,
          location_ar: finalFormData.location_ar,
          // Mark auto-translated fields
          name_en_auto_translated: formData.name_en ? false : true,
          name_ar_auto_translated: formData.name_ar ? false : true,
          description_en_auto_translated: formData.description_en ? false : true,
          description_ar_auto_translated: formData.description_ar ? false : true,
          location_en_auto_translated: formData.location_en ? false : true,
          location_ar_auto_translated: formData.location_ar ? false : true,
          // Keep backward compatibility
          name: finalFormData.name_ar || finalFormData.name_en,
          description: finalFormData.description_ar || finalFormData.description_en,
          location: finalFormData.location_ar || finalFormData.location_en,
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
            listingName: formData.name_ar || formData.name_en,
            listingLocation: formData.location_ar || formData.location_en,
            listingId: `${Date.now()}` // Simple ID for reference
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the listing creation if email fails
      }

      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم إضافة العقار بنجاح وهو قيد المراجعة. تم إرسال تأكيد على بريدك الإلكتروني." : "Listing added successfully and is under review. A confirmation has been sent to your email.",
      });

      navigate('/host-dashboard');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في إضافة العقار" : "An error occurred while adding the listing"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (!user || !profile) {
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
            <ArrowRight className="h-4 w-4" />
            {language === 'ar' ? 'العودة للوحة المضيف' : 'Back to Host Dashboard'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Home className="h-6 w-6" />
              {language === 'ar' ? 'إضافة عقار جديد' : 'Add New Listing'}
            </CardTitle>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'أضف تفاصيل عقارك لبدء استقبال الضيوف' 
                : 'Add your listing details to start hosting guests'
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
                        : 'Our team can add your listing for you - contact us on WhatsApp'
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
                        href={`https://wa.me/963969864741?text=${encodeURIComponent(
                          language === 'ar' 
                            ? 'مرحباً، أرغب في المساعدة لإضافة عقاري إلى منصة نورتوا'
                            : 'Hello, I would like help adding my listing to the Nawartu platform'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full"
                      >
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
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
                  {/* Bilingual Name Fields */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        {language === 'ar' ? 'اسم العقار (يمكن إدخاله بلغة واحدة) *' : 'Listing Name (Can be entered in one language) *'}
                      </h4>
                      {((formData.name_en && !formData.name_ar) || (formData.name_ar && !formData.name_en)) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAutoTranslate}
                          disabled={translating}
                          className="flex items-center gap-2"
                        >
                          <Languages className="h-4 w-4" />
                          {translating 
                            ? (language === 'ar' ? 'جاري الترجمة...' : 'Translating...') 
                            : (language === 'ar' ? 'ترجمة تلقائية' : 'Auto-translate')
                          }
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name_en" className="text-sm">
                          {language === 'ar' ? 'الاسم بالإنجليزية' : 'Name in English'}
                        </Label>
                        <Input
                          id="name_en"
                          name="name_en"
                          value={formData.name_en}
                          onChange={handleInputChange}
                          placeholder="Example: Luxury apartment in city center"
                          dir="ltr"
                          className="text-left"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name_ar" className="text-sm">
                          {language === 'ar' ? 'الاسم بالعربية' : 'Name in Arabic'}
                        </Label>
                        <Input
                          id="name_ar"
                          name="name_ar"
                          value={formData.name_ar}
                          onChange={handleInputChange}
                          placeholder="مثال: شقة فاخرة في وسط المدينة"
                          dir="rtl"
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <SyrianGovernorateDropdown
                      onGovernorateSelect={(governorate) => {
                        setFormData(prev => ({
                          ...prev,
                          governorate: governorate,
                          latitude: governorate.latitude,
                          longitude: governorate.longitude,
                          // Set bilingual location with governorate info
                          location_en: `${governorate.nameEn}, ${governorate.majorCities[0]}`,
                          location_ar: `${governorate.nameAr}, ${governorate.majorCities[0]}`
                        }));
                      }}
                      selectedGovernorate={formData.governorate}
                      label={language === 'ar' ? 'المحافظة *' : 'Governorate *'}
                      placeholder={language === 'ar' ? 'اختر محافظة العقار...' : 'Select property governorate...'}
                      adaptToHostLocation={false}
                      required={true}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'ar' 
                        ? 'اختر المحافظة التي يقع فيها العقار' 
                        : 'Select the governorate where the property is located'}
                    </p>
                  </div>
                  
                  {/* Bilingual Location Fields */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'العنوان التفصيلي (يمكن إدخاله بلغة واحدة) *' : 'Detailed Address (Can be entered in one language) *'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location_en" className="text-sm">
                          {language === 'ar' ? 'العنوان بالإنجليزية' : 'Address in English'}
                        </Label>
                        <Input
                          id="location_en"
                          name="location_en"
                          value={formData.location_en}
                          onChange={handleInputChange}
                          placeholder="Example: Malki, Jalaa Street, No. 15"
                          dir="ltr"
                          className="text-left"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location_ar" className="text-sm">
                          {language === 'ar' ? 'العنوان بالعربية' : 'Address in Arabic'}
                        </Label>
                        <Input
                          id="location_ar"
                          name="location_ar"
                          value={formData.location_ar}
                          onChange={handleInputChange}
                          placeholder="مثال: المالكي، شارع الجلاء، رقم 15"
                          dir="rtl"
                          className="text-right"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' 
                        ? 'يمكنك إدخال العنوان بلغة واحدة وسيتم ترجمته تلقائياً' 
                        : 'You can enter the address in one language and it will be auto-translated'}
                    </p>
                  </div>


                  </div>

                {/* Bilingual Description Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'وصف العقار (يمكن إدخاله بلغة واحدة) *' : 'Listing Description (Can be entered in one language) *'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="description_en" className="text-sm">
                        {language === 'ar' ? 'الوصف بالإنجليزية' : 'Description in English'}
                      </Label>
                      <Textarea
                        id="description_en"
                        name="description_en"
                        value={formData.description_en}
                        onChange={handleInputChange}
                        placeholder="Write an attractive description of your listing..."
                        rows={4}
                        dir="ltr"
                        className="text-left"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description_ar" className="text-sm">
                        {language === 'ar' ? 'الوصف بالعربية' : 'Description in Arabic'}
                      </Label>
                      <Textarea
                        id="description_ar"
                        name="description_ar"
                        value={formData.description_ar}
                        onChange={handleInputChange}
                        placeholder="اكتب وصفاً جذاباً لعقارك..."
                        rows={4}
                        dir="rtl"
                        className="text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Listing Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === 'ar' ? 'تفاصيل العقار' : 'Listing Details'}
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
                  {language === 'ar' ? 'صور العقار' : 'Listing Images'}
                </h3>
                <ImageUpload
                  onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                  existingImages={formData.images}
                  maxImages={10}
                  bucketName="listing-images"
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
                    : (language === 'ar' ? "إضافة العقار" : "Add Listing")
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