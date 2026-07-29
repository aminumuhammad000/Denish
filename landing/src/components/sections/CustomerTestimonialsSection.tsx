

import { motion } from "framer-motion";

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  initials: string;
};

const defaultTestimonials: Testimonial[] = [
  {
    quote:
      "Denish App makes ordering food and essentials so easy. The delivery is always fast and reliable!",
    name: "Aisha M.",
    location: "Kano",
    initials: "AM",
  },
  {
    quote:
      "I love that I can order my medications and birthday cakes from the same app. Highly recommended!",
    name: "Musa A.",
    location: "Abuja",
    initials: "MA",
  },
  {
    quote:
      "The real-time tracking feature gives me peace of mind. Great service!",
    name: "Chioma E.",
    location: "Lagos",
    initials: "CE",
  },
];

function StarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="#BC3C0D"
      />
    </svg>
  );
}


interface Props {
  title?: string;
  testimonials?: Testimonial[];
}

export function CustomerTestimonialsSection({
  title = "Customer Testimonials",
  testimonials = defaultTestimonials,
}: Props) {
  return (
    <section className="pt-16 pb-[113px] md:py-[113px] bg-[#F2F4F3] relative scroll-mt-[120px]" id="testimonials">
      <div className="w-full max-w-[1216px] mx-auto px-4 xl:px-0 flex flex-col items-center">
        {/* Header Content */}
        <div className="text-center mb-10 md:mb-[64px]">
          <h2
            className="text-[36px] font-extrabold text-[#191C1C] leading-[40px]"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-h2)" }}
          >
            {title}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[48px] w-full">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-white rounded-[12px] p-[32px] flex flex-col items-start w-full min-h-[251px]"
              style={{ width: "100%" }}
            >
              {/* Star Ratings */}
              <div className="flex flex-row space-x-1 mb-[24px]">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>

              {/* Quote Block */}
              <p
                className="text-[16px] font-normal italic text-[#3E4948] leading-[24px] grow"
                style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
              >
                &quot;{testimonial.quote}&quot;
              </p>

              {/* User Identity Block */}
              <div className="flex flex-row items-center mt-[24px] space-x-3">
                {/* Avatar Initial Placeholder */}
                <div
                  className="w-[44px] h-[44px] rounded-full bg-[#E1E3E2] flex items-center justify-center text-[16px] font-bold text-[#004D4C]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {testimonial.initials}
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-[16px] font-semibold text-[#191C1C] leading-[24px]"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
                  >
                    {testimonial.name}
                  </span>
                  <span
                    className="text-[14px] font-normal text-[#788584] leading-[20px]"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-sm)" }}
                  >
                    {testimonial.location}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
