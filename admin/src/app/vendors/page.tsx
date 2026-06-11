"use client";

import { useState, useEffect } from "react";
import { VendorHeroSection } from "@/components/sections/vendors/VendorHeroSection";
import { WhyPeopleLoveDenishSection } from "@/components/sections/WhyPeopleLoveDenishSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { VendorRequirementsSection } from "@/components/sections/vendors/VendorRequirementsSection";
import { CustomerTestimonialsSection } from "@/components/sections/CustomerTestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { LandingPageSkeleton } from "@/components/layout/LandingPageSkeleton";

const vendorFeatures = [
  {
    title: "Boost Your Sales",
    description: "Tap into thousands of hungry customers actively browsing in your area.",
    icon: "/images/Everything_you_need_to_grow_online_Images/BoostYourSales.svg",
  },
  {
    title: "Wider Reach",
    description: "Tap into thousands of hungry customers actively browsing in your area.",
    icon: "/images/Everything_you_need_to_grow_online_Images/WiderReach.svg",
  },
  {
    title: "Reliable Logistics",
    description: "Our vetted rider network handles every delivery, end to end.",
    icon: "/images/Everything_you_need_to_grow_online_Images/ReliableLogistics.svg",
  },
  {
    title: "Smart Dashboard",
    description: "Real-time orders, inventory, and revenue analytics in one place.",
    icon: "/images/Everything_you_need_to_grow_online_Images/SmartDashboard.svg",
  },
  {
    title: "Marketing Support",
    description: "Featured placements, push promos, and seasonal campaigns built-in.",
    icon: "/images/Everything_you_need_to_grow_online_Images/MarketingSupport.svg",
  },
  {
    title: "Secure Payouts",
    description: "Weekly settlements straight to your bank account. No surprises.",
    icon: "/images/Everything_you_need_to_grow_online_Images/SecurePayouts.svg",
  },
];

const vendorSteps = [
  {
    number: "1",
    title: "Sign Up",
    description: "Submit your business details and KYC documents online — takes 5 minutes.",
  },
  {
    number: "2",
    title: "Get Verified",
    description: "Our partner team reviews and approves you within 48 hours.",
  },
  {
    number: "3",
    title: "Setup Your Store",
    description: "Upload your menu, products, and operating hours from the dashboard.",
  },
  {
    number: "4",
    title: "Start Earning",
    description: "Go live, receive orders, and watch your revenue grow week over week.",
    isActive: true,
  },
];

const vendorTestimonials = [
  {
    quote: "Our sales have grown by 40% since joining Denish. The logistics are handled perfectly, so we can focus on what we do best—making great food!",
    name: "The Burger Hub",
    location: "Kano",
    initials: "BH",
  },
  {
    quote: "The dashboard gives us real-time insights we never had before. Managing orders is seamless, and the weekly settlements are a huge plus.",
    name: "Mama's Kitchen",
    location: "Kano",
    initials: "MK",
  },
  {
    quote: "Joining the Denish vendor network was the best decision for our pharmacy. We now reach customers across the entire city with zero stress.",
    name: "HealthFirst Pharma",
    location: "Kano",
    initials: "HP",
  },
];


export default function VendorsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <LandingPageSkeleton />;
  }

  return (
    <>
      <VendorHeroSection />
        
        <WhyPeopleLoveDenishSection 
          label="WHY VENDORS LOVE DENISH"
          titlePart1={<><span className="text-[#F9811F]">Everything you need to</span><br /></>}
          titlePart2="grow online."
          features={vendorFeatures}
          variant="premium"
        />

        <div id="onboarding">
          <HowItWorksSection 
            label="ONBOARDING"
            titlePart1={<>From sign up to selling in<br /></>}
            titlePart2="48 hours."
            steps={vendorSteps}
          />
        </div>

        <VendorRequirementsSection />

        <CustomerTestimonialsSection 
          title="Vendors Testimonials"
          testimonials={vendorTestimonials}
        />

        <CTASection 
          title="Ready to grow your business with Denish?"
          subtitle="Download the Denish Vendor app or apply online today. Our partner team will be in touch within 24 hours."
          email="vendors@denishapp.com"
          backgroundColor="#F2F4F3"
        />
    </>
  );
}
