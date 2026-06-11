"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell as PieCell,
} from "recharts";

const rangeData: Record<string, { name: string; revenue: number }[]> = {
  "1D": [
    { name: "08:00", revenue: 5000 },
    { name: "10:00", revenue: 12000 },
    { name: "12:00", revenue: 28000 },
    { name: "14:00", revenue: 18000 },
    { name: "16:00", revenue: 32000 },
    { name: "18:00", revenue: 45000 },
    { name: "20:00", revenue: 15000 },
  ],
  "1W": [
    { name: "Mon", revenue: 25000 },
    { name: "Tue", revenue: 42000 },
    { name: "Wed", revenue: 31000 },
    { name: "Thu", revenue: 58000 },
    { name: "Fri", revenue: 45000 },
    { name: "Sat", revenue: 72000 },
    { name: "Sun", revenue: 50000 },
  ],
  "1M": [
    { name: "8/04", revenue: 15000 },
    { name: "9/04", revenue: 35000 },
    { name: "10/04", revenue: 22000 },
    { name: "11/04", revenue: 48000 },
    { name: "12/04", revenue: 38000 },
    { name: "13/04", revenue: 55000 },
    { name: "14/04", revenue: 42000 },
  ],
  "6M": [
    { name: "Nov", revenue: 120000 },
    { name: "Dec", revenue: 240000 },
    { name: "Jan", revenue: 180000 },
    { name: "Feb", revenue: 210000 },
    { name: "Mar", revenue: 310000 },
    { name: "Apr", revenue: 280000 },
  ],
  "1Y": [
    { name: "2021", revenue: 1200000 },
    { name: "2022", revenue: 1800000 },
    { name: "2023", revenue: 2400000 },
    { name: "2024", revenue: 3100000 },
    { name: "2025", revenue: 4500000 },
    { name: "2026", revenue: 2100000 },
  ],
};

const statusData = [
  { name: "Delivered", value: 68, color: "#207951" },
  { name: "Preparing", value: 15, color: "#00B4D8" },
  { name: "Pending", value: 10, color: "#F9811F" },
  { name: "Cancelled", value: 7, color: "#EF4444" },
];

export function ChartsSection() {
  const [activeRange, setActiveRange] = useState("1M");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-[#EAEAEA]">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
            <div>
              <h3 className="text-[18px] font-bold text-[#191C1C]">
                Revenue This Week
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-[#F8FAF9] p-1 rounded-[8px]">
              {["1D", "1W", "1M", "6M", "1Y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-3 py-1 text-[12px] font-bold rounded-[6px] transition-all ${
                    range === activeRange
                      ? "bg-white text-[#191C1C] shadow-sm"
                      : "text-[#747475] hover:text-[#191C1C]"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="aspect-2/1 md:aspect-auto md:h-[300px] w-full relative **:outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={rangeData[activeRange]}
                margin={{ top: 0, right: 10, left: 5, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F2F4F3"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    className: "text-[9px] md:text-[12px] fill-[#747475]",
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{
                    className: "text-[9px] md:text-[12px] fill-[#747475]",
                  }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
                    return `₦${value}`;
                  }}
                />
                <Tooltip
                  cursor={{
                    stroke: "#F9811F",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="relative flex flex-col items-center -translate-x-[52%] -translate-y-[calc(100%+12px)]">
                          <div className="bg-[#F9811F] text-white px-3 py-1.5 rounded-none text-[12px] font-bold shadow-lg relative after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-[#F9811F]">
                            ₦{payload[0].value?.toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#207951"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#F9811F",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Donut Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[24px] shadow-sm border border-[#FAFAFA]">
          <h3 className="text-[18px] font-bold text-[#191C1C] mb-8">
            Order Status
          </h3>
          <div className="h-[200px] w-full mb-6 **:outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {statusData.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[12px] text-[#747475]">
                    {item.name}
                  </span>
                </div>
                <span className="text-[12px] font-bold text-[#191C1C]">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
