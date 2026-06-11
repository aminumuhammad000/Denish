"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function RiderRequirementsSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const requirements = [
    "18 years or older",
    "Valid rider's license / motorbike permit",
    "Own a motorbike or bicycle in good condition",
    "Smartphone (Android 7.0+ / iPhone)",
    "Valid government-issued ID (NIN, Driver's License or Voter's Card)",
    "Bank account for weekly payouts",
  ];

  return (
    <section className="py-16 md:py-[100px] bg-white relative overflow-hidden">
      <div className="max-w-[1216px] mx-auto px-4 xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 md:gap-[60px] items-center">
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
              style={{
                fontFamily: "var(--font-plus-jakarta-sans)",
                fontSize: "var(--fs-label)",
              }}
            >
              REQUIREMENTS
            </p>
            <h2
              className="font-extrabold text-[#FE7200] mb-6 leading-[1.2] max-w-[550px]"
              style={{
                fontFamily: "var(--font-plus-jakarta-sans)",
                fontSize: "var(--fs-h2)",
              }}
            >
              What you&apos;ll need <br />
              <span className="text-[#004D4C]">to get rolling</span>
            </h2>
            <p
              className="text-[#3E4948] font-normal mb-10 leading-[1.6] max-w-[480px]"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "var(--fs-body-lg)",
              }}
            >
              We keep it simple. If you&apos;ve got a bike and a hustle mindset,
              you&apos;re halfway there.
            </p>

            <div className="space-y-5">
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="shrink-0 relative w-[24px] h-[24px] mt-0.5">
                    <Image
                      src="/images/checkBulletPoints.svg"
                      alt="Check icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p
                    className="text-[#191C1C] text-[16px] font-medium leading-[24px] max-w-[340px]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "var(--fs-body-lg)",
                    }}
                  >
                    {req}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Earnings Card Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative mt-12 md:mt-0 mx-auto md:ml-auto md:mr-0 shrink-0"
            style={{
              width: "clamp(350px, 35vw, 684px)",
              height: "clamp(315px, 25vw, 548px)",
            }}
          >
            <Image
              src="/images/HeroImage4.svg"
              alt="Earnings Breakdown"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
