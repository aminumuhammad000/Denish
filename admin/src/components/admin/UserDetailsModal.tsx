

import { X, Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAdminStore, type User } from "@/lib/store";

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser?: (updatedUser: User) => Promise<void> | void;
}

const roleStyles = {
  Customer: "text-[#EF4343] bg-[#FEF0E7]",
  Vendor: "text-[#29A378] bg-[#E9F5EF]",
  Driver: "text-[#0A85FF] bg-[#EBF5FF]",
};

const statusStyles = {
  Active: "text-[#29A378] bg-[#E9F5EF]",
  Suspended: "text-[#EF4343] bg-[#FEF0E7]",
};

export function UserDetailsModal({ user, onClose, onUpdateUser }: UserDetailsModalProps) {
  const [isWarned, setIsWarned] = useState(user.isWarned || false);
  const [isBanned, setIsBanned] = useState(user.status === "Suspended");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteUserOnServer = useAdminStore((state) => state.deleteUserOnServer);

  useEffect(() => {
    setIsWarned(user.isWarned || false);
    setIsBanned(user.status === "Suspended");
  }, [user]);

  const handleEmail = () => {
    if (user.email) {
      window.location.href = `mailto:${user.email}`;
    } else {
      toast.info("No email address is available for this user.");
    }
  };

  const handleWarn = () => {
    const newState = !isWarned;
    setIsWarned(newState);
    if (onUpdateUser) {
      onUpdateUser({ ...user, isWarned: newState });
    }
    toast.success(newState ? `${user.role} Warned` : "Warning retracted", {
      description: newState
        ? `A formal warning has been sent to ${user.name}.`
        : `The warning for ${user.name} has been removed.`,
    });
  };

  const handleBan = () => {
    const newState = !isBanned;
    setIsBanned(newState);
    if (onUpdateUser) {
      onUpdateUser({ ...user, status: newState ? "Suspended" : "Active" });
    }
    if (newState) {
      toast.custom(
        (t) => (
          <div className="w-[320px] h-[64px] bg-white border border-[#EAEAEA] rounded-[6px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex items-center px-4 py-2 gap-3 relative">
            <div className="w-8 h-8 rounded-[4px] bg-[#FEE2E2] flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-[#E14343]" />
            </div>
            <p className="text-[14px] font-normal text-[#687280] leading-none">
              {user.role} Banned
            </p>
            <button
              onClick={() => toast.dismiss(t)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#747475] hover:text-[#191C1C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ),
        { duration: 3000 },
      );
    } else {
      toast.success(`${user.role} Restored`, {
        description: `${user.name}'s account is now active again.`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-[21px] shadow-2xl overflow-hidden p-[25px] flex flex-col justify-between"
        style={{
          width: "542px",
          height: "503px",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-8 top-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-8 h-8 text-[#747475]" />
        </button>

        {/* 1. Title Container (48px) */}
        <div className="h-[48px] flex items-center">
          <h2 className="text-[28px] font-medium text-[#000000] leading-none">
            {user.name}
          </h2>
        </div>

        {/* 2. Badges Container (32px) */}
        <div className="h-[32px] flex gap-4">
          <span
            className={`inline-flex items-center justify-center h-[32px] px-[18px] rounded-full text-[16px] font-medium ${roleStyles[user.role]}`}
          >
            {user.role}
          </span>
          <span
            className={`inline-flex items-center justify-center h-[32px] px-[18px] rounded-full text-[16px] font-medium ${statusStyles[isBanned ? "Suspended" : "Active"]}`}
          >
            {isBanned ? "Suspended" : "Active"}
          </span>
        </div>

        {/* 3. Details Grid Container (164px) */}
        <div className="h-[164px] grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 content-center">
          <div className="space-y-1">
            <p className="text-[12px] text-[#A0A0A0] font-normal">Email</p>
            <p className="text-[16px] text-[#212121] font-normal">
              {user.email}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] text-[#A0A0A0] font-normal">Phone</p>
            <p className="text-[16px] text-[#212121] font-normal">
              {user.phone}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] text-[#A0A0A0] font-normal">Address</p>
            <p className="text-[16px] text-[#212121] font-normal leading-snug">
              {user.address || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] text-[#A0A0A0] font-normal">Rating</p>
            <div className="flex items-center gap-1">
              <Star className="w-[14px] h-[14px] fill-[#F9A825] text-[#F9A825]" />
              <span className="text-[16px] text-[#212121] font-normal">
                {user.rating ?? "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] text-[#A0A0A0] font-normal">
              Total Orders
            </p>
            <p className="text-[16px] text-[#212121] font-normal">
              {user.orders}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] text-[#A0A0A0] font-normal">
              Last Active
            </p>
            <p className="text-[16px] text-[#212121] font-normal">
              {user.lastActive}
            </p>
          </div>
        </div>

        {/* 4. Money Card Container (63px) */}
        <div className="h-[63px] bg-[#F8F8F8] rounded-[8px] px-[28px] flex flex-col justify-center">
          <p className="text-[12px] font-medium text-[#A0A0A0] mb-0.5 leading-none">
            {user.role === "Driver" ? "Total Earned" : "Total Spent"}
          </p>
          <p className="text-[20px] font-semibold text-[#212121] leading-none">
            {user.spentEarned === "-" ? "₦0" : user.spentEarned}
          </p>
        </div>

        {/* 5. Action Buttons Container (42px) */}
        <div className="h-[42px] flex gap-3">
          <button
            onClick={handleEmail}
            className="flex-1 flex items-center justify-center gap-2 h-[42px] border border-[#212121] rounded-[8px] hover:bg-gray-50 transition-all group"
          >
            <div
              className="w-5 h-5 bg-[#212121]"
              style={{
                maskImage: "url(/images/Email_icon.svg)",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
                WebkitMaskImage: "url(/images/Email_icon.svg)",
              }}
            />
            <span className="text-[16px] font-medium text-[#212121]">
              Email
            </span>
          </button>

          <button
            onClick={handleWarn}
            className={`flex-1 flex items-center justify-center gap-2 h-[42px] border rounded-[8px] transition-all group ${
              isWarned
                ? "bg-[#FEF9C3] border-[#F9811F] text-[#F9811F]"
                : "border-[#F9811F] text-[#F9811F] hover:bg-orange-50/30"
            }`}
          >
            <div
              className="w-5 h-5 bg-[#F9811F]"
              style={{
                maskImage: "url(/images/info_icon.svg)",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
                WebkitMaskImage: "url(/images/info_icon.svg)",
              }}
            />
            <span className="text-[16px] font-medium">Warn</span>
          </button>

          <button
            onClick={handleBan}
            className={`flex-1 flex items-center justify-center gap-2 h-[42px] border rounded-[8px] transition-all group ${
              isBanned
                ? "bg-[#FEE2E2] border-[#E14343] text-[#E14343]"
                : "border-[#E14343] text-[#E14343] hover:bg-red-50/30"
            }`}
          >
            <div
              className="w-5 h-5 bg-[#E14343]"
              style={{
                maskImage: "url(/images/Dashboard_sidebar_icons/users.svg)",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
                WebkitMaskImage:
                  "url(/images/Dashboard_sidebar_icons/users.svg)",
              }}
            />
            <span className="text-[16px] font-medium">
              {isBanned ? "Unban" : "Ban"}
            </span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 h-[42px] border border-[#EF4343] text-[#EF4343] hover:bg-[#FEF2F2] rounded-[8px] transition-all group"
          >
            <span className="text-[16px] font-medium">Delete</span>
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-[400px] w-full p-6 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              {/* Alert Icon */}
              <div className="w-[56px] h-[56px] bg-[#FEF2F2] rounded-full flex items-center justify-center text-[#EF4343]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-[18px] font-bold text-[#191C1C] mb-2">Delete Account?</h3>
                <p className="text-[14px] text-[#747475] leading-relaxed">
                  Are you sure you want to delete {user.name}'s account? This action cannot be undone and their profile will be permanently removed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-[46px] border border-[#EAEAEA] rounded-[10px] text-[14px] font-bold text-[#747475] hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowDeleteConfirm(false);
                    await deleteUserOnServer(user.id, user.role);
                    toast.success("User deleted successfully");
                    onClose();
                  }}
                  className="flex-1 h-[46px] bg-[#EF4343] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#D32F2F] transition-all"
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
