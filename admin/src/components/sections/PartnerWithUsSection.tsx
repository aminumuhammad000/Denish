"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Static image imports for automatic blur placeholders
import becomeVendorImg from "../../../public/images/PartnerWithUsImages/becomeAvendor.png";
import signUpRiderImg from "../../../public/images/PartnerWithUsImages/signUpAsaRider.png";

export function PartnerWithUsSection() {
  return (
    <section
      className="pt-16 pb-[113px] md:py-[113px] bg-[#F8FAF9] relative"
      id="partner-with-us"
    >
      <div className="w-full max-w-[1216px] mx-auto px-4 xl:px-0 flex flex-col items-center">
        {/* Header Content */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-[64px] max-w-[700px]">
          <h2
            className="text-[36px] font-extrabold text-[#191C1C] leading-[40px] mb-4"
            style={{
              fontFamily: "var(--font-plus-jakarta-sans)",
              fontSize: "var(--fs-h2)",
            }}
          >
            Partner With Us
          </h2>
          <p
            className="text-[16px] text-[#3F4948] font-normal leading-[24px]"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "var(--fs-body-lg)",
            }}
          >
            Are You a Restaurant, Bakery, Pharmacy, or Grocery Store?
            <br className="hidden md:block" />
            Join the Denish marketplace and grow your business by reaching
            thousands of customers.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] w-full">
          {/* Vendor Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-[320px] rounded-[16px] overflow-hidden group cursor-pointer"
          >
            <Image
              src={becomeVendorImg}
              alt="Become a Vendor"
              fill
              placeholder="blur"
              quality={60}
              className="object-cover object-bottom scale-150 origin-bottom lg:scale-110 group-hover:scale-[1.55] md:group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-[#004D4C]/95 via-[#004D4C]/40 to-transparent" />

            {/* Content Bottom Anchor */}
            <div className="absolute bottom-0 left-0 p-[32px] flex flex-col items-start w-full z-10">
              <h3
                className="text-[24px] font-semibold text-white mb-2 leading-[32px]"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "var(--fs-h3)",
                }}
              >
                Become a Vendor
              </h3>
              <p
                className="text-[14px] font-normal text-white/90 mb-[24px] leading-[20px] max-w-[280px]"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "var(--fs-body-sm)",
                }}
              >
                Grow your business and reach thousands of new customers with
                Denish.
              </p>
              <Link
                href="/vendors"
                className="bg-white text-[#004D4C] px-[24px] py-[12px] rounded-[8px] text-[14px] font-bold active:scale-95 transition-all shadow-md hover:bg-gray-50 shiny-btn"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Become a Vendor
              </Link>
            </div>
          </motion.div>

          {/* Rider Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full h-[320px] rounded-[16px] overflow-hidden group cursor-pointer"
          >
            <Image
              src={signUpRiderImg}
              alt="Sign Up as a Rider"
              fill
              placeholder="blur"
              quality={60}
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-[#F9811F]/95 via-[#F9811F]/40 to-transparent" />

            {/* Content Bottom Anchor */}
            <div className="absolute bottom-0 left-0 p-[32px] flex flex-col items-start w-full z-10">
              <h3
                className="text-[24px] font-semibold text-white mb-2 leading-[32px]"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "var(--fs-h3)",
                }}
              >
                Sign Up as a Rider
              </h3>
              <p
                className="text-[14px] font-normal text-white/90 mb-[24px] leading-[20px] max-w-[288px]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Earn competitive pay and choose your own hours working as a
                Denish rider.
              </p>
              <Link
                href="/riders"
                className="bg-white text-[#F9811F] px-[24px] py-[12px] rounded-[8px] text-[14px] font-bold active:scale-95 transition-all shadow-md hover:bg-gray-50 shiny-btn"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Become a Rider
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
