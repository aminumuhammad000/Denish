import { motion } from "framer-motion";

export function ServiceAreasSection() {
  return (
    <section
      className="bg-[#F2F4F3] pt-16 pb-[100px] md:py-[100px] w-full overflow-hidden"
      id="service-areas"
    >
      <div className="w-full max-w-[1236px] mx-auto px-4 xl:px-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8 w-full">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col w-full max-w-[380px] md:max-w-[420px] xl:max-w-[500px] shrink"
          >
            <h2
              className="text-[40px] md:text-[48px] font-extrabold text-[#191C1C] leading-[1.2] md:leading-[48px] mb-8 md:mb-[42px]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-h2)" }}
            >
              Service Areas
            </h2>
            <p
              className="text-[16px] md:text-[18px] font-normal text-[#3E4948] leading-[29.25px] max-w-[471px]"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
            >
              Denish is currently available in major Nigerian cities like Ilorin
              with plans to expand nationwide. Stay tuned as we bring
              convenience closer to you.
            </p>
          </motion.div>

          {/* Right Map Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full md:flex-1 flex justify-center md:justify-end"
          >
            <div className="relative w-full max-w-[550px] aspect-4/3 md:aspect-auto md:h-[414px]">
              <img
                src="/images/mapImage/location 1.png"
                alt="Map showing current Denish service areas and pindrops"
                className="w-full h-full object-contain md:object-right"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
