

import { useAdminStore } from "@/lib/store";

const statusStyles = {
  preparing: "text-[#F9811F]",
  pending: "text-[#F9811F]",
  delivered: "text-[#207951]",
  confirmed: "text-[#00B4D8]",
  "picked up": "text-[#92400E]",
};

export function RecentOrders() {
  const ordersList = useAdminStore((state) => state.orders);
  
  // Take last 5 orders
  const recentOrders = [...ordersList]
    .slice(-5)
    .reverse();

  return (

    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F2F4F3]">
      <div className="mb-8">
        <h3 className="text-[18px] font-bold text-[#191C1C]">Recent Orders</h3>
      </div>

      <div className="space-y-2">
        {recentOrders.map((order, index) => (
          <div key={index} className="flex justify-between items-center bg-[#F8F8F8] px-4 py-3 rounded-[12px]">
            <div>
              <p className="text-[16px] font-semibold text-black">{order.customer}</p>
              <p className="text-[16px] font-normal text-[#747475]">{order.vendor} | {order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-semibold text-black">{order.total}</p>
              <p className={`text-[16px] font-normal mt-1 ${statusStyles[order.status as keyof typeof statusStyles]}`}>
                {order.status}
              </p>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
