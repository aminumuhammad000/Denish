import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { printOrderInvoice } from "../../lib/exportUtils";

interface Order {
  id: string;
  customer: string;
  vendor: string;
  status: string;
  amount?: string;
  date?: string;
  address?: string;
  items?: number;
  total?: string;
  commission?: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateOrder?: (updatedOrder: any) => void;
}

export function OrderDetailsModal({ order, onClose, onUpdateOrder }: OrderDetailsModalProps) {
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

  if (!order) return null;

  const handlePrint = () => {
    printOrderInvoice(order);
    toast.success("Invoice print request sent successfully");
  };

  const handleCancelOrder = () => {
    if (onUpdateOrder) {
      onUpdateOrder({ ...order, status: "cancelled" });
      toast.error(`Order ${order.id} has been cancelled`);
      onClose();
    }
  };

  const handleAssignDriver = () => {
    if (onUpdateOrder) {
      onUpdateOrder({ ...order, status: "confirmed" });
      toast.success(`Driver Bayo Adeyemi assigned to Order ${order.id}`, {
        description: "Order status updated to confirmed.",
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-[615px] h-[645px] rounded-[21px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Main Content Container: p-25px, space-y-26px */}
        <div className="h-full p-[25px] flex flex-col space-y-[26px]">
          {/* Block 1: Header (Height: 48px) */}
          <div className="flex items-center justify-between h-[48px] shrink-0">
            <h2 className="text-[28px] font-medium text-[#191C1C]">
              Order {order.id}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-[24px] h-[24px] text-[#747475]" />
            </button>
          </div>

          {/* Block 2: Info Grid (Height: 119px) */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 h-[119px] shrink-0">
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-[#747475]">Customer</p>
              <p className="text-[16px] font-normal text-[#191C1C]">
                {order.customer}
              </p>
              <p className="text-[12px] text-[#747475] leading-tight">
                {order.address || "12 Marina Road, Lagos"}
              </p>
            </div>
            <div className="space-y-1 justify-self-end w-[136px]">
              <p className="text-[12px] font-medium text-[#747475]">Vendor</p>
              <p className="text-[16px] font-normal text-[#191C1C]">
                {order.vendor}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-[#747475]">Driver</p>
              <p className="text-[16px] font-normal text-[#191C1C]">
                {order.status === "pending" ? "Unassigned" : "Bayo Adeyemi"}
              </p>
            </div>
            <div className="space-y-1 justify-self-end w-[136px]">
              <p className="text-[12px] font-medium text-[#747475]">Status</p>
              <div className="flex">
                <span className="w-[92px] h-[32px] flex items-center justify-center rounded-full text-[16px] font-medium bg-[#E6F2FF] text-[#0A85FF] capitalize">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Block 3: Order Summary Container (Height: 247px) */}
          <div className="space-y-3 h-[247px] shrink-0">
            <p className="text-[12px] font-medium text-[#848484]">
              Order Items
            </p>
            <div className="bg-[#F8F8F8] rounded-[8px] p-[15px] h-[222px]">
              {/* Items List */}
              <div className="space-y-[6px] mb-[10px]">
                <div className="flex justify-between items-center">
                  <p className="text-[16px] font-normal text-[#191C1C]">
                    Jollof Rice x 2
                  </p>
                  <p className="text-[16px] font-normal text-[#191C1C]">
                    ₦5,000
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[16px] font-normal text-[#191C1C]">
                    Egusi Soup x 1
                  </p>
                  <p className="text-[16px] font-normal text-[#191C1C]">
                    ₦3,000
                  </p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-[10px] border-t border-dashed border-[#DCDCDC] space-y-[6px]">
                <div className="flex justify-between items-center">
                  <p className="text-[16px] font-semibold text-[#191C1C]">
                    Subtotal
                  </p>
                  <p className="text-[16px] font-semibold text-[#191C1C]">
                    {order.total}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[16px] font-normal text-[#191C1C]">
                    Delivery Fee
                  </p>
                  <p className="text-[16px] font-normal text-[#191C1C]">₦0</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[16px] font-normal text-[#29A378]">
                    Commission (15%)
                  </p>
                  <p className="text-[16px] font-normal text-[#29A378]">
                    {order.commission || "₦1,200"}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-[6px] border-t border-dashed border-[#DCDCDC]">
                  <p className="text-[16px] font-semibold text-[#191C1C]">
                    Total
                  </p>
                  <p className="text-[16px] font-semibold text-[#191C1C]">
                    {order.total}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Block 4: Timeline and Actions (Height: 103px) */}
          <div className="h-[103px] flex flex-col justify-between shrink-0 mt-auto">
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-[#848484]">
                Order Timeline
              </p>
              <p className="text-[14px] font-normal text-[#191C1C]">
                Placed:{" "}
                <span className="text-[#747475]">{order.date || "10/04/2026"}, 10:30:00</span>
              </p>
            </div>

            <div className="flex gap-[12px] w-full">
              <button 
                onClick={handlePrint}
                className="flex-1 h-[42px] border border-[#207951] rounded-[8px] text-[14px] font-semibold text-[#207951] hover:bg-emerald-50 transition-all whitespace-nowrap cursor-pointer"
              >
                Print Invoice
              </button>
              {order.status === "pending" && (
                <button 
                  onClick={handleAssignDriver}
                  className="flex-1 h-[42px] bg-[#207951] text-white rounded-[8px] text-[14px] font-semibold hover:bg-[#1a6342] transition-all whitespace-nowrap cursor-pointer"
                >
                  Assign Driver
                </button>
              )}
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <button 
                  onClick={handleCancelOrder}
                  className="w-[120px] h-[42px] border border-[#FF4343] rounded-[8px] text-[14px] font-semibold text-[#FF4343] hover:bg-red-50 transition-all whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
