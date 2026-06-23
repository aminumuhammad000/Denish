
import { useAdminStore } from "@/lib/store";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive?: boolean;
}

function StatCard({ label, value, change, isPositive = true }: StatCardProps) {
  return (
    <div className="bg-white h-[100px] p-[clamp(12px,1.5vw,16px)] rounded-[12px] border border-[#EAEAEA] flex flex-col justify-between">
      <p className="text-[#747475] text-[clamp(10px,1.2vw,12px)] font-medium leading-tight">{label}</p>
      <h3 className="text-[clamp(18px,2vw,24px)] font-bold text-[#191C1C] leading-none">{value}</h3>
      <p className={`text-[12px] font-bold ${isPositive ? "text-[#207951]" : "text-[#EF4444]"}`}>
        {change}
      </p>
    </div>
  );
}

export function AnalyticsStats() {
  const orders = useAdminStore((state) => state.orders);
  const users = useAdminStore((state) => state.users);

  // Avg Order Value
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (parseInt(o.total.replace(/[^\d]/g, ""), 10) || 0), 0);
  const avgOrderValue = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0;

  // Orders per day (last 7 days)
  const last7DaysOrders = orders.filter(o => {
    const orderDate = new Date(o.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  const ordersPerDay = Math.round(last7DaysOrders.length / 7);

  const stats = [
    { label: "Avg. Order Value", value: "₦" + avgOrderValue.toLocaleString(), change: "+12%" },
    { label: "Orders/Day", value: ordersPerDay.toString(), change: "+8%" },
    { label: "Total Customers", value: users.filter(u => u.role === "Customer").length.toString(), change: "+15%" },
    { label: "Customer Rating", value: "4.8", change: "+0.1" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-[16px] md:gap-[20px]">
      {stats.map((stat) => (
        <StatCard 
          key={stat.label} 
          label={stat.label} 
          value={stat.value} 
          change={stat.change}
          isPositive={true}
        />
      ))}
    </div>
  );
}
