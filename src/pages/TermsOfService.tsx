import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsOfService = () => {
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
            {language === 'ar' ? 'نورتوا - الشروط والسياسات' : 'Nawartu – Terms & Policies'}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '1. نظرة عامة' : '1. Overview'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'نورتوا هي منصة رقمية تربط بين:'
                  : 'Nawartu is a digital platform connecting:'
                }
              </p>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>
                  <strong>{language === 'ar' ? 'المضيفون:' : 'Hosts:'}</strong> 
                  {language === 'ar' 
                    ? ' أفراد أو شركات تقدم إقامات قصيرة المدى.'
                    : ' Individuals or businesses offering short-term stays.'
                  }
                </li>
                <li>
                  <strong>{language === 'ar' ? 'الضيوف:' : 'Guests:'}</strong> 
                  {language === 'ar' 
                    ? ' مسافرون أو محليون يبحثون عن أماكن إقامة.'
                    : ' Travelers or locals seeking accommodations.'
                  }
                </li>
              </ul>
              <p className="text-foreground leading-relaxed mt-4">
                {language === 'ar'
                  ? 'نحن لا نملك أو ندير العقارات المدرجة؛ نحن نقدم خدمات الحجز الآمن والدفع والتواصل.'
                  : 'We do not own or manage listed properties; we provide secure booking, payment, and communication services.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '2. الأهلية والتحقق' : '2. Eligibility & Verification'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'يجب أن يكون المستخدمون 18+.' : 'Users must be 18+.'}</li>
                <li>{language === 'ar' ? 'مطلوب التحقق من الهوية للوصول الكامل إلى الاستضافة أو الحجز.' : 'KYC verification required for full access to hosting or booking.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '3. رسوم الخدمة والمدفوعات' : '3. Service Fees & Payments'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'يدفع الضيوف رسوم خدمة 8% لكل حجز.' : 'Guests pay a service fee of 8% per booking.'}</li>
                <li>{language === 'ar' ? 'جميع المعاملات تتم معالجتها عبر مزودي الدفع المرخصين والآمنين.' : 'All transactions are processed via licensed, secure payment providers.'}</li>
                <li>{language === 'ar' ? 'المراسلة بين الضيف والمضيف متاحة فقط بعد تأكيد الحجز.' : 'Messaging between guest and host is enabled only after booking confirmation.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '4. سياسة الإلغاء والاسترداد' : '4. Cancellation & Refund Policy'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li><strong>{language === 'ar' ? '14+ يوم قبل الوصول:' : '14+ days before check-in:'}</strong> {language === 'ar' ? 'استرداد كامل.' : 'Full refund.'}</li>
                <li><strong>{language === 'ar' ? '5-13 يوم:' : '5–13 days:'}</strong> {language === 'ar' ? 'استرداد 50%.' : '50% refund.'}</li>
                <li><strong>{language === 'ar' ? '2-4 أيام:' : '2–4 days:'}</strong> {language === 'ar' ? 'استرداد 25%.' : '25% refund.'}</li>
                <li><strong>{language === 'ar' ? '&lt;2 يوم أو عدم الحضور:' : '&lt;2 days or no-show:'}</strong> {language === 'ar' ? 'لا يوجد استرداد.' : 'No refund.'}</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-4">
                {language === 'ar' 
                  ? 'رسوم الخدمة غير قابلة للاسترداد. تتم معالجة الاسترداد خلال 5-10 أيام عمل.'
                  : 'Service fee is non-refundable. Refunds processed within 5–10 business days.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '5. مسؤوليات المضيف' : '5. Host Responsibilities'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'تقديم تفاصيل العقار بدقة وتحديثها.' : 'Provide accurate and updated listing details.'}</li>
                <li>{language === 'ar' ? 'الحفاظ على النظافة والأمان والامتثال القانوني.' : 'Maintain cleanliness, safety, and legal compliance.'}</li>
                <li>{language === 'ar' ? 'الرد بسرعة على الاستفسارات وتأكيدات الحجز.' : 'Respond promptly to inquiries and booking confirmations.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '6. مسؤوليات الضيف' : '6. Guest Responsibilities'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'اتباع قواعد المنزل واحترام العقار والجيران.' : 'Follow house rules and respect the listing and neighbors.'}</li>
                <li>{language === 'ar' ? 'تجنب الأضرار أو الأنشطة غير القانونية أو الاستخدام غير المصرح به.' : 'Avoid damage, illegal activities, or unauthorized use.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '7. المسؤولية والتأمين' : '7. Liability & Insurance'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'نورتوا غير مسؤولة عن الحوادث أو الأضرار أو النزاعات أثناء الإقامة. نوصي بأن يكون لدى كل من المضيفين والضيوف تأمين شخصي أو على الممتلكات.'
                  : 'Nawartu is not liable for accidents, damages, or disputes during stays. We recommend both hosts and guests have personal or listing insurance.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '8. البيانات والخصوصية' : '8. Data & Privacy'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'يتم تخزين ومعالجة بيانات المستخدم بأمان ووفقاً للقوانين السورية. يمكن للمستخدمين طلب حذف الحساب في أي وقت؛ قد يتم الاحتفاظ بالبيانات الأساسية لأغراض قانونية.'
                  : 'User data is stored and processed securely and in compliance with Syrian laws. Users may request account deletion at any time; essential data may be retained for legal purposes.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '9. تعليق أو إنهاء الحساب' : '9. Account Suspension or Termination'}
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                {language === 'ar' ? 'قد يتم تعليق أو إزالة الحسابات لـ:' : 'Accounts may be suspended or removed for:'}
              </p>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'خرق السياسات' : 'Breaching policies'}</li>
                <li>{language === 'ar' ? 'الأنشطة الاحتيالية أو الضارة' : 'Fraudulent or harmful activities'}</li>
                <li>{language === 'ar' ? 'الطلبات القانونية أو التنظيمية' : 'Legal or regulatory requests'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '10. القانون الحاكم' : '10. Governing Law'}
              </h2>
              <p className="text-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'تخضع هذه الشروط لقوانين الجمهورية العربية السورية.'
                  : 'These terms are governed by the laws of the Syrian Arab Republic.'
                }
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;