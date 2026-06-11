"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function VendorRequirementsSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const requirements = [
    "Registered business name or CAC certificate",
    "Valid government-issued ID (Owner / Director)",
    "Operational physical address in Nigeria",
    "Active bank account for weekly payouts",
    "Quality product photos & menu list",
    "Health/NAFDAC permit (for food & pharmacy)",
  ];

  return (
    <section className="py-16 md:py-[100px] bg-white relative overflow-hidden">
      <div className="max-w-[1216px] mx-auto px-4 xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-[100px] items-center">
          {/* Left Column - Checklist */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col items-start"
          >
            <p
              className="text-[16px] font-semibold text-[#F9811F] mb-4 tracking-wider uppercase"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-label)" }}
            >
              WHAT YOU NEED
            </p>
            <h2
              className="text-[36px] font-extrabold text-[#F9811F] mb-6 leading-[1.1] max-w-[450px]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-h2)" }}
            >
              Simple requirements <br />
              <span className="text-[#004D4C]">to get started</span>
            </h2>
            <p
              className="text-[#3E4948] text-[16px] font-normal mb-10 leading-[24px] max-w-[450px]"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
            >
              We&apos;ve kept the onboarding lightweight so you can start
              selling fast. Here&apos;s what you&apos;ll need to apply.
            </p>

            <div className="space-y-5">
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="shrink-0 relative w-[24px] h-[24px]">
                    <Image
                      src="/images/checkBulletPoints.svg"
                      alt="Check icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p
                    className="text-[#191C1C] text-[16px] font-medium leading-[24px]"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
                  >
                    {req}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative w-full aspect-588/500 md:aspect-auto md:h-[500px] mt-10 md:mt-0"
          >
            <Image
              src="/images/Simple_requirements_to_get_started/SimpleRequirementsToGetStarted.png"
              alt="Commission Settings"
              fill
              className="object-contain md:object-right"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
