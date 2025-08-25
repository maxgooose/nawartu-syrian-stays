import { useState } from "react";
import { Header } from "@/components/Header";

const PrivacyPolicy = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Nawartu – Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Introduction</h2>
              <p className="text-foreground leading-relaxed">
                At Nawartu, your privacy is important. This policy explains how we collect, use, and protect your personal information when using our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Data We Collect</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li><strong>Account Information:</strong> Name, email, phone number, ID (for KYC).</li>
                <li><strong>Booking Information:</strong> Property details, check-in/check-out dates, payment info.</li>
                <li><strong>Usage Data:</strong> IP address, device type, app activity, cookies for improving experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">3. How We Use Your Data</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>To facilitate bookings and payments securely.</li>
                <li>To verify identity and comply with Syrian regulations.</li>
                <li>To improve platform features and user experience.</li>
                <li>To communicate updates, notifications, or promotional offers (if opted-in).</li>
                <li>To prevent fraud, abuse, or illegal activity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Data Sharing</h2>
              <p className="text-foreground leading-relaxed mb-4">Data is not sold to third parties.</p>
              <p className="text-foreground leading-relaxed">
                Shared only with licensed payment providers, legal authorities if required, or to enforce policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Data Security</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Personal data is encrypted and stored securely.</li>
                <li>Access is restricted to authorized staff only.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Data Retention</h2>
              <p className="text-foreground leading-relaxed">
                Data is kept as long as your account is active or as required by law.
                Users can request account deletion, though some data may remain for legal compliance or fraud prevention.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">7. User Rights</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Access, update, or delete personal information.</li>
                <li>Opt out of marketing communications.</li>
                <li>Request explanations on how your data is used.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Cookies & Tracking</h2>
              <p className="text-foreground leading-relaxed">
                Nawartu uses cookies to improve functionality and user experience.
                Users can manage or disable cookies via their device or browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">9. Changes to Policy</h2>
              <p className="text-foreground leading-relaxed">
                We may update this policy from time to time.
                Users will be notified of major changes via the website or app.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">10. Contact Us</h2>
              <p className="text-foreground leading-relaxed">
                For questions about this Privacy Policy, email us at: <a href="mailto:info@nawartu.com" className="text-primary underline">info@nawartu.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;