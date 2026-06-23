

;
import { motion } from "framer-motion";

// Static image imports for automatic priority loading
import googlePlayBtn from "../../../public/images/heroCTAbuttons/googleplaybutton.svg";
import appleStoreBtn from "../../../public/images/heroCTAbuttons/applebutton.svg";

interface Props {
  title?: string;
  subtitle?: string;
  email?: string;
  backgroundColor?: string;
}

export function CTASection({
  title = "Ready to Experience Convenience Like Never Before?",
  subtitle = "Download the Denish App Today and Enjoy Fast Delivery of Food and Essentials.",
  email,
  backgroundColor = "#f8faf9",
}: Props) {
  return (
    <section
      className="pt-16 pb-[96px] md:py-[96px] relative"
      style={{ backgroundColor }}
      id="cta-section"
    >
      <div className="w-full max-w-[1216px] mx-auto px-4 xl:px-0">
        {/* Main CTA Card */}
        <div className="w-full bg-[#004D4C] rounded-[24px] relative overflow-hidden flex flex-col items-center justify-center text-center px-4 py-16 md:py-[112px]">
          {/* Decorative Blur Top Right */}
          <div className="absolute -top-[192px] -right-[192px] w-[384px] h-[384px] bg-[#005755] rounded-full opacity-20 blur-3xl pointer-events-none" />

          {/* Decorative Blur Bottom Left */}
          <div className="absolute -bottom-[192px] -left-[192px] w-[384px] h-[384px] bg-[#005755] rounded-full opacity-20 blur-3xl pointer-events-none" />

          {/* Content Wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center relative z-10 w-full"
          >
            {/* Title */}
            <h2
              className="text-[32px] md:text-[40px] font-extrabold text-white leading-[1.2] md:leading-[48px] max-w-[660px]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-h2)" }}
            >
              {title}
            </h2>

            {/* Subtitle */}
            <p
              className="mt-[16px] mb-[40px] text-[16px] md:text-[18px] font-normal text-white opacity-90 leading-normal max-w-[486px]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-body-lg)" }}
            >
              {subtitle}
            </p>

            {/* CTA Buttons row */}
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-row justify-center items-center gap-[12px] sm:gap-[16px] w-full">
                <a
                  href="#"
                  className="transition-transform hover:scale-105 active:scale-95 inline-block w-full max-w-[130px] sm:max-w-[180px] relative h-[40px] sm:h-[54px] shiny-btn"
                >
                  <img
                    src={googlePlayBtn}
                    alt="Get it on Google Play"
                    className="w-full h-full object-contain"
                  />
                </a>
                <a
                  href="#"
                  className="transition-transform hover:scale-105 active:scale-95 inline-block w-full max-w-[130px] sm:max-w-[180px] relative h-[40px] sm:h-[54px] shiny-btn"
                >
                  <img
                    src={appleStoreBtn}
                    alt="Download on the App Store"
                    className="w-full h-full object-contain"
                  />
                </a>
              </div>
              {email && (
                <p
                  className="text-white font-normal text-[16px]"
                  style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-body-lg)" }}
                >
                  Have questions? Email us at{" "}
                  <a href={`mailto:${email}`} className="underline">
                    {email}
                  </a>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
