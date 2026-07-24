

import { useState, useEffect } from "react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ChartsSection } from "@/components/admin/ChartsSection";
import { TopVendors } from "@/components/admin/TopVendors";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { HourlyOrdersChart } from "@/components/admin/HourlyOrdersChart";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { useAdminStore } from "@/lib/store";


export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  const { fetchAllData } = useAdminStore();

  useEffect(() => {
    fetchAllData();
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);


  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  return (
    <>
      {/* Page Content Container */}
      <div className="px-[clamp(1rem,3vw,2rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
        <div className="w-full pb-8 flex flex-col gap-8 px-6">
          {/* Page Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
            <h1 className="text-[clamp(1.5rem,4vw,1.75rem)] font-bold text-[#191C1C]">
              Dashboard Overview
            </h1>
            <p className="text-[12px] text-[#747475]">
              Last updated:{" "}
              <span className="font-medium text-[#191C1C]">Just now</span>
            </p>
          </div>

          {/* Stats Grid */}
          <DashboardStats />

          {/* Main Activity Sections */}
          <ChartsSection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
              <HourlyOrdersChart />
            </div>
            <div className="lg:col-span-1">
              <TopVendors />
            </div>
          </div>

          <RecentOrders />
        </div>
      </div>
    </>
  );
}
