

import { Search, Download } from "lucide-react";

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

import { useAdminStore } from "@/lib/store";
import { exportToCSV } from "@/lib/exportUtils";

export default function CommissionManagementPage() {
  const [isMounted, setIsMounted] = useState(false);
  const vendorList = useAdminStore((state) => state.vendors);
  const updateVendorOnServer = useAdminStore((state) => state.updateVendorOnServer);
  const updateSettingsOnServer = useAdminStore((state) => state.updateSettingsOnServer);
  const fetchSettings = useAdminStore((state) => state.fetchSettings);
  const settings = useAdminStore((state) => state.settings);
  const globalSearchQuery = useAdminStore((state) => state.globalSearchQuery);
  const ordersList = useAdminStore((state) => state.orders);

  // Group commission by month for the last 4 months
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  const last4Months = Array.from({ length: 4 }, (_, i) => {
    const idx = (currentMonthIdx - (3 - i) + 12) % 12;
    return months[idx];
  });

  const revenueData = last4Months.map(month => {
    const monthOrders = ordersList.filter(o => months[new Date(o.date).getMonth()] === month);
    const amount = monthOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (parseInt(o.commission.replace(/[^\d]/g, ""), 10) || 0), 0);
    return { month, amount };
  });

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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings?.platform) {
      setDefaultRate(Number(settings.platform.commission ?? 15));
      setDeliveryFeeComm(Number(settings.platform.deliveryFeeCommission ?? 5));
    }
  }, [settings]);

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


  const handleSaveDefaultRate = async () => {
    await updateSettingsOnServer({ platform: { commission: String(defaultRate) } });
    setToastMessage(`Saved default commission rate as ${defaultRate}%`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveDeliveryFee = async () => {
    await updateSettingsOnServer({ platform: { deliveryFeeCommission: String(deliveryFeeComm) } });
    setToastMessage(`Saved delivery fee commission as ${deliveryFeeComm}%`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleExport = () => {
    const exportData = vendorCommissions.map((vendor) => ({
      "Vendor": vendor.name,
      "Rate": `${vendor.rate}%`,
      "Total Paid": vendor.totalPaid,
      "Pending": vendor.pending,
      "Status": vendor.status,
    }));
    exportToCSV(exportData, "denish-commissions.csv");
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
    const matchesSearch =
      !(globalSearchQuery || searchQuery).trim() ||
      vc.name.toLowerCase().includes((globalSearchQuery || searchQuery).trim().toLowerCase());

    if (!matchesSearch) return false;
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
      <div className="px-3 py-4 sm:px-6 sm:py-8 flex flex-col items-center overflow-x-hidden">
        <div className="w-full max-w-full pb-8 flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center shrink-0">
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#191C1C] leading-tight break-words">
              Commission Management
            </h1>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[#EAEAEA] rounded-[8px] text-[15px] sm:text-[16px] font-medium text-[#212121] hover:bg-gray-50 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-[#212121]" />
              Export
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 shrink-0 h-auto min-h-[98px]">
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
                className="bg-white px-[16px] sm:px-[22px] py-[12px] sm:py-[clamp(12px,1.5vw,22px)] rounded-[12px] border border-[#FAFAFA] shadow-sm flex flex-col justify-center h-full"
              >
                <p className="text-[#848484] text-[12px] font-medium mb-1">
                  {stat.label}
                </p>
                <h3
                  className="text-[22px] sm:text-[clamp(24px,2.5vw,32px)] font-bold leading-tight break-words"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 shrink-0 h-auto w-full">
            <div className="flex items-center gap-[12px] w-full h-[44px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-white min-w-0">
              <Search className="w-[16px] h-[16px] text-[#747475] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by vendor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1">
              {['All Vendors', 'Approved', 'Suspended'].map((tab) => {
                const statusVal = tab === 'All Vendors' ? 'All' : tab === 'Approved' ? 'approved' : 'suspended';
                const isActive = activeFilter === statusVal;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(statusVal)}
                    className={`px-4 py-2 rounded-[8px] text-[13px] sm:text-[14px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#FE7200] text-white'
                        : 'bg-white text-[#212121] border border-[#EAEAEA] hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Charts and Settings Area */}
          <div className="flex flex-col lg:flex-row justify-between w-full shrink-0 gap-4 lg:gap-6">
            {/* Monthly Revenue Chart */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#EAEAEA] w-full lg:w-[48%] h-[280px] sm:h-[342px] flex flex-col">
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[#191C1C] mb-4 sm:mb-8">
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
                        fill: '#687280',
                        fontSize: 12,
                        fontWeight: 400,
                      }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={30}
                      tick={{
                        fill: '#687280',
                        fontSize: 12,
                        fontWeight: 400,
                      }}
                      tickFormatter={(value) => `${value / 1000}k`}
                      ticks={[0, 10000, 20000, 30000, 40000]}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar
                      dataKey="amount"
                      fill="#F97015"
                      radius={[5, 5, 0, 0]}
                      barSize={56}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Commission Settings */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#EAEAEA] w-full lg:w-[48%] min-h-[280px] flex flex-col overflow-hidden">
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[#303031] mb-4 sm:mb-6">
                Commission Settings
              </h3>

              <div className="flex flex-col gap-[12px] sm:gap-[18px]">
                {[
                  {
                    label: 'Default Commission Rate',
                    sub: 'Applied to all new vendors',
                    value: defaultRate,
                    setter: setDefaultRate,
                  },
                  {
                    label: 'Delivery Fee Commission',
                    sub: 'Commission on delivery charges',
                    value: deliveryFeeComm,
                    setter: setDeliveryFeeComm,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full min-h-[96px] p-[12px] sm:p-[15px] rounded-[8px] bg-[#F8F8F8] flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col">
                      <p className="text-[14px] sm:text-[16px] font-medium text-[#303031] leading-tight break-words">
                        {item.label}
                      </p>
                      <p className="text-[12px] text-[#848484] break-words">{item.sub}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[8px] sm:gap-[12px]">
                      <div className="w-full sm:w-[105px] h-[36px] flex items-center px-3 bg-white border border-[#DCDCDC] rounded-[8px]">
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => item.setter(Number(e.target.value))}
                          className="w-full bg-transparent text-[14px] font-medium outline-none"
                        />
                        <span className="text-[#747475] font-medium ml-1">%</span>
                      </div>
                      <button
                        onClick={idx === 0 ? handleSaveDefaultRate : handleSaveDeliveryFee}
                        className="w-full sm:w-[87px] h-[36px] bg-[#F97015] text-white text-[12px] font-bold rounded-[10px] hover:bg-[#e06512] transition-all cursor-pointer"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white w-full flex flex-col rounded-[12px] border border-[#EAEAEA] overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[720px]">
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
                    .filter((vc) => vc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="hover:bg-[#F8FAF9]/50 transition-all border-b border-[#EAEAEA] last:border-0"
                      >
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-medium text-[#191C1C] break-words">
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
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-medium text-[#29A378] break-words">
                          {vendor.totalPaid}
                        </td>
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-medium text-[#F9811F] break-words">
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
