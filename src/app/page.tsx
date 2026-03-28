import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import QuoteBuilder from "@/components/QuoteBuilder";
import PhotoGuide from "@/components/PhotoGuide";
import Materials from "@/components/Materials";
import UseCases from "@/components/UseCases";
import WhyTrust from "@/components/WhyTrust";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <QuoteBuilder />
        <PhotoGuide />
        <Materials />
        <UseCases />
        <WhyTrust />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
