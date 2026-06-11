"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { CTASection } from "@/components/sections/CTASection";
import TermsLoading from "./loading";

export default function TermsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    if (isMounted) {
      window.scrollTo(0, 0);
    }
  }, [isMounted]);

  if (!isMounted) {
    return <TermsLoading />;
  }

  return (
    <div className="bg-white min-h-screen pt-0 md:pt-10">
      {/* Hero Section */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] mt-8 md:mt-[40px] mb-[40px] md:mb-[64px]">
        <div className="relative w-full h-[200px] md:h-[409px] rounded-[20px] overflow-hidden">
          <Image
            src="/images/Terms_of_service.png"
            alt="Terms of Service"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-[800px] mx-auto px-4 text-[#3E4948] pb-20 md:pb-32">
        <div className="prose prose-lg max-w-none">
          <h2
            className="text-[32px] font-bold text-[#191C1C] mb-4"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            Terms of Service
          </h2>
          <p className="text-[14px] mb-8 font-medium">
            Last updated: August, 2026.
          </p>

          <div
            className="space-y-6 text-[16px] leading-[28px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <p>
              Welcome to my Website. These terms and conditions outline the
              rules and regulations for the use of Denish App&apos;s Website,
              located at www.denishapp.com.
            </p>
            <p>
              By accessing this website, we assume you accept these terms and
              conditions. Do not continue to use if you do not agree to take all
              of the terms and conditions stated on this page.
            </p>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                1. Definitions
              </h3>
              <p className="mb-2">
                &quot;Client&quot; refers to any individual or business entity
                that engages the services of Denish App.
              </p>
              <p className="mb-2">
                &quot;Services&quot; refer to premium delivery services,
                including food, pharmacy, groceries, and other related services
                provided by Denish App.
              </p>
              <p>
                &quot;Deliverables&quot; refer to the final products or results
                provided by Denish App to the Client as part of the Services.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                2. Services
              </h3>
              <p>
                Denish App provides a range of services including premium
                on-demand delivery. All services will be carried out with
                reasonable care and skill, consistent with industry standards.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                3. No Free Work
              </h3>
              <p>
                All services provided by Denish App are subject to fees agreed
                upon in advance. No work will be undertaken without a clear,
                written agreement detailing the scope of work and associated
                costs. Requests for free work will be politely declined.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                4. Time Management
              </h3>
              <p className="mb-2">
                Denish App will endeavor to meet all agreed-upon deadlines.
                However, any timelines provided are estimates and are not
                guaranteed.
              </p>
              <p className="mb-2">
                Clients must provide all necessary information and materials
                required for the completion of the delivery or service in a
                timely manner.
              </p>
              <p>
                Delays caused by the Client (e.g., late availability or
                feedback) may result in adjusted timelines and additional fees.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                5. Payment Terms
              </h3>
              <p className="mb-2">
                Payment terms are established before commencement of the
                service.
              </p>
              <p className="mb-2">
                Final payment is due upon completion of the service and before
                the final deliverables are handed over.
              </p>
              <p>
                Payment can be made via any discussed and agreed payment channel
                within the app.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                6. Revisions
              </h3>
              <p className="mb-2">
                The Client is entitled to contact support for issues regarding
                their service or delivery.
              </p>
              <p>
                Requests must be made within a working day of delivery of the
                service.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                7. Intellectual Property
              </h3>
              <p className="mb-2">
                Upon full payment, Denish App grants the Client a non-exclusive,
                non-transferable license to use the app for the intended
                purpose.
              </p>
              <p className="mb-2">
                Denish App retains all intellectual property rights to any
                pre-existing materials or components used in the app.
              </p>
              <p>
                The Client is not permitted to resell, redistribute, or use the
                deliverables in any manner not specified in the agreement
                without prior written consent from Denish App.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                8. Confidentiality
              </h3>
              <p className="mb-2">
                Both parties agree to keep all confidential information
                disclosed during the service confidential.
              </p>
              <p>
                Confidential information includes, but is not limited to,
                personal information, business strategies, and proprietary
                information.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                9. Limitation of Liability
              </h3>
              <p className="mb-2">
                Denish App is not liable for any indirect, incidental, or
                consequential damages arising out of or in connection with the
                services provided.
              </p>
              <p>
                The maximum liability of Denish App for any claim arising out of
                the provision of services is limited to the amount paid by the
                Client for those services.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                10. Termination
              </h3>
              <p className="mb-2">
                Either party may terminate the agreement with written notice.
              </p>
              <p>
                In the event of termination, the Client is responsible for
                payment for all work completed up to the date of termination.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                11. Changes to Terms
              </h3>
              <p>
                Denish App reserves the right to modify these terms and
                conditions at any time. Any changes will be posted on this page
                and will become effective immediately upon posting.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                Contact Us
              </h3>
              <p>
                If you have any questions about these Terms and Conditions,
                please contact us at{" "}
                <a
                  href="mailto:support@denishapp.com"
                  className="text-[#004D4C] font-semibold hover:underline"
                >
                  support@denishapp.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <CTASection backgroundColor="#F2F4F3" />
      </div>
    </div>
  );
}
