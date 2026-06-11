"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut, X } from "lucide-react";

const navItems = [
  {
    iconPath: "/images/Dashboard_sidebar_icons/overview.svg",
    label: "Overview",
    href: "/admin/dashboard",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/orders.svg",
    label: "Orders",
    href: "/admin/orders",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/vendors.svg",
    label: "Vendors",
    href: "/admin/vendors",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/drivers.svg",
    label: "Drivers",
    href: "/admin/drivers",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/users.svg",
    label: "Users",
    href: "/admin/users",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/commissions.svg",
    label: "Commissions",
    href: "/admin/commissions",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/payments.svg",
    label: "Payments",
    href: "/admin/payments",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/Analitycs.svg",
    label: "Analytics",
    href: "/admin/analytics",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/content.svg",
    label: "Content",
    href: "/admin/content",
  },
  {
    iconPath: "/images/Dashboard_sidebar_icons/disputes.svg",
    label: "Disputes",
    href: "/admin/disputes",
  },
  {
    iconPath: "",
    label: "Settings",
    href: "/admin/settings",
    isSettings: true,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenSidebar = () => setIsOpen(true);
    window.addEventListener("openSidebar", handleOpenSidebar);
    return () => window.removeEventListener("openSidebar", handleOpenSidebar);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-45 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-[280px]  h-dvh bg-[#207951] flex flex-col fixed left-0 top-0 z-50 text-white transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-[18px] right-4 text-white/70 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* Logo Section */}
        <div className="py-4 md:py-8 pb-2 md:pb-4 flex justify-center shrink-0">
          <Link
            href="/admin/dashboard"
            onClick={() => setIsOpen(false)}
            className="block"
          >
            <div
              className="w-[100px] h-[28px] bg-white"
              style={{
                maskImage: "url(/images/BrandLogo/Denish.svg)",
                maskRepeat: "no-repeat",
                maskSize: "contain",
                WebkitMaskImage: "url(/images/BrandLogo/Denish.svg)",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
              }}
            />
          </Link>
        </div>

        {/* Separator below logo */}
        <div className="border-t border-white mb-1 md:mb-2 shrink-0" />

        {/* Navigation Links */}
        <nav className="flex-1 min-h-0 max-h-[calc(100dvh-185px)] md:max-h-none flex flex-col justify-between md:justify-start py-4 md:py-2 space-y-0.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-8 h-[38px] md:h-[52px] transition-all relative group ${
                    isActive
                      ? "text-[#F9811F] font-bold"
                      : "text-white hover:text-white/80"
                  }`}
                >
                  {/* Active Indicator Bar — flush to the sidebar's left edge */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#F9811F] rounded-r-[2px]" />
                  )}

                  {item.isSettings ? (
                    <Settings
                      className={`w-5 h-5 ${isActive ? "text-[#F9811F]" : "text-white group-hover:text-white"}`}
                    />
                  ) : (
                    <div
                      className={`w-5 h-5 ${isActive ? "bg-[#F9811F]" : "bg-white group-hover:bg-white"}`}
                      style={{
                        maskImage: `url(${item.iconPath})`,
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskImage: `url(${item.iconPath})`,
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        WebkitMaskSize: "contain",
                      }}
                    />
                  )}
                  <span className="text-[14px] md:text-[16px] font-medium">
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Separator above profile */}
        <div className="border-t border-white mt-1 md:mt-2 shrink-0" />

        {/* User Profile & Logout */}
        <div className="p-3 md:p-4 mb-2 md:mb-4 space-y-1 md:space-y-2 shrink-0">
          <div className="flex items-center gap-3 p-2 md:p-3 rounded-[16px] hover:bg-white/5 transition-all">
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white/20">
              <Image
                src="/images/missionpageImages/cake.png"
                alt="Admin"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] md:text-[14px] font-bold text-white truncate">
                Denish Admin
              </p>
              <p className="text-[11px] md:text-[12px] text-white/50 truncate">
                denishadmin@gmail.com
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-[12px] text-white/70 hover:text-white hover:bg-white/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[13px] md:text-[14px] font-medium">
              Log out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
