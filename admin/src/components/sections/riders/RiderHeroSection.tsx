"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

// Static image imports
import HeroImageImg from "../../../../public/images/HeroImage2.png";

export function RiderHeroSection() {
  return (
    <div className="relative overflow-hidden bg-[#004D4C] md:bg-[#F8FAF9] pt-[70px] md:pt-[60px] pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] md:relative z-20 pb-[32px] md:pb-0">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-12 md:gap-[58px]">
          {/* Left Column - Content */}
          <div
            className="w-full relative z-20 animate-in fade-in duration-700 fill-mode-both"
            style={{ maxWidth: "clamp(300px, 50vw, 638px)" }}
          >
            <h1
              className="text-[44px] md:text-5xl md:text-[64px] font-extrabold tracking-[-1.8px] text-white md:text-[#004D4C] mb-6 leading-[1.23] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both"
              style={{
                fontFamily: "var(--font-plus-jakarta-sans)",
                fontSize: "var(--fs-display)",
              }}
            >
              Ride. <span className="text-[#F9811F]">Earn.</span>
              <br />
              Repeat.
            </h1>

            <p
              className="text-[16px] md:text-[18px] font-normal text-white md:text-[#3E4948] mb-[40px] max-w-[544px] leading-[26px] md:leading-[28px] tracking-[0px] [text-shadow:0px_2px_12px_rgba(0,77,76,1),0px_4px_16px_rgba(0,77,76,0.8)] md:text-shadow-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "var(--fs-body-lg)",
              }}
            >
              Be your own boss. Set your own hours. Make money delivering food,
              groceries, and pharmacy essentials across the city — with the
              rider community that actually pays on time.
            </p>

            <div className="flex flex-row justify-start items-center gap-2 sm:gap-4 mt-2 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
              <Link
                href="#onboarding"
                className="flex-1 bg-[#F9811F] text-white text-[13px] sm:text-[18px] font-semibold h-[54px] sm:h-[69px] px-2 sm:px-10 rounded-[12px] flex items-center justify-center hover:bg-[#e0741a] transition-all shadow-sm active:scale-95 shiny-btn whitespace-nowrap"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Start Riding Today
              </Link>
              <Link
                href="#how-it-works"
                className="flex-1 bg-[#F8F8F8] border border-[#747475] text-[#191C1C] text-[13px] sm:text-[18px] font-semibold h-[54px] sm:h-[69px] px-2 sm:px-8 rounded-[12px] flex items-center justify-center hover:bg-white transition-all whitespace-nowrap"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="absolute md:relative inset-0 md:inset-auto z-0 md:z-10 md:ml-auto w-full md:max-w-[620px] h-full md:h-[720px] mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
            <div className="relative h-full w-full md:rounded-[12px] mask-hero-fade md:mask-none">
              <Image
                src={HeroImageImg}
                alt="Denish Rider"
                fill
                priority
                quality={100}
                className="object-contain md:object-bottom-right"
                sizes="(max-width: 768px) 100vw, 544px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#004D4C]/90 via-[#004D4C]/40 to-transparent md:hidden" />
            </div>
          </div>
        </div>
      </div>

      {/* Value Prop Bar */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="w-full mt-12 md:mt-[110px] relative z-10 bg-[#F2F4F3]"
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[100px] py-8 md:py-[50px]">
          <div className="grid grid-cols-2 md:grid-cols-4 justify-center items-start w-full gap-y-10 gap-x-4 max-w-[1240px] mx-auto">
            <div className="flex flex-col items-center text-center space-y-2">
              <p
                className="text-[18px] sm:text-[24px] font-black text-[#191C1C] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-h3)",
                }}
              >
                10K+
              </p>
              <p
                className="text-[14px] sm:text-[20px] font-medium text-[#747475] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-body)",
                }}
              >
                Active Customers
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <p
                className="text-[18px] sm:text-[24px] font-black text-[#191C1C] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-h3)",
                }}
              >
                N2.5M
              </p>
              <p
                className="text-[14px] sm:text-[20px] font-medium text-[#747475] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-body)",
                }}
              >
                Avg. Monthly Payout
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <p
                className="text-[18px] sm:text-[24px] font-black text-[#191C1C] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-h3)",
                }}
              >
                48hrs
              </p>
              <p
                className="text-[14px] sm:text-[20px] font-medium text-[#747475] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-body)",
                }}
              >
                Onboarding Time
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <p
                className="text-[18px] sm:text-[24px] font-black text-[#191C1C] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-h3)",
                }}
              >
                98%
              </p>
              <p
                className="text-[14px] sm:text-[20px] font-medium text-[#747475] leading-none"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans)",
                  fontSize: "var(--fs-body)",
                }}
              >
                Rider Satisfaction
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
