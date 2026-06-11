"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export type NavLink = {
  label: string;
  href: string;
};

const navbarLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Vendors", href: "/vendors" },
  { label: "For Riders", href: "/riders" },
  { label: "Testimonials", href: "/#testimonials" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = navbarLinks;

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="w-full bg-[#F8FAF9] border-b border-[#D9D9D9] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px]">
        <div className="flex justify-between items-center py-4 md:py-[25px] h-[64px] md:h-[98px]">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/BrandLogo/Denish.svg"
              alt="Denish Logo"
              width={124}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu - Center/Right Aligned */}
          <div
            className="hidden md:flex flex-1 justify-center items-center"
            style={{ fontFamily: "var(--font-dm-sans)", gap: "clamp(1.5rem, 2.5vw, 2.5rem)" }}
          >
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-2 leading-none transition-colors ${
                    isActive
                      ? "text-[#004D4C] font-bold"
                      : "text-[#3E4948] font-medium hover:text-[#0b5c54]"
                  }`}
                  style={{ fontSize: "clamp(15px, 0.3vw + 13px, 20px)" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center shrink-0">
            <Link
              href="#cta-section"
              className="bg-[#0b5c54] text-white font-medium leading-none rounded-xl hover:bg-[#094d46] transition-colors shadow-sm shiny-btn"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(15px, 0.3vw + 13px, 20px)",
                padding: "clamp(10px, 0.5vw + 6px, 14px) clamp(16px, 1vw + 8px, 24px)",
              }}
            >
              Download App
            </Link>
          </div>

          {/* Mobile menu button - Floats right because of justify-between */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#004D4C] hover:bg-teal-50 p-2 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white absolute top-full left-0 right-0 z-100 border-b border-gray-100 shadow-2xl"
          >
            <div
              className="px-4 pt-2 pb-6 space-y-4"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 text-[20px] transition-all rounded-md ${
                      isActive
                        ? "text-[#004D4C] font-bold bg-teal-50"
                        : "text-[#3E4948] font-medium hover:text-[#0b5c54] hover:bg-teal-50"
                    }`}
                    style={{ fontSize: "var(--fs-body-xl)" }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="#cta-section"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center mt-6 bg-[#0b5c54] text-white text-[20px] font-medium leading-none px-6 py-3.5 rounded-xl hover:bg-[#094d46] transition-colors shadow-sm shiny-btn"
                style={{ fontSize: "var(--fs-body-xl)" }}
              >
                Download App
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
