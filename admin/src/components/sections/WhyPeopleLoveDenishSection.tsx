"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Feature = {
  title: string;
  description: string;
  icon: string;
};

const defaultFeatures: Feature[] = [
  {
    title: "Boost Your Sales",
    description:
      "Tap into thousands of hungry customers actively browsing in your area.",
    icon: "/images/Everything_you_need_to_grow_online_Images/BoostYourSales.svg",
  },
  {
    title: "Wider Reach",
    description:
      "Tap into thousands of hungry customers actively browsing in your area.",
    icon: "/images/Everything_you_need_to_grow_online_Images/WiderReach.svg",
  },
  {
    title: "Reliable Logistics",
    description: "Our vetted rider network handles every delivery, end to end.",
    icon: "/images/Everything_you_need_to_grow_online_Images/ReliableLogistics.svg",
  },
  {
    title: "Smart Dashboard",
    description:
      "Real-time orders, inventory, and revenue analytics in one place.",
    icon: "/images/Everything_you_need_to_grow_online_Images/SmartDashboard.svg",
  },
  {
    title: "Marketing Support",
    description:
      "Featured placements, push promos, and seasonal campaigns built-in.",
    icon: "/images/Everything_you_need_to_grow_online_Images/MarketingSupport.svg",
  },
  {
    title: "Secure Payouts",
    description:
      "Weekly settlements straight to your bank account. No surprises.",
    icon: "/images/Everything_you_need_to_grow_online_Images/SecurePayouts.svg",
  },
];

interface Props {
  label?: string;
  titlePart1?: React.ReactNode;
  titlePart2?: React.ReactNode;
  features?: Feature[];
  variant?: "default" | "premium";
}

export function WhyPeopleLoveDenishSection({
  label = "",
  titlePart1 = "Why People Love Denish",
  titlePart2 = "",
  features = defaultFeatures,
  variant = "default",
}: Props) {
  const isPremium = variant === "premium";

  return (
    <section
      className={`pt-16 pb-[100px] md:py-[100px] relative overflow-hidden ${
        label ? "bg-[#f8faf9]" : "bg-[#F2F4F3]"
      }`}
      id="why-people-love"
    >
      <div className="w-full max-w-[1216px] mx-auto px-4 xl:px-0">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-[64px] flex flex-col items-center">
          {label && (
            <p
              className="text-[16px] font-semibold text-[#F9811F] mb-4 tracking-wider uppercase"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              {label}
            </p>
          )}
          <h2
            className="text-[36px] font-extrabold text-[#191C1C] leading-[1.2]"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-h2)" }}
          >
            {titlePart1}{" "}
            {titlePart2 && <span className="text-[#004D4C]">{titlePart2}</span>}
          </h2>
        </div>

        {/* Features Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 ${
            isPremium ? "gap-[26px]" : "gap-y-12 md:gap-y-[64px] gap-x-[32px]"
          }`}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={
                isPremium
                  ? "bg-white border border-[#EAEAEA] rounded-[14px] flex flex-col items-start text-left transition-shadow p-8 gap-8 min-h-[260px] shadow-[0px_13px_100px_0px_rgba(0,0,0,0.08)] hover:shadow-lg"
                  : "flex flex-col items-center text-center md:flex-row md:gap-4 md:items-start md:text-left"
              }
            >
              {/* Feature Icon */}
              <div
                className={
                  isPremium
                    ? "w-[48px] h-[48px] rounded-[8px] bg-[#FFF5EE] flex items-center justify-center shrink-0 overflow-hidden"
                    : "w-[32px] h-[32px] shrink-0 mb-4 md:mb-0 md:mt-1"
                }
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={isPremium ? 48 : 32}
                  height={isPremium ? 48 : 32}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Text Block */}
              <div className="flex flex-col">
                <h3
                  className={`font-bold text-[#191C1C] mb-2 leading-[1.2] ${
                    isPremium ? "text-[20px]" : "text-[18px]"
                  }`}
                  style={{
                    fontFamily: isPremium
                      ? "var(--font-plus-jakarta-sans)"
                      : "var(--font-inter)",
                    fontSize: isPremium ? "var(--fs-h3)" : "var(--fs-body-xl)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className={`font-normal text-[#3F4948] ${
                    isPremium
                      ? "text-[16px] leading-[24px]"
                      : "text-[14px] leading-[22px]"
                  }`}
                  style={{ fontFamily: "var(--font-inter)", fontSize: isPremium ? "var(--fs-body-lg)" : "var(--fs-body-sm)" }}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
