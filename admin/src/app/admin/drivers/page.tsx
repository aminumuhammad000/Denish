"use client";

import { Search, Star, Eye, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { DriverDetailsModal } from "@/components/admin/DriverDetailsModal";

import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { exportToCSV } from "@/lib/exportUtils";

import { useAdminStore, Driver } from "@/lib/store";

const statusStyles = {
  Online: "text-[#29A378] bg-[#E9F5EF]",
  Delivering: "text-[#F9A825] bg-[#FFF8E5]",
  Offline: "text-[#848484] bg-[#F5F5F5]",
};

export default function DriversPage() {
  const [isMounted, setIsMounted] = useState(false);
  const driversList = useAdminStore((state) => state.drivers);
  const updateDriverStatusOnServer = useAdminStore((state) => state.updateDriverStatusOnServer);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  // Dynamic calculations based on state
  const totalDrivers = driversList.length;
  const onlineCount = driversList.filter(d => d.status === "Online" && !d.isSuspended).length;
  const deliveringCount = driversList.filter(d => d.status === "Delivering" && !d.isSuspended).length;
  const offlineCount = driversList.filter(d => d.status === "Offline" || d.isSuspended).length;

  const filteredDrivers = driversList.filter((driver) => {
    const matchesSearch = driver.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      driver.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "All" || driver.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleUpdateDriver = async (updatedDriver: Driver) => {
    await updateDriverStatusOnServer(updatedDriver.id, updatedDriver.status);
    setSelectedDriver(updatedDriver);
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
        <div className="w-full max-w-[988px] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-[28px] font-bold text-[#191C1C]">
              Driver Management
            </h1>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-[#EAEAEA] rounded-[8px] text-[16px] font-medium text-[#212121] hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#212121]" />
              Export
            </button>
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
                Online
              </p>
              <h3 className="text-[32px] font-semibold text-[#29A378]">{onlineCount}</h3>
            </div>
            <div className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm">
              <p className="text-[#848484] text-[12px] font-medium mb-1">
                Delivering
              </p>
              <h3 className="text-[32px] font-semibold text-[#0A85FF]">{deliveringCount}</h3>
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
              {["All", "Online", "Delivering", "Offline"].map((tab) => (
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
                            className={`inline-flex items-center justify-center w-[92px] h-[32px] rounded-full text-[14px] font-medium ${
                              driver.isSuspended ? statusStyles["Offline"] : statusStyles[driver.status]
                            }`}
                          >
                            {driver.isSuspended ? "Offline" : driver.status}
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
                          {driver.earnings}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDriver(driver);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 border border-[#EAEAEA] rounded-[6px] hover:bg-[#F8FAF9] transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-[#747475]" />
                            <span className="text-[14px] font-medium text-[#212121]">
                              View
                            </span>
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
        />
      )}
    </>
  );
}
