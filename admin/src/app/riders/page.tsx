"use client";

import { useState, useEffect } from "react";
import { RiderHeroSection } from "@/components/sections/riders/RiderHeroSection";
import { WhyPeopleLoveDenishSection } from "@/components/sections/WhyPeopleLoveDenishSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { RiderRequirementsSection } from "@/components/sections/riders/RiderRequirementsSection";
import { CustomerTestimonialsSection } from "@/components/sections/CustomerTestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { LandingPageSkeleton } from "@/components/layout/LandingPageSkeleton";

const riderFeatures = [
  {
    title: "Earn N80K - N200K/mo",
    description:
      "Top riders earn premium income with bonuses, surge pricing, and tips on every trip.",
    icon: "/images/WhyRideWithUs/Earn.svg",
  },
  {
    title: "Flexible Hours",
    description:
      "Ride mornings, evenings, weekends — go online whenever it works for you.",
    icon: "/images/WhyRideWithUs/Flexible.svg",
  },
  {
    title: "Weekly Payouts",
    description:
      "Cash hits your bank every Friday. No waiting, no chasing, no surprises.",
    icon: "/images/WhyRideWithUs/Weekly.svg",
  },
  {
    title: "Smart Routing",
    description:
      "Our AI matches you to nearby orders to minimize idle time and maximize earnings.",
    icon: "/images/WhyRideWithUs/Smart.svg",
  },
  {
    title: "Rider Insurance",
    description:
      "Stay protected on every trip with accident cover and 24/7 emergency support.",
    icon: "/images/WhyRideWithUs/RiderInsurance.svg",
  },
  {
    title: "Real Human Support",
    description:
      "Dedicated rider success team available all day, every day. We've got your back.",
    icon: "/images/WhyRideWithUs/Real.svg",
  },
];

const riderSteps = [
  {
    number: "1",
    title: "Apply Online",
    description: "Fill our 5-minute form with your bike details and ID.",
  },
  {
    number: "2",
    title: "Get Verified",
    description: "We confirm your documents and run a quick safety check.",
  },
  {
    number: "3",
    title: "Attend Briefing",
    description: "Join our 1-hour orientation — online or at our Ilorin hub.",
  },
  {
    number: "4",
    title: "Hit the Road",
    description: "Go online in the app and start accepting orders.",
    isActive: true,
  },
];

const riderTestimonials = [
  {
    quote:
      "Being my own boss with Denish has been life-changing. I choose my hours and the weekly payouts are always on time. Best riding experience in Kano!",
    name: "Aminu S.",
    location: "Kano",
    initials: "AS",
  },
  {
    quote:
      "The smart routing actually works. I spend less time waiting and more time earning. I've doubled my monthly income since joining.",
    name: "Sani B.",
    location: "Kano",
    initials: "SB",
  },
  {
    quote:
      "I feel protected with the insurance and support. It's not just an app; it's a community that cares about its riders. Highly recommend!",
    name: "Fatima L.",
    location: "Kano",
    initials: "FL",
  },
];


export default function RidersPage() {
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
      <RiderHeroSection />

        <WhyPeopleLoveDenishSection
          label="WHY RIDE WITH US"
          titlePart1={
            <>
              <span className="text-[#F9811F]">Built for riders.</span>{" "}
              <span className="text-[#004D4C]">Backed</span>
              <br />
            </>
          }
          titlePart2="by riders"
          features={riderFeatures}
          variant="premium"
        />

        <div id="onboarding">
          <HowItWorksSection
            label="GET STARTED"
            titlePart1={
              <>
                <span className="text-[#F9811F]">From application</span>{" "}
                <span className="text-[#004D4C]">to first</span>
                <br />
              </>
            }
            titlePart2=" paycheck in 7 days"
            steps={riderSteps}
          />
        </div>

        <RiderRequirementsSection />

        <CustomerTestimonialsSection
          title="Riders Testimonials"
          testimonials={riderTestimonials}
        />

        <CTASection
          title="Your bike. Your hours. Your money."
          subtitle="Download the Denish Rider app and start earning this week. Onboarding takes under an hour."
          email="riders@denishapp.com"
          backgroundColor="#F2F4F3"
        />
    </>
  );
}
