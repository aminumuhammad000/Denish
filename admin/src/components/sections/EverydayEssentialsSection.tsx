"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Static image imports for automatic blur placeholders
import riceAndPlantain from "../../../public/images/missionpageImages/riceAndPlantain.png";
import pillsAndStet from "../../../public/images/missionpageImages/pillsAndStet.png";
import fruits from "../../../public/images/missionpageImages/fruits.png";
import cake from "../../../public/images/missionpageImages/cake.png";

export function EverydayEssentialsSection() {
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
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section
      id="essentials"
      className="pt-24 md:pt-[160px] pb-[120px] bg-white relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-[100px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* 1. Title - First on mobile, first row left column on desktop */}
          <motion.div
            className="w-full md:max-w-[618px] order-1 md:col-start-1 md:row-start-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2
              className="text-4xl md:text-[48px] font-extrabold tracking-[-1.5px] text-[#004D4C] leading-[1.1] text-center md:text-left"
              style={{
                fontFamily: "var(--font-plus-jakarta-sans)",
                fontSize: "var(--fs-h2)",
              }}
            >
              Your Everyday Essentials,
              <br />
              <span className="text-[#F9811F]">One Tap Away</span>
            </h2>
          </motion.div>

          {/* 2. Image Grid - Second on mobile, vertical span in right column on desktop */}
          <motion.div
            className="w-full md:flex-1 grid grid-cols-2 gap-4 auto-rows-min max-w-[600px] md:max-w-none order-2 md:col-start-2 md:row-start-1 md:row-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* Left Image Sub-Column */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-square rounded-[12px] overflow-hidden shadow-sm">
                <Image
                  src={riceAndPlantain}
                  alt="Egusi soup with assorted meat "
                  fill
                  placeholder="blur"
                  quality={60}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative w-full aspect-4/5 rounded-[12px] overflow-hidden shadow-sm">
                <Image
                  src={pillsAndStet}
                  alt="Pounded Yam with Egusi soup and meats"
                  fill
                  placeholder="blur"
                  quality={60}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right Image Sub-Column */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-4/5 rounded-[12px] overflow-hidden shadow-sm">
                <Image
                  src={fruits}
                  alt="Jollof rice with fish"
                  fill
                  placeholder="blur"
                  quality={60}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative w-full aspect-square rounded-[12px] overflow-hidden shadow-sm">
                <Image
                  src={cake}
                  alt="Vegetable soup with assorted meats"
                  fill
                  placeholder="blur"
                  quality={60}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </motion.div>

          {/* 3. Body Content - Third on mobile, second row left column on desktop */}
          <motion.div
            className="w-full md:max-w-[618px] flex flex-col gap-8 md:gap-[42px] order-3 md:col-start-1 md:row-start-2 self-start md:mt-[-40px]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="flex flex-col gap-6">
              <motion.p
                variants={fadeInUp}
                className="text-[#4F6260] text-[18px] leading-[28.8px] font-normal text-left md:text-left"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "var(--fs-body-lg)",
                }}
              >
                Denish App is your all-in-one delivery platform designed to make
                life easier. Whether you{"'"}re craving your favorite meal,
                celebrating with a cake, or in urgent need of pharmacy items,
                Denish connects you to trusted vendors and delivers straight to
                your doorstep.
              </motion.p>

              {/* Mission & Vision */}
              <div className="flex flex-col gap-6">
                {/* Mission Item */}
                <motion.div
                  variants={fadeInUp}
                  className="flex gap-4 items-start"
                >
                  <div className="shrink-0 relative w-[40px] h-[40px]">
                    <Image
                      src="/images/checkBulletPoints.svg"
                      alt="Check icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4
                      className="font-bold text-[#F9811F] text-[18px] leading-[28.8px]"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "var(--fs-body-xl)",
                      }}
                    >
                      Our Mission
                    </h4>
                    <p
                      className="text-[#4F6260] text-[16px] leading-[25.6px] font-normal"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "var(--fs-body-lg)",
                      }}
                    >
                      To simplify daily living by providing fast, reliable, and
                      convenient access to food and essential products.
                    </p>
                  </div>
                </motion.div>

                {/* Vision Item */}
                <motion.div
                  variants={fadeInUp}
                  className="flex gap-4 items-start"
                >
                  <div className="shrink-0 relative w-[40px] h-[40px]">
                    <Image
                      src="/images/checkBulletPoints.svg"
                      alt="Check icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4
                      className="font-bold text-[#F9811F] text-[18px] leading-[28.8px]"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "var(--fs-body-xl)",
                      }}
                    >
                      Our Vision
                    </h4>
                    <p
                      className="text-[#4F6260] text-[16px] leading-[25.6px] font-normal"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "var(--fs-body-lg)",
                      }}
                    >
                      To become Nigeria{"'"}s most trusted platform for
                      on-demand delivery of meals and everyday essentials.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
