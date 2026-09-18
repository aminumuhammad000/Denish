

import { Search, Star, Eye, Download, Check, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DriverDetailsModal } from "@/components/admin/DriverDetailsModal";

import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { exportToCSV } from "@/lib/exportUtils";

import { useAdminStore, type Driver } from "@/lib/store";

const statusStyles: Record<string, string> = {
  Online: "text-[#29A378] bg-[#E9F5EF]",
  Active: "text-[#29A378] bg-[#E9F5EF]",
  Delivering: "text-[#F9A825] bg-[#FFF8E5]",
  Offline: "text-[#848484] bg-[#F5F5F5]",
  Pending: "text-[#FE7200] bg-[#FFF4E4]",
  Suspended: "text-[#E14343] bg-[#FDECEC]",
};

export default function DriversPage() {
  const [isMounted, setIsMounted] = useState(false);
  const driversList = useAdminStore((state) => state.drivers);
  const fetchDrivers = useAdminStore((state) => state.fetchDrivers);
  const updateDriverStatusOnServer = useAdminStore((state) => state.updateDriverStatusOnServer);
  const approveDriverOnServer = useAdminStore((state) => state.approveDriverOnServer);
  const deleteDriverOnServer = useAdminStore((state) => state.deleteDriverOnServer);
  const globalSearchQuery = useAdminStore((state) => state.globalSearchQuery);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  useEffect(() => {
    fetchDrivers();
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDrivers]);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDrivers();
    setIsRefreshing(false);
    toast.success("Drivers list updated");
  };

  // Dynamic calculations based on state
  const totalDrivers = driversList.length;
  const pendingCount = driversList.filter(d => (d.status || "").toLowerCase() === "pending").length;
  const onlineCount = driversList.filter(d => ((d.status || "").toLowerCase() === "online" || (d.status || "").toLowerCase() === "active") && !d.isSuspended).length;
  const offlineCount = driversList.filter(d => (d.status || "").toLowerCase() === "offline" || d.isSuspended).length;

  const filteredDrivers = driversList.filter((driver) => {
    const activeSearch = (globalSearchQuery || searchQuery).trim().toLowerCase();
    const name = (driver.name || "").toLowerCase();
    const location = (driver.location || "").toLowerCase();
    const phone = (driver.phone || "").toLowerCase();
    const vehicle = (driver.vehicle || "").toLowerCase();
    const email = (driver.email || "").toLowerCase();

    const matchesSearch =
      !activeSearch ||
      name.includes(activeSearch) ||
      location.includes(activeSearch) ||
      phone.includes(activeSearch) ||
      vehicle.includes(activeSearch) ||
      email.includes(activeSearch);
    
    let matchesTab = true;
    const s = (driver.status || "").toLowerCase();
    if (activeTab === "Pending") {
      matchesTab = s === "pending";
    } else if (activeTab === "Online") {
      matchesTab = (s === "online" || s === "active") && !driver.isSuspended;
    } else if (activeTab === "Delivering") {
      matchesTab = s === "delivering" && !driver.isSuspended;
    } else if (activeTab === "Offline") {
      matchesTab = s === "offline" || !!driver.isSuspended;
    }

    return matchesSearch && matchesTab;
  });

  const handleApproveDriver = async (driver: Driver) => {
    const success = await approveDriverOnServer(driver.id);
    if (success) {
      toast.success(`${driver.name} verified & approved successfully`);
      if (selectedDriver && selectedDriver.id === driver.id) {
        setSelectedDriver({ ...selectedDriver, status: "Active", isSuspended: false, isVerified: true });
      }
      await fetchDrivers();
    } else {
      toast.error("Failed to verify driver");
    }
  };

  const handleConfirmDeleteDriver = async () => {
    if (!driverToDelete) return;
    const d = driverToDelete;
    setDriverToDelete(null);
    if (selectedDriver?.id === d.id) {
      setSelectedDriver(null);
    }
    const success = await deleteDriverOnServer(d.id);
    if (success) {
      toast.success(`${d.name} deleted successfully`);
    } else {
      toast.error("Failed to delete driver");
    }
  };

  const handleUpdateDriver = async (updatedDriver: Driver) => {
    await updateDriverStatusOnServer(updatedDriver.id, updatedDriver.status, {
      isWarned: updatedDriver.isWarned,
      isSuspended: updatedDriver.isSuspended,
    });
    setSelectedDriver(updatedDriver);
    await fetchDrivers();
  };


  const handleExport = () => {
    const exportData = filteredDrivers.map(d => ({
      "Driver ID": d.id,
      "Name": d.name,
      "Location": d.location,
      "Phone": d.phone,
      "Vehicle": d.vehicle,
      "Total Deliveries": d.deliveries,
      "Rating": d.rating,
      "Completion Rate": d.completion,
      "Status": d.status,
      "Warnings Active": d.isWarned ? "Yes" : "No",
      "Suspended": d.isSuspended ? "Yes" : "No",
      "Earnings": d.earnings,
    }));
    exportToCSV(exportData, "denish-drivers.csv");
  };

  return (
    <>
      <div className="px-[clamp(0px,calc((1024px-100vw)*100),1rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
        <div className="w-full pb-8 flex flex-col gap-4 sm:gap-6 px-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] sm:text-[28px] font-bold text-[#191C1C] leading-tight break-words">
                Driver Management
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-[#747475] rounded-full">
                {totalDrivers} Total
              </span>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-[14px] sm:text-[15px] font-medium text-[#212121] hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                title="Refresh Drivers"
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
                Total Drivers
              </p>
              <h3 className="text-[32px] font-semibold text-[#F15C11]">{totalDrivers}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Pending Approval
              </p>
              <h3 className="text-[32px] font-semibold text-[#FE7200]">{pendingCount}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Online / Active
              </p>
              <h3 className="text-[32px] font-semibold text-[#29A378]">{onlineCount}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Offline / Suspended
              </p>
              <h3 className="text-[32px] font-semibold text-[#212121]">{offlineCount}</h3>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 py-2 w-full">
            <div className="flex items-center gap-[12px] w-full md:w-[571px] shrink-0 h-[40px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-white">
              <Search className="w-[16px] h-[16px] text-[#747475]" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0">
              {["All", "Pending", "Online", "Delivering", "Offline"].map((tab) => (
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

          {/* Drivers Table */}
          <div className="bg-white overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F7F6F4]">
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Driver
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Phone
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Vehicle
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Deliveries
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Rating
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Completion
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Status
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Earnings
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className="border-b border-[#EAEAEA] last:border-0 hover:bg-[#F7F6F4] transition-all cursor-pointer"
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex flex-col">
                          <span className="text-[16px] text-[#212121] font-semibold">
                            {driver.name}
                          </span>
                          <span className="text-[12px] font-medium text-[#848484]">
                            {driver.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] text-[#212121]">
                          {driver.phone}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] text-[#212121]">
                          {driver.vehicle}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] font-medium text-[#29A378]">
                          {driver.deliveries}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex items-center gap-1">
                          <Star className="w-[14px] h-[14px] fill-[#F9A825] text-[#F9A825]" />
                          <span className="text-[16px] text-[#212121]">
                            {driver.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] text-[#212121]">
                          {driver.completion}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center px-3 h-[30px] rounded-full text-[13px] font-medium ${
                              driver.isSuspended ? statusStyles["Suspended"] : (statusStyles[driver.status] || statusStyles["Offline"])
                            }`}
                          >
                            {driver.isSuspended ? "Suspended" : driver.status}
                          </span>
                          {driver.isSuspended && (
                            <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-[#E14343] rounded-[4px]">
                              Suspended
                            </span>
                          )}
                          {driver.isWarned && (
                            <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-[#F9A825] rounded-[4px]">
                              Warned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] text-[#212121]">
                          {(() => {
                            const e = driver.earnings as any;
                            if (e == null) return "₦0";
                            if (typeof e === "string" && !e.includes("[object")) return e;
                            if (typeof e === "number") return "₦" + e.toLocaleString();
                            if (typeof e === "object") {
                              const val = e.$numberDecimal ?? e.totalEarned ?? e.availableBalance ?? 0;
                              return "₦" + (parseFloat(val) || 0).toLocaleString();
                            }
                            return "₦0";
                          })()}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex items-center justify-center gap-1.5">
                          {driver.status === "Pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveDriver(driver);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#29A378] text-white rounded-[6px] hover:bg-[#207951] transition-all text-[12px] font-semibold cursor-pointer shadow-sm"
                              title="Approve Driver"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDriver(driver);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#EAEAEA] rounded-[6px] hover:bg-[#F8FAF9] transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-[#747475]" />
                            <span className="text-[14px] font-medium text-[#212121]">
                              View
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDriverToDelete(driver);
                            }}
                            className="p-1.5 border border-[#EAEAEA] rounded-[6px] text-[#E14343] hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                            title="Delete Driver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onUpdateDriver={handleUpdateDriver}
          onApprove={handleApproveDriver}
          onDelete={(d) => setDriverToDelete(d)}
        />
      )}

      {/* Delete Driver Confirmation Modal */}
      {driverToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-[400px] w-full p-6 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[56px] h-[56px] bg-[#FEF2F2] rounded-full flex items-center justify-center text-[#EF4343]">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-[#191C1C] mb-2">Delete Driver?</h3>
                <p className="text-[14px] text-[#747475] leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[#191C1C]">{driverToDelete.name}</strong>? This action cannot be undone and will remove the driver profile and delivery records.
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDriverToDelete(null)}
                  className="flex-1 h-[46px] border border-[#EAEAEA] rounded-[10px] text-[14px] font-bold text-[#747475] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteDriver}
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
