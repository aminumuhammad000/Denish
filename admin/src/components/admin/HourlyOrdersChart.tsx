"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const hourlyData = [
  { hour: "00:00", orders: 15 },
  { hour: "01:00", orders: 20 },
  { hour: "02:00", orders: 30 },
  { hour: "03:00", orders: 25 },
  { hour: "04:00", orders: 15 },
  { hour: "05:00", orders: 10 },
  { hour: "06:00", orders: 25 },
  { hour: "07:00", orders: 40 },
  { hour: "08:00", orders: 30 },
  { hour: "09:00", orders: 35 },
  { hour: "10:00", orders: 45 },
  { hour: "11:00", orders: 50 },
  { hour: "12:00", orders: 65 },
  { hour: "13:00", orders: 55 },
  { hour: "14:00", orders: 48 },
  { hour: "15:00", orders: 42 },
  { hour: "16:00", orders: 35 },
  { hour: "17:00", orders: 30 },
  { hour: "18:00", orders: 55 },
  { hour: "19:00", orders: 60 },
  { hour: "20:00", orders: 45 },
  { hour: "21:00", orders: 30 },
  { hour: "22:00", orders: 20 },
  { hour: "23:00", orders: 15 },
];

export function HourlyOrdersChart() {
  const [activeTime, setActiveTime] = useState("12:00");

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
              tickFormatter={(value) => `${value}K`}
              domain={[0, 40]}
              ticks={[0, 10, 20, 30, 40]}
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
