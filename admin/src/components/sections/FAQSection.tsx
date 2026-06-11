"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What can I order on the Denish App?",
    answer:
      "You can order hot meals from restaurants, fresh groceries, bakery items, and pharmacy essentials from verified vendors in your area.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery typically takes between 20 to 45 minutes, depending on the distance, traffic conditions, and preparation time.",
  },
  {
    question: "Can I track my order in real-time?",
    answer:
      "Yes! Once your order is dispatched, you can monitor the rider's exact location in real-time directly through the app.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support major credit/debit cards, direct bank transfers, and seamless mobile wallet integrations for checkout.",
  },
  {
    question: "Are pharmacy items safe to order?",
    answer:
      "Absolutely. All our pharmacy partners are strictly vetted and fully certified to dispense over-the-counter and standard medical essentials safely.",
  },
  {
    question: "How can I become a vendor or rider?",
    answer:
      "You can apply directly through our Partner Portal available at the top navigation menu, or by clicking the 'Partner With Us' banner links above!",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pt-16 pb-[113px] md:py-[113px] bg-[#F8FAF9] relative" id="faq">
      <div className="w-full max-w-[1216px] mx-auto px-4 xl:px-0 flex flex-col items-center">
        {/* Header Content */}
        <div className="text-center mb-10 md:mb-[64px]">
          <h2
            className="text-[36px] font-extrabold text-[#191C1C] leading-[40px]"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)", fontSize: "var(--fs-h2)" }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQs List */}
        <div className="w-full max-w-[768px] mx-auto flex flex-col gap-[16px]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="w-full bg-[#F2F4F3] rounded-[12px] overflow-hidden"
              >
                {/* Question Row (Clickable) */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-[24px] py-[24px] flex flex-row items-center justify-between text-left focus:outline-none transition-colors hover:bg-[#EAECEC]"
                >
                  <span
                    className="text-[16px] font-semibold text-[#191C1C] leading-[24px] pr-4"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
                  >
                    {faq.question}
                  </span>

                  {/* Plus/Minus Toggle Icon */}
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="w-6 h-6 relative shrink-0 flex items-center justify-center text-[#004D4C]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#004D4C]"
                    >
                      <path
                        d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z"
                        fill="#004D4C"
                      />
                    </svg>
                  </motion.div>
                </button>

                {/* Answer Block (Collapsible) */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div
                        className="px-[24px] pb-[24px] pt-0 text-[15px] font-normal text-[#3E4948] leading-[24px]"
                        style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
