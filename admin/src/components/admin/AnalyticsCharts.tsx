"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  LegendPayload,
} from "recharts";

// --- Order by Cuisine (Donut Chart) ---
const cuisineData = [
  { name: "Local Dishes", value: 35, color: "#FE7200" },
  { name: "Grills & BBQ", value: 25, color: "#29A378" },
  { name: "Healthy", value: 15, color: "#0A85FF" },
  { name: "Drinks", value: 12, color: "#F9B400" },
  { name: "Continental", value: 8, color: "#8B5CF6" },
  { name: "Raw Food", value: 5, color: "#EF4444" },
];

export function OrderCuisineChart() {
  return (
    <div className="bg-white w-full max-w-[314px] mx-auto lg:mx-0 lg:w-[314px] h-[342px] p-4 rounded-[12px] border border-[#EAEAEA] flex flex-col overflow-hidden">
      <h3 className="text-[18px] font-bold text-[#191C1C] mb-6">
        Order by Cuisine
      </h3>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-[140px] h-[140px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cuisineData}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {cuisineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
          {cuisineData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[12px] text-[#747475] whitespace-nowrap">
                {item.name}
              </span>
              <span className="text-[12px] font-bold text-[#191C1C] ml-auto">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Peak Ordering Hours (Area Chart) ---
const hoursData = [
  { time: "0:00", orders: 10 },
  { time: "4:00", orders: 5 },
  { time: "8:00", orders: 25 },
  { time: "12:00", orders: 65 },
  { time: "16:00", orders: 45 },
  { time: "20:00", orders: 85 },
];

export function PeakHoursChart() {
  return (
    <div className="bg-white w-full max-w-[314px] mx-auto lg:mx-0 lg:w-[314px] h-[342px] p-4 rounded-[12px] border border-[#EAEAEA] overflow-hidden">
      <h3 className="text-[18px] font-bold text-[#191C1C] mb-6">
        Peak Ordering Hours
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hoursData}
            margin={{ top: 0, right: 10, left: 5, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#207951" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#207951" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F2F4F3"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#747475", fontSize: 10 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={35}
              tick={{ fill: "#747475", fontSize: 10 }}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#207951"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Customer Metrics (Radar Chart) ---
const metricsData = [
  { subject: "Retention", A: 80, fullMark: 100 },
  { subject: "Satisfaction", A: 95, fullMark: 100 },
  { subject: "Repeat Orders", A: 75, fullMark: 100 },
  { subject: "Referrals", A: 60, fullMark: 100 },
  { subject: "App Ratings", A: 85, fullMark: 100 },
  { subject: "Support Score", A: 80, fullMark: 100 },
];

export function CustomerMetricsChart() {
  return (
    <div className="bg-white w-full max-w-[314px] mx-auto lg:mx-0 lg:w-[314px] h-[342px] p-4 rounded-[12px] border border-[#EAEAEA] overflow-hidden">
      <h3 className="text-[18px] font-bold text-[#191C1C] mb-4">
        Customer Metrics
      </h3>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricsData}>
            <PolarGrid stroke="#EAEAEA" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#848484", fontSize: 8 }}
            />
            <Radar
              name="Metrics"
              dataKey="A"
              stroke="#FE7200"
              fill="#EFB891"
              fillOpacity={0.59}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Monthly Revenue Trend (List) ---
const revenueItems = [
  { name: "Jollof Rice", orders: "342 orders", revenue: "₦855K", trend: 80 },
  { name: "Suya Platter", orders: "287 orders", revenue: "₦105K", trend: 60 },
  { name: "Carrots", orders: "158 orders", revenue: "₦15K", trend: 40 },
  { name: "Carrots", orders: "158 orders", revenue: "₦15K", trend: 40 },
  { name: "Carrots", orders: "158 orders", revenue: "₦15K", trend: 40 },
  { name: "Carrots", orders: "158 orders", revenue: "₦15K", trend: 40 },
  { name: "Carrots", orders: "158 orders", revenue: "₦15K", trend: 40 },
  { name: "Carrots", orders: "158 orders", revenue: "₦15K", trend: 40 },
];

export function RevenueTrendList() {
  return (
    <div className="bg-white p-4 rounded-[12px] border border-[#EAEAEA] h-full overflow-hidden">
      <h3 className="text-[18px] font-bold text-[#191C1C] mb-6">
        Monthly Revenue Trend
      </h3>
      <div className="space-y-6">
        {revenueItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#FFF4E4] flex items-center justify-center text-[#F9811F] font-bold text-[14px]">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#191C1C]">
                {item.name}
              </p>
              <p className="text-[12px] text-[#747475]">{item.orders}</p>
            </div>
            <div className="w-32 flex flex-col items-end gap-1">
              <span className="text-[14px] font-bold text-[#191C1C]">
                {item.revenue}
              </span>
              <div className="w-full h-2 bg-[#F8FAF9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F9811F]"
                  style={{ width: `${item.trend}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Orders by Area (Horizontal Bar Chart) ---
const areaData = [
  { name: "Lagos Island", value: 650 },
  { name: "Ikeja", value: 450 },
  { name: "Victoria Island", value: 380 },
  { name: "Lekki", value: 300 },
  { name: "Surulere", value: 200 },
];

export function OrdersByAreaChart() {
  return (
    <div className="bg-white p-4 rounded-[12px] border border-[#EAEAEA] h-full overflow-hidden">
      <h3 className="text-[18px] font-bold text-[#191C1C] mb-6">
        Orders by Area
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={areaData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#F2F4F3"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#747475", fontSize: 10 }}
              domain={[0, 600]}
              ticks={[0, 150, 300, 450, 600]}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#747475", fontSize: 10 }}
              width={80}
            />
            <Tooltip cursor={{ fill: "transparent" }} />
            <Bar
              dataKey="value"
              fill="#FE7200"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
// --- User Growth Chart ---
const growthData = [
  { name: "Jan", customers: 450, vendor: 80, driver: 60 },
  { name: "Feb", customers: 500, vendor: 90, driver: 70 },
  { name: "Mar", customers: 650, vendor: 110, driver: 85 },
  { name: "Apr", customers: 850, vendor: 130, driver: 100 },
];

export function UserGrowthChart() {
  return (
    <div className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] overflow-hidden w-full">
      <h3 className="text-[18px] font-bold text-[#191C1C] mb-8">User Growth</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={growthData}
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
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
              tick={{ fill: "#747475", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={30}
              tick={{ fill: "#747475", fontSize: 12 }}
              domain={[0, 1000]}
              ticks={[0, 250, 500, 750, 1000]}
            />
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="flex justify-center gap-6 mt-8">
                    {payload?.map((entry: LegendPayload, index: number) => (
                      <div
                        key={`item-${index}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-[12px] h-[2px]"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[12px] text-[#747475] capitalize">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="customers"
              stroke="#FE7200"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="vendor"
              stroke="#29A378"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="driver"
              stroke="#0A85FF"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
