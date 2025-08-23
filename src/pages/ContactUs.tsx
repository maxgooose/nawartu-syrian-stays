import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Instagram, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactUs = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>('en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: language === 'ar' ? "تم إرسال الرسالة" : "Message Sent",
        description: language === 'ar' 
          ? "شكراً لتواصلكم معنا. سنرد عليكم قريباً."
          : "Thank you for contacting us. We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container-custom py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'نحن هنا لمساعدتك. تواصل معنا لأي استفسار أو مساعدة تحتاجها.'
                : "We're here to help. Reach out to us for any questions or assistance you need."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-6">
                  {language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
                </h2>
                <div className="space-y-6">
                  {/* Email */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                          </h3>
                          <a 
                            href="mailto:info@nawartu.com" 
                            className="text-primary hover:underline"
                          >
                            info@nawartu.com
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* WhatsApp */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <MessageCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {language === 'ar' ? 'واتساب' : 'WhatsApp Support'}
                          </h3>
                          <a 
                            href="https://wa.me/19296679792" 
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            +1 (929) 667-9792
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phone */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {language === 'ar' ? 'أرقام الهاتف' : 'Phone Numbers'}
                          </h3>
                          <div className="space-y-1">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? 'سوريا:' : 'Syria:'}
                              </p>
                              <a 
                                href="tel:+963969864741" 
                                className="text-primary hover:underline"
                              >
                                +963 969 864 741
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {language === 'ar' ? 'العنوان' : 'Address'}
                          </h3>
                          <p className="text-muted-foreground">
                            {language === 'ar' 
                              ? 'دمشق، الجمهورية العربية السورية'
                              : 'Damascus, Syrian Arab Republic'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Hours */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {language === 'ar' ? 'ساعات العمل' : 'Business Hours'}
                          </h3>
                          <div className="space-y-1 text-muted-foreground">
                            <p>
                              {language === 'ar' 
                                ? 'الأحد - الخميس: 9:00 - 18:00'
                                : 'Sunday - Thursday: 9:00 AM - 6:00 PM'
                              }
                            </p>
                            <p>
                              {language === 'ar' 
                                ? 'الجمعة - السبت: 10:00 - 16:00'
                                : 'Friday - Saturday: 10:00 AM - 4:00 PM'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Media */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-foreground">
                          {language === 'ar' ? 'تابعونا على وسائل التواصل' : 'Follow Us on Social Media'}
                        </h3>
                        <div className="flex gap-4">
                          <a 
                            href="https://instagram.com/nawartuofficial" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Instagram className="h-5 w-5" />
                            <span className="text-sm font-medium">Instagram</span>
                          </a>
                          <a 
                            href="https://tiktok.com/@nawartu" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Music className="h-5 w-5" />
                            <span className="text-sm font-medium">TikTok</span>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    {language === 'ar' ? 'أرسل لنا رسالة' : 'Send us a Message'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === 'ar' ? 'الاسم' : 'Full Name'}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                        required
                        className={isRTL ? 'text-right' : ''}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                        required
                        className={isRTL ? 'text-right' : ''}
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        {language === 'ar' ? 'الموضوع' : 'Subject'}
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder={language === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                        required
                        className={isRTL ? 'text-right' : ''}
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {language === 'ar' ? 'الرسالة' : 'Message'}
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                        className={`min-h-[120px] ${isRTL ? 'text-right' : ''}`}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'
                      ) : (
                        <>
                          <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;