import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return (
    <div className="min-h-screen">
      <Header language={language} onLanguageChange={handleLanguageChange} />
      <main className="pt-16">
        <HeroSection language={language} />
        <FeaturedProperties language={language} />
      </main>
      <Footer language={language} onLanguageChange={handleLanguageChange} />
    </div>
  );
};

export default Index;
