

import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminStore } from "@/lib/store";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  iconPath: string;
  href: string;
}

function StatCard({ label, value, change, trend, iconPath, href }: StatCardProps) {
  const getValueColor = () => {
    switch (label) {
      case "Total Orders":
      case "Revenue":
      case "Order Completion Rate":
      case "Pending Approvals":
        return "text-[#F9811F]";
      case "Total Vendors":
      case "Active Orders":
        return "text-[#0A85FF]";
      case "Total Drivers":
      case "Total Users":
        return "text-[#29A378]";
      default:
        return "text-[#191C1C]";
    }
  };

  return (
    <Link
      to={href}
      className="bg-white p-[clamp(12px,1.5vw,18px)] rounded-[12px] shadow-sm border border-[#FAFAFA] flex flex-col gap-[clamp(8px,1vw,12px)] transition-all hover:shadow-md hover:-translate-y-[1px] hover:border-[#F9811F] cursor-pointer"
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[#848484] text-[12px] font-medium leading-snug">{label}</p>
        <div className="w-[32px] h-[32px] shrink-0 rounded-full bg-[#F8FAF9] flex items-center justify-center text-[#747475]">
          <div 
            className="w-[16px] h-[16px] bg-current"
            style={{
              maskImage: `url(${iconPath})`,
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
              WebkitMaskImage: `url(${iconPath})`,
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain'
            }}
          />
        </div>
      </div>
      <div className="mt-auto">
        <h3 className={`text-[20px] md:text-[24px] font-bold leading-none mb-1 ${getValueColor()}`}>
          {value}
        </h3>
        <div className={`flex items-center gap-1 text-[12px] font-semibold ${
          trend === "up" ? "text-emerald-500" : "text-rose-500"
        }`}>
          {trend === "up" ? <TrendingUp className="w-[12px] h-[12px] shrink-0" /> : <TrendingDown className="w-[12px] h-[12px] shrink-0" />}
          <span className="truncate">{change} from last week</span>
        </div>
      </div>
    </Link>
  );
}

export function DashboardStats() {
  const ordersList = useAdminStore((state) => state.orders);
  const usersList = useAdminStore((state) => state.users);
  const vendorList = useAdminStore((state) => state.vendors);
  const driversList = useAdminStore((state) => state.drivers);
  const disputesList = useAdminStore((state) => state.disputes);

  // Dynamic calculations
  const totalOrders = ordersList.length;
  
  // Calculate total revenue from delivered orders
  const revenueNum = ordersList
    .filter(o => o.status === "delivered")
    .reduce((sum, o) => sum + (parseInt(o.total.replace(/[^\d]/g, ""), 10) || 0), 0);
  const revenue = "₦" + revenueNum.toLocaleString();

  // Active orders (neither delivered nor cancelled)
  const activeOrders = ordersList.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  ).length;

  const totalUsers = usersList.length;
  const totalVendors = vendorList.length;
  const totalDrivers = driversList.length;

  // Completion Rate
  const completedOrders = ordersList.filter(o => o.status === "delivered").length;
  const completionRateNum = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const completionRate = completionRateNum.toFixed(1) + "%";

  // Pending approvals (unresolved disputes + pending vendors + pending drivers)
  const pendingApprovals = disputesList.filter(d => d.status === "open").length +
    vendorList.filter(v => v.status === "pending").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[24px]">
      <StatCard 
        label="Total Orders" 
        value={String(totalOrders)} 
        change="+12%" 
        trend="up" 
        iconPath="/images/Dashboard_sidebar_icons/orders.svg"
        href="/orders"
      />
      <StatCard 
        label="Revenue" 
        value={revenue} 
        change="+8.2%" 
        trend="up" 
        iconPath="/images/coin_icon.svg"
        href="/payments"
      />
      <StatCard 
        label="Active Orders" 
        value={String(activeOrders)} 
        change="+5" 
        trend="up" 
        iconPath="/images/Dashboard_sidebar_icons/orders.svg"
        href="/orders"
      />
      <StatCard 
        label="Total Users" 
        value={String(totalUsers)} 
        change="+23" 
        trend="up" 
        iconPath="/images/Dashboard_sidebar_icons/users.svg"
        href="/users"
      />
      
      <StatCard 
        label="Total Vendors" 
        value={String(totalVendors)} 
        change="+2" 
        trend="up" 
        iconPath="/images/Dashboard_sidebar_icons/vendors.svg"
        href="/vendors"
      />
      <StatCard 
        label="Total Drivers" 
        value={String(totalDrivers)} 
        change="+1" 
        trend="up" 
        iconPath="/images/Dashboard_sidebar_icons/drivers.svg"
        href="/drivers"
      />
      <StatCard 
        label="Order Completion Rate" 
        value={completionRate} 
        change="+1.2%" 
        trend="up" 
        iconPath="/images/Dashboard_sidebar_icons/orders.svg"
        href="/orders"
      />
      <StatCard 
        label="Pending Approvals" 
        value={String(pendingApprovals)} 
        change="-2" 
        trend="down" 
        iconPath="/images/info_icon.svg"
        href="/vendors"
      />
    </div>
  );
}
