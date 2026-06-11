import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MapPinOff, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="grow flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-teal-50 blur-3xl opacity-50 rounded-full" />
          <div className="relative p-6 bg-white rounded-full shadow-2xl shadow-teal-900/10 border border-teal-50">
            <MapPinOff className="w-16 h-16 text-[#004D4C]" />
          </div>
        </div>

        <h1
          className="text-7xl md:text-9xl font-extrabold text-[#004D4C] opacity-10 -mb-6 md:-mb-10"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          404
        </h1>

        <h2
          className="text-4xl md:text-5xl font-extrabold text-[#004D4C] mb-6 tracking-tight relative z-10"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          Page Not Found
        </h2>

        <p
          className="text-[#4F6260] text-lg max-w-md mb-12 leading-relaxed"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          The page you&apos;re looking for might have been moved, deleted, or
          never existed in the first place. Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="flex items-center gap-2 bg-[#0b5c54] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#094d46] transition-all shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 active:scale-95 group"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Homepage
        </Link>
      </main>
      <Footer />
    </div>
  );
}
