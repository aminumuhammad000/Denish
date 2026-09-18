import { useState, useEffect, useMemo } from "react";
import { 
  Search, UtensilsCrossed, Trash2, ToggleLeft, ToggleRight, LayoutGrid, List, 
  RefreshCw, AlertCircle, CheckCircle2, Store, Download, X 
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { useAdminStore } from "@/lib/store";

interface VendorInfo {
  _id: string;
  name: string;
  businessName?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  status?: string;
}

interface MenuItemData {
  _id: string;
  vendorId: VendorInfo | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  category: string;
  image?: string;
  createdAt?: string;
}

export default function MenuItemsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Available" | "Unavailable">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemToDelete, setItemToDelete] = useState<MenuItemData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const vendors = useAdminStore((state) => state.vendors);
  const fetchVendors = useAdminStore((state) => state.fetchVendors);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.denishng.com/api";

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/admin/menu-items`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        toast.error(data.error || "Failed to fetch menu items");
      }
    } catch (err: any) {
      console.error("fetchMenuItems error:", err);
      toast.error(err.message || "Network error loading menu items");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchMenuItems();
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMenuItems();
    toast.success("Menu items refreshed");
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${apiBase}/admin/menu-items/${itemToDelete._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
        toast.success(`"${itemToDelete.name}" deleted successfully`);
        setItemToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete menu item");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailable = async (item: MenuItemData) => {
    try {
      const res = await fetch(`${apiBase}/admin/menu-items/${item._id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, available: !i.available } : i))
        );
        toast.success(`"${item.name}" is now ${!item.available ? "Available" : "Unavailable"}`);
      } else {
        toast.error(data.error || "Failed to update availability");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update item availability");
    }
  };

  // Distinct categories
  const categories = useMemo(() => {
    const list = items.map((i) => i.category).filter(Boolean);
    const standard = ["All", "Rice", "Soups", "Grills", "Drinks", "Snacks", "Sides", "Desserts"];
    return Array.from(new Set([...standard, ...list]));
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Vendor filter
      if (selectedVendorId !== "All") {
        const itemVendorId = typeof item.vendorId === "object" ? item.vendorId?._id : item.vendorId;
        if (itemVendorId !== selectedVendorId) return false;
      }

      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === "Available" && !item.available) return false;
      if (selectedStatus === "Unavailable" && item.available) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const vendorName =
          typeof item.vendorId === "object"
            ? (item.vendorId?.businessName || item.vendorId?.name || "").toLowerCase()
            : "";
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory && !vendorName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedVendorId, selectedCategory, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.available).length;
    const lowStock = items.filter((i) => (i.stock ?? 0) <= 3).length;
    const vendorIds = new Set(
      items.map((i) => (typeof i.vendorId === "object" ? i.vendorId?._id : i.vendorId)).filter(Boolean)
    );
    return {
      total,
      available,
      unavailable: total - available,
      lowStock,
      totalVendors: vendorIds.size,
    };
  }, [items]);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  const exportCSV = () => {
    const headers = "ID,Name,Category,Price,Stock,Available,Vendor\n";
    const rows = filteredItems
      .map((i) => {
        const vName = typeof i.vendorId === "object" ? i.vendorId?.businessName || i.vendorId?.name || "Vendor" : "Vendor";
        return `"${i._id}","${i.name.replace(/"/g, '""')}","${i.category}","${i.price}","${i.stock}","${i.available ? "Yes" : "No"}","${vName.replace(/"/g, '""')}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `denish-menu-items-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-[#191C1C] tracking-tight">
            Menu Items Management
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#747475] mt-1">
            Browse, manage, and delete items uploaded across all vendor restaurants on Denish
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={exportCSV}
            className="h-[40px] px-3.5 rounded-[10px] bg-white border border-[#EAEAEA] text-[#191C1C] text-[13px] font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Download size={16} className="text-[#747475]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-[40px] px-3.5 rounded-[10px] bg-white border border-[#EAEAEA] text-[#191C1C] text-[13px] font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={`text-[#747475] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-[14px] border border-[#EAEAEA] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#FE7200]/10 flex items-center justify-center text-[#FE7200] shrink-0">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <p className="text-[12px] text-[#747475] font-medium">Total Menu Items</p>
            <h3 className="text-[20px] font-bold text-[#191C1C]">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[14px] border border-[#EAEAEA] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#29A378]/10 flex items-center justify-center text-[#29A378] shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[12px] text-[#747475] font-medium">Active & Available</p>
            <h3 className="text-[20px] font-bold text-[#29A378]">{stats.available}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[14px] border border-[#EAEAEA] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[12px] text-[#747475] font-medium">Low Stock (&le;3)</p>
            <h3 className="text-[20px] font-bold text-amber-600">{stats.lowStock}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[14px] border border-[#EAEAEA] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Store size={20} />
          </div>
          <div>
            <p className="text-[12px] text-[#747475] font-medium">Vendors with Menus</p>
            <h3 className="text-[20px] font-bold text-purple-600">{stats.totalVendors}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-[14px] border border-[#EAEAEA] shadow-sm mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-[480px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1A1]" />
            <input
              type="text"
              placeholder="Search by food name, description, category, or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[44px] pl-10 pr-10 rounded-[10px] border border-[#EAEAEA] text-[14px] text-[#191C1C] focus:outline-none focus:border-[#FE7200] bg-[#FAFAFA]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1A1] hover:text-[#191C1C]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Controls: Vendor select + Status + View toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Vendor Filter */}
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="h-[44px] px-3 rounded-[10px] border border-[#EAEAEA] text-[13px] font-medium text-[#191C1C] bg-[#FAFAFA] focus:outline-none focus:border-[#FE7200] cursor-pointer"
            >
              <option value="All">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="h-[44px] px-3 rounded-[10px] border border-[#EAEAEA] text-[13px] font-medium text-[#191C1C] bg-[#FAFAFA] focus:outline-none focus:border-[#FE7200] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Unavailable">Unavailable / Off</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-[#F2F4F3] p-1 rounded-[10px] border border-[#EAEAEA]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-[8px] transition-all ${
                  viewMode === "grid" ? "bg-white text-[#FE7200] shadow-sm font-semibold" : "text-[#747475] hover:text-[#191C1C]"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-[8px] transition-all ${
                  viewMode === "list" ? "bg-white text-[#FE7200] shadow-sm font-semibold" : "text-[#747475] hover:text-[#191C1C]"
                }`}
                title="List / Table View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#FE7200] text-white shadow-sm"
                  : "bg-[#F5F5F5] text-[#747475] hover:bg-[#EAEAEA] hover:text-[#191C1C]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Items Display */}
      {loading ? (
        <div className="bg-white rounded-[14px] border border-[#EAEAEA] p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-[#FE7200] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[14px] text-[#747475]">Loading menu items from all vendors...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#EAEAEA] p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#747475]">
            <UtensilsCrossed size={28} />
          </div>
          <h3 className="text-[16px] font-bold text-[#191C1C] mb-1">No Menu Items Found</h3>
          <p className="text-[13px] text-[#747475] max-w-[400px] mx-auto mb-4">
            {searchQuery || selectedVendorId !== "All" || selectedCategory !== "All"
              ? "No items matched your active filters. Try adjusting your search query or filters."
              : "No vendor has uploaded menu items yet."}
          </p>
          {(searchQuery || selectedVendorId !== "All" || selectedCategory !== "All" || selectedStatus !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedVendorId("All");
                setSelectedCategory("All");
                setSelectedStatus("All");
              }}
              className="px-4 py-2 rounded-[8px] bg-[#FE7200] text-white text-[13px] font-medium hover:bg-[#e06500]"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const vendorName =
              typeof item.vendorId === "object"
                ? item.vendorId?.businessName || item.vendorId?.name || "Vendor"
                : "Vendor";
            const vendorLogo = typeof item.vendorId === "object" ? item.vendorId?.logoUrl : null;

            return (
              <div
                key={item._id}
                className="bg-white rounded-[14px] border border-[#EAEAEA] hover:border-[#FE7200]/40 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image header */}
                  <div className="relative h-[160px] w-full bg-gray-100 overflow-hidden">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                        {item.category || "Food"}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md ${
                          item.available
                            ? "bg-[#29A378]/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    {/* Vendor Badge */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                      {vendorLogo ? (
                        <img src={vendorLogo} alt={vendorName} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#FE7200]/10 text-[#FE7200] flex items-center justify-center text-[10px] font-bold">
                          {vendorName.charAt(0)}
                        </div>
                      )}
                      <span className="text-[12px] font-semibold text-[#191C1C] truncate">{vendorName}</span>
                    </div>

                    <h4 className="text-[16px] font-bold text-[#191C1C] line-clamp-1 mb-1">{item.name}</h4>
                    <p className="text-[12px] text-[#747475] line-clamp-2 min-h-[36px] mb-3">
                      {item.description || "No description provided."}
                    </p>

                    {/* Price & Stock */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-[11px] text-[#747475]">Price</p>
                        <p className="text-[16px] font-extrabold text-[#FE7200]">
                          ₦{(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#747475]">Stock</p>
                        <span
                          className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                            (item.stock ?? 0) <= 0
                              ? "bg-red-100 text-red-700"
                              : (item.stock ?? 0) <= 3
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.stock ?? 0} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-[#FBFBFA] border-t border-[#EAEAEA] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleAvailable(item)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-[#747475] hover:text-[#191C1C] cursor-pointer"
                  >
                    {item.available ? (
                      <>
                        <ToggleRight size={20} className="text-[#29A378]" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={20} className="text-[#A1A1A1]" />
                        <span>Off</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setItemToDelete(item)}
                    className="h-[32px] px-3 rounded-[8px] bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete Menu Item"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-[14px] border border-[#EAEAEA] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA] text-[12px] font-bold text-[#747475] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[14px]">
                {filteredItems.map((item) => {
                  const vendorName =
                    typeof item.vendorId === "object"
                      ? item.vendorId?.businessName || item.vendorId?.name || "Vendor"
                      : "Vendor";

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Item Image + Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"}
                            alt={item.name}
                            className="w-12 h-12 rounded-[10px] object-cover bg-gray-100 shrink-0 border border-gray-200"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#191C1C] truncate">{item.name}</p>
                            <p className="text-[12px] text-[#747475] truncate max-w-[240px]">
                              {item.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#191C1C]">{vendorName}</span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[#555] text-[12px] font-semibold">
                          {item.category || "Food"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-[#FE7200]">
                        ₦{(item.price || 0).toLocaleString()}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                            (item.stock ?? 0) <= 0
                              ? "bg-red-100 text-red-700"
                              : (item.stock ?? 0) <= 3
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.stock ?? 0} in stock
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className="flex items-center gap-1.5 cursor-pointer text-[12px] font-semibold"
                        >
                          {item.available ? (
                            <span className="flex items-center gap-1 text-[#29A378] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={14} /> Available
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                              <AlertCircle size={14} /> Unavailable
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Delete Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-2 rounded-[8px] text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                          <span className="text-[12px] font-bold">Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[440px] rounded-[18px] p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 size={24} />
            </div>

            <h3 className="text-[18px] font-bold text-[#191C1C] text-center mb-1">
              Delete Menu Item?
            </h3>
            <p className="text-[13px] text-[#747475] text-center mb-4">
              Are you sure you want to permanently delete this item from the platform? This will remove it from customer menus immediately.
            </p>

            {/* Item Card preview inside modal */}
            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-gray-50 border border-gray-200 mb-6">
              <img
                src={itemToDelete.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80"}
                alt={itemToDelete.name}
                className="w-14 h-14 rounded-[10px] object-cover bg-gray-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[#191C1C] text-[14px] truncate">{itemToDelete.name}</h4>
                <p className="text-[12px] text-[#FE7200] font-bold">₦{(itemToDelete.price || 0).toLocaleString()}</p>
                <p className="text-[11px] text-[#747475] truncate">
                  Vendor: {typeof itemToDelete.vendorId === "object" ? itemToDelete.vendorId?.businessName || itemToDelete.vendorId?.name : "Vendor"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="flex-1 h-[44px] rounded-[10px] border border-[#EAEAEA] text-[#191C1C] font-semibold text-[14px] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteItem}
                className="flex-1 h-[44px] rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
