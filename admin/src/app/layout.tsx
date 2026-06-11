import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Denish | Premium Delivery Service",
  description: "Everything you need, delivered to your doorstep. Order delicious meals, fresh cakes, pharmacy essentials, and everyday groceries.",
};

import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>

        <Toaster position="bottom-right" expand={false} richColors />
        <Navbar />
        <main className="grow flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
