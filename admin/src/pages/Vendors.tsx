

import { Search, Star, Eye, Check, X, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VendorDetailsModal } from "@/components/admin/VendorDetailsModal";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { exportToCSV } from "@/lib/exportUtils";

import { useAdminStore, type Vendor } from "@/lib/store";

const statusStyles = {
  approved: "text-[#3DD26A] bg-[#F0FBF4]",
  suspended: "text-red-500 bg-red-50",
  pending: "text-[#F9811F] bg-[#FFF4E4]",
};

export default function VendorsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const vendorList = useAdminStore((state) => state.vendors);
  const updateVendorStatusOnServer = useAdminStore((state) => state.updateVendorStatusOnServer);
  const globalSearchQuery = useAdminStore((state) => state.globalSearchQuery);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [menuVendor, setMenuVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  const toggleVendorStatus = async (vendorId: string, currentStatus: string) => {
    let newStatus = "approved";
    if (currentStatus.toLowerCase() === "pending") {
      newStatus = "approved";
    } else if (currentStatus.toLowerCase() === "suspended") {
      newStatus = "approved";
    } else {
      newStatus = "suspended";
    }

    await updateVendorStatusOnServer(vendorId, newStatus);
    setToastMessage(newStatus === "suspended" ? "Vendor Suspended" : "Vendor Approved");
    setSelectedVendor(null);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleViewMenu = async (vendor: Vendor) => {
    setMenuVendor(vendor);
    setIsMenuLoading(true);
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || "https://api.denishng.com/api").replace(/\/$/, "");
      const candidates = [
        `${apiBase}/admin/vendors/${vendor.id}/menu`,
        `${apiBase}/admin/vendors/${vendor.id}/menu-items`,
      ];

      let data: any = null;
      for (const url of candidates) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          data = await response.json();
          if (data?.success) break;
        } catch {
          // try next fallback
        }
      }

      if (data?.success) {
        setMenuItems(data.data?.items || []);
      } else {
        setMenuItems([]);
        toast.error("Could not load the vendor menu");
      }
    } catch (error) {
      console.error("Failed to load vendor menu", error);
      setMenuItems([]);
      toast.error("Could not load the vendor menu");
    } finally {
      setIsMenuLoading(false);
    }
  };

  // Dynamic calculations based on state
  const totalVendors = vendorList.length;
  const activeVendors = vendorList.filter(v => v.status === "approved").length;
  
  const totalRevenue = (() => {
    const sum = vendorList.reduce((acc, v) => {
      let rev = v.revenue.replace(/[^\d.kK]/g, ""); // keep digits, dot, and k
      let multiplier = 1;
      if (rev.toLowerCase().endsWith("k")) {
        multiplier = 1000;
        rev = rev.slice(0, -1);
      } else if (rev.toLowerCase().endsWith("m")) {
        multiplier = 1000000;
        rev = rev.slice(0, -1);
      }
      const num = parseFloat(rev) || 0;
      return acc + (num * multiplier);
    }, 0);
    
    if (sum >= 1000000) {
      return "₦" + (sum / 1000000).toFixed(1) + "M";
    } else if (sum >= 1000) {
      return "₦" + (sum / 1000).toFixed(0) + "k";
    }
    return "₦" + sum.toLocaleString();
  })();

  const averageRating = (() => {
    if (vendorList.length === 0) return "0.0";
    const sum = vendorList.reduce((acc, v) => acc + v.rating, 0);
    return (sum / vendorList.length).toFixed(1);
  })();

  const filteredVendors = vendorList.filter((v) => {
    const activeSearch = (globalSearchQuery || searchQuery).trim().toLowerCase();
    const matchesSearch =
      !activeSearch ||
      v.name.toLowerCase().includes(activeSearch) ||
      v.category.toLowerCase().includes(activeSearch) ||
      v.id.toLowerCase().includes(activeSearch);
    
    const matchesTab =
      activeTab === "All" ||
      v.status.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  const handleExport = () => {
    const exportData = filteredVendors.map(v => ({
      "Vendor ID": v.id,
      "Name": v.name,
      "Category": v.category,
      "Status": v.status,
      "Total Orders": v.orders,
      "Revenue": v.revenue,
      "Rating": v.rating,
    }));
    exportToCSV(exportData, "denish-vendors.csv");
  };

  return (
    <>
      <div className="px-[clamp(1rem,3vw,2rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
        <div className="w-full pb-8 flex flex-col gap-4 sm:gap-6 px-3 sm:px-6">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-[22px] sm:text-[28px] font-bold text-[#191C1C] leading-tight break-words">
              Vendor Management
            </h1>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[#EAEAEA] rounded-[8px] text-[14px] sm:text-[16px] font-medium text-[#212121] hover:bg-gray-50 transition-all cursor-pointer self-stretch sm:self-auto"
            >
              <Download className="w-4 h-4 text-[#212121]" />
              Export
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Total Vendors
              </p>
              <h3 className="text-[32px] font-semibold text-[#F15C11]">{totalVendors}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Active
              </p>
              <h3 className="text-[32px] font-semibold text-[#29A378]">{activeVendors}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Total Revenue
              </p>
              <h3 className="text-[32px] font-semibold text-[#FE7200]">
                {totalRevenue}
              </h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Average Rating
              </p>
              <h3 className="text-[32px] font-semibold text-[#F9A825]">{averageRating}</h3>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 py-2 w-full">
            <div className="flex items-center gap-[12px] w-full md:w-auto md:min-w-[300px] h-[40px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-white shrink-0">
              <Search className="w-[16px] h-[16px] text-[#747475] shrink-0" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0">
              {["All", "Approved", "Pending", "Suspended"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-[8px] text-[16px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#FE7200] text-white"
                      : "bg-white text-[#212121] border border-[#EAEAEA] hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[16px] md:gap-[24px]">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-[12px] border border-[#EAEAEA] overflow-hidden flex flex-col hover:shadow-md transition-all"
              >
                {/* Vendor Image */}
                <div className="w-full h-[160px] overflow-hidden bg-[#F8FAF9]">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    width={400}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card Body */}
                <div className="flex flex-col gap-[clamp(12px,2vw,24px)] p-[clamp(12px,2vw,20px)] pb-[clamp(10px,1.5vw,15px)] flex-1">
                  {/* Name, Category, Status */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-[clamp(14px,2vw,20px)] font-semibold text-[#212121] leading-tight truncate">
                        {vendor.name}
                      </p>
                      <p className="text-[clamp(10px,1.5vw,12px)] font-medium text-[#848484] mt-[2px] truncate">
                        {vendor.category}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 h-[clamp(20px,2vw,23px)] rounded-full text-[clamp(9px,1.2vw,12px)] font-medium capitalize ${
                        statusStyles[vendor.status]
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </div>

                  {/* Stats Row — 3 individual boxes */}
                  <div className="flex items-center gap-[clamp(4px,1vw,12px)]">
                    <div className="flex-1 flex flex-col items-center py-[clamp(4px,1vw,8px)] bg-[#F8F8F8] rounded-[8px]">
                      <p className="text-[clamp(9px,1.2vw,11px)] font-medium text-[#848484]">
                        Orders
                      </p>
                      <p className="text-[clamp(14px,2vw,20px)] font-semibold text-[#212121]">
                        {vendor.orders}
                      </p>
                    </div>
                    <div className="flex-1 flex flex-col items-center py-[clamp(4px,1vw,8px)] bg-[#F8F8F8] rounded-[8px]">
                      <p className="text-[clamp(9px,1.2vw,11px)] font-medium text-[#848484]">
                        Revenue
                      </p>
                      <p className="text-[clamp(14px,2vw,20px)] font-semibold text-[#212121]">
                        {vendor.revenue}
                      </p>
                    </div>
                    <div className="flex-1 flex flex-col items-center py-[clamp(4px,1vw,8px)] bg-[#F8F8F8] rounded-[8px]">
                      <p className="text-[clamp(9px,1.2vw,11px)] font-medium text-[#848484]">
                        Rating
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-[clamp(10px,1.5vw,14px)] h-[clamp(10px,1.5vw,14px)] fill-[#F9A825] text-[#F9A825]" />
                        <p className="text-[clamp(14px,2vw,20px)] font-semibold text-[#212121]">
                          {vendor.rating}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-[clamp(6px,1vw,12px)] mt-auto">
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="flex-1 flex items-center justify-center gap-[4px] h-[clamp(32px,3vw,42px)] border border-[#EAEAEA] rounded-[8px] text-[clamp(11px,1.5vw,14px)] font-medium text-[#212121] bg-[#F8F8F8] hover:bg-[#F0F0F0] transition-all cursor-pointer"
                    >
                      <Eye className="w-[clamp(12px,1.5vw,16px)] h-[clamp(12px,1.5vw,16px)] text-[#747475]" />
                      View
                    </button>
                    <button
                      onClick={() => toggleVendorStatus(vendor.id, vendor.status)}
                      className={`flex-1 max-w-[92px] px-1 md:px-0 flex items-center justify-center h-[clamp(32px,3vw,42px)] border rounded-[8px] text-[clamp(10px,1.5vw,14px)] font-semibold transition-all bg-[#F8F8F8] cursor-pointer ${
                        vendor.status.toLowerCase() === "pending"
                          ? "border-[#FE7200] text-[#FE7200] hover:bg-[#FFF4E4]"
                          : vendor.status.toLowerCase() === "suspended"
                            ? "border-[#29A378] text-[#29A378] hover:bg-[#F0FBF4]"
                            : "border-[#E14343] text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <span className="truncate text-[12px]">
                        {vendor.status.toLowerCase() === "pending"
                          ? "Approve"
                          : vendor.status.toLowerCase() === "suspended"
                            ? "Unsuspend"
                            : "Suspend"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Details Modal */}
      <VendorDetailsModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onSuspend={() => selectedVendor && toggleVendorStatus(selectedVendor.id, selectedVendor.status)}
        onViewMenu={() => selectedVendor && handleViewMenu(selectedVendor)}
      />

      {menuVendor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[560px] rounded-[20px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[22px] font-semibold text-[#191C1C]">{menuVendor.name} Menu</h3>
                <p className="text-[13px] text-[#747475]">Live menu items from the vendor account</p>
              </div>
              <button
                onClick={() => {
                  setMenuVendor(null);
                  setMenuItems([]);
                }}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-[#747475]" />
              </button>
            </div>

            {isMenuLoading ? (
              <div className="rounded-[12px] border border-[#EAEAEA] bg-[#FAFAFA] p-4 text-[14px] text-[#747475]">
                Loading menu items...
              </div>
            ) : menuItems.length === 0 ? (
              <div className="rounded-[12px] border border-[#EAEAEA] bg-[#FAFAFA] p-4 text-[14px] text-[#747475]">
                No menu items were found for this vendor.
              </div>
            ) : (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {menuItems.map((item) => (
                  <div key={item._id || item.id} className="flex items-start justify-between rounded-[12px] border border-[#EAEAEA] bg-[#F8F8F8] p-3">
                    <div>
                      <p className="text-[15px] font-semibold text-[#212121]">{item.name}</p>
                      <p className="text-[13px] text-[#747475]">{item.category || "General"}</p>
                      <p className="mt-1 text-[13px] text-[#747475]">{item.description || "No description provided"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-semibold text-[#212121]">₦{Number(item.price || 0).toLocaleString()}</p>
                      <p className={`text-[12px] ${item.available ? "text-[#29A378]" : "text-[#E14343]"}`}>
                        {item.available ? "Available" : "Unavailable"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 bg-white w-[320px] h-[64px] rounded-[8px] px-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#EAEAEA]">
            <div className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0 ${toastMessage === "Vendor Suspended" ? "bg-[#FF2F00]/10" : "bg-[#29A378]/10"}`}>
              <Check className={`w-[16px] h-[16px] ${toastMessage === "Vendor Suspended" ? "text-[#FF2F00]" : "text-[#29A378]"}`} />
            </div>
            <p className="flex-1 text-[14px] text-[#6B7280] font-normal">
              {toastMessage}
            </p>
            <button
              onClick={() => setShowToast(false)}
              className="w-[20px] h-[20px] flex items-center justify-center hover:bg-gray-100 rounded-full shrink-0 cursor-pointer"
            >
              <X className="w-[14px] h-[14px] text-[#D1D5DB]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
