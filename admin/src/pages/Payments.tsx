

;
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { exportToCSV } from "@/lib/exportUtils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useAdminStore } from "@/lib/store";

const statusStyles = {
  Completed: "text-[#29A378] bg-[#EAF6F2]",
  Pending: "text-[#F9811F] bg-[#FFF4E4]",
  Failed: "text-[#E14343] bg-[#FEE2E2]",
};

export default function PaymentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const transactionsList = useAdminStore((state) => state.transactions);
  const globalSearchQuery = useAdminStore((state) => state.globalSearchQuery);
  const [activeTab, setActiveTab] = useState("All Transactions");

  // Group transactions by date for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString();
  });

  const cashFlowData = last7Days.map(dateStr => {
    const dayTransactions = transactionsList.filter(t => new Date(t.date).toLocaleDateString() === dateStr);
    const inflow = dayTransactions
      .filter(t => t.type === "Order Payment" && (t.status === "Completed" as any))
      .reduce((sum, t) => sum + (parseInt(String(t.amount).replace(/[^\d]/g, ""), 10) || 0), 0);
    const outflow = dayTransactions
      .filter(t => (t.type.includes("Payout") || t.type.includes("Refund")) && t.status === "Completed")
      .reduce((sum, t) => sum + (parseInt(String(t.amount).replace(/[^\d]/g, ""), 10) || 0), 0);
    
    return {
      date: dateStr.split("/").slice(0, 2).join("/"), // MM/DD
      inflow,
      outflow
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  // Dynamic calculations
  const inflowNum = transactionsList
    .filter(t => t.type === "Order Payment" && t.status === "Completed")
    .reduce((sum, t) => sum + (parseInt(String(t.amount).replace(/[^\d]/g, ""), 10) || 0), 0);

  const outflowNum = transactionsList
    .filter(t => (t.type.includes("Payout") || t.type.includes("Refund")) && t.status === "Completed")
    .reduce((sum, t) => sum + (parseInt(String(t.amount).replace(/[^\d]/g, ""), 10) || 0), 0);

  const netRevenueNum = inflowNum - outflowNum;

  const pendingPayoutsNum = transactionsList
    .filter(t => (t.type.includes("Payout") || t.type.includes("Refund")) && t.status === "Pending")
    .reduce((sum, t) => sum + (parseInt(String(t.amount).replace(/[^\d]/g, ""), 10) || 0), 0);

  const filteredTransactions = transactionsList.filter((txn) => {
    const activeSearch = globalSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !activeSearch ||
      txn.id.toLowerCase().includes(activeSearch) ||
      txn.from.toLowerCase().includes(activeSearch) ||
      txn.to.toLowerCase().includes(activeSearch) ||
      txn.type.toLowerCase().includes(activeSearch) ||
      txn.method.toLowerCase().includes(activeSearch);

    if (!matchesSearch) return false;
    if (activeTab === "All Transactions") return true;
    return txn.type === activeTab.slice(0, -1);
  });

  const handleExport = () => {
    const exportData = filteredTransactions.map((txn) => ({
      ID: txn.id,
      Type: txn.type,
      From: txn.from,
      To: txn.to,
      Amount: txn.amount,
      Method: txn.method,
      Status: txn.status,
      Date: txn.date,
    }));
    exportToCSV(exportData, "denish-payments.csv");
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) {
      return "₦" + (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return "₦" + (num / 1000).toFixed(1) + "K";
    }
    return "₦" + num.toLocaleString();
  };

  return (
    <>
      <div className="px-[clamp(0px,calc((1024px-100vw)*100),1rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
        <div className="w-full pb-8 flex flex-col gap-6 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-[28px] font-bold text-[#191C1C]">
              Payment Tracking
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
            {[
              { label: "Total Inflow", value: formatCurrency(inflowNum), color: "#FE7200" },
              { label: "Total Outflow", value: formatCurrency(outflowNum), color: "#29A378" },
              { label: "Net Revenue", value: formatCurrency(netRevenueNum), color: "#0A85FF" },
              { label: "Pending Payouts", value: formatCurrency(pendingPayoutsNum), color: "#F9A825" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm"
              >
                <p className="text-[#848484] text-[12px] font-medium mb-1">
                  {stat.label}
                </p>
                <h3
                  className="text-[32px] font-semibold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          {/* Cash Flow Chart */}
          <div className="bg-white p-6 rounded-[12px] shadow-sm border border-[#EAEAEA]">
            <h3 className="text-[18px] font-bold text-[#191C1C] mb-6">
              Cash Flow (This Week)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F2F4F3"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#848484", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    tick={{ fill: "#848484", fontSize: 12 }}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    content={(props) => {
                      const { payload } = props;
                      return (
                        <div className="flex justify-center gap-6 mt-6">
                          {payload?.map(
                            (
                              entry: { value?: string; color?: string },
                              index: number,
                            ) => (
                              <div
                                key={`item-${index}`}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-[22px] h-[4px] rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-[14px] font-medium text-[#747475]">
                                  {entry.value}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inflow"
                    stroke="#29A378"
                    strokeWidth={2}
                    dot={false}
                    name="Inflow"
                  />
                  <Line
                    type="monotone"
                    dataKey="outflow"
                    stroke="#E14343"
                    strokeWidth={2}
                    dot={false}
                    name="Outflow"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0">
            {["All Transactions", "Vendor Payouts", "Driver Payouts"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-[8px] text-[16px] font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-[#FE7200] text-white"
                      : "bg-white text-[#212121] border border-[#EAEAEA] hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>

          {/* Transactions Table */}
          <div className="bg-white overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F7F6F4]">
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      ID
                    </th>
                    <th className="px-2 py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Type
                    </th>
                    <th className="px-2 py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      From
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      To
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Amount
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Method
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Status
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn, index) => (
                      <tr
                        key={index}
                        className="border-b border-[#747475] last:border-0 hover:bg-[#F8FAF9]/50 transition-all cursor-pointer"
                      >
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-normal text-[#212121]">
                          {txn.id}
                        </td>
                        <td className="px-2 py-[clamp(0.25rem,1vw,0.75rem)]">
                          <div className="flex justify-center">
                            <div className="w-[24px] h-[24px] flex items-center justify-center">
                              <img
                                src={`/images/Arrow_pointing${txn.type.includes("Payout") ? "Down" : "Up"}.svg`}
                                alt={txn.type}
                                width={12}
                                height={12}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-normal text-[#212121]">
                          {txn.from}
                        </td>
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-normal text-[#212121]">
                          {txn.to}
                        </td>
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-bold text-[#29A378]">
                          {txn.amount}
                        </td>
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-normal text-[#747475]">
                          {txn.method}
                        </td>
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                          <span
                            className={`inline-flex items-center justify-center w-[92px] h-[32px] rounded-full text-[14px] font-medium ${statusStyles[txn.status as keyof typeof statusStyles]}`}
                          >
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[16px] font-normal text-[#747475]">
                          {txn.date}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
