"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { TopNavbar } from "@/components/admin/TopNavbar";
import { useAdminStore } from "@/lib/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin" || pathname === "/admin/";
  
  const {
    fetchOrders,
    fetchDrivers,
    fetchVendors,
    fetchUsers,
    fetchDisputes,
    fetchTransactions,
    fetchStats
  } = useAdminStore();

  useEffect(() => {
    if (!isLoginPage) {
      fetchOrders();
      fetchDrivers();
      fetchVendors();
      fetchUsers();
      fetchDisputes();
      fetchTransactions();
      fetchStats();
    }
  }, [isLoginPage, fetchOrders, fetchDrivers, fetchVendors, fetchUsers, fetchDisputes, fetchTransactions, fetchStats]);

  if (isLoginPage) {

    return <>{children}</>;
  }

  const outerBg = pathname === "/admin/settings" ? "bg-[#FDFDFD]" : (pathname === "/admin/disputes" ? "bg-white" : "bg-[#F8FAF9]");
  const mainBg = pathname === "/admin/settings" ? "bg-[#FDFDFD]" : "bg-white";

  return (
    <div className={`min-h-screen relative w-full ${outerBg}`}>
      <AdminSidebar />
      <main className={`md:ml-[280px] ml-0 w-full md:w-[calc(100%-280px)] overflow-x-hidden ${mainBg} h-screen overflow-y-auto flex flex-col`}>
        <TopNavbar />
        {children}
      </main>
    </div>
  );
}
