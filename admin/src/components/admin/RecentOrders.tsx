

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
    <div className="rounded-[24px] border border-[#F2F4F3] bg-white p-3 shadow-sm sm:p-6">
      <div className="mb-3 sm:mb-8">
        <h3 className="text-[15px] font-bold text-[#191C1C] sm:text-[18px]">Recent Orders</h3>
      </div>

      <div className="space-y-2">
        {recentOrders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-[12px] bg-[#F8F8F8] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-black break-words sm:text-[16px]">{order.customer}</p>
              <p className="text-[12px] font-normal text-[#747475] break-words sm:text-[16px]">
                {order.vendor} | {order.id}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
              <p className="text-[13px] font-semibold text-black sm:text-[16px]">{order.total}</p>
              <p
                className={`text-[12px] font-normal sm:text-[16px] ${statusStyles[order.status as keyof typeof statusStyles]}`}
              >
                {order.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
