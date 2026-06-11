"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#F8FAF9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-teal-900/5 text-center border border-teal-50"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-orange-50 rounded-full">
            <AlertCircle className="w-12 h-12 text-[#F9811F]" />
          </div>
        </div>

        <h1
          className="text-3xl font-extrabold text-[#004D4C] mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          Something went wrong!
        </h1>

        <p
          className="text-[#4F6260] mb-8 leading-relaxed"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          An unexpected error occurred while loading this page. Our team has
          been notified and we&apos;re working to fix it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#0b5c54] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#094d46] transition-all hover:shadow-lg active:scale-95"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <RefreshCw className="w-5 h-5" />
            Try again
          </button>

          <Link
            href="/"
            className="flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-[#3E4948] bg-white border border-[#D9D9D9] hover:bg-gray-50 transition-all active:scale-95"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
