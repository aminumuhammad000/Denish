

import { useState, useEffect } from "react";
import { MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";

import { useAdminStore, type Dispute, type Transaction } from "@/lib/store";

const PriorityBadge = ({ priority }: { priority: Dispute["priority"] }) => {
  const styles = {
    low: "bg-[#F3F4F6] text-[#6B7280]",
    medium: "bg-[#FFFBEB] text-[#D97706]",
    high: "bg-[#FFF1F1] text-[#EF4444]",
    critical: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[12px] font-bold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: Dispute["status"] }) => {
  const styles = {
    open: "bg-[#FFFBEB] text-[#D97706]",
    investigating: "bg-[#E0F2FE] text-[#0284C7]",
    escalated: "bg-[#F5F3FF] text-[#7C3AED]",
    resolved: "bg-[#DCFCE7] text-[#16A34A]",
    closed: "bg-[#F3F4F6] text-[#6B7280]",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[12px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default function DisputesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const disputesList = useAdminStore((state) => state.disputes);
  const updateDisputeStatusOnServer = useAdminStore((state) => state.updateDisputeStatusOnServer);
  const usersList = useAdminStore((state) => state.users);
  const updateUserStatusOnServer = useAdminStore((state) => state.updateUserStatusOnServer);
  const addTransactionOnServer = useAdminStore((state) => state.addTransactionOnServer);


  const [activeFilter, setActiveFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Response sent");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  const handleOpenDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsModalOpen(true);
  };

  const handleSendResponse = () => {
    setToastMessage("Response sent successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdateStatus = async (newStatus: Dispute["status"]) => {
    if (!selectedDispute) return;
    await updateDisputeStatusOnServer(selectedDispute.id, newStatus);
    setSelectedDispute({ ...selectedDispute, status: newStatus });
    setToastMessage(`Dispute status updated to ${newStatus}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  const handleSuspendUser = async () => {
    if (!selectedDispute) return;
    const cleanName = (name: string) => name.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
    const suspectName = cleanName(selectedDispute.against);
    const complainantName = cleanName(selectedDispute.from);

    const userToSuspend = usersList.find(
      (u) =>
        cleanName(u.name) === suspectName ||
        cleanName(u.name) === complainantName
    );

    if (userToSuspend) {
      await updateUserStatusOnServer(userToSuspend.id, "Suspended");
      setToastMessage(`User ${userToSuspend.name} suspended`);
    } else {
      setToastMessage("Associated user suspended");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  const handleRefundCustomer = async () => {
    if (!selectedDispute) return;
    const customerName = selectedDispute.from.replace(/\s*\(.*?\)\s*/g, "").trim();
    
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: "Refund Payment",
      from: "Platform",
      to: customerName,
      amount: "₦5,000",
      method: "Wallet",
      status: "Completed",
      date: new Date().toISOString().split("T")[0],
    };
    await addTransactionOnServer(newTxn);

    await updateDisputeStatusOnServer(selectedDispute.id, "resolved");
    setSelectedDispute({ ...selectedDispute, status: "resolved" });

    setToastMessage(`Refund of ₦5,000 issued to ${customerName}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  return (
    <>
      {/* Page Content */}
      <div className="px-[clamp(1rem,3vw,2rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center flex-1">
        <div className="w-full max-w-[991px] flex flex-col gap-8">
          <h1 className="text-[clamp(1.5rem,4vw,1.75rem)] font-bold text-[#191C1C]">
            Complaints and Disputes
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[
              { label: "Total", value: String(disputesList.length), color: "#191C1C" },
              { label: "Open", value: String(disputesList.filter(d => d.status === "open").length), color: "#D97706" },
              { label: "Investigating", value: String(disputesList.filter(d => d.status === "investigating").length), color: "#0284C7" },
              { label: "Escalated", value: String(disputesList.filter(d => d.status === "escalated").length), color: "#DC2626" },
              { label: "Resolved", value: String(disputesList.filter(d => d.status === "resolved").length), color: "#16A34A" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] shadow-sm"
              >
                <p className="text-[14px] text-[#747475] mb-2">{stat.label}</p>
                <h4
                  className="text-[28px] font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </h4>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {[
              "all",
              "open",
              "investigating",
              "escalated",
              "resolved",
              "closed",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-[8px] text-[14px] font-medium border transition-all ${
                  activeFilter === filter
                    ? "bg-[#F9811F] text-white border-[#F9811F]"
                    : "bg-white text-[#747475] border-[#EAEAEA] hover:bg-gray-50"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Dispute Cards */}
          <div className="flex flex-col gap-4">
            {disputesList
              .filter(
                (d) => activeFilter === "all" || d.status === activeFilter,
              )
              .map((dispute) => (
                <div
                  key={dispute.id}
                  onClick={() => handleOpenDispute(dispute)}
                  className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] shadow-sm hover:border-[#F9811F] transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                      <h3 className="text-[18px] font-bold text-[#191C1C] group-hover:text-[#F9811F] transition-colors">
                        {dispute.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={dispute.priority} />
                      <StatusBadge status={dispute.status} />
                    </div>
                  </div>

                  <p className="text-[14px] text-[#747475] mb-6 line-clamp-2">
                    {dispute.description}
                  </p>

                  <div className="flex items-center justify-between text-[13px] text-[#747475] flex-wrap gap-4">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{dispute.complaintId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{dispute.orderId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          From:{" "}
                          <span className="text-[#191C1C] font-medium">
                            {dispute.from}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          Against:{" "}
                          <span className="text-[#191C1C] font-medium">
                            {dispute.against}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{dispute.messageCount} messages</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Dispute Details Modal */}
      {isModalOpen && selectedDispute && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-[92vw] max-w-[668px] max-h-[80vh] sm:max-h-[92vh] overflow-y-auto rounded-[16px] sm:rounded-[21px] shadow-2xl relative border border-[#EAEAEA]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-10 py-3 sm:py-6 border-b border-[#EAEAEA]">
              <h2 className="text-[18px] sm:text-[24px] font-bold text-[#191C1C]">
                {selectedDispute.title}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#747475] hover:text-[#191C1C]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="px-4 sm:px-10 py-4 sm:py-8 flex flex-col gap-3 sm:gap-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-12 gap-y-4 sm:gap-y-6 max-w-[504px] mx-auto w-full">
                <div>
                  <p className="text-[11px] sm:text-[12px] text-[#747475] uppercase mb-1">
                    Complaint ID
                  </p>
                  <p className="text-[14px] sm:text-[16px] font-normal text-[#212121]">
                    {selectedDispute.complaintId}
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-[#747475] mt-1">
                    12 Marina Road, Lagos
                  </p>
                </div>
                <div>
                  <p className="text-[11px] sm:text-[12px] text-[#747475] uppercase mb-1">
                    Order ID
                  </p>
                  <p className="text-[14px] sm:text-[16px] font-normal text-[#212121]">
                    {selectedDispute.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] sm:text-[12px] text-[#747475] uppercase mb-1">
                    Filed By
                  </p>
                  <p className="text-[14px] sm:text-[16px] font-normal text-[#212121] wrap-break-word">
                    {selectedDispute.from}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] sm:text-[12px] text-[#747475] uppercase mb-1">
                    Against
                  </p>
                  <p className="text-[14px] sm:text-[16px] font-normal text-[#212121] wrap-break-word">
                    {selectedDispute.against}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] sm:text-[12px] text-[#747475] uppercase mb-1">
                    Type
                  </p>
                  <p className="text-[14px] sm:text-[16px] font-normal text-[#212121]">
                    Quality
                  </p>
                </div>
                <div>
                  <p className="text-[11px] sm:text-[12px] text-[#747475] uppercase mb-1">
                    Priority
                  </p>
                  <PriorityBadge priority={selectedDispute.priority} />
                </div>
              </div>

              {/* Conversation */}
              <div className="flex flex-col gap-2 sm:gap-3 max-w-[504px] mx-auto w-full">
                <p className="text-[13px] sm:text-[14px] font-bold text-[#191C1C]">
                  Conversation
                </p>
                <div className="bg-[#F8FAF9] p-3 sm:p-6 rounded-[12px] flex flex-col gap-3 sm:gap-6 h-[140px] sm:h-[255px] overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] sm:text-[14px] font-bold text-[#191C1C]">
                        Aisha
                      </span>
                      <span className="text-[11px] sm:text-[12px] text-[#747475]">
                        10:30
                      </span>
                    </div>
                    <p className="text-[14px] sm:text-[16px] font-normal text-[#212121]">
                      The food was cold and soggy
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] sm:text-[14px] font-bold text-[#191C1C]">
                        Admin
                      </span>
                      <span className="text-[11px] sm:text-[12px] text-[#747475]">
                        10:45
                      </span>
                    </div>
                    <p className="text-[14px] sm:text-[16px] font-normal text-[#212121]">
                      We&apos;re looking into this. Apologies for the
                      inconvenience.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] sm:text-[14px] font-bold text-[#191C1C]">
                        Mama&apos;s Kitchen
                      </span>
                      <span className="text-[11px] sm:text-[12px] text-[#747475]">
                        11:00
                      </span>
                    </div>
                    <p className="text-[14px] sm:text-[16px] font-normal text-[#212121]">
                      The food was hot when it left our kitchen at 10:05
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Box */}
              <div className="flex flex-col gap-3 sm:gap-4 max-w-[504px] mx-auto w-full">
                <textarea
                  placeholder="Type your response..."
                  className="w-full h-[80px] sm:h-[159px] p-3 sm:p-4 border-2 border-[#F9811F] rounded-[12px] text-[14px] sm:text-[16px] placeholder:text-[#C0C0C0] focus:outline-none resize-none"
                />
                <div className="flex flex-col gap-2 sm:gap-3 w-full">
                  {/* Row 1 */}
                  <div className="flex flex-col sm:grid sm:grid-cols-[2.2fr_1fr_1fr] gap-2 sm:gap-3 w-full">
                    <button
                      onClick={handleSendResponse}
                      className="bg-[#F9811F] text-white h-[40px] sm:h-[42px] rounded-[8px] text-[13px] sm:text-[14px] font-medium hover:bg-[#e0741b] transition-all flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(249,129,31,0.2)] w-full"
                    >
                      <div
                        className="w-4 h-4 bg-white"
                        style={{
                          maskImage: "url('/images/chat.svg')",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                          maskSize: "contain",
                          WebkitMaskImage: "url('/images/chat.svg')",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          WebkitMaskSize: "contain",
                        }}
                      />
                      Send Response
                    </button>
                    <div className="grid grid-cols-2 sm:contents gap-2">
                      <button 
                        onClick={() => handleUpdateStatus("resolved")}
                        className="border border-[#29A378] text-[#29A378] h-[40px] sm:h-[42px] rounded-[8px] text-[13px] sm:text-[14px] font-medium hover:bg-green-50 transition-all w-full cursor-pointer"
                      >
                        Resolve
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus("investigating")}
                        className="border border-[#F9A825] text-[#F9A825] h-[40px] sm:h-[42px] rounded-[8px] text-[13px] sm:text-[14px] font-medium hover:bg-orange-50 transition-all w-full cursor-pointer"
                      >
                        Investigate
                      </button>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
                    <button 
                      onClick={() => handleUpdateStatus("escalated")}
                      className="border border-[#EF4343] text-[#EF4343] h-[40px] sm:h-[42px] rounded-[8px] text-[13px] sm:text-[14px] font-medium hover:bg-red-50 transition-all w-full cursor-pointer"
                    >
                      Escalate
                    </button>
                    <button 
                      onClick={handleRefundCustomer}
                      className="border border-[#212121] text-[#212121] h-[40px] sm:h-[42px] rounded-[8px] text-[13px] sm:text-[14px] font-medium hover:bg-gray-50 transition-all whitespace-nowrap w-full cursor-pointer"
                    >
                      Refund Customer
                    </button>
                    <button 
                      onClick={handleSuspendUser}
                      className="border border-dashed border-[#EF4343] text-[#EF4343] h-[40px] sm:h-[42px] rounded-[8px] text-[13px] sm:text-[14px] font-medium hover:bg-red-50 transition-all col-span-2 sm:col-span-1 w-full cursor-pointer"
                    >
                      Suspend User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-110 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white w-[320px] h-[64px] rounded-[6px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center px-4 gap-3 border border-[#F5F5F5]">
            <div className="w-[32px] h-[32px] rounded-full bg-[#DCFCE7] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            </div>
            <span className="text-[14px] font-normal text-[#687280] flex-1">
              {toastMessage}
            </span>
            <button
              onClick={() => setShowToast(false)}
              className="text-[#687280] hover:text-[#191C1C]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
