

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-[#004D4C] md:bg-[#F8FAF9] pt-[70px] md:pt-[60px] pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] md:relative z-20 pb-[32px] md:pb-0">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-12 md:gap-[58px]">
          {/* Left Column - Content */}
          <div className="w-full relative z-20" style={{ maxWidth: "clamp(300px, 50vw, 638px)" }}>
            <h1
              className="text-[44px] md:text-5xl md:text-[64px] font-extrabold tracking-[-1.8px] text-white md:text-[#004D4C] mb-6 leading-[1.1] md:leading-[1.23]"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Everything You Need,<br />
              <span className="text-[#F9811F] tracking-[0px]">Delivered</span> to Your<br />Doorstep
            </h1>

            <p className="text-[16px] md:text-[18px] font-normal text-[#EAECEC] md:text-[#314948] mb-[40px] max-w-[544px] leading-[26px] md:leading-[28.75px]">
              Order delicious meals, fresh cakes, pharmacy essentials, and everyday groceries—all in one convenient app. Fast, reliable, and designed for your lifestyle.
            </p>

            <div className="flex flex-row justify-start items-center gap-3 sm:gap-4 mt-2">
              <button className="transition-transform hover:scale-105 active:scale-95 rounded-sm overflow-hidden w-full max-w-[130px] sm:max-w-[180px] relative h-[40px] sm:h-[54px] shiny-btn">
                <img src="/images/heroCTAbuttons/googleplaybutton.svg" alt="Get it on Google Play" className="w-full h-full object-contain" />
              </button>

              <button className="transition-transform hover:scale-105 active:scale-95 rounded-sm overflow-hidden w-full max-w-[130px] sm:max-w-[180px] relative h-[40px] sm:h-[54px] shiny-btn">
                <img src="/images/heroCTAbuttons/applebutton.svg" alt="Download on the App Store" className="w-full h-full object-contain" />
              </button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="absolute md:relative inset-0 md:inset-auto z-0 md:z-10 md:ml-auto w-full md:max-w-[544px] aspect-square md:aspect-544/632 mx-auto overflow-hidden">
            <div className="relative h-full w-full md:rounded-[12px] overflow-hidden">
              <img src="/images/HeroImage.png" alt="Delivery Worker" className="w-full h-full object-cover md:object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#004D4C]/90 via-[#004D4C]/40 to-transparent md:hidden" />
            </div>
          </div>
        </div>
      </div>

      {/* Value Prop Bar */}
      <div className="w-full mt-12 md:mt-[110px] relative z-10 bg-[#F2F4F3]">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[100px] py-8 md:py-[50px]">
          <div className="grid grid-cols-2 md:flex md:flex-row justify-center md:justify-between items-center w-full gap-y-10 gap-x-4 md:gap-4 max-w-[1240px] mx-auto">
            <div className="flex items-center space-x-3 w-[160px] md:w-auto">
              <img src="/images/FeaturesRowIcons/FastDeliveryIcon.svg" alt="Fast delivery" className="h-6 w-auto shrink-0" />
              <p className="text-base font-semibold text-[#004D4C]">Fast delivery</p>
            </div>
            <div className="flex items-center space-x-3 w-[160px] md:w-auto">
              <img src="/images/FeaturesRowIcons/TrustedVendorsIcon.svg" alt="Trusted vendors" className="h-6 w-auto shrink-0" />
              <p className="text-base font-semibold text-[#004D4C]">Trusted vendors</p>
            </div>
            <div className="flex items-center space-x-3 w-[160px] md:w-auto">
              <img src="/images/FeaturesRowIcons/SecureIcon.svg" alt="Secure payments" className="h-6 w-auto shrink-0" />
              <p className="text-base font-semibold text-[#004D4C]">Secure payments</p>
            </div>
            <div className="flex items-center space-x-3 w-[160px] md:w-auto">
              <img src="/images/FeaturesRowIcons/RealTimeIcon.svg" alt="Real-time tracking" className="h-6 w-auto shrink-0" />
              <p className="text-base font-semibold text-[#004D4C]">Real-time tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
