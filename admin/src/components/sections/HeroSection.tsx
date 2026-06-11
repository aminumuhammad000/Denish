"use client";

import Image from "next/image";

// Static image imports for automatic blur placeholders
import HeroImageImg from "../../../public/images/HeroImage.png";
import googlePlayBtn from "../../../public/images/heroCTAbuttons/googleplaybutton.svg";
import appleStoreBtn from "../../../public/images/heroCTAbuttons/applebutton.svg";

export function HeroSection() {

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
              className="text-[44px] md:text-5xl md:text-[64px] font-extrabold tracking-[-1.8px] text-white md:text-[#004D4C] mb-6 leading-[1.1] md:leading-[1.23] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both"
              style={{
                fontFamily: "var(--font-plus-jakarta-sans)",
                fontSize: "var(--fs-display)",
              }}
            >
              Everything You Need,
              <br />
              <span className="text-[#F9811F] tracking-[0px]">
                Delivered
              </span>{" "}
              to Your
              <br />
              Doorstep
            </h1>

            <p
              className="text-[16px] md:text-[18px] font-normal text-[#EAECEC] md:text-[#314948] mb-[40px] max-w-[544px] leading-[26px] md:leading-[28.75px] tracking-[0px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "var(--fs-body-lg)",
              }}
            >
              Order delicious meals, fresh cakes, pharmacy essentials, and
              everyday groceries—all in one convenient app. Fast, reliable, and
              designed for your lifestyle.
            </p>

            <div
              className="flex flex-row justify-start items-center gap-3 sm:gap-4 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both"
            >
              <button className="transition-transform hover:scale-105 active:scale-95 rounded-sm overflow-hidden w-full max-w-[130px] sm:max-w-[180px] relative h-[40px] sm:h-[54px] shiny-btn">
                <Image
                  src={googlePlayBtn}
                  alt="Get it on Google Play"
                  fill
                  priority
                  className="object-contain"
                />
              </button>

              <button className="transition-transform hover:scale-105 active:scale-95 rounded-sm overflow-hidden w-full max-w-[130px] sm:max-w-[180px] relative h-[40px] sm:h-[54px] shiny-btn">
                <Image
                  src={appleStoreBtn}
                  alt="Download on the App Store"
                  fill
                  priority
                  className="object-contain"
                />
              </button>
            </div>
          </div>

          {/* Right Column - Image (Backdrop on mobile, side image on desktop) */}
          <div
            className="absolute md:relative inset-0 md:inset-auto z-0 md:z-10 md:ml-auto w-full md:max-w-[544px] aspect-square md:aspect-544/632 mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both"
          >
            <div className="relative h-full w-full md:rounded-[12px] overflow-hidden mask-[linear-gradient(to_bottom,black_70%,transparent_100%)] md:mask-none">
              <Image
                src={HeroImageImg}
                alt="Delivery Worker carrying a package"
                fill
                priority
                placeholder="blur"
                quality={60}
                className="object-cover md:object-center"
                sizes="(max-width: 768px) 100vw, 544px"
              />
              {/* Refined smooth bottom-to-top gradient overlay (reduced height footprint) using Brand Green */}
              <div className="absolute inset-0 bg-linear-to-t from-[#004D4C]/90 via-[#004D4C]/40 to-transparent md:hidden" />
            </div>
          </div>
        </div>
      </div>

      {/* Value Prop Bar */}
      <div
        className="w-full mt-12 md:mt-[110px] relative z-10 bg-[#F2F4F3] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both"
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[100px] py-8 md:py-[50px]">
          <div className="grid grid-cols-2 md:flex md:flex-row justify-center md:justify-between items-center w-full gap-y-10 gap-x-4 md:gap-4 max-w-[1240px] mx-auto">
            <div className="flex justify-center md:block">
              <div className="flex items-center space-x-3 w-[160px] md:w-auto">
                <Image
                  src="/images/FeaturesRowIcons/FastDeliveryIcon.svg"
                  alt="Fast delivery"
                  width={24}
                  height={24}
                  className="h-6 w-auto shrink-0"
                  style={{ width: "auto", height: "auto" }}
                />
                <p
                  className="text-base font-semibold text-[#004D4C]"
                  style={{ fontSize: "var(--fs-body-lg)" }}
                >
                  Fast delivery
                </p>
              </div>
            </div>

            <div className="flex justify-center md:block">
              <div className="flex items-center space-x-3 w-[160px] md:w-auto">
                <Image
                  src="/images/FeaturesRowIcons/TrustedVendorsIcon.svg"
                  alt="Trusted vendors"
                  width={24}
                  height={24}
                  className="h-6 w-auto shrink-0"
                  style={{ width: "auto", height: "auto" }}
                />
                <p className="text-base font-semibold text-[#004D4C]">
                  Trusted vendors
                </p>
              </div>
            </div>

            <div className="flex justify-center md:block">
              <div className="flex items-center space-x-3 w-[160px] md:w-auto">
                <Image
                  src="/images/FeaturesRowIcons/SecureIcon.svg"
                  alt="Secure payments"
                  width={24}
                  height={24}
                  className="h-6 w-auto shrink-0"
                  style={{ width: "auto", height: "auto" }}
                />
                <p className="text-base font-semibold text-[#004D4C]">
                  Secure payments
                </p>
              </div>
            </div>

            <div className="flex justify-center md:block">
              <div className="flex items-center space-x-3 w-[160px] md:w-auto">
                <Image
                  src="/images/FeaturesRowIcons/RealTimeIcon.svg"
                  alt="Real-time tracking"
                  width={24}
                  height={24}
                  className="h-6 w-auto shrink-0"
                  style={{ width: "auto", height: "auto" }}
                />
                <p className="text-base font-semibold text-[#004D4C]">
                  Real-time tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
