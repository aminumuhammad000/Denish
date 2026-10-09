import { X, Star, Trash2, Check, CreditCard, Clock, Store, ZoomIn, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Vendor {
  id: string;
  name: string;
  businessName?: string;
  category: string;
  address?: string;
  email?: string;
  phone?: string;
  status: "approved" | "suspended" | "pending";
  orders: number;
  revenue: string;
  rating: number;
  image: string;
  logoUrl?: string;
  coverUrl?: string;
  commissionRate?: number;
  isVerified?: boolean;
  payoutAccount?: {
    bank?: string;
    bankCode?: string;
    accountName?: string;
    accountNumber?: string;
  };
  openingHours?: any[];
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
  const [activeTab, setActiveTab] = useState<"overview" | "assets">("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        if (!previewImage && !showDeleteConfirm) {
          onClose();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, previewImage, showDeleteConfirm]);

  if (!vendor) return null;

  const logo = vendor.logoUrl || vendor.image;
  const banner = vendor.coverUrl || vendor.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4 py-6">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-[580px] max-h-[92vh] flex flex-col rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={vendor.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#29A378]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#E9F5EF] text-[#29A378] font-bold flex items-center justify-center text-lg">
                {vendor.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-bold text-[#191C1C]">{vendor.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                    vendor.status.toLowerCase() === "approved"
                      ? "text-[#3DD26A] bg-[#F0FBF4] border border-[#3DD26A]/20"
                      : vendor.status.toLowerCase() === "suspended"
                      ? "text-red-500 bg-red-50 border border-red-200"
                      : "text-[#F9811F] bg-[#FFF4E4] border border-[#F9811F]/20"
                  }`}
                >
                  {vendor.status}
                </span>
              </div>
              <p className="text-[13px] text-[#747475]">{vendor.category} • {vendor.address || "No address specified"}</p>
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
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 py-3 px-3 text-[14px] font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-[#29A378] text-[#29A378]"
                : "border-transparent text-[#747475] hover:text-[#191C1C]"
            }`}
          >
            <Store className="w-4 h-4" />
            Store Overview
          </button>

          <button
            onClick={() => setActiveTab("assets")}
            className={`flex items-center gap-2 py-3 px-3 text-[14px] font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "assets"
                ? "border-[#29A378] text-[#29A378]"
                : "border-transparent text-[#747475] hover:text-[#191C1C]"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Bank & Store Assets
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-5 py-4 overflow-y-auto no-scrollbar min-h-0">
          {activeTab === "overview" ? (
            <div className="flex flex-col gap-4">
              {/* Banner Image */}
              <div
                onClick={() => banner && setPreviewImage({ title: `${vendor.name} Banner`, url: banner })}
                className="relative w-full h-[150px] rounded-[14px] overflow-hidden bg-[#F8FAF9] group cursor-pointer border border-[#EAEAEA]"
              >
                <img
                  src={banner || "/images/Vendor_management_images/mama's kitchen.png"}
                  alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all text-white text-[12px] font-bold">
                  <ZoomIn className="w-4 h-4" /> View Full Banner
                </div>
              </div>

              {/* Contact Strip */}
              {(vendor.phone || vendor.email || vendor.address) && (
                <div className="bg-[#F8F9FA] rounded-[10px] p-3 text-[13px] text-[#555] flex flex-col gap-1 border border-[#EAEAEA]">
                  {vendor.phone && <div><strong>Phone:</strong> {vendor.phone}</div>}
                  {vendor.email && <div><strong>Email:</strong> {vendor.email}</div>}
                  {vendor.address && <div><strong>Address:</strong> {vendor.address}</div>}
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 bg-white border border-[#EAEAEA] rounded-[14px] p-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-[#848484]">Cuisine</p>
                  <p className="text-[14px] font-bold text-[#212121]">{vendor.category}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-[#848484]">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#F9A825] text-[#F9A825]" />
                    <p className="text-[14px] font-bold text-[#212121]">{vendor.rating}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-[#848484]">Total Orders</p>
                  <p className="text-[14px] font-bold text-[#212121]">{vendor.orders}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-[#848484]">Commission Rate</p>
                  <p className="text-[14px] font-bold text-[#212121]">{vendor.commissionRate || 15}%</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-[#848484]">Total Revenue</p>
                  <p className="text-[14px] font-bold text-[#212121]">{vendor.revenue}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-medium text-[#848484]">Commission Paid</p>
                  <p className="text-[14px] font-bold text-[#29A378]">
                    ₦{((parseFloat(vendor.revenue.replace(/[^\d.]/g, "")) || 0) * (vendor.commissionRate || 15) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Store Branding Photos */}
              <div>
                <h3 className="text-[14px] font-bold text-[#191C1C] mb-2.5 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#29A378]" />
                  Store Brand Images
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-[#EAEAEA] rounded-[12px] p-3 bg-white">
                    <p className="text-[12px] font-bold text-[#191C1C] mb-1">Store Logo</p>
                    <div
                      onClick={() => logo && setPreviewImage({ title: `${vendor.name} Logo`, url: logo })}
                      className="relative w-full h-[90px] rounded-[8px] overflow-hidden bg-[#F5F5F5] group cursor-pointer border border-[#EAEAEA]"
                    >
                      <img
                        src={logo || "/images/Vendor_management_images/mama's kitchen.png"}
                        alt="Logo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold">
                        <ZoomIn className="w-4 h-4 mr-1" /> View
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#EAEAEA] rounded-[12px] p-3 bg-white">
                    <p className="text-[12px] font-bold text-[#191C1C] mb-1">Cover Banner</p>
                    <div
                      onClick={() => banner && setPreviewImage({ title: `${vendor.name} Banner`, url: banner })}
                      className="relative w-full h-[90px] rounded-[8px] overflow-hidden bg-[#F5F5F5] group cursor-pointer border border-[#EAEAEA]"
                    >
                      <img
                        src={banner || "/images/Vendor_management_images/mama's kitchen.png"}
                        alt="Banner"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold">
                        <ZoomIn className="w-4 h-4 mr-1" /> View
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Bank Account */}
              <div className="border border-[#EAEAEA] rounded-[14px] p-4 bg-[#FAFAFA]">
                <div className="flex items-center gap-2 mb-2.5 text-[#191C1C]">
                  <CreditCard className="w-4 h-4 text-[#29A378]" />
                  <h4 className="text-[14px] font-bold">Payout Bank Account</h4>
                </div>
                <div className="text-[13px] flex flex-col gap-2 text-[#555]">
                  <div className="flex justify-between">
                    <span className="text-[#848484]">Bank:</span>
                    <strong className="text-[#191C1C]">{vendor.payoutAccount?.bank || "Not Added"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848484]">Account Number:</span>
                    <strong className="text-[#191C1C]">{vendor.payoutAccount?.accountNumber || "Not Added"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848484]">Account Name:</span>
                    <strong className="text-[#191C1C]">{vendor.payoutAccount?.accountName || vendor.name}</strong>
                  </div>
                </div>
              </div>

              {/* Opening Hours if available */}
              {vendor.openingHours && vendor.openingHours.length > 0 && (
                <div className="border border-[#EAEAEA] rounded-[14px] p-4 bg-[#FAFAFA]">
                  <div className="flex items-center gap-2 mb-2 text-[#191C1C]">
                    <Clock className="w-4 h-4 text-[#29A378]" />
                    <h4 className="text-[14px] font-bold">Opening Hours</h4>
                  </div>
                  <div className="text-[12px] flex flex-col gap-1 text-[#555]">
                    {vendor.openingHours.map((h: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-0.5 border-b border-[#EEE] last:border-0">
                        <span className="font-medium">{h.day || `Day ${idx + 1}`}:</span>
                        <span>{h.open && h.close ? `${h.open} - ${h.close}` : (h.closed ? "Closed" : "24 Hours")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-3 bg-white border-t border-[#F0F0F0]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onViewMenu}
              className="flex-1 h-[42px] bg-[#207951] text-white rounded-[10px] text-[13px] font-bold hover:bg-[#1a6342] transition-all cursor-pointer"
            >
              View Menu
            </button>

            {vendor.status.toLowerCase() === "pending" ? (
              <button
                onClick={onApprove || onSuspend}
                className="flex-[1.5] h-[42px] bg-[#29A378] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#207951] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Verify & Approve Vendor
              </button>
            ) : (
              <button
                onClick={onSuspend}
                className={`flex-1 h-[42px] border rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
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
                className="h-[42px] px-3.5 border border-[#E14343] text-[#E14343] hover:bg-red-50 rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Delete Vendor"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[800px] flex items-center justify-between text-white mb-3">
            <h3 className="text-[18px] font-bold">{previewImage.title}</h3>
            <div className="flex items-center gap-2">
              <a
                href={previewImage.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-[800px] max-h-[80vh] w-full bg-black/40 rounded-[16px] overflow-hidden flex items-center justify-center border border-white/10">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[75vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}

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
