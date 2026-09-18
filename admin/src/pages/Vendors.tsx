

import { Search, Star, Eye, Check, X, Download, Trash2, LayoutGrid, List, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VendorDetailsModal } from "@/components/admin/VendorDetailsModal";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { exportToCSV } from "@/lib/exportUtils";

import { useAdminStore, type Vendor } from "@/lib/store";

const statusStyles: Record<string, string> = {
  approved: "text-[#3DD26A] bg-[#F0FBF4] border border-[#3DD26A]/20",
  suspended: "text-red-500 bg-red-50 border border-red-200",
  pending: "text-[#F9811F] bg-[#FFF4E4] border border-[#F9811F]/20",
};

export default function VendorsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const vendorList = useAdminStore((state) => state.vendors);
  const fetchVendors = useAdminStore((state) => state.fetchVendors);
  const updateVendorStatusOnServer = useAdminStore((state) => state.updateVendorStatusOnServer);
  const approveVendorOnServer = useAdminStore((state) => state.approveVendorOnServer);
  const deleteVendorOnServer = useAdminStore((state) => state.deleteVendorOnServer);
  const globalSearchQuery = useAdminStore((state) => state.globalSearchQuery);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [menuVendor, setMenuVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchVendors();
    setIsRefreshing(false);
    toast.success("Vendors list updated");
  };

  const handleApproveVendor = async (vendorId: string) => {
    const success = await approveVendorOnServer(vendorId);
    if (success) {
      toast.success("Vendor verified & approved successfully");
      if (selectedVendor && selectedVendor.id === vendorId) {
        setSelectedVendor({ ...selectedVendor, status: "approved", isVerified: true });
      }
      await fetchVendors();
    } else {
      toast.error("Failed to verify vendor");
    }
  };

  const handleConfirmDeleteVendor = async () => {
    if (!vendorToDelete) return;
    const v = vendorToDelete;
    setVendorToDelete(null);
    if (selectedVendor?.id === v.id) {
      setSelectedVendor(null);
    }
    const success = await deleteVendorOnServer(v.id);
    if (success) {
      toast.success(`${v.name} deleted successfully`);
    } else {
      toast.error("Failed to delete vendor");
    }
  };

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
    setToastMessage(newStatus === "suspended" ? "Vendor Suspended" : "Vendor Verified & Approved");
    setSelectedVendor(null);
    setShowToast(true);
    await fetchVendors();
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
  const activeVendors = vendorList.filter(v => (v.status || "").toLowerCase() === "approved").length;
  const pendingVendors = vendorList.filter(v => (v.status || "").toLowerCase() === "pending").length;
  
  const totalRevenue = (() => {
    const sum = vendorList.reduce((acc, v) => {
      let rev = (v.revenue || "").replace(/[^\d.kK]/g, ""); // keep digits, dot, and k
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

  const filteredVendors = vendorList.filter((v) => {
    const activeSearch = (globalSearchQuery || searchQuery).trim().toLowerCase();
    const name = (v.name || "").toLowerCase();
    const category = (v.category || "").toLowerCase();
    const id = (v.id || "").toLowerCase();
    const email = (v.email || "").toLowerCase();
    const phone = (v.phone || "").toLowerCase();
    const address = (v.address || "").toLowerCase();

    const matchesSearch =
      !activeSearch ||
      name.includes(activeSearch) ||
      category.includes(activeSearch) ||
      id.includes(activeSearch) ||
      email.includes(activeSearch) ||
      phone.includes(activeSearch) ||
      address.includes(activeSearch);
    
    const vStatus = (v.status || "pending").toLowerCase();
    const matchesTab =
      activeTab === "All" ||
      vStatus === activeTab.toLowerCase();
    
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
      "Phone": v.phone || "",
      "Email": v.email || "",
      "Address": v.address || "",
    }));
    exportToCSV(exportData, "denish-vendors.csv");
  };

  return (
    <>
      <div className="px-[clamp(1rem,3vw,2rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
        <div className="w-full pb-8 flex flex-col gap-4 sm:gap-6 px-3 sm:px-6">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] sm:text-[28px] font-bold text-[#191C1C] leading-tight break-words">
                Vendor Management
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-[#747475] rounded-full">
                {totalVendors} Total
              </span>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-[14px] sm:text-[15px] font-medium text-[#212121] hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                title="Refresh Vendors"
              >
                <RefreshCw className={`w-4 h-4 text-[#747475] ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-[#EAEAEA] rounded-[8px] text-[14px] sm:text-[16px] font-medium text-[#212121] hover:bg-gray-50 transition-all cursor-pointer self-stretch sm:self-auto"
              >
                <Download className="w-4 h-4 text-[#212121]" />
                Export
              </button>
            </div>
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
                Active / Verified
              </p>
              <h3 className="text-[32px] font-semibold text-[#29A378]">{activeVendors}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Pending Verification
              </p>
              <h3 className="text-[32px] font-semibold text-[#FE7200]">{pendingVendors}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Total Revenue
              </p>
              <h3 className="text-[32px] font-semibold text-[#212121]">{totalRevenue}</h3>
            </div>
          </div>

          {/* Filters, Search & View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-[12px] w-full sm:w-auto sm:min-w-[280px] md:min-w-[320px] h-[40px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-white shrink-0">
                <Search className="w-[16px] h-[16px] text-[#747475] shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, category, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-2 sm:pb-0">
                {["All", "Approved", "Pending", "Suspended"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-[8px] text-[15px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? "bg-[#FE7200] text-white shadow-sm"
                        : "bg-white text-[#212121] border border-[#EAEAEA] hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-[8px] border border-[#EAEAEA] self-start sm:self-auto shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#FE7200] shadow-sm font-semibold"
                    : "text-[#747475] hover:text-[#212121]"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#FE7200] shadow-sm font-semibold"
                    : "text-[#747475] hover:text-[#212121]"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Vendors Display */}
          {filteredVendors.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-[#EAEAEA] p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#FE7200]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#191C1C]">No vendors found</h3>
              <p className="text-[14px] text-[#747475] max-w-[400px]">
                {searchQuery ? `No vendors match "${searchQuery}". Try another search term.` : "There are no vendors in this category."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Vendor Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[24px]">
              {filteredVendors.map((vendor) => {
                const s = (vendor.status || "pending").toLowerCase();
                const isPending = s === "pending";
                return (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-[12px] border border-[#EAEAEA] overflow-hidden flex flex-col hover:shadow-md transition-all"
                  >
                    {/* Vendor Image */}
                    <div className="w-full h-[160px] overflow-hidden bg-[#F8FAF9] relative">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        width={400}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize shadow-sm ${
                          statusStyles[s] || statusStyles.pending
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-col gap-[clamp(12px,2vw,20px)] p-[clamp(12px,2vw,20px)] pb-[clamp(10px,1.5vw,15px)] flex-1">
                      {/* Name, Category */}
                      <div className="min-w-0">
                        <p className="text-[18px] font-semibold text-[#212121] leading-tight truncate">
                          {vendor.name}
                        </p>
                        <p className="text-[12px] font-medium text-[#848484] mt-[2px] truncate">
                          {vendor.category} • {vendor.address || "N/A"}
                        </p>
                      </div>

                      {/* Stats Row — 3 individual boxes */}
                      <div className="flex items-center gap-[clamp(4px,1vw,12px)]">
                        <div className="flex-1 flex flex-col items-center py-[clamp(4px,1vw,8px)] bg-[#F8F8F8] rounded-[8px]">
                          <p className="text-[11px] font-medium text-[#848484]">
                            Orders
                          </p>
                          <p className="text-[16px] font-semibold text-[#212121]">
                            {vendor.orders}
                          </p>
                        </div>
                        <div className="flex-1 flex flex-col items-center py-[clamp(4px,1vw,8px)] bg-[#F8F8F8] rounded-[8px]">
                          <p className="text-[11px] font-medium text-[#848484]">
                            Revenue
                          </p>
                          <p className="text-[16px] font-semibold text-[#212121]">
                            {vendor.revenue}
                          </p>
                        </div>
                        <div className="flex-1 flex flex-col items-center py-[clamp(4px,1vw,8px)] bg-[#F8F8F8] rounded-[8px]">
                          <p className="text-[11px] font-medium text-[#848484]">
                            Rating
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="w-[12px] h-[12px] fill-[#F9A825] text-[#F9A825]" />
                            <p className="text-[16px] font-semibold text-[#212121]">
                              {vendor.rating}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-[6px] mt-auto pt-1">
                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="flex-1 flex items-center justify-center gap-[4px] h-[36px] border border-[#EAEAEA] rounded-[8px] text-[12px] font-medium text-[#212121] bg-[#F8F8F8] hover:bg-[#F0F0F0] transition-all cursor-pointer"
                        >
                          <Eye className="w-[14px] h-[14px] text-[#747475]" />
                          View
                        </button>
                        {isPending ? (
                          <button
                            onClick={() => handleApproveVendor(vendor.id)}
                            className="flex-[1.2] flex items-center justify-center gap-[4px] h-[36px] bg-[#29A378] text-white hover:bg-[#207951] rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer shadow-sm"
                            title="Verify Vendor"
                          >
                            <Check className="w-[14px] h-[14px]" />
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleVendorStatus(vendor.id, vendor.status)}
                            className={`flex-1 flex items-center justify-center h-[36px] border rounded-[8px] text-[11px] font-semibold transition-all bg-[#F8F8F8] cursor-pointer ${
                              s === "suspended"
                                ? "border-[#29A378] text-[#29A378] hover:bg-[#F0FBF4]"
                                : "border-[#E14343] text-red-500 hover:bg-red-50"
                            }`}
                          >
                            <span className="truncate">
                              {s === "suspended" ? "Unsuspend" : "Suspend"}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => setVendorToDelete(vendor)}
                          className="w-[36px] h-[36px] flex items-center justify-center border border-[#EAEAEA] rounded-[8px] text-[#E14343] hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shrink-0"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-[14px] h-[14px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Vendor List Table View */
            <div className="bg-white rounded-[12px] border border-[#EAEAEA] overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-[#F7F6F4]">
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475]">Vendor</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475]">Category</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475]">Contact</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475]">Orders</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475]">Revenue</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475]">Rating</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475]">Status</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#747475] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.map((vendor) => {
                      const s = (vendor.status || "pending").toLowerCase();
                      const isPending = s === "pending";
                      return (
                        <tr
                          key={vendor.id}
                          className="border-b border-[#EAEAEA] last:border-0 hover:bg-[#F7F6F4] transition-all cursor-pointer"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={vendor.image}
                                alt={vendor.name}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-[15px] font-semibold text-[#212121] leading-tight truncate">
                                  {vendor.name}
                                </p>
                                <p className="text-[12px] text-[#848484] truncate mt-0.5 max-w-[200px]">
                                  {vendor.address || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#212121]">
                            {vendor.category}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#747475]">
                            <div>{vendor.phone || "No phone"}</div>
                            <div className="text-[12px] text-[#999] truncate max-w-[160px]">{vendor.email || ""}</div>
                          </td>
                          <td className="px-4 py-3 text-[14px] font-medium text-[#29A378]">
                            {vendor.orders}
                          </td>
                          <td className="px-4 py-3 text-[14px] font-semibold text-[#212121]">
                            {vendor.revenue}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-[#F9A825] text-[#F9A825]" />
                              <span className="text-[14px] text-[#212121] font-medium">{vendor.rating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[12px] font-medium capitalize ${
                              statusStyles[s] || statusStyles.pending
                            }`}>
                              {vendor.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {isPending && (
                                <button
                                  onClick={() => handleApproveVendor(vendor.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#29A378] text-white rounded-[6px] hover:bg-[#207951] transition-all text-[12px] font-semibold cursor-pointer shadow-sm"
                                  title="Verify & Approve Vendor"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedVendor(vendor)}
                                className="flex items-center gap-1 px-2.5 py-1.5 border border-[#EAEAEA] rounded-[6px] hover:bg-[#F8FAF9] text-[13px] font-medium text-[#212121] transition-all cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#747475]" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => toggleVendorStatus(vendor.id, vendor.status)}
                                className={`px-2 py-1.5 border rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer ${
                                  s === "suspended"
                                    ? "border-[#29A378] text-[#29A378] hover:bg-[#F0FBF4]"
                                    : "border-[#E14343] text-red-500 hover:bg-red-50"
                                }`}
                                title={s === "suspended" ? "Unsuspend Vendor" : "Suspend Vendor"}
                              >
                                {s === "suspended" ? "Unsuspend" : "Suspend"}
                              </button>
                              <button
                                onClick={() => setVendorToDelete(vendor)}
                                className="p-1.5 border border-[#EAEAEA] rounded-[6px] text-[#E14343] hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                                title="Delete Vendor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Details Modal */}
      <VendorDetailsModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onSuspend={() => selectedVendor && toggleVendorStatus(selectedVendor.id, selectedVendor.status)}
        onApprove={() => selectedVendor && handleApproveVendor(selectedVendor.id)}
        onDelete={() => selectedVendor && setVendorToDelete(selectedVendor)}
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

      {/* Delete Vendor Confirmation Modal */}
      {vendorToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-[400px] w-full p-6 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[56px] h-[56px] bg-[#FEF2F2] rounded-full flex items-center justify-center text-[#EF4343]">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-[#191C1C] mb-2">Delete Vendor?</h3>
                <p className="text-[14px] text-[#747475] leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[#191C1C]">{vendorToDelete.name}</strong>? This action cannot be undone and will delete the vendor profile and all related menu items.
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setVendorToDelete(null)}
                  className="flex-1 h-[46px] border border-[#EAEAEA] rounded-[10px] text-[14px] font-bold text-[#747475] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteVendor}
                  className="flex-1 h-[46px] bg-[#EF4343] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#D32F2F] transition-all cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
