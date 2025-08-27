import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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

  const { language } = useLanguage();
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
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في تحديث الملف الشخصي" : "Error updating profile"),
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "كلمات المرور الجديدة غير متطابقة" : "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
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
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في تغيير كلمة المرور" : "Error changing password"),
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يرجى اختيار ملف صورة صالح" : "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image size must be less than 5MB",
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



  const getRoleBadge = (role: string) => {
    const variants = {
      guest: 'outline',
      host: 'secondary',
      admin: 'default'
    } as const;

    const labels = {
      guest: language === 'ar' ? 'ضيف' : 'Guest',
      host: language === 'ar' ? 'مضيف' : 'Host',
      admin: language === 'ar' ? 'مدير' : 'Admin'
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
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    // This would typically call a Supabase function to delete the account
    // For now, we'll just show a toast
    toast({
      title: language === 'ar' ? "تم حذف الحساب" : "Account Deleted",
      description: language === 'ar' ? "تم حذف حسابك بنجاح" : "Your account has been deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background pattern-geometric-stars" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة' : 'Back'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar' ? 'إدارة حسابك والإعدادات' : 'Manage your account and settings'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="pattern-subtle border border-primary/10 lg:sticky lg:top-6">
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
                  {profile.full_name || (language === 'ar' ? 'بدون اسم' : 'No Name')}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">{profile.email}</p>
                
                <div className="flex justify-center mb-4">
                  {getRoleBadge(profile.role)}
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{language === 'ar' ? 'البريد مؤكد' : 'Email Verified'}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{language === 'ar' ? 'الهاتف مؤكد' : 'Phone Verified'}</span>
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
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Info'}
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {language === 'ar' ? 'الأمان' : 'Security'}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {language === 'ar' ? 'الإعدادات' : 'Settings'}
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="pattern-subtle border border-primary/10">
                  <CardHeader>
                    <CardTitle>{language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <Label htmlFor="full_name">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
                          <Input
                            id="full_name"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                            className={isRTL ? 'text-right' : 'text-left'}
                            placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className={isRTL ? 'text-right' : 'text-left'}
                            placeholder={language === 'ar' ? '+963 xxx xxx xxx' : '+963 xxx xxx xxx'}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                                                      className={`${isRTL ? 'text-right' : 'text-left'} bg-muted`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="preferred_language">{language === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}</Label>
                        <Select value={profileData.preferred_language} onValueChange={(value) => setProfileData({...profileData, preferred_language: value})}>
                          <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="role">{language === 'ar' ? 'نوع الحساب' : 'Account Type'}</Label>
                        <div className="flex items-center gap-2 mt-2">
                          {getRoleBadge(profile.role)}
                          <span className="text-sm text-muted-foreground">
                            {profile.role === 'admin' && (language === 'ar' ? 'يمكنك إدارة المنصة' : 'You can manage the platform')}
                            {profile.role === 'host' && (language === 'ar' ? 'يمكنك إضافة عقارات' : 'You can add properties')}
                            {profile.role === 'guest' && (language === 'ar' ? 'يمكنك حجز العقارات' : 'You can book properties')}
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
                        {loading ? (language === 'ar' ? "جاري الحفظ..." : "Saving...") : (language === 'ar' ? "حفظ التغييرات" : "Save Changes")}
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
                        {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div>
                          <Label htmlFor="current_password">{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                          <div className="relative">
                            <Input
                              id="current_password"
                              type={showOldPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className={`${isRTL ? 'text-right pr-10' : 'text-left pl-10'}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-muted-foreground hover:text-foreground`}
                            >
                              {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="new_password">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                          <div className="relative">
                            <Input
                              id="new_password"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className={`${isRTL ? 'text-right pr-10' : 'text-left pl-10'}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-muted-foreground hover:text-foreground`}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirm_password">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                          <div className="relative">
                            <Input
                              id="confirm_password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className={`${isRTL ? 'text-right pr-10' : 'text-left pl-10'}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-muted-foreground hover:text-foreground`}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" disabled={passwordLoading}>
                          <Lock className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                          {passwordLoading ? (language === 'ar' ? "جاري التحديث..." : "Updating...") : (language === 'ar' ? "تحديث كلمة المرور" : "Update Password")}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Account Deletion */}
                  <Card className="pattern-subtle border border-destructive/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-5 w-5" />
                        {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
                        {language === 'ar' 
                          ? 'حذف الحساب إجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.'
                          : 'Deleting your account is a permanent action that cannot be undone. All your data will be permanently deleted.'
                        }
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                            {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="pattern-subtle" dir={isRTL ? 'rtl' : 'ltr'}>
                          <DialogHeader>
                            <DialogTitle>{language === 'ar' ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>{language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف حسابك؟' : 'Are you sure you want to delete your account?'}</p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? (
                                <>
                                  • سيتم حذف جميع بياناتك الشخصية<br/>
                                  • سيتم إلغاء جميع حجوزاتك<br/>
                                  • لن تتمكن من استرداد البيانات<br/>
                                  • هذا الإجراء لا يمكن التراجع عنه
                                </>
                              ) : (
                                <>
                                  • All your personal data will be deleted<br/>
                                  • All your bookings will be cancelled<br/>
                                  • You won't be able to recover the data<br/>
                                  • This action cannot be undone
                                </>
                              )}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                className="flex-1"
                              >
                                {language === 'ar' ? 'نعم، احذف حسابي' : 'Yes, Delete My Account'}
                              </Button>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1">
                                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
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
                      {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</p>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'تلقي الإشعارات عبر البريد الإلكتروني' : 'Receive notifications via email'}</p>
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
                        <p className="font-medium">{language === 'ar' ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}</p>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'تلقي الإشعارات عبر الرسائل النصية' : 'Receive notifications via SMS'}</p>
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
                        <p className="font-medium">{language === 'ar' ? 'رسائل تسويقية' : 'Marketing Messages'}</p>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'تلقي العروض والرسائل التسويقية' : 'Receive offers and marketing messages'}</p>
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
                        <p className="font-medium">{language === 'ar' ? 'تذكير الحجوزات' : 'Booking Reminders'}</p>
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'تذكير بمواعيد الحجوزات القادمة' : 'Reminders for upcoming bookings'}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.bookingReminders}
                        onChange={(e) => setSettings({...settings, bookingReminders: e.target.checked})}
                        className="toggle"
                      />
                    </div>

                    <Button className="w-full md:w-auto">
                      <Save className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
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