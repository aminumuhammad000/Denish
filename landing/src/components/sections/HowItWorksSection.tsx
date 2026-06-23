

import { motion } from "framer-motion";

export type Step = {
  number: string;
  title: string;
  description: string;
  isActive?: boolean;
};

const defaultSteps: Step[] = [
  {
    number: "1",
    title: "Download the App",
    description:
      "Install the Denish App from the Google Play Store or Apple App Store.",
  },
  {
    number: "2",
    title: "Browse & Select",
    description:
      "Choose from a wide range of restaurants, bakeries, pharmacies, and grocery stores.",
  },
  {
    number: "3",
    title: "Place Your Order",
    description:
      "Add items to your cart and select your preferred payment method.",
  },
  {
    number: "4",
    title: "Track in Real-Time",
    description: "Monitor your order as it is prepared and delivered to you.",
  },
  {
    number: "5",
    title: "Enjoy Your Delivery",
    description:
      "Receive your order at your doorstep and enjoy the convenience.",
  },
];

interface Props {
  label?: string;
  titlePart1?: React.ReactNode;
  titlePart2?: React.ReactNode;
  subtitle?: string;
  steps?: Step[];
}

export function HowItWorksSection({
  label = "",
  titlePart1 = "How Denish Works",
  titlePart2 = "",
  subtitle = "",
  steps = defaultSteps,
}: Props) {
  const isOnboarding = !!label;
  const gridCols = steps.length === 5 ? "md:grid-cols-5" : "md:grid-cols-4";

  return (
    <section
      className={`pt-16 md:pt-[113px] pb-16 md:pb-[113px] relative overflow-hidden ${
        isOnboarding ? "bg-[#F2F4F3]" : "bg-[#F8FAF9]"
      }`}
      id="how-it-works"
    >
      <div className="w-full max-w-[1216px] mx-auto px-4 xl:px-0">
        {/* Header Block */}
        <div className="flex flex-col items-center mb-10 md:mb-[64px] text-center max-w-[700px] mx-auto">
          {label && (
            <p
              className="text-[16px] font-bold text-[#F9811F] mb-3 tracking-widest uppercase"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              {label}
            </p>
          )}
          <h2
            className={`text-[36px] font-extrabold leading-[1.15] tracking-[-0.02em] mb-3 ${
              isOnboarding ? "text-[#F9811F]" : "text-[#191C1C]"
            }`}
            style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-h2)" }}
          >
            {titlePart1}{" "}
            {titlePart2 && <span className="text-[#004D4C]">{titlePart2}</span>}
          </h2>
          {subtitle && (
            <p
              className="text-[16px] text-[#3F4948] font-normal leading-[24px]"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Steps Grid container */}
        <div className="relative w-full">
          {/* Horizontal line (Desktop) */}
          <div className="absolute top-[32px] left-0 w-full h-px bg-[#BEC9C8] opacity-30 z-0 hidden md:block" />

          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-12 md:gap-[32px] relative z-10`}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center w-full"
              >
                <div
                  className={`w-[64px] h-[64px] rounded-full flex items-center justify-center text-[20px] font-black leading-[28px] mb-[24px] mx-auto ${
                    step.isActive
                      ? "bg-[#F9811F] text-white"
                      : "bg-[#E1E3E2] text-[#004D4C]"
                  }`}
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {step.number}
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center">
                  <h3
                    className="text-[18px] font-bold text-[#191C1C] mb-3 leading-[24px]"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-xl)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[14px] font-normal text-[#3E4948] leading-[22px] text-center"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-sm)" }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
