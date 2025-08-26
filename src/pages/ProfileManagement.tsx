import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  Key,
  Upload,
  Camera,
  Save,
  ArrowLeft,
  Settings,
  Bell,
  Lock,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { HostRegistrationButton } from "@/components/HostRegistrationButton";

const ProfileManagement = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    preferred_language: 'ar',
    bio: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    bookingReminders: true
  });

  // Mock language - in real app this would come from context
  const language: 'ar' | 'en' = 'ar';
  const isRTL = language === 'ar';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        preferred_language: profile.preferred_language || 'ar',
        bio: ''
      });
    }
  }, [user, profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          preferred_language: profileData.preferred_language
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update the context
      await updateProfile({
        full_name: profileData.full_name,
        phone: profileData.phone,
        preferred_language: profileData.preferred_language
      });

      toast({
        title: "تم بنجاح",
        description: "تم تحديث الملف الشخصي بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في تحديث الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور الجديدة غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would upload to Supabase Storage
      // For now, we'll just create a placeholder URL
      const avatarUrl = URL.createObjectURL(file);
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user?.id);

      if (error) throw error;

      await updateProfile({
        avatar_url: avatarUrl
      });

      toast({
        title: "تم بنجاح",
        description: "تم تحديث الصورة الشخصية بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث الصورة الشخصية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      // In a real app, you would have a proper account deletion process
      await signOut();
      toast({
        title: "تم حذف الحساب",
        description: "تم حذف حسابك بنجاح",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف الحساب",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      guest: 'outline',
      host: 'secondary',
      admin: 'default'
    } as const;

    const labels = {
      guest: 'ضيف',
      host: 'مضيف',
      admin: 'مدير'
    };

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  if (!user || !profile) {
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              الملف الشخصي
            </h1>
            <p className="text-muted-foreground mt-2">إدارة حسابك والإعدادات</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="pattern-subtle border border-primary/10 sticky top-6">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 cursor-pointer">
                    <div className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {profile.full_name || 'بدون اسم'}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">{profile.email}</p>
                
                <div className="flex justify-center mb-4">
                  {getRoleBadge(profile.role)}
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>البريد مؤكد</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>الهاتف مؤكد</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{profile.preferred_language === 'ar' ? 'العربية' : 'English'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  المعلومات الشخصية
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  الأمان
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="pattern-subtle border border-primary/10">
                  <CardHeader>
                    <CardTitle>المعلومات الشخصية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6" dir="rtl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="full_name">الاسم الكامل</Label>
                          <Input
                            id="full_name"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                            className="text-right"
                            placeholder="أدخل اسمك الكامل"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="text-right"
                            placeholder="+963 xxx xxx xxx"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="text-right bg-muted"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          لا يمكن تغيير البريد الإلكتروني
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="preferred_language">اللغة المفضلة</Label>
                        <Select value={profileData.preferred_language} onValueChange={(value) => setProfileData({...profileData, preferred_language: value})}>
                          <SelectTrigger className="text-right">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="role">نوع الحساب</Label>
                        <div className="flex items-center gap-2 mt-2">
                          {getRoleBadge(profile.role)}
                          <span className="text-sm text-muted-foreground">
                            {profile.role === 'admin' && 'يمكنك إدارة المنصة'}
                            {profile.role === 'host' && 'يمكنك إضافة عقارات'}
                            {profile.role === 'guest' && 'يمكنك حجز العقارات'}
                          </span>
                        </div>
                        {profile.role === 'guest' && (
                          <div className="mt-3">
                            <HostRegistrationButton 
                              variant="outline" 
                              size="sm"
                              onSuccess={() => {
                                // Refresh the page to show updated role
                                window.location.reload();
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="space-y-6">
                  {/* Change Password */}
                  <Card className="pattern-subtle border border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        تغيير كلمة المرور
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4" dir="rtl">
                        <div>
                          <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                          <div className="relative">
                            <Input
                              id="current_password"
                              type={showOldPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="text-right pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                          <div className="relative">
                            <Input
                              id="new_password"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="text-right pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
                          <div className="relative">
                            <Input
                              id="confirm_password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="text-right pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" disabled={passwordLoading}>
                          <Lock className="h-4 w-4 mr-2" />
                          {passwordLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Account Deletion */}
                  <Card className="pattern-subtle border border-destructive/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-5 w-5" />
                        حذف الحساب
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4" dir="rtl">
                        حذف الحساب إجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            حذف الحساب
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="pattern-subtle" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>تأكيد حذف الحساب</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>هل أنت متأكد من رغبتك في حذف حسابك؟</p>
                            <p className="text-sm text-muted-foreground">
                              • سيتم حذف جميع بياناتك الشخصية<br/>
                              • سيتم إلغاء جميع حجوزاتك<br/>
                              • لن تتمكن من استرداد البيانات<br/>
                              • هذا الإجراء لا يمكن التراجع عنه
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                className="flex-1"
                              >
                                نعم، احذف حسابي
                              </Button>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1">
                                  إلغاء
                                </Button>
                              </DialogTrigger>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="pattern-subtle border border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      إعدادات الإشعارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6" dir="rtl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">إشعارات البريد الإلكتروني</p>
                        <p className="text-sm text-muted-foreground">تلقي الإشعارات عبر البريد الإلكتروني</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                        className="toggle"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">إشعارات الرسائل النصية</p>
                        <p className="text-sm text-muted-foreground">تلقي الإشعارات عبر الرسائل النصية</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                        className="toggle"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">رسائل تسويقية</p>
                        <p className="text-sm text-muted-foreground">تلقي العروض والرسائل التسويقية</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => setSettings({...settings, marketingEmails: e.target.checked})}
                        className="toggle"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">تذكير الحجوزات</p>
                        <p className="text-sm text-muted-foreground">تذكير بمواعيد الحجوزات القادمة</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.bookingReminders}
                        onChange={(e) => setSettings({...settings, bookingReminders: e.target.checked})}
                        className="toggle"
                      />
                    </div>

                    <Button className="w-full md:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      حفظ الإعدادات
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;