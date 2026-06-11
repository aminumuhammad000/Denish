"use client";

import { Search, Bell, Menu, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function TopNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Dispute Filed",
      message: "Customer Aisha Mohammed filed a dispute for Order ORD-001.",
      time: "5m ago",
      read: false,
    },
    {
      id: "2",
      title: "Driver Registration",
      message: "New driver Bayo Adeyemi submitted registration documents.",
      time: "1h ago",
      read: false,
    },
    {
      id: "3",
      title: "Payout Completed",
      message: "Weekly vendor payout of N245K processed successfully.",
      time: "3h ago",
      read: true,
    },
  ]);

  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const closeMenu = () => setIsMenuOpen(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [isMenuOpen]);

  // Close notifications dropdown on click outside
  useEffect(() => {
    if (!isNotificationsOpen) return;
    const closeNotifications = () => setIsNotificationsOpen(false);
    window.addEventListener("click", closeNotifications);
    return () => window.removeEventListener("click", closeNotifications);
  }, [isNotificationsOpen]);

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

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsMenuOpen(false);
  };

  return (
    <div
      className={`bg-[#FFFFFF] h-[72px] md:h-[100px] pt-2 md:py-[10px] flex items-center justify-between px-4 md:px-[72px] sticky top-0 z-20 transition-all duration-300 ${
        isScrolled
          ? "border-b border-[#EAEAEA] shadow-sm"
          : "border-b border-transparent"
      }`}
    >
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new Event("openSidebar"))}
          className="md:hidden p-1.5 -ml-2 text-[#191C1C] rounded-md shrink-0 active:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-[12px] w-[180px] md:w-[272px] h-[40px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-[#F8FAF9]">
          <Search className="w-[16px] h-[16px] text-[#747475]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
          />
        </div>
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-[16px] relative">
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className={`relative w-[36px] h-[36px] md:w-[42px] md:h-[42px] flex items-center justify-center border rounded-full transition-all ${
              isNotificationsOpen
                ? "border-[#F9811F] bg-[#F9811F]/5 text-[#F9811F]"
                : "border-[#EAEAEA] hover:bg-gray-50 text-[#747475]"
            }`}
          >
            <Bell className={`w-[18px] h-[18px] md:w-[20px] md:h-[20px] ${isNotificationsOpen ? "text-[#F9811F]" : "text-[#747475]"}`} />
            {hasUnread && (
              <span className="absolute -top-px -right-px w-[8px] md:w-[11px] h-[8px] md:h-[11px] rounded-full bg-[#EF4444] border-2 border-white shadow-sm animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-[-80px] md:right-0 top-[calc(100%+12px)] w-[280px] md:w-[360px] bg-white rounded-[20px] border border-[#F2F4F3] shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-30 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F8FAF9]">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-[#191C1C]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F9811F]/10 text-[#F9811F] text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-medium text-[#207951] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[280px] overflow-y-auto divide-y divide-[#F8FAF9]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F8FAF9] flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-[#C0C0C0]" />
                    </div>
                    <p className="text-[13px] font-medium text-[#191C1C]">All caught up!</p>
                    <p className="text-[11px] text-[#747475] mt-1">No new notifications at the moment.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`px-5 py-4 hover:bg-[#F8FAF9] transition-all cursor-pointer flex items-start gap-3 relative ${
                        !notification.read ? "bg-[#F9811F]/5" : ""
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {!notification.read && (
                        <span className="absolute left-2.5 top-[22px] w-2 h-2 rounded-full bg-[#F9811F]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[13px] font-bold text-[#191C1C] truncate ${!notification.read ? "pr-2" : ""}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-[#9A9A9A] shrink-0">{notification.time}</span>
                        </div>
                        <p className="text-[12px] text-[#747475] mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-[#F8FAF9] flex justify-end">
                  <button
                    onClick={clearAll}
                    className="text-[11px] font-medium text-[#FF4D4F] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Profile dropdown trigger */}
        <div
          onClick={toggleMenu}
          className="flex items-center gap-[6px] md:gap-[12px] cursor-pointer group select-none"
        >
          <div className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full overflow-hidden border border-[#EAEAEA] active:scale-95 transition-transform">
            <Image
              src="/images/missionpageImages/cake.png"
              alt="Admin"
              width={42}
              height={42}
              className="object-cover"
            />
          </div>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`text-[#747475] transition-transform duration-300 ${isMenuOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Floating dropdown menu */}
        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-[calc(100%+12px)] w-[180px] bg-white rounded-[16px] border border-[#F2F4F3] shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="px-4 py-2 border-b border-[#F8FAF9] mb-1">
              <p className="text-[13px] font-bold text-[#191C1C]">Admin Portal</p>
              <p className="text-[11px] text-[#747475] truncate">admin@denish.com</p>
            </div>

            <Link
              href="/admin/settings"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[13px] text-[#191C1C] hover:bg-[#F8FAF9] transition-all group"
            >
              <Settings className="w-4 h-4 text-[#747475] group-hover:text-[#207951] group-hover:rotate-45 transition-transform duration-300" />
              <span>Settings</span>
            </Link>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#FF4D4F] hover:bg-red-50/50 transition-all group text-left"
            >
              <LogOut className="w-4 h-4 text-[#FF4D4F] group-hover:translate-x-0.5 transition-transform" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
