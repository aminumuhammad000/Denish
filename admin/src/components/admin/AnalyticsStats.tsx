"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive?: boolean;
}

function StatCard({ label, value, change, isPositive = true }: StatCardProps) {
  return (
    <div className="bg-white h-[100px] p-[clamp(12px,1.5vw,16px)] rounded-[12px] border border-[#EAEAEA] flex flex-col justify-between">
      <p className="text-[#747475] text-[clamp(10px,1.2vw,12px)] font-medium leading-tight">{label}</p>
      <h3 className="text-[clamp(18px,2vw,24px)] font-bold text-[#191C1C] leading-none">{value}</h3>
      <p className={`text-[12px] font-bold ${isPositive ? "text-[#207951]" : "text-[#EF4444]"}`}>
        {change}
      </p>
    </div>
  );
}

export function AnalyticsStats() {
  const stats = [
    { label: "Avg. Order Value", value: "₦5,800", change: "+12%" },
    { label: "Orders/Day", value: "42", change: "+8%" },
    { label: "Avg. Delivery Time", value: "28 min", change: "-3 min" },
    { label: "Customer Rating", value: "4.7", change: "+0.2" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-[16px] md:gap-[20px]">
      {stats.map((stat) => (
        <StatCard 
          key={stat.label} 
          label={stat.label} 
          value={stat.value} 
          change={stat.change}
          isPositive={true}
        />
      ))}
    </div>
  );
}
