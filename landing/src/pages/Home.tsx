import { useState, useEffect } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { EverydayEssentialsSection } from "@/components/sections/EverydayEssentialsSection";
import { KeyFeaturesSection } from "@/components/sections/KeyFeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WhyPeopleLoveDenishSection } from "@/components/sections/WhyPeopleLoveDenishSection";
import { PartnerWithUsSection } from "@/components/sections/PartnerWithUsSection";
import { CustomerTestimonialsSection } from "@/components/sections/CustomerTestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { ServiceAreasSection } from "@/components/sections/ServiceAreasSection";
import { LandingPageSkeleton } from "@/components/layout/LandingPageSkeleton";

const homeFeatures = [
  { title: "Fast Delivery", description: "Lightning speed fulfillment.", icon: "/images/whyPeopleLoveDenish/fashDelivery.svg" },
  { title: "Secure Payments", description: "Bank-level encryption standards.", icon: "/images/whyPeopleLoveDenish/securePayment.svg" },
  { title: "24/7 Support", description: "Always here to help you.", icon: "/images/whyPeopleLoveDenish/7support.svg" },
  { title: "Top Vendors", description: "Only the best for you.", icon: "/images/whyPeopleLoveDenish/topVendors.svg" },
  { title: "Best Rates", description: "Premium service at fair prices.", icon: "/images/whyPeopleLoveDenish/bestRates.svg" },
  { title: "Wide Coverage", description: "Available in Kano, Ilorin, and more.", icon: "/images/whyPeopleLoveDenish/wideCoverage.svg" },
  { title: "Easy to Use", description: "Designed for pure simplicity.", icon: "/images/whyPeopleLoveDenish/easyToUse.svg" },
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <LandingPageSkeleton />;
  }

  return (
    <>
      <HeroSection />
      <EverydayEssentialsSection />
      <KeyFeaturesSection />
      <HowItWorksSection 
        subtitle="Simple steps to your first delivery" 
        steps={[
          { number: "1", title: "Download the App", description: "Install the Denish App from the Google Play Store or Apple App Store." },
          { number: "2", title: "Browse & Select", description: "Choose from a wide range of restaurants, bakeries, pharmacies, and grocery stores." },
          { number: "3", title: "Place Your Order", description: "Add items to your cart and select your preferred payment method." },
          { number: "4", title: "Track in Real-Time", description: "Monitor your order as it is prepared and delivered to you." },
          { number: "5", title: "Enjoy Your Delivery", description: "Receive your order at your doorstep and enjoy the convenience.", isActive: true },
        ]}
      />
      <WhyPeopleLoveDenishSection titlePart1="Why People Love Denish" features={homeFeatures} />
      <PartnerWithUsSection />
      <CustomerTestimonialsSection />
      <CTASection backgroundColor="#F2F4F3" />
      <FAQSection />
      <ServiceAreasSection />
    </>
  );
}
