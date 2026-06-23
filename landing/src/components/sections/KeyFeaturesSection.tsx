

import { useState } from "react";
;
import { motion } from "framer-motion";

const features = [
  {
    title: "Food Delivery",
    description:
      "Order from a wide variety of local and international restaurants near you. Enjoy your favorite meals anytime, anywhere.",
    icon: (
      <img
        src="/images/cardsIcons/foodDelivery.svg"
        alt="Food Delivery"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#FFF0E6]",
  },
  {
    title: "Pharmacy Essentials",
    description:
      "Access over-the-counter medications and health essentials quickly and safely from trusted pharmacies",
    icon: (
      <img
        src="/images/cardsIcons/pharmacy.svg"
        alt="Pharmacy"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#E6F6F5]",
  },
  {
    title: "Groceries and Daily Needs",
    description:
      "Shop for everyday essentials without leaving your home. Convenience at its best.",
    icon: (
      <img
        src="/images/cardsIcons/Groceries.svg"
        alt="Groceries"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#FDF3EE]",
  },
  {
    title: "Cake Delivery",
    description:
      "Celebrate special moments with freshly baked cakes delivered right to your doorstep, perfect for birthdays, anniversaries, and surprises.",
    icon: (
      <img
        src="/images/cardsIcons/CakeDelivery.svg"
        alt="Cake Delivery"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#FDEFEE]",
  },
  {
    title: "Real-Time Order",
    description:
      "Tracking Track your order from preparation to delivery with live updates.",
    icon: (
      <img
        src="/images/cardsIcons/foodDelivery.svg"
        alt="Real-Time tracking"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#FFF0E6]",
  },
  {
    title: "Multiple Payment Options",
    description:
      "Pay securely using debit cards, bank transfers, USSD, or cash on delivery.",
    icon: (
      <img
        src="/images/cardsIcons/pharmacy.svg"
        alt="Multiple Payment Options"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#E6F6F5]",
  },
  {
    title: "Verified Vendors",
    description:
      "Verified Vendors We partner with trusted restaurants, bakeries, and pharmacies to ensure quality and reliability.",
    icon: (
      <img
        src="/images/cardsIcons/Groceries.svg"
        alt="Verified Vendors"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#FDF3EE]",
  },
  {
    title: "Fast and Reliable Delivery",
    description:
      "Fast & Reliable Delivery Our dedicated riders ensure your orders arrive quickly and safely.",
    icon: (
      <img
        src="/images/cardsIcons/CakeDelivery.svg"
        alt="Fast and Reliable Delivery"
        width={24}
        height={24}
        className="w-6 h-6 shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
    ),
    iconBg: "bg-[#FDEFEE]",
  },
];

export function KeyFeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section
      className="pt-16 md:pt-[118px] pb-16 md:pb-[118px] bg-[#F1F3F2]"
      id="features"
    >
      <div className="w-full max-w-[1216px] mx-auto px-4 xl:px-0">
        <motion.div
          className="flex flex-col items-center mb-10 md:mb-[64px] text-center max-w-[560px] mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2
            className="text-[36px] font-extrabold text-[#004D4C] mb-4 leading-[40px]"
            style={{
              fontFamily: "var(--font-plus-jakarta-sans)",
              fontSize: "var(--fs-h2)",
            }}
          >
            Key Features
          </h2>
          <p
            className="text-[18px] text-[#191C1C] font-normal leading-[24px]"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "var(--fs-body-xl)",
            }}
          >
            Everything you need, organized into intuitive <br /> categories.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-[32px] justify-center items-stretch mx-auto w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {features.map((feature, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                onMouseEnter={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth >= 768
                  ) {
                    setHoveredIndex(index);
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut" },
                  },
                }}
                animate={isHovered ? { scale: 1.02, y: -4 } : "visible"}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="relative bg-white rounded-[12px] p-4 sm:p-8 flex flex-col items-start overflow-hidden transition-shadow duration-300 w-full cursor-default group"
                style={{
                  boxShadow: "0px 10px 32px -4px rgba(25, 28, 28, 0.06)",
                }}
              >
                {/* Radial Expansion Background */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isHovered ? 5 : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-[#004D4C] z-0 pointer-events-none"
                />

                {/* Card Content - relative z-10 */}
                <div className="relative z-10 w-full h-full flex flex-col items-start pointer-events-none">
                  <div
                    className={`w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-[8px] flex items-center justify-center mb-4 sm:mb-6 shrink-0 ${feature.iconBg}`}
                  >
                    {feature.icon}
                  </div>
                  <motion.h3
                    animate={{ color: isHovered ? "#FFFFFF" : "#191C1C" }}
                    transition={{ duration: 0.3 }}
                    className="text-[16px] sm:text-[20px] font-semibold mb-2 sm:mb-3 leading-[1.3] sm:leading-[28px]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "var(--fs-h4)",
                    }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    animate={{
                      color: isHovered ? "rgba(255, 255, 255, 0.9)" : "#3E4948",
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-[13px] sm:text-[16px] font-normal leading-normal sm:leading-[22.75px]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "var(--fs-body-sm)",
                    }}
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
