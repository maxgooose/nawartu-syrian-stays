import { useState } from "react";
import { Header } from "@/components/Header";

const TermsOfService = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>('en');

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Nawartu – Terms & Policies</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Overview</h2>
              <p className="text-foreground leading-relaxed">
                Nawartu is a digital platform connecting:
              </p>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li><strong>Hosts:</strong> Individuals or businesses offering short-term stays.</li>
                <li><strong>Guests:</strong> Travelers or locals seeking accommodations.</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-4">
                We do not own or manage listed properties; we provide secure booking, payment, and communication services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Eligibility & Verification</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Users must be 18+.</li>
                <li>KYC verification required for full access to hosting or booking.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">3. Service Fees & Payments</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Guests pay a service fee of 8% per booking.</li>
                <li>All transactions are processed via licensed, secure payment providers.</li>
                <li>Messaging between guest and host is enabled only after booking confirmation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Cancellation & Refund Policy</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li><strong>14+ days before check-in:</strong> Full refund.</li>
                <li><strong>5–13 days:</strong> 50% refund.</li>
                <li><strong>48 hours–4 days:</strong> 25% refund.</li>
                <li><strong>&lt;48 hours or no-show:</strong> No refund.</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-4">
                Service fee is non-refundable. Refunds processed within 5–10 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Host Responsibilities</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Provide accurate and updated property details.</li>
                <li>Maintain cleanliness, safety, and legal compliance.</li>
                <li>Respond promptly to inquiries and booking confirmations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Guest Responsibilities</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Follow house rules and respect the property and neighbors.</li>
                <li>Avoid damage, illegal activities, or unauthorized use.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Liability & Insurance</h2>
              <p className="text-foreground leading-relaxed">
                Nawartu is not liable for accidents, damages, or disputes during stays.
                We recommend both hosts and guests have personal or property insurance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Data & Privacy</h2>
              <p className="text-foreground leading-relaxed">
                User data is stored and processed securely and in compliance with Syrian laws.
                Users may request account deletion at any time; essential data may be retained for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">9. Account Suspension or Termination</h2>
              <p className="text-foreground leading-relaxed mb-4">Accounts may be suspended or removed for:</p>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Breaching policies</li>
                <li>Fraudulent or harmful activities</li>
                <li>Legal or regulatory requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">10. Governing Law</h2>
              <p className="text-foreground leading-relaxed">
                These terms are governed by the laws of the Syrian Arab Republic.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;