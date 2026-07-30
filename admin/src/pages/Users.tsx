

import { Search, Star, Eye, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { exportToCSV } from "@/lib/exportUtils";

import { useAdminStore, type User } from "@/lib/store";

const roleStyles = {
  Customer: "text-[#F97015] bg-[#FFF1E7]",
  Vendor: "text-[#29A378] bg-[#E9F5EF]",
  Driver: "text-[#0A85FF] bg-[#EBF5FF]",
};

const statusStyles = {
  Active: "text-[#29A378] bg-[#E9F5EF]",
  Suspended: "text-[#E14343] bg-[#FDECEC]",
};

export default function UserManagementPage() {
  const [isMounted, setIsMounted] = useState(false);
  const baseUsers = useAdminStore((state) => state.users);
  const globalSearchQuery = useAdminStore((state) => state.globalSearchQuery);
  const vendors = useAdminStore((state) => state.vendors);
  const drivers = useAdminStore((state) => state.drivers);

  const usersList: User[] = [
    ...baseUsers.map((u) => ({ ...u, role: "Customer" as const })),
    ...vendors.map((v) => ({
      id: v.id,
      name: v.name,
      email: "Vendor Account",
      phone: "N/A",
      role: "Vendor" as const,
      status: (v.status === "suspended" ? "Suspended" : "Active") as "Active" | "Suspended",
      orders: v.orders,
      spentEarned: v.revenue,
      rating: v.rating,
      complaints: 0,
      lastActive: "Today",
    })),
    ...drivers.map((d) => ({
      id: d.id,
      name: d.name,
      email: "Driver Account",
      phone: d.phone,
      role: "Driver" as const,
      status: d.isSuspended ? "Suspended" : "Active" as "Active" | "Suspended",
      orders: d.deliveries,
      spentEarned: d.earnings,
      rating: d.rating,
      complaints: 0,
      lastActive: "Today",
    })),
  ];
  const updateUserStatusOnServer = useAdminStore((state) => state.updateUserStatusOnServer);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
  const totalUsers = usersList.length;
  const customerCount = usersList.filter(u => u.role === "Customer").length;
  const vendorCount = usersList.filter(u => u.role === "Vendor").length;
  const driverCount = usersList.filter(u => u.role === "Driver").length;
  const suspendedCount = usersList.filter(u => u.status === "Suspended").length;

  const filteredUsers = usersList.filter((user) => {
    const activeSearch = (globalSearchQuery || searchQuery).trim().toLowerCase();
    const matchesSearch =
      !activeSearch ||
      user.name.toLowerCase().includes(activeSearch) ||
      user.email.toLowerCase().includes(activeSearch) ||
      user.phone.toLowerCase().includes(activeSearch) ||
      user.role.toLowerCase().includes(activeSearch);

    if (activeFilter === "All" || activeFilter === "All Status")
      return matchesSearch;

    const isRoleFilter = ["Customer", "Vendor", "Driver"].includes(
      activeFilter,
    );
    const isStatusFilter = ["Active", "Suspended"].includes(activeFilter);

    if (isRoleFilter) return matchesSearch && user.role === activeFilter;
    if (isStatusFilter) return matchesSearch && user.status === activeFilter;

    return matchesSearch;
  });

  const handleUpdateUser = async (updatedUser: User) => {
    await updateUserStatusOnServer(updatedUser.id, updatedUser.status, {
      isWarned: updatedUser.isWarned,
    });
    setSelectedUser(updatedUser);
  };

  const handleExport = () => {
    const exportData = filteredUsers.map((user) => ({
      "User ID": user.id,
      "Name": user.name,
      "Email": user.email,
      "Phone": user.phone,
      "Role": user.role,
      "Status": user.status,
      "Orders": user.orders,
      "Spent/Earned": user.spentEarned,
      "Rating": user.rating,
      "Complaints": user.complaints,
      "Last Active": user.lastActive,
    }));
    exportToCSV(exportData, "denish-users.csv");
  };

  return (
    <>
      <div className="px-[clamp(0px,calc((1024px-100vw)*100),1rem)] py-[clamp(1rem,3vw,2rem)] flex flex-col items-center">
        <div className="w-full pb-8 flex flex-col gap-6 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-[28px] font-bold text-[#191C1C]">
              User Management
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Users", value: totalUsers, color: "#F15C11" },
              { label: "Customers", value: customerCount, color: "#29A378" },
              { label: "Vendors", value: vendorCount, color: "#29A378" },
              { label: "Drivers", value: driverCount, color: "#212121" },
              { label: "Suspended", value: suspendedCount, color: "#E14343" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-[18px] rounded-[12px] border border-[#FAFAFA] shadow-sm"
              >
                <p className="text-[#848484] text-[12px] font-medium mb-1">
                  {stat.label}
                </p>
                <h3
                  className="text-[32px] font-semibold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 py-2 w-full">
            <div className="flex items-center gap-[12px] w-full md:w-[251px] shrink-0 h-[40px] px-[14px] border border-[#DCDCDC] rounded-[8px] bg-white">
              <Search className="w-[16px] h-[16px] text-[#747475]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent text-[14px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full pb-2 md:pb-0">
              <div className="flex items-center gap-2">
                {["All", "Customers", "Vendors", "Drivers"].map((tab) => {
                  const roleValue =
                    tab === "Customers"
                      ? "Customer"
                      : tab === "Vendors"
                        ? "Vendor"
                        : tab === "Drivers"
                          ? "Driver"
                          : "All";
                  const isActive = activeFilter === roleValue;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(roleValue)}
                      className={`px-4 py-2 rounded-[8px] text-[14px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-[#FE7200] text-white"
                          : "bg-white text-[#747475] border border-[#EAEAEA] hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {["All Status", "Active", "Suspended"].map((tab) => {
                  const isActive = activeFilter === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`px-4 py-2 rounded-[8px] text-[14px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-[#FE7200] text-white"
                          : "bg-white text-[#747475] border border-[#EAEAEA] hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F7F6F4]">
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      User
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Role
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Status
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Orders
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Spent/Earned
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Rating
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Complaints
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475]">
                      Last Active
                    </th>
                    <th className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-[13px] font-bold text-[#747475] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#EAEAEA] last:border-0 hover:bg-[#F7F6F4] transition-all cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex flex-col">
                          <span className="text-[16px] font-semibold text-[#212121]">
                            {user.name}
                          </span>
                          <span className="text-[12px] text-[#848484]">
                            {user.email}
                          </span>
                          <span className="text-[12px] text-[#848484]">
                            {user.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span
                          className={`inline-flex items-center justify-center px-3 h-8 rounded-full text-[14px] font-medium ${roleStyles[user.role]}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center px-3 h-8 rounded-full text-[14px] font-medium ${statusStyles[user.status]}`}
                          >
                            {user.status}
                          </span>
                          {user.isWarned && (
                            <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-[#F9811F] rounded-[4px]">
                              Warned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] text-[#212121]">
                          {user.orders}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] text-[#212121]">
                          {(() => {
                            const e = user.spentEarned as any;
                            if (e == null) return "₦0";
                            if (typeof e === "string" && !e.includes("[object")) return e;
                            if (typeof e === "number") return "₦" + e.toLocaleString();
                            if (typeof e === "object") {
                              const val = e.$numberDecimal ?? e.totalEarned ?? e.weeklyRevenue ?? e.availableBalance ?? 0;
                              return "₦" + (parseFloat(val) || 0).toLocaleString();
                            }
                            return "₦0";
                          })()}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex items-center gap-1">
                          <Star className="w-[14px] h-[14px] fill-[#F9A825] text-[#F9A825]" />
                          <span className="text-[16px] text-[#212121]">
                            {user.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)] text-center">
                        <span
                          className={`text-[16px] font-semibold ${user.complaints > 0 ? "text-[#E14343]" : "text-[#29A378]"}`}
                        >
                          {user.complaints}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <span className="text-[16px] text-[#212121]">
                          {user.lastActive}
                        </span>
                      </td>
                      <td className="px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.25rem,1vw,0.75rem)]">
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
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

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </>
  );
}
