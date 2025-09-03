import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { language, handleLanguageChange } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Header language={language} onLanguageChange={handleLanguageChange} />
      <main className="pt-20">
        <HeroSection language={language} />
        <FeaturedProperties language={language} />
      </main>
      <Footer language={language} onLanguageChange={handleLanguageChange} />
    </div>
  );
};

export default Index;
