

import { useState, useEffect } from "react";
import { AnalyticsStats } from "@/components/admin/AnalyticsStats";
import {
  OrderCuisineChart,
  PeakHoursChart,
  CustomerMetricsChart,
  RevenueTrendList,
  OrdersByAreaChart,
  UserGrowthChart,
} from "@/components/admin/AnalyticsCharts";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
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
      <div className="px-[clamp(1rem,3vw,2rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center flex-1 bg-white">
        <div className="w-full max-w-[992px] flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-[28px] font-bold text-[#191C1C]">
              Analytics Dashboard
            </h1>
          </div>

          {/* Top Stats Cards */}
          <AnalyticsStats />

          {/* Middle Section: Donut, Area, Radar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch w-full gap-[16px] lg:gap-[25px]">
            <OrderCuisineChart />
            <PeakHoursChart />
            <CustomerMetricsChart />
          </div>

          {/* Bottom Section: Revenue Trend and Area Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[26px] w-full">
            <div className="lg:col-span-1">
              <RevenueTrendList />
            </div>
            <div className="lg:col-span-1">
              <OrdersByAreaChart />
            </div>
          </div>

          {/* User Growth Full Width Section */}
          <UserGrowthChart />
        </div>
      </div>
    </>
  );
}
