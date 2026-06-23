

import { X, Star } from "lucide-react";
;
import { useEffect, useRef } from "react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: "approved" | "suspended" | "pending";
  orders: number;
  revenue: string;
  rating: number;
  image: string;
}

interface VendorDetailsModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSuspend?: () => void;
}

export function VendorDetailsModal({ vendor, onClose, onSuspend }: VendorDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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
        <div className="p-[25px] flex flex-col gap-[28px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-semibold text-[#191C1C]">
              {vendor.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-[24px] h-[24px] text-[#747475]" />
            </button>
          </div>

          {/* Image */}
          <div className="w-full h-[205px] rounded-[12px] overflow-hidden bg-[#F8FAF9]">
            <img
              src={vendor.image}
              alt={vendor.name}
              width={492}
              height={205}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-6">
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Cuisine</p>
              <p className="text-[16px] font-medium text-[#212121]">
                {vendor.category}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="w-[14px] h-[14px] fill-[#F9A825] text-[#F9A825]" />
                <p className="text-[16px] font-medium text-[#212121]">
                  {vendor.rating}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Total Orders</p>
              <p className="text-[16px] font-medium text-[#212121]">
                {vendor.orders}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Reviews</p>
              <p className="text-[16px] font-medium text-[#212121]">16</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Commission Paid</p>
              <p className="text-[16px] font-medium text-[#212121]">₦709,520</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium text-[#848484]">Complaints</p>
              <p className="text-[16px] font-medium text-[#212121]">2</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-[12px] pt-2">
            <button className="flex-1 h-[42px] bg-[#207951] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#1a6342] transition-all">
              View Menu
            </button>
            <button 
              onClick={onSuspend}
              className={`w-[120px] h-[42px] border rounded-[8px] text-[14px] font-medium transition-all ${
                vendor.status === "suspended"
                  ? "border-[#29A378] text-[#29A378] hover:bg-[#F0FBF4]"
                  : "border-[#E14343] text-[#E14343] hover:bg-red-50"
              }`}
            >
              {vendor.status === "suspended" ? "Unsuspend" : "Suspend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
