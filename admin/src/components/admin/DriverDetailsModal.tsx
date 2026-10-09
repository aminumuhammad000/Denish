import { X, Star, Phone, Check, Trash2, FileText, ExternalLink, ShieldCheck, Car, CreditCard, ZoomIn } from "lucide-react";
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
  email?: string;
  vehicle: string;
  vehicleDetails?: {
    type?: string;
    make?: string;
    plate?: string;
    color?: string;
  };
  deliveries: number;
  rating: number;
  completion: string;
  status: "Online" | "Delivering" | "Offline" | "Pending" | "Active" | "Suspended" | string;
  earnings: string;
  isWarned?: boolean;
  isSuspended?: boolean;
  isVerified?: boolean;
  profilePic?: string | null;
  documents?: {
    nationalId?: string | null;
    vehiclePhoto?: string | null;
    license?: string | null;
  };
  bank?: {
    name?: string;
    bankCode?: string;
    accountName?: string;
    accountNumber?: string;
  };
}

interface DriverDetailsModalProps {
  driver: Driver | null;
  onClose: () => void;
  onUpdateDriver?: (updatedDriver: Driver) => void;
  onApprove?: (driver: Driver) => void;
  onDelete?: (driver: Driver) => void;
}

export function DriverDetailsModal({
  driver,
  onClose,
  onUpdateDriver,
  onApprove,
  onDelete,
}: DriverDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"documents" | "performance">("documents");
  const [activeDay, setActiveDay] = useState("Wed");
  const [isWarned, setIsWarned] = useState(driver?.isWarned || false);
  const [isSuspended, setIsSuspended] = useState(driver?.isSuspended || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    if (driver) {
      setIsWarned(driver.isWarned || false);
      setIsSuspended(driver.isSuspended || false);
      // If driver is pending approval, default to documents tab
      if (driver.status === "Pending") {
        setActiveTab("documents");
      }
    }
  }, [driver]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        if (!previewDoc && !showDeleteConfirm) {
          onClose();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, previewDoc, showDeleteConfirm]);

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

  const handleContact = () => {
    const recipient = driver?.email || "support@denish.ng";
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(`Inquiry about ${driver?.name || "driver"}`)}`;
  };

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

  const docs = driver.documents || {};
  const docList = [
    {
      id: "nationalId",
      title: "National ID / NIN",
      description: "Government-issued ID document",
      url: docs.nationalId,
    },
    {
      id: "license",
      title: "Driver's License",
      description: "Official driving license permit",
      url: docs.license,
    },
    {
      id: "vehiclePhoto",
      title: "Vehicle Photo",
      description: "Photo of registered delivery vehicle",
      url: docs.vehiclePhoto,
    },
    {
      id: "profilePic",
      title: "Profile Photo",
      description: "Driver identity portrait",
      url: driver.profilePic,
    },
  ];

  const uploadedDocsCount = docList.filter((d) => Boolean(d.url)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4 py-6">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-[620px] max-h-[92vh] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header - Fixed */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            {driver.profilePic ? (
              <img
                src={driver.profilePic}
                alt={driver.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#29A378]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#E9F5EF] text-[#29A378] font-bold flex items-center justify-center text-lg">
                {driver.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-bold text-[#191C1C]">{driver.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                    driver.status.toLowerCase() === "active" || driver.status.toLowerCase() === "online"
                      ? "text-[#29A378] bg-[#E9F5EF]"
                      : driver.status.toLowerCase() === "suspended"
                      ? "text-red-500 bg-red-50"
                      : "text-[#FE7200] bg-[#FFF4E4]"
                  }`}
                >
                  {driver.status}
                </span>
              </div>
              <p className="text-[13px] text-[#747475]">{driver.phone} • {driver.email || "No email"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-[#555]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EAEAEA] px-5 bg-[#FAFAFA]">
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 py-3 px-3 text-[14px] font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "documents"
                ? "border-[#29A378] text-[#29A378]"
                : "border-transparent text-[#747475] hover:text-[#191C1C]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            KYC Documents & Info
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                uploadedDocsCount >= 3
                  ? "bg-[#E9F5EF] text-[#29A378]"
                  : "bg-[#FFF4E4] text-[#FE7200]"
              }`}
            >
              {uploadedDocsCount}/4
            </span>
          </button>

          <button
            onClick={() => setActiveTab("performance")}
            className={`flex items-center gap-2 py-3 px-3 text-[14px] font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "performance"
                ? "border-[#29A378] text-[#29A378]"
                : "border-transparent text-[#747475] hover:text-[#191C1C]"
            }`}
          >
            <FileText className="w-4 h-4" />
            Performance & Stats
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-5 py-4 overflow-y-auto no-scrollbar min-h-0">
          {activeTab === "documents" ? (
            <div className="flex flex-col gap-4">
              {/* KYC Documents Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-[14px] font-bold text-[#191C1C] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#29A378]" />
                    Uploaded Verification Documents
                  </h3>
                  <span className="text-[12px] text-[#747475]">
                    {uploadedDocsCount} of 4 attached
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docList.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-[#EAEAEA] rounded-[12px] p-3 flex flex-col justify-between bg-white hover:border-[#29A378]/50 transition-all shadow-xs"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[13px] font-bold text-[#191C1C]">{doc.title}</p>
                          <p className="text-[11px] text-[#848484]">{doc.description}</p>
                        </div>
                        {doc.url ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9F5EF] text-[#29A378]">
                            Uploaded
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4E4] text-[#FE7200]">
                            Missing
                          </span>
                        )}
                      </div>

                      {doc.url ? (
                        <div className="mt-1">
                          <div
                            onClick={() => setPreviewDoc({ title: doc.title, url: doc.url! })}
                            className="relative w-full h-[110px] bg-[#F5F5F5] rounded-[8px] overflow-hidden group cursor-pointer border border-[#EAEAEA]"
                          >
                            <img
                              src={doc.url}
                              alt={doc.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all text-white text-[12px] font-bold">
                              <ZoomIn className="w-4 h-4" /> View Full
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setPreviewDoc({ title: doc.title, url: doc.url! })}
                              className="flex-1 py-1.5 px-2 bg-[#F0FDF4] text-[#29A378] hover:bg-[#E9F5EF] rounded-[6px] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              <ZoomIn className="w-3.5 h-3.5" /> Preview
                            </button>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-[#555] rounded-[6px] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-[80px] bg-[#F9F9F9] rounded-[8px] border border-dashed border-[#DDD] flex flex-col items-center justify-center text-[#999] text-[12px]">
                          <FileText className="w-5 h-5 mb-1 text-[#BBB]" />
                          Not Uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle & Bank Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {/* Vehicle Details */}
                <div className="border border-[#EAEAEA] rounded-[12px] p-3.5 bg-[#FAFAFA]">
                  <div className="flex items-center gap-2 mb-2 text-[#191C1C]">
                    <Car className="w-4 h-4 text-[#29A378]" />
                    <h4 className="text-[13px] font-bold">Vehicle Details</h4>
                  </div>
                  <div className="text-[12px] flex flex-col gap-1.5 text-[#555]">
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Type:</span>
                      <strong className="text-[#191C1C]">{driver.vehicleDetails?.type || driver.vehicle || "Motorcycle"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Make / Model:</span>
                      <strong className="text-[#191C1C]">{driver.vehicleDetails?.make || "Not specified"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Plate Number:</span>
                      <strong className="text-[#191C1C]">{driver.vehicleDetails?.plate || "Not specified"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Color:</span>
                      <strong className="text-[#191C1C]">{driver.vehicleDetails?.color || "Not specified"}</strong>
                    </div>
                  </div>
                </div>

                {/* Bank Account */}
                <div className="border border-[#EAEAEA] rounded-[12px] p-3.5 bg-[#FAFAFA]">
                  <div className="flex items-center gap-2 mb-2 text-[#191C1C]">
                    <CreditCard className="w-4 h-4 text-[#29A378]" />
                    <h4 className="text-[13px] font-bold">Payout Bank Account</h4>
                  </div>
                  <div className="text-[12px] flex flex-col gap-1.5 text-[#555]">
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Bank:</span>
                      <strong className="text-[#191C1C]">{driver.bank?.name || "Not Added"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Account Number:</span>
                      <strong className="text-[#191C1C]">{driver.bank?.accountNumber || "Not Added"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Account Name:</span>
                      <strong className="text-[#191C1C]">{driver.bank?.accountName || driver.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848484]">Available Balance:</span>
                      <strong className="text-[#29A378]">{driver.earnings}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-2">
                  <p className="text-[11px] font-medium text-[#848484] mb-0.5">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#F9A825] text-[#F9A825]" />
                    <span className="text-[13px] font-bold text-[#212121]">{driver.rating || 4.8}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-2">
                  <p className="text-[11px] font-medium text-[#848484] mb-0.5">Deliveries</p>
                  <span className="text-[13px] font-bold text-[#212121]">{driver.deliveries || 0}</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#F8F8F8] rounded-[8px] py-2">
                  <p className="text-[11px] font-medium text-[#848484] mb-0.5">Completion</p>
                  <span className="text-[13px] font-bold text-[#212121]">{driver.completion || "100%"}</span>
                </div>
              </div>

              {/* Weekly Earnings Chart */}
              <div className="flex flex-col gap-2 border border-[#EAEAEA] rounded-[12px] p-3">
                <h3 className="text-[13px] font-bold text-[#848484]">Weekly Earnings Overview</h3>
                <div className="h-[180px] w-full mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={({ x, y, payload }) => {
                          const isActive = activeDay === payload.value;
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <rect
                                x={-16}
                                y={4}
                                width={32}
                                height={22}
                                fill={isActive ? "#F3F4F6" : "transparent"}
                                rx={4}
                                cursor="pointer"
                                onClick={() => setActiveDay(payload.value)}
                              />
                              <text
                                x={0}
                                y={18}
                                fill={isActive ? "#303031" : "#A0A0A0"}
                                fontSize={12}
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
                        tick={{ fill: "#A0A0A0", fontSize: 11 }}
                        tickFormatter={(value) => (value === 0 ? "0k" : `${value / 1000}k`)}
                        width={28}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [
                          `₦${Number(Array.isArray(value) ? value[0] : value || 0).toLocaleString()}`,
                          "Earnings",
                        ]}
                      />
                      <Bar dataKey="value" fill="#29A378" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Deliveries */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[13px] font-bold text-[#848484]">Recent Delivery Activity</h3>
                <div className="flex flex-col gap-2">
                  {recentDeliveries.slice(0, 3).map((delivery, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F8F8F8] rounded-[8px]">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[13px] font-medium text-[#212121]">{delivery.customer}</p>
                        <p className="text-[12px] text-[#747475]">{delivery.vendor} | {delivery.time}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-[13px] font-bold text-[#212121]">{delivery.amount}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#F9A825] text-[#F9A825]" />
                          <p className="text-[12px] font-medium text-[#212121]">{delivery.rating}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-4 pt-3 bg-white border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between gap-2.5">
            <button
              onClick={handleContact}
              className="flex-1 flex items-center justify-center gap-1.5 h-[42px] bg-[#207951] text-white rounded-[10px] text-[13px] font-bold hover:bg-[#1a6342] transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              Contact
            </button>

            {driver.status === "Pending" ? (
              <button
                onClick={() => {
                  if (onApprove && driver) {
                    onApprove(driver);
                  }
                }}
                className="flex-[1.8] flex items-center justify-center gap-1.5 h-[42px] bg-[#29A378] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#207951] transition-all cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                Approve & Verify Driver
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const nextState = !isWarned;
                    setIsWarned(nextState);
                    if (onUpdateDriver && driver) {
                      onUpdateDriver({ ...driver, isWarned: nextState });
                    }
                    if (nextState) {
                      toast.warning(`Warning sent to ${driver.name}`);
                    } else {
                      toast.info(`Warning retracted for ${driver.name}`);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 h-[42px] border rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
                    isWarned
                      ? "bg-[#F9A825] border-[#F9A825] text-white"
                      : "border-[#F9A825] text-[#F9A825] hover:bg-yellow-50"
                  }`}
                >
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
                      toast.error(`${driver.name} suspended`);
                    } else {
                      toast.success(`${driver.name} restored`);
                    }
                  }}
                  className={`flex-1 h-[42px] border rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
                    isSuspended
                      ? "bg-[#E14343] border-[#E14343] text-white"
                      : "border-[#E14343] text-[#E14343] hover:bg-red-50"
                  }`}
                >
                  {isSuspended ? "Unsuspend" : "Suspend"}
                </button>
              </>
            )}

            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="h-[42px] px-3 border border-[#E14343] text-[#E14343] hover:bg-red-50 rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Delete Driver"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document Lightbox Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[800px] flex items-center justify-between text-white mb-3">
            <h3 className="text-[18px] font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#29A378]" />
              {previewDoc.title} — {driver.name}
            </h3>
            <div className="flex items-center gap-2">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-[800px] max-h-[80vh] w-full bg-black/40 rounded-[16px] overflow-hidden flex items-center justify-center border border-white/10">
            <img
              src={previewDoc.url}
              alt={previewDoc.title}
              className="max-h-[75vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Delete Driver Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-[400px] w-full p-6 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[56px] h-[56px] bg-[#FEF2F2] rounded-full flex items-center justify-center text-[#EF4343]">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-[#191C1C] mb-2">Delete Driver?</h3>
                <p className="text-[14px] text-[#747475] leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[#191C1C]">{driver.name}</strong>? This action cannot be undone and will remove all driver documents and delivery records.
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-[46px] border border-[#EAEAEA] rounded-[10px] text-[14px] font-bold text-[#747475] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    if (onDelete && driver) onDelete(driver);
                  }}
                  className="flex-1 h-[46px] bg-[#EF4343] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#D32F2F] transition-all cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
