import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

const PropertyGuidelines = () => {
  const { language, handleLanguageChange } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header language={language} onLanguageChange={handleLanguageChange} />
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">
            {language === 'ar' ? 'نوارتو - إرشادات إدراج العقارات' : 'Nawartu – Property Listing Guidelines'}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-foreground leading-relaxed text-lg">
                {language === 'ar'
                  ? 'لضمان تجربة آمنة وموثوقة للضيوف والمضيفين، يجب أن تتبع جميع إدراجات العقارات في نوارتو هذه الإرشادات:'
                  : 'To ensure a safe and trustworthy experience for guests and hosts, all property listings on Nawartu must follow these guidelines:'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '1. معلومات دقيقة' : '1. Accurate Information'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'تقديم تفاصيل كاملة وصادقة حول العقار (النوع، الحجم، المرافق).' : 'Provide complete and truthful details about the property (type, size, amenities).'}</li>
                <li>{language === 'ar' ? 'تضمين صور واضحة وعالية الجودة لجميع المناطق الرئيسية.' : 'Include clear, high-quality photos of all key areas.'}</li>
                <li>{language === 'ar' ? 'تحديث التوفر والتسعير والوصف بانتظام.' : 'Update availability, pricing, and description regularly.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '2. الامتثال القانوني' : '2. Legal Compliance'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'ضمان امتثال العقار للقوانين واللوائح المحلية.' : 'Ensure the property complies with local laws and regulations.'}</li>
                <li>{language === 'ar' ? 'المضيفون مسؤولون عن التصاريح الضرورية والضرائب والتأمين.' : 'Hosts are responsible for necessary permits, taxes, and insurance.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '3. السلامة والنظافة' : '3. Safety & Cleanliness'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'الحفاظ على مرافق نظيفة وآمنة وذات أداء جيد.' : 'Maintain clean, safe, and well-functioning facilities.'}</li>
                <li>{language === 'ar' ? 'توفير معدات السلامة الأساسية (مطفأة الحريق، كاشف الدخان، حقيبة الإسعافات الأولية إذا كان ذلك مناسباً).' : 'Provide basic safety equipment (fire extinguisher, smoke detector, first aid kit if applicable).'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '4. التسعير والرسوم' : '4. Pricing & Fees'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'تحديد أسعار عادلة وشفافة.' : 'Set fair and transparent pricing.'}</li>
                <li>{language === 'ar' ? 'تضمين أي رسوم إضافية مقدماً (التنظيف، ضيوف إضافيون، إلخ).' : 'Include any additional fees upfront (cleaning, extra guests, etc.).'}</li>
                <li>{language === 'ar' ? 'لا تقدم معلومات خاطئة عن التسعير لجذب الحجوزات.' : 'Do not misrepresent pricing to attract bookings.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '5. قواعد المنزل' : '5. House Rules'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'حدد بوضوح قواعد الضيوف (الضوضاء، الحيوانات الأليفة، التدخين، إلخ).' : 'Clearly state guest rules (noise, pets, smoking, etc.).'}</li>
                <li>{language === 'ar' ? 'كن محترماً وواضحاً في التواصل مع التوقعات.' : 'Be respectful and communicate expectations clearly.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '6. الإدراجات المحظورة' : '6. Prohibited Listings'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'لا توجد عقارات أو أنشطة غير قانونية.' : 'No illegal properties or activities.'}</li>
                <li>{language === 'ar' ? 'لا توجد إدراجات مضللة أو احتيالية.' : 'No misleading or fraudulent listings.'}</li>
                <li>{language === 'ar' ? 'الإدراجات التي تنتهك هذه القواعد قد يتم إزالتها أو تعليقها.' : 'Listings that violate these rules may be removed or suspended.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '7. التواصل والاستجابة' : '7. Communication & Responsiveness'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'الرد بسرعة على طلبات الحجز واستفسارات الضيوف.' : 'Respond promptly to booking requests and guest inquiries.'}</li>
                <li>{language === 'ar' ? 'الحفاظ على تواصل مهني ومحترم في جميع الأوقات.' : 'Maintain professional and respectful communication at all times.'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {language === 'ar' ? '8. المراجعات والتعليقات' : '8. Review & Feedback'}
              </h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>{language === 'ar' ? 'شجع على مراجعات صادقة من الضيوف.' : 'Encourage honest guest reviews.'}</li>
                <li>{language === 'ar' ? 'لا تلاعب أو تزيف المراجعات.' : 'Do not manipulate or falsify reviews.'}</li>
              </ul>
            </section>

            <div className="mt-12 p-6 bg-secondary/10 rounded-lg">
              <p className="text-foreground font-medium">
                <strong>{language === 'ar' ? 'ملاحظة:' : 'Note:'}</strong> 
                {language === 'ar'
                  ? 'هذه الإرشادات تساعد في الحفاظ على الجودة والثقة التي بني عليها نوارتو. جميع الإدراجات تخضع للمراجعة والموافقة قبل أن تصبح متاحة على المنصة.'
                  : 'These guidelines help maintain the quality and trust that Nawartu is built on. All listings are subject to review and approval before going live on the platform.'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyGuidelines;