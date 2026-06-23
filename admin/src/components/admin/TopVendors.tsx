

import { ChevronRight } from "lucide-react";

import { Link } from "react-router-dom";

import { useAdminStore } from "@/lib/store";

export function TopVendors() {
  const vendorsList = useAdminStore((state) => state.vendors);
  
  // Sort by orders and take top 5
  const topVendors = [...vendorsList]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5)
    .map((v, i) => ({
      rank: i + 1,
      name: v.name,
      orders: v.orders,
      revenue: v.revenue
    }));


  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F2F4F3] h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-[#191C1C]">Top Vendors</h3>
        <Link to="/vendors" className="text-[14px] text-[#207951] font-semibold flex items-center gap-1 hover:underline">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-5">
        {topVendors.map((vendor, index) => (

          <div key={index} className="flex items-center gap-4 group">
            {/* Rank */}
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#FFF4ED] text-[#F9811F] text-[12px] font-bold">
              {vendor.rank}
            </div>

            {/* Vendor Info */}
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#191C1C]">
                {vendor.name}
              </p>
              <p className="text-[12px] text-[#747475]">
                {vendor.orders} orders
              </p>
            </div>

            {/* Revenue */}
            <div className="text-right">
              <p className="text-[14px] font-bold text-[#191C1C]">
                {vendor.revenue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
