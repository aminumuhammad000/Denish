

import { useState } from "react";
import { useAdminStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function HourlyOrdersChart() {
  const [activeTime, setActiveTime] = useState("12:00");
  const ordersList = useAdminStore((state) => state.orders);

  // Group today's orders by hour
  const getHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    const todayStr = new Date().toDateString();
    
    return hours.map(hour => {
      const hourNum = parseInt(hour.split(":")[0]);
      const count = ordersList.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.toDateString() === todayStr && orderDate.getHours() === hourNum;
      }).length;
      return { hour, orders: count };
    });
  };

  const hourlyData = getHourlyData();

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F2F4F3] h-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[18px] font-bold text-[#191C1C]">
          Orders by Hour (Today)
        </h3>
      </div>

      <div className="h-[250px] w-full **:outline-none focus:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F2F4F3"
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              interval={3}
              tick={({
                x,
                y,
                payload,
              }: {
                x: string | number;
                y: string | number;
                payload: { value: string };
              }) => {
                const isActive = activeTime === payload.value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <rect
                      x={-24}
                      y={4}
                      width={48}
                      height={24}
                      fill={isActive ? "#F3F4F6" : "transparent"}
                      rx={6}
                      cursor="pointer"
                      onClick={() => setActiveTime(payload.value)}
                    />
                    <text
                      x={0}
                      y={20}
                      fill={isActive ? "#303031" : "#B0B0B1"}
                      fontSize={11}
                      fontWeight={isActive ? 600 : 400}
                      textAnchor="middle"
                      cursor="pointer"
                      onClick={() => setActiveTime(payload.value)}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={30}
              tick={{ fill: "#B0B0B1", fontSize: 11 }}
            />
            <Tooltip cursor={{ fill: "transparent" }} content={() => null} />
            <Bar
              dataKey="orders"
              fill="#F9811F"
              radius={[2, 2, 0, 0]}
              barSize={8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F9811F]" />
          <span className="text-[11px] text-[#747475]">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#191C1C]" />
          <span className="text-[11px] text-[#747475]">Time</span>
        </div>
      </div>
    </div>
  );
}
