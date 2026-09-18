

import { X, Star, Trash2, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  address?: string;
  email?: string;
  phone?: string;
  status: "approved" | "suspended" | "pending";
  orders: number;
  revenue: string;
  rating: number;
  image: string;
  commissionRate?: number;
  isVerified?: boolean;
}

interface VendorDetailsModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSuspend?: () => void;
  onApprove?: () => void;
  onDelete?: () => void;
  onViewMenu?: () => void;
}

export function VendorDetailsModal({
  vendor,
  onClose,
  onSuspend,
  onApprove,
  onDelete,
  onViewMenu,
}: VendorDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  if (!vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-[542px] rounded-[21px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="p-[25px] flex flex-col gap-[20px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[24px] font-semibold text-[#191C1C]">
                {vendor.name}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium capitalize ${
                vendor.status.toLowerCase() === "approved"
                  ? "text-[#3DD26A] bg-[#F0FBF4] border border-[#3DD26A]/20"
                  : vendor.status.toLowerCase() === "suspended"
                  ? "text-red-500 bg-red-50 border border-red-200"
                  : "text-[#F9811F] bg-[#FFF4E4] border border-[#F9811F]/20"
              }`}>
                {vendor.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-[24px] h-[24px] text-[#747475]" />
            </button>
          </div>

          {/* Image */}
          <div className="w-full h-[180px] rounded-[12px] overflow-hidden bg-[#F8FAF9]">
            <img
              src={vendor.image}
              alt={vendor.name}
              width={492}
              height={180}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Contact / Address Strip */}
          {(vendor.phone || vendor.email || vendor.address) && (
            <div className="bg-[#F8F9FA] rounded-[10px] p-3 text-[13px] text-[#555] flex flex-col gap-1 border border-[#EAEAEA]">
              {vendor.phone && <div><strong>Phone:</strong> {vendor.phone}</div>}
              {vendor.email && <div><strong>Email:</strong> {vendor.email}</div>}
              {vendor.address && <div><strong>Address:</strong> {vendor.address}</div>}
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Cuisine</p>
              <p className="text-[15px] font-medium text-[#212121]">
                {vendor.category}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="w-[14px] h-[14px] fill-[#F9A825] text-[#F9A825]" />
                <p className="text-[15px] font-medium text-[#212121]">
                  {vendor.rating}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Total Orders</p>
              <p className="text-[15px] font-medium text-[#212121]">
                {vendor.orders}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Commission Rate</p>
              <p className="text-[15px] font-medium text-[#212121]">{vendor.commissionRate || 15}%</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Total Revenue</p>
              <p className="text-[15px] font-medium text-[#212121]">{vendor.revenue}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Commission Paid</p>
              <p className="text-[15px] font-medium text-[#212121]">
                ₦{((parseFloat(vendor.revenue.replace(/[^\d.]/g, "")) || 0) * (vendor.commissionRate || 15) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-[10px] pt-2">
            <button
              onClick={onViewMenu}
              className="flex-1 h-[42px] bg-[#207951] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1a6342] transition-all cursor-pointer"
            >
              View Menu
            </button>
            {vendor.status.toLowerCase() === "pending" ? (
              <button
                onClick={onApprove || onSuspend}
                className="flex-[1.5] h-[42px] bg-[#29A378] text-white rounded-[8px] text-[14px] font-semibold hover:bg-[#207951] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Verify & Approve Vendor
              </button>
            ) : (
              <button
                onClick={onSuspend}
                className={`flex-1 h-[42px] border rounded-[8px] text-[14px] font-medium transition-all cursor-pointer ${
                  vendor.status.toLowerCase() === "suspended"
                    ? "border-[#29A378] text-[#29A378] hover:bg-[#F0FBF4]"
                    : "border-[#E14343] text-[#E14343] hover:bg-red-50"
                }`}
              >
                {vendor.status.toLowerCase() === "suspended" ? "Unsuspend" : "Suspend"}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="h-[42px] px-3.5 border border-[#E14343] text-[#E14343] hover:bg-red-50 rounded-[8px] text-[14px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Delete Vendor"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-[400px] w-full p-6 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[56px] h-[56px] bg-[#FEF2F2] rounded-full flex items-center justify-center text-[#EF4343]">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-[#191C1C] mb-2">Delete Vendor?</h3>
                <p className="text-[14px] text-[#747475] leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-[#191C1C]">{vendor.name}</strong>? This action cannot be undone and will delete the vendor profile and all related menu items.
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
                    if (onDelete) onDelete();
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
