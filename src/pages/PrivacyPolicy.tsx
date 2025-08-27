import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { language, handleLanguageChange } = useLanguage();

  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header language={language} onLanguageChange={handleLanguageChange} />
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'ar' ? 'العودة' : 'Go Back'}
            </Button>
          </div>

          <h1 className="text-4xl font-bold text-primary mb-8">
            {language === 'ar' ? 'نوارتو - سياسة الخصوصية' : 'Nawartu – Privacy Policy'}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '1. مقدمة' : '1. Introduction'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar'
                  ? 'في نوارتو، خصوصيتك مهمة. تشرح هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتك الشخصية عند استخدام منصتنا.'
                  : 'At Nawartu, your privacy is important. This policy explains how we collect, use, and protect your personal information when using our platform.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '2. البيانات التي نجمعها' : '2. Data We Collect'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>
                  <strong>{language === 'ar' ? 'معلومات الحساب:' : 'Account Information:'}</strong> 
                  {language === 'ar' ? ' الاسم، البريد الإلكتروني، رقم الهاتف، الهوية (للتأكد من الهوية).' : ' Name, email, phone number, ID (for KYC).'}
                </li>
                <li>
                  <strong>{language === 'ar' ? 'معلومات الحجز:' : 'Booking Information:'}</strong> 
                  {language === 'ar' ? ' تفاصيل العقار، تواريخ الوصول والمغادرة، معلومات الدفع.' : ' Property details, check-in/check-out dates, payment info.'}
                </li>
                <li>
                  <strong>{language === 'ar' ? 'بيانات الاستخدام:' : 'Usage Data:'}</strong> 
                  {language === 'ar' ? ' عنوان IP، نوع الجهاز، نشاط التطبيق، ملفات تعريف الارتباط لتحسين التجربة.' : ' IP address, device type, app activity, cookies for improving experience.'}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '3. كيف نستخدم بياناتك' : '3. How We Use Your Data'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'لتسهيل الحجوزات والمدفوعات بأمان.' : 'To facilitate bookings and payments securely.'}</li>
                <li>{language === 'ar' ? 'للتحقق من الهوية والامتثال للوائح السورية.' : 'To verify identity and comply with Syrian regulations.'}</li>
                <li>{language === 'ar' ? 'لتحسين ميزات المنصة وتجربة المستخدم.' : 'To improve platform features and user experience.'}</li>
                <li>{language === 'ar' ? 'للتواصل مع التحديثات والإشعارات أو العروض الترويجية (إذا تم الاشتراك).' : 'To communicate updates, notifications, or promotional offers (if opted-in).'}</li>
                <li>{language === 'ar' ? 'لمنع الاحتيال أو سوء الاستخدام أو النشاط غير القانوني.' : 'To prevent fraud, abuse, or illegal activity.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '4. مشاركة البيانات' : '4. Data Sharing'}
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                {language === 'ar' ? 'لا يتم بيع البيانات لأطراف ثالثة.' : 'Data is not sold to third parties.'}
              </p>
              <p className="text-foreground leading-relaxed">
                {language === 'ar'
                  ? 'يتم مشاركتها فقط مع مزودي الدفع المرخصين، أو السلطات القانونية إذا لزم الأمر، أو لإنفاذ السياسات.'
                  : 'Shared only with licensed payment providers, legal authorities if required, or to enforce policies.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '5. أمان البيانات' : '5. Data Security'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'يتم تشفير البيانات الشخصية وتخزينها بأمان.' : 'Personal data is encrypted and stored securely.'}</li>
                <li>{language === 'ar' ? 'يقتصر الوصول على الموظفين المصرح لهم فقط.' : 'Access is restricted to authorized staff only.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '6. الاحتفاظ بالبيانات' : '6. Data Retention'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar'
                  ? 'يتم الاحتفاظ بالبيانات طالما أن حسابك نشط أو كما هو مطلوب بموجب القانون. يمكن للمستخدمين طلب حذف الحساب، على الرغم من أن بعض البيانات قد تبقى للامتثال القانوني أو منع الاحتيال.'
                  : 'Data is kept as long as your account is active or as required by law. Users can request account deletion, though some data may remain for legal compliance or fraud prevention.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '7. حقوق المستخدم' : '7. User Rights'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'الوصول إلى المعلومات الشخصية أو تحديثها أو حذفها.' : 'Access, update, or delete personal information.'}</li>
                <li>{language === 'ar' ? 'الانسحاب من الرسائل التسويقية.' : 'Opt out of marketing communications.'}</li>
                <li>{language === 'ar' ? 'طلب شرح لكيفية استخدام بياناتك.' : 'Request explanations on how your data is used.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '8. ملفات تعريف الارتباط والتتبع' : '8. Cookies & Tracking'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar'
                  ? 'يستخدم نوارتو ملفات تعريف الارتباط لتحسين الوظائف وتجربة المستخدم. يمكن للمستخدمين إدارة أو تعطيل ملفات تعريف الارتباط عبر أجهزتهم أو متصفحهم.'
                  : 'Nawartu uses cookies to improve functionality and user experience. Users can manage or disable cookies via their device or browser.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '9. تغييرات السياسة' : '9. Changes to Policy'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar'
                  ? 'قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم إخطار المستخدمين بالتغييرات الرئيسية عبر الموقع أو التطبيق.'
                  : 'We may update this policy from time to time. Users will be notified of major changes via the website or app.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '10. اتصل بنا' : '10. Contact Us'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar' ? 'للاستفسارات حول سياسة الخصوصية هذه، راسلنا على:' : 'For questions about this Privacy Policy, email us at:'} 
                <a href="mailto:info@nawartu.com" className="text-primary underline">info@nawartu.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;