"use client";

import { Search } from "lucide-react";

import { useState, useEffect } from "react";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", amount: 20000 },
  { month: "Feb", amount: 25000 },
  { month: "Mar", amount: 35000 },
  { month: "Apr", amount: 20000 },
];

import { useAdminStore } from "@/lib/store";

export default function CommissionManagementPage() {
  const [isMounted, setIsMounted] = useState(false);
  const vendorList = useAdminStore((state) => state.vendors);
  const updateVendorOnServer = useAdminStore((state) => state.updateVendorOnServer);
  const ordersList = useAdminStore((state) => state.orders);

  const [activeFilter, setActiveFilter] = useState("All");
  const [defaultRate, setDefaultRate] = useState(15);
  const [deliveryFeeComm, setDeliveryFeeComm] = useState(5);

  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(15);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  const handleUpdateVendorRate = async (vendorId: string, rate: number) => {
    const v = vendorList.find(vend => vend.id === vendorId);
    if (v) {
      await updateVendorOnServer(vendorId, { commissionRate: rate });
      setToastMessage(`Updated ${v.name} commission rate to ${rate}%`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    setEditingVendorId(null);
  };


  const handleCollectCommission = (vendorName: string, amount: string) => {
    setToastMessage(`Collected ${amount} commission from ${vendorName}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Dynamic vendor commissions mapping
  const vendorCommissions = vendorList.map(vendor => {
    const rate = vendor.commissionRate || defaultRate;
    const vendorOrders = ordersList.filter(o => o.vendor === vendor.name);
    
    const totalPaidNum = vendorOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (parseInt(o.commission.replace(/[^\d]/g, ""), 10) || 0), 0);

    const pendingNum = vendorOrders
      .filter(o => o.status !== "delivered" && o.status !== "cancelled")
      .reduce((sum, o) => sum + (parseInt(o.commission.replace(/[^\d]/g, ""), 10) || 0), 0);

    return {
      id: vendor.id,
      name: vendor.name,
      rate,
      totalPaid: "₦" + totalPaidNum.toLocaleString(),
      totalPaidNum,
      pending: "₦" + pendingNum.toLocaleString(),
      pendingNum,
      status: vendor.status
    };
  }).filter(vc => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Approved") return vc.status === "approved";
    if (activeFilter === "Pending") return vc.status === "pending";
    return true;
  });

  // Global totals
  const totalEarnedNum = vendorCommissions.reduce((sum, vc) => sum + vc.totalPaidNum, 0);
  const pendingCollectionNum = vendorCommissions.reduce((sum, vc) => sum + vc.pendingNum, 0);
  const activeVendorsCount = vendorList.filter(v => v.status === "approved").length;

  return (
    <>

        <div className="px-[clamp(0px,calc((1024px-100vw)*100),1rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
          <div className="w-full max-w-[988px] flex flex-col gap-6">
            <div className="flex justify-between items-center shrink-0">
              <h1 className="text-[28px] font-bold text-[#191C1C]">
                Commission Management
              </h1>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 h-auto min-h-[98px]">
              {[
                { label: "Total Earned", value: "₦" + totalEarnedNum.toLocaleString(), color: "#F9811F" },
                {
                  label: "Pending Collection",
                  value: "₦" + pendingCollectionNum.toLocaleString(),
                  color: "#29A378",
                },
                { label: "Default Rate", value: `${defaultRate}%`, color: "#0A85FF" },
                { label: "Active Vendors", value: String(activeVendorsCount), color: "#191C1C" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white px-[22px] py-[clamp(12px,1.5vw,22px)] rounded-[12px] border border-[#FAFAFA] shadow-sm flex flex-col justify-center h-full"
                >
                  <p className="text-[#848484] text-[12px] font-medium mb-1">
                    {stat.label}
                  </p>
                  <h3
                    className="text-[clamp(24px,2.5vw,32px)] font-bold leading-tight"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </h3>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 shrink-0 h-auto md:h-[40px] w-full">
              <div className="flex items-center gap-[12px] w-full md:w-[251px] shrink-0 h-[40px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-white">
                <Search className="w-[16px] h-[16px] text-[#747475]" />
                <input
                  type="text"
                  placeholder="Search by vendor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0 h-[40px]">
                <div className="flex items-center gap-[12px] h-full">
                  {["All Vendors", "Approved", "Suspended"].map((tab) => {
                    const statusVal = tab === "All Vendors" ? "All" : tab === "Approved" ? "approved" : "suspended";
                    const isActive = activeFilter === statusVal;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveFilter(statusVal)}
                        className={`px-4 h-full rounded-[8px] text-[16px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? "bg-[#FE7200] text-white"
                            : "bg-white text-[#212121] border border-[#EAEAEA] hover:bg-gray-50"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Charts and Settings Area */}
            <div className="flex flex-col lg:flex-row justify-between w-full shrink-0 gap-6 lg:gap-0">
              {/* Monthly Revenue Chart */}
              <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#EAEAEA] w-full lg:w-[48%] h-[342px] flex flex-col">
                <h3 className="text-[18px] font-bold text-[#191C1C] mb-8">
                  Monthly Commission Revenue
                </h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#EAEAEA"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#687280",
                          fontSize: 14,
                          fontWeight: 400,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={30}
                        tick={{
                          fill: "#687280",
                          fontSize: 14,
                          fontWeight: 400,
                        }}
                        tickFormatter={(value) => `${value / 1000}k`}
                        ticks={[0, 10000, 20000, 30000, 40000]}
                      />
                      <Tooltip cursor={{ fill: "transparent" }} />
                      <Bar
                        dataKey="amount"
                        fill="#F97015"
                        radius={[5, 5, 0, 0]}
                        barSize={83}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Commission Settings */}
              <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#EAEAEA] w-full lg:w-[48%] h-[342px] flex flex-col overflow-hidden">
                <h3 className="text-[18px] font-bold text-[#303031] mb-6">
                  Commission Settings
                </h3>

                <div className="flex flex-col gap-[18px]">
                  {[
                    {
                      label: "Default Commission Rate",
                      sub: "Applied to all new vendors",
                      value: defaultRate,
                      setter: setDefaultRate,
                    },
                    {
                      label: "Delivery Fee Commission",
                      sub: "Commission on delivery charges",
                      value: deliveryFeeComm,
                      setter: setDeliveryFeeComm,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full h-[100px] p-[15px] rounded-[8px] bg-[#F8F8F8] flex flex-col justify-between"
                    >
                      <div className="flex flex-col">
                        <p className="text-[16px] font-medium text-[#303031] leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[12px] text-[#848484]">{item.sub}</p>
                      </div>
                      <div className="flex items-center gap-[12px] h-[32px]">
                        <div className="w-[105px] h-full flex items-center px-3 bg-white border border-[#DCDCDC] rounded-[8px]">
                          <input
                            type="number"
                            value={item.value}
                            onChange={(e) =>
                              item.setter(Number(e.target.value))
                            }
                            className="w-full bg-transparent text-[14px] font-medium outline-none"
                          />
                          <span className="text-[#747475] font-medium ml-1">
                            %
                          </span>
                        </div>
                        <button className="w-[87px] h-full bg-[#F97015] text-white text-[12px] font-bold rounded-[10px] hover:bg-[#e06512] transition-all cursor-pointer">
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white w-full flex flex-col">
              <div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#F8FAF9]">
                        <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-bold text-[#747475]">
                          Vendor
                        </th>
                        <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-bold text-[#747475]">
                          Rate
                        </th>
                        <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-bold text-[#747475]">
                          Total Paid
                        </th>
                        <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-bold text-[#747475]">
                          Pending
                        </th>
                        <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[14px] font-bold text-[#747475] text-right pr-[40px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorCommissions
                        .filter(vc => vc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((vendor) => (
                          <tr
                            key={vendor.id}
                            className="hover:bg-[#F8FAF9]/50 transition-all border-b border-[#EAEAEA] last:border-0"
                          >
                            <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-medium text-[#191C1C]">
                              {vendor.name}
                            </td>
                            <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                              {editingVendorId === vendor.id ? (
                                <div className="flex items-center gap-[6px]">
                                  <input
                                    type="number"
                                    value={tempRate}
                                    onChange={(e) => setTempRate(Number(e.target.value))}
                                    className="w-[55px] h-[28px] text-center bg-white border border-[#F9811F] rounded-[8px] text-[14px] font-medium focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleUpdateVendorRate(vendor.id, tempRate)}
                                    className="h-[28px] px-3 bg-[#29A378] text-white text-[12px] font-bold rounded-[8px] hover:bg-green-700 transition-all cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-[6px]">
                                  <div className="w-[51px] h-[28px] flex items-center justify-center bg-white border border-[#EAEAEA] rounded-[8px] text-[16px] font-medium text-[#747475]">
                                    {vendor.rate}%
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-medium text-[#29A378]">
                              {vendor.totalPaid}
                            </td>
                            <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-medium text-[#F9811F]">
                              {vendor.pending}
                            </td>
                            <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                              <div className="flex items-center justify-end gap-[6px]">
                                <button
                                  onClick={() => {
                                    setEditingVendorId(vendor.id);
                                    setTempRate(vendor.rate);
                                  }}
                                  className="w-[89px] h-[28px] bg-[#F97015] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#e06512] transition-all cursor-pointer"
                                >
                                  Edit Rate
                                </button>
                                <button
                                  onClick={() => handleCollectCommission(vendor.name, vendor.pending)}
                                  className="w-[74px] h-[28px] bg-white border border-[#EAEAEA] text-[#29A378] text-[14px] font-bold rounded-[8px] hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                  Collect
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
        </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-110 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white px-6 py-4 rounded-[12px] shadow-lg border border-[#EAEAEA] flex items-center gap-3">
            <div className="w-[8px] h-[8px] rounded-full bg-[#29A378]" />
            <span className="text-[14px] font-medium text-[#191C1C]">
              {toastMessage}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
