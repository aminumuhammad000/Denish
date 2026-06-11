"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// Brand icons replaced with SVGs

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#004D4C] text-white pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-[100px]">
        <div className="flex flex-col md:flex-row justify-between items-start w-full gap-12 md:gap-4 mb-12">
          {/* Brand Info */}
          <div className="w-full max-w-[344px] space-y-4">
            <Link
              href="/"
              className="text-[20px] font-semibold leading-[28px] tracking-[0px] text-[#F2F4F3] inline-block mb-2"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-h4)" }}
            >
              Denish
            </Link>
            <p
              className="font-normal text-[14px] leading-[22.75px] text-[#F2F4F3] w-full max-w-[344px]"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-sm)" }}
            >
              Premium delivery service tailored for
              <br />
              the Nigerian lifestyle. Fast, secure, and
              <br className="hidden md:block" />
              reliable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="w-full max-w-[150px]">
            <h3
              className="font-semibold text-[16px] leading-[24px] text-[#F2F4F3] mb-6"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
            >
              Quick Links
            </h3>
            <ul
              className="space-y-4 font-normal text-[14px] leading-[20px] text-[#F2F4F3]"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-sm)" }}
            >
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white underline-offset-4"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white underline-offset-4"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="w-full max-w-[150px]">
            <h3
              className="font-semibold text-[16px] leading-[24px] text-[#F2F4F3] mb-6"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
            >
              Navigation
            </h3>
            <ul
              className="space-y-4 font-normal text-[14px] leading-[20px] text-[#F2F4F3]"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-sm)" }}
            >
              <li>
                <Link
                  href="/vendors"
                  className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white underline-offset-4"
                >
                  For Vendors
                </Link>
              </li>
              <li>
                <Link
                  href="/riders"
                  className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white underline-offset-4"
                >
                  For Riders
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white underline-offset-4"
                >
                  Main Site
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="w-full md:w-auto md:max-w-[300px]">
            <h3
              className="font-semibold text-[16px] leading-[24px] text-[#F2F4F3] mb-6"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-lg)" }}
            >
              Contact Us
            </h3>
            <ul
              className="space-y-4 font-normal text-[14px] leading-[20px] text-[#F2F4F3]"
              style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-body-sm)" }}
            >
              <li>Email: support@denishapp.com</li>
              <li>Phone: +234 800 000 0000</li>
              <li>Address: Kano, Nigeria</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F2F4F3] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p
            className="font-normal text-[14px] leading-[20px] text-[#F2F4F3]"
            style={{ fontFamily: "var(--font-inter)", fontSize: "var(--fs-xs)" }}
          >
            © 2026 Denish App. Excellence in Delivery.
          </p>
          <div className="flex space-x-6">
            <Link
              href="#"
              className="hover:text-white transition-transform hover:scale-110"
              aria-label="Facebook"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="#"
              className="hover:text-white transition-transform hover:scale-110"
              aria-label="Instagram"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="#"
              className="hover:text-white transition-transform hover:scale-110"
              aria-label="X"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
