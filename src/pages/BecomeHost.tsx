import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useHostUpgrade } from "@/hooks/useHostUpgrade";
import { Home, Users, DollarSign, Shield, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BecomeHost = () => {
  const [motivation, setMotivation] = useState("");
  const { user, profile, refreshProfile } = useAuth();
  const { isLoading, upgradeToHost } = useHostUpgrade();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast({
        title: language === 'ar' ? "المصادقة مطلوبة" : "Authentication Required",
        description: language === 'ar' ? "يرجى تسجيل الدخول لتصبح مضيفاً." : "Please log in to become a host.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (profile.role === "host") {
      toast({
        title: language === 'ar' ? "أنت مضيف بالفعل" : "Already a Host",
        description: language === 'ar' ? "أنت مسجل بالفعل كمضيف!" : "You are already registered as a host!",
      });
      navigate("/host-dashboard");
      return;
    }

    try {
      // Use the hook to request host upgrade
      const result = await upgradeToHost();

      if (result.success) {
        // Successfully upgraded to host
        // Refresh profile to get updated role
        await refreshProfile();

        toast({
          title: language === 'ar' ? "مرحباً بك في الاستضافة!" : "Welcome to Hosting!",
          description: language === 'ar' ? "أنت الآن مضيف. ابدأ بإضافة عقارك الأول!" : "You are now a host. Start adding your first listing!",
        });

        navigate("/host-dashboard");
      } else {
        // Upgrade failed
        toast({
          title: language === 'ar' ? "فشل الترقية" : "Upgrade Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error becoming host:", error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في التسجيل كمضيف. يرجى المحاولة مرة أخرى." : "Failed to register as host. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>
              {language === 'ar' ? 'المصادقة مطلوبة' : 'Authentication Required'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'يرجى تسجيل الدخول لتصبح مضيفاً' : 'Please log in to become a host'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.role === "host") {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>
              {language === 'ar' ? 'أنت مضيف بالفعل!' : 'Already a Host!'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'أنت مسجل بالفعل كمضيف' : "You're already registered as a host"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/host-dashboard")} className="w-full">
              {language === 'ar' ? 'اذهب إلى لوحة المضيف' : 'Go to Host Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {language === 'ar' ? 'كن مضيفاً' : 'Become a Host'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === 'ar' 
                ? 'شارك مساحتك واكسب المال بينما تساعد المسافرين على اكتشاف أماكن مذهلة'
                : 'Share your space and earn money while helping travelers discover amazing places'
              }
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {language === 'ar' ? 'أدرج مساحتك' : 'List Your Space'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'شارك منزلك أو شقتك أو غرفتك مع المسافرين'
                    : 'Share your home, apartment, or room with travelers'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {language === 'ar' ? 'اكسب المال' : 'Earn Money'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'حدد أسعارك الخاصة واكسب من عقارك'
                    : 'Set your own prices and earn from your listing'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {language === 'ar' ? 'تعرف على أشخاص' : 'Meet People'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'تواصل مع المسافرين من جميع أنحاء العالم'
                    : 'Connect with travelers from around the world'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {language === 'ar' ? 'منصة آمنة' : 'Secure Platform'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'مدفوعات محمية وضيوف موثقون'
                    : 'Protected payments and verified guests'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'مستعد للبدء؟' : 'Ready to Get Started?'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'انضم إلى مجتمع المضيفين لدينا وابدأ بمشاركة مساحتك اليوم'
                  : 'Join our community of hosts and start sharing your space today'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' 
                      ? 'لماذا تريد أن تصبح مضيفاً؟ (اختياري)'
                      : 'Why do you want to become a host? (Optional)'
                    }
                  </label>
                  <Textarea
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder={language === 'ar' 
                      ? 'أخبرنا ما الذي يحفزك لمشاركة مساحتك...'
                      : 'Tell us what motivates you to share your space...'
                    }
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading 
                      ? (language === 'ar' ? "جاري المعالجة..." : "Processing...") 
                      : (language === 'ar' ? "كن مضيفاً" : "Become a Host")
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'بأن تصبح مضيفاً، فإنك توافق على' : 'By becoming a host, you agree to our'}{" "}
              <a href="/terms" className="text-primary hover:underline">
                {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
              </a>{" "}
              {language === 'ar' ? 'و' : 'and'}{" "}
              <a href="/guidelines" className="text-primary hover:underline">
                {language === 'ar' ? 'إرشادات العقارات' : 'Listing Guidelines'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeHost;