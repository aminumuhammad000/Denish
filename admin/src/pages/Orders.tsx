

import { Search, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { exportToCSV } from "@/lib/exportUtils";

import { useAdminStore, type Order } from "@/lib/store";

const statusStyles = {
  preparing: "text-[#0A85FF] bg-[#E6F2FF]",
  pending: "text-[#F9811F] bg-[#FFF4E4]",
  confirmed: "text-[#29A378] bg-[#EAF6F2]",
  "picked up": "text-[#92400E] bg-[#FEF3C7]",
  ready: "text-[#207951] bg-[#F1FAF5]",
  delivered: "text-[#207951] bg-[#F1FAF5]",
  cancelled: "text-red-500 bg-red-50",
};

export default function OrdersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const ordersList = useAdminStore((state) => state.orders);
  const updateOrderOnServer = useAdminStore((state) => state.updateOrderOnServer);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  // Dynamic calculations based on state
  const totalOrders = ordersList.filter(o => o.status !== "cancelled").length;
  
  const totalRevenueNum = ordersList
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + (parseInt(o.total.replace(/[^\d]/g, ""), 10) || 0), 0);
  
  const totalCommissionNum = ordersList
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + (parseInt(o.commission.replace(/[^\d]/g, ""), 10) || 0), 0);

  const pendingCount = ordersList.filter(o => o.status === "pending").length;

  const filteredOrders = ordersList.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      activeTab === "All" ||
      order.status.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  const handleUpdateOrder = async (updatedOrder: Order) => {
    await updateOrderOnServer(updatedOrder.id, updatedOrder);
    setSelectedOrder(updatedOrder);
  };


  const handleExport = () => {
    const exportData = filteredOrders.map(o => ({
      "Order ID": o.id,
      "Customer": o.customer,
      "Delivery Address": o.address,
      "Item Count": o.items,
      "Order Value": o.total,
      "Commission earned": o.commission,
      "Vendor Partner": o.vendor,
      "Status": o.status,
      "Date Placed": o.date,
    }));
    exportToCSV(exportData, "denish-orders.csv");
  };

  return (
    <>
      <div className="px-[clamp(0px,calc((1024px-100vw)*100),1rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
        <div className="w-full pb-8 flex flex-col gap-6 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-[28px] font-bold text-[#191C1C]">
              Order Management
            </h1>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-[#EAEAEA] rounded-[8px] text-[16px] font-medium text-[#212121] hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#212121]" />
              Export
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Active Orders
              </p>
              <h3 className="text-[32px] font-semibold text-[#F15C11]">{totalOrders}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Total Revenue
              </p>
              <h3 className="text-[32px] font-semibold text-[#29A378]">
                ₦{totalRevenueNum.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Total Commission
              </p>
              <h3 className="text-[32px] font-semibold text-[#F9811F]">
                ₦{totalCommissionNum.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Pending
              </p>
              <h3 className="text-[32px] font-semibold text-[#F9811F]">{pendingCount}</h3>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 py-2 w-full">
            <div className="flex items-center gap-[12px] w-full md:w-auto md:min-w-[300px] h-[40px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-white shrink-0">
              <Search className="w-[16px] h-[16px] text-[#747475]" />
              <input
                type="text"
                placeholder="Search orders"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0">
              {[
                "All",
                "Pending",
                "Confirmed",
                "Preparing",
                "Ready",
                "Picked Up",
                "Delivered",
                "Cancelled",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-[8px] text-[16px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#FE7200] text-white"
                      : "bg-white text-[#212121] border border-[#EAEAEA] hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F7F6F4]">
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Order ID
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Customer
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Items
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Total
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Commission
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Vendor
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Status
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Date
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={index}
                      onClick={() => setSelectedOrder(order)}
                      className="border-b border-[#EAEAEA] last:border-0 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-medium text-[#191C1C]">
                        {order.id}
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <p className="text-[14px] font-semibold text-[#191C1C]">
                          {order.customer}
                        </p>
                        <p className="text-[12px] text-[#747475]">
                          {order.address}
                        </p>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] text-[#191C1C] text-center">
                        {order.items}
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-semibold text-[#191C1C] text-center">
                        {order.total}
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-semibold text-[#29A378] text-center">
                        {order.commission}
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-normal text-[#212121] text-center">
                        {order.vendor}
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span
                          className={`mx-auto w-[92px] h-[32px] flex items-center justify-center rounded-full text-[14px] font-medium capitalize ${statusStyles[order.status as keyof typeof statusStyles] || "text-gray-500 bg-gray-50"}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-normal text-[#212121] text-center">
                        {order.date}
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 border border-[#EAEAEA] rounded-[6px] hover:bg-[#F8FAF9] transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-[#747475]" />
                            <span className="text-[14px] font-medium text-[#212121]">
                              View
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrder={handleUpdateOrder}
        />
      )}
    </>
  );
}
