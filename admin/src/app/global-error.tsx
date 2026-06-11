"use client";

import { useEffect } from "react";
import { Plus_Jakarta_Sans, Inter, DM_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${dmSans.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF9] p-4 text-center">
          <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-2xl shadow-teal-900/10 border border-teal-50">
            <h1 className="text-4xl font-extrabold text-[#004D4C] mb-6 tracking-tight font-plus-jakarta">
              A Critical Error Occurred
            </h1>
            <p className="text-[#4F6260] mb-10 leading-relaxed font-inter">
              We encountered a system-level issue. Please try refreshing or
              restarting the application.
            </p>
            <button
              onClick={() => reset()}
              className="w-full bg-[#0b5c54] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#094d46] transition-all font-dm-sans shadow-lg shadow-teal-900/20 active:scale-95"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
