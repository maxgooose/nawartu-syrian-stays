import { useState } from "react";
import { Header } from "@/components/Header";

const PropertyGuidelines = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Nawartu – Property Listing Guidelines</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-foreground leading-relaxed text-lg">
                To ensure a safe and trustworthy experience for guests and hosts, all property listings on Nawartu must follow these guidelines:
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Accurate Information</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Provide complete and truthful details about the property (type, size, amenities).</li>
                <li>Include clear, high-quality photos of all key areas.</li>
                <li>Update availability, pricing, and description regularly.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Legal Compliance</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Ensure the property complies with local laws and regulations.</li>
                <li>Hosts are responsible for necessary permits, taxes, and insurance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">3. Safety & Cleanliness</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Maintain clean, safe, and well-functioning facilities.</li>
                <li>Provide basic safety equipment (fire extinguisher, smoke detector, first aid kit if applicable).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Pricing & Fees</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Set fair and transparent pricing.</li>
                <li>Include any additional fees upfront (cleaning, extra guests, etc.).</li>
                <li>Do not misrepresent pricing to attract bookings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">5. House Rules</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Clearly state guest rules (noise, pets, smoking, etc.).</li>
                <li>Be respectful and communicate expectations clearly.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Prohibited Listings</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>No illegal properties or activities.</li>
                <li>No misleading or fraudulent listings.</li>
                <li>Listings that violate these rules may be removed or suspended.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Communication & Responsiveness</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Respond promptly to booking requests and guest inquiries.</li>
                <li>Maintain professional and respectful communication at all times.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Review & Feedback</h2>
              <ul className="list-disc ml-6 text-foreground space-y-2">
                <li>Encourage honest guest reviews.</li>
                <li>Do not manipulate or falsify reviews.</li>
              </ul>
            </section>

            <div className="mt-12 p-6 bg-secondary/10 rounded-lg">
              <p className="text-foreground font-medium">
                <strong>Note:</strong> These guidelines help maintain the quality and trust that Nawartu is built on. 
                All listings are subject to review and approval before going live on the platform.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyGuidelines;