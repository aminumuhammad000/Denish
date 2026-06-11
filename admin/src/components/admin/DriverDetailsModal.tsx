"use client";

import { X, Star, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Driver {
  id: string;
  name: string;
  location: string;
  phone: string;
  vehicle: string;
  deliveries: number;
  rating: number;
  completion: string;
  status: "Online" | "Delivering" | "Offline";
  earnings: string;
  isWarned?: boolean;
  isSuspended?: boolean;
}

interface DriverDetailsModalProps {
  driver: Driver | null;
  onClose: () => void;
  onUpdateDriver?: (updatedDriver: Driver) => void;
}

export function DriverDetailsModal({
  driver,
  onClose,
  onUpdateDriver,
}: DriverDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState("Wed");
  const [isWarned, setIsWarned] = useState(driver?.isWarned || false);
  const [isSuspended, setIsSuspended] = useState(driver?.isSuspended || false);

  useEffect(() => {
    if (driver) {
      setIsWarned(driver.isWarned || false);
      setIsSuspended(driver.isSuspended || false);
    }
  }, [driver]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!driver) return null;

  const mockChartData = [
    { day: "Mon", value: 26000 },
    { day: "Tue", value: 34000 },
    { day: "Wed", value: 32000 },
    { day: "Thur", value: 18000 },
    { day: "Fri", value: 40000 },
    { day: "Sat", value: 30000 },
    { day: "Sun", value: 32000 },
  ];

  const recentDeliveries = [
    {
      customer: "Aisha Mohammed",
      vendor: "Mama's Kitchen",
      time: "25mins",
      amount: "₦8,000",
      rating: 4.8,
    },
    {
      customer: "Chidi Okafor",
      vendor: "Grill House",
      time: "32mins",
      amount: "₦4,000",
      rating: 4.8,
    },
    {
      customer: "Fatima Bello",
      vendor: "Mama's Kitchen",
      time: "19mins",
      amount: "₦7,000",
      rating: 4.8,
    },
    {
      customer: "Fatima Bello",
      vendor: "Mama's Kitchen",
      time: "19mins",
      amount: "₦7,000",
      rating: 4.8,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-[542px] max-h-[min(939px,95vh)] flex flex-col rounded-[21px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header - Fixed */}
        <div className="p-[clamp(12px,2vh,20px)] pb-0 flex items-center justify-between mb-[clamp(8px,1.2vh,12px)]">
          <h2 className="text-[clamp(20px,3vh,28px)] font-medium text-[#000000]">
            {driver.name}
          </h2>
          <button
            onClick={onClose}
            className="w-[clamp(36px,5vh,48px)] h-[clamp(36px,5vh,48px)] flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6 text-[#000000]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-[clamp(12px,2vh,20px)] flex flex-col min-h-0">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-3 gap-[clamp(6px,1vh,10px)] mb-[clamp(8px,1.2vh,12px)]">
            <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-[clamp(4px,0.8vh,8px)]">
              <p className="text-[clamp(10px,1.2vh,12px)] font-medium text-[#848484] mb-0.5">
                Rating
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-[clamp(10px,1.2vh,12px)] h-[clamp(10px,1.2vh,12px)] fill-[#F9A825] text-[#F9A825]" />
                <span className="text-[clamp(12px,1.5vh,14px)] font-bold text-[#212121]">
                  4.8
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-[clamp(4px,0.8vh,8px)]">
              <p className="text-[clamp(10px,1.2vh,12px)] font-medium text-[#848484] mb-0.5">
                Deliveries
              </p>
              <span className="text-[clamp(12px,1.5vh,14px)] font-bold text-[#212121]">
                342
              </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-[clamp(4px,0.8vh,8px)]">
              <p className="text-[clamp(10px,1.2vh,12px)] font-medium text-[#848484] mb-0.5">
                Completion
              </p>
              <span className="text-[clamp(12px,1.5vh,14px)] font-bold text-[#212121]">
                96%
              </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-[clamp(4px,0.8vh,8px)]">
              <p className="text-[clamp(10px,1.2vh,12px)] font-medium text-[#848484] mb-0.5">
                Avg. Time
              </p>
              <span className="text-[clamp(12px,1.5vh,14px)] font-bold text-[#212121]">
                4.8
              </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-[clamp(4px,0.8vh,8px)]">
              <p className="text-[clamp(10px,1.2vh,12px)] font-medium text-[#848484] mb-0.5">
                Cancel Rate
              </p>
              <span className="text-[clamp(12px,1.5vh,14px)] font-bold text-[#212121]">
                2.1%
              </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-[clamp(4px,0.8vh,8px)]">
              <p className="text-[clamp(10px,1.2vh,12px)] font-medium text-[#848484] mb-0.5">
                Complaints
              </p>
              <span className="text-[clamp(12px,1.5vh,14px)] font-bold text-[#212121]">
                1
              </span>
            </div>
          </div>

          {/* Weekly Earnings Chart */}
          <div className="flex flex-col gap-[clamp(6px,1vh,12px)] border border-[#EAEAEA] rounded-[12px] p-[clamp(10px,1.5vh,15px)] mb-[clamp(8px,1.2vh,12px)]">
            <h3 className="text-[clamp(12px,1.4vh,14px)] font-medium text-[#848484]">
              Weekly Earnings
            </h3>
            <div className="h-[clamp(150px,29.2vh,274px)] w-full mt-1 **:outline-none focus:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockChartData}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  barSize={38}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#EAEAEA"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={({ x, y, payload }: { x: string | number; y: string | number; payload: { value: string } }) => {
                      const isActive = activeDay === payload.value;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <rect
                            x={-20}
                            y={4}
                            width={40}
                            height={26}
                            fill={isActive ? "#F3F4F6" : "transparent"}
                            rx={6}
                            cursor="pointer"
                            onClick={() => setActiveDay(payload.value)}
                          />
                          <text
                            x={0}
                            y={22}
                            fill={isActive ? "#303031" : "#A0A0A0"}
                            fontSize={14}
                            fontWeight={400}
                            textAnchor="middle"
                            cursor="pointer"
                            onClick={() => setActiveDay(payload.value)}
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
                    tick={{ fill: "#A0A0A0", fontSize: 14 }}
                    tickFormatter={(value) =>
                      value === 0 ? "0k" : `${value / 1000}k`
                    }
                    ticks={[0, 10000, 20000, 30000, 40000]}
                    interval={0}
                    width={30}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(
                      value:
                        | string
                        | number
                        | readonly (string | number)[]
                        | undefined,
                    ) => [
                      `₦${Number(Array.isArray(value) ? value[0] : value || 0).toLocaleString()}`,
                      "Earnings",
                    ]}
                    labelStyle={{ color: "#848484", marginBottom: "4px" }}
                  />
                  <Bar dataKey="value" fill="#F97015" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="flex flex-col gap-[clamp(8px,1.5vh,16px)] mb-[clamp(12px,2.5vh,26px)] flex-1 min-h-0">
            <h3 className="text-[clamp(12px,1.4vh,14px)] font-medium text-[#848484] shrink-0">
              Recent Deliveries
            </h3>
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-[clamp(6px,1vh,10px)]">
              {recentDeliveries.map((delivery, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-[clamp(8px,1.2vh,12px)] shrink-0 bg-[#F8F8F8] rounded-[8px]"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[clamp(13px,1.6vh,16px)] font-medium text-[#212121]">
                      {delivery.customer}
                    </p>
                    <p className="text-[clamp(13px,1.6vh,16px)] text-[#747475]">
                      {delivery.vendor} | {delivery.time}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full">
                    <p className="text-[clamp(13px,1.6vh,16px)] font-medium text-[#212121]">
                      {delivery.amount}
                    </p>
                    <div className="flex items-center gap-1 mt-auto">
                      <Star className="w-[clamp(13px,1.6vh,16px)] h-[clamp(13px,1.6vh,16px)] fill-[#F9A825] text-[#F9A825]" />
                      <p className="text-[clamp(13px,1.6vh,16px)] font-medium text-[#212121]">
                        {delivery.rating}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-[clamp(12px,2vh,20px)] pt-0">
          <div className="flex items-center justify-between gap-[clamp(8px,1.2vh,12px)] pt-[clamp(10px,1.5vh,16px)] border-t border-transparent">
            <button className="flex-[1.5] flex items-center justify-center gap-3 h-[clamp(36px,4.7vh,48px)] bg-[#29A378] text-white rounded-[8px] text-[clamp(13px,1.6vh,16px)] font-medium hover:bg-[#207951] transition-all">
              <Phone className="w-[clamp(16px,2vh,20px)] h-[clamp(16px,2vh,20px)]" />
              Contact
            </button>
            <button
              onClick={() => {
                const nextState = !isWarned;
                setIsWarned(nextState);
                if (onUpdateDriver && driver) {
                  onUpdateDriver({ ...driver, isWarned: nextState });
                }
                if (nextState) {
                  toast.warning(`Warning sent to ${driver.name}`, {
                    description:
                      "The driver will receive a formal notification.",
                  });
                } else {
                  toast.info(`Warning retracted for ${driver.name}`);
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 h-[clamp(36px,4.7vh,48px)] border rounded-[8px] text-[clamp(13px,1.6vh,16px)] font-medium transition-all ${
                isWarned
                  ? "bg-[#F9A825] border-[#F9A825] text-white"
                  : "border-[#F9A825] text-[#F9A825] hover:bg-yellow-50"
              }`}
            >
              <span
                className={`flex items-center justify-center w-[clamp(16px,2vh,20px)] h-[clamp(16px,2vh,20px)] rounded-full border text-[clamp(10px,1.2vh,12px)] font-bold ${
                  isWarned
                    ? "border-white text-white"
                    : "border-[#F9A825] text-[#F9A825]"
                }`}
              >
                i
              </span>
              {isWarned ? "Unwarn" : "Warn"}
            </button>
            <button
              onClick={() => {
                const nextState = !isSuspended;
                setIsSuspended(nextState);
                if (onUpdateDriver && driver) {
                  onUpdateDriver({ ...driver, isSuspended: nextState });
                }
                if (nextState) {
                  toast.error(`${driver.name} has been suspended`, {
                    description:
                      "The account has been restricted until further review.",
                  });
                } else {
                  toast.success(`${driver.name}'s account has been restored`);
                }
              }}
              className={`flex-1 h-[clamp(36px,4.7vh,48px)] border rounded-[8px] text-[clamp(13px,1.6vh,16px)] font-medium transition-all ${
                isSuspended
                  ? "bg-[#E14343] border-[#E14343] text-white"
                  : "border-[#E14343] text-[#E14343] hover:bg-red-50"
              }`}
            >
              {isSuspended ? "Unsuspend" : "Suspend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
