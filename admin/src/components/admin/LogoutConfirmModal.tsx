import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-[20px] max-w-[400px] w-full p-6 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          {/* Logout Icon */}
          <div className="w-[56px] h-[56px] bg-[#FEF2F2] rounded-full flex items-center justify-center text-[#EF4343]">
            <LogOut size={26} />
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-[18px] font-bold text-[#191C1C] mb-2">
              Log out of Admin?
            </h3>
            <p className="text-[14px] text-[#747475] leading-relaxed">
              Are you sure you want to log out? You will need to sign back in to access the dashboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[46px] border border-[#EAEAEA] rounded-[10px] text-[14px] font-bold text-[#747475] hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 h-[46px] bg-[#EF4343] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#D32F2F] transition-all cursor-pointer"
            >
              Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
