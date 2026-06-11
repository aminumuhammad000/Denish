"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { CTASection } from "@/components/sections/CTASection";
import PrivacyLoading from "./loading";

export default function PrivacyPage() {
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
    return <PrivacyLoading />;
  }

  return (
    <div className="bg-white min-h-screen pt-0 md:pt-10">
      {/* Hero Section */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] mt-8 md:mt-[40px] mb-[40px] md:mb-[64px]">
        <div className="relative w-full h-[200px] md:h-[409px] rounded-[20px] overflow-hidden">
          <Image
            src="/images/Privacy_policy.png"
            alt="Privacy Policy"
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
            Privacy Policy
          </h2>
          <p className="text-[14px] mb-8 font-medium">
            Last updated: August, 2026.
          </p>

          <div
            className="space-y-6 text-[16px] leading-[28px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <p>
              Denish App (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates www.denishapp.com (&quot;Website&quot;).
              This Privacy Policy describes how we collect, use, and share information when you visit or use services from our App or Website.
            </p>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                1. Information We Collect
              </h3>
              <p className="mb-2">
                <strong>Personal Information:</strong> We may collect personal information such as your name, email address, phone number, and payment information when you register, make a purchase, or contact us.
              </p>
              <p>
                <strong>Usage Data:</strong> We may collect information about how you access and use the App or Website. This may include your IP address, device type, operating system, referring URLs, and pages visited.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                2. How We Use Your Information
              </h3>
              <p className="mb-2">
                <strong>To Provide Services:</strong> We use the information we collect to provide and improve our services, communicate with you, and process payments.
              </p>
              <p className="mb-2">
                <strong>To Communicate:</strong> We may use your contact information to send you updates, newsletters, and marketing communications. You can opt out of these communications at any time.
              </p>
              <p>
                <strong>To Improve Our Services:</strong> We use usage data to analyze how our App and Website are used and to improve functionality and content.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                3. Sharing Your Information
              </h3>
              <p className="mb-2">
                <strong>Third-Party Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, and email delivery.
              </p>
              <p>
                <strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                4. Data Security
              </h3>
              <p>
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                5. Cookies
              </h3>
              <p>
                We use cookies and similar tracking technologies to track activity on our Website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Website.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                6. Third-Party Links
              </h3>
              <p>
                Our App or Website may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party&apos;s site. We strongly advise you to review the privacy policy of every site you visit.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                7. Children&apos;s Privacy
              </h3>
              <p>
                Our services do not address anyone under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                8. Changes to This Privacy Policy
              </h3>
              <p>
                We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div>
              <h3 className="text-[20px] font-bold text-[#191C1C] mb-2 mt-8">
                Contact Us
              </h3>
              <p className="mb-2">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a
                  href="mailto:support@denishapp.com"
                  className="text-[#004D4C] font-semibold hover:underline"
                >
                  support@denishapp.com
                </a>
                .
              </p>
              <p>
                By using our App and Website, you agree to the terms outlined in this Privacy Policy document. Thank you for choosing us.
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
