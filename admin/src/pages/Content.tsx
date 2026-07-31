

import { useState, useEffect } from "react";
;
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { useAdminStore } from "@/lib/store";

interface BannerCardProps {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  image: string;
  status: "active" | "inactive";
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onEdit?: (id: string) => void;
}

interface Promotion {
  id: string;
  title: string;
  code: string;
  discount: string;
  minOrder: string;
  usage: string;
  status: "active" | "expired";
  period: string;
}

function BannerCard({
  id,
  title,
  description,
  dateRange,
  image,
  status,
  onDelete,
  onToggleStatus,
  onEdit,
}: BannerCardProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#EAEAEA] overflow-hidden flex flex-col">
      <div className="relative w-full h-[160px] sm:h-[200px]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-2">
          <h3 className="text-[16px] sm:text-[18px] font-bold text-[#191C1C] break-words">{title}</h3>
          {status === "active" ? (
            <div className="px-[10px] py-[4px] bg-[#E9F5EF] rounded-full flex items-center justify-center">
              <span className="text-[12px] font-medium text-[#3DD26A]">
                Active
              </span>
            </div>
          ) : (
            <div className="px-[10px] py-[4px] bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <span className="text-[12px] font-medium text-[#747475]">
                Inactive
              </span>
            </div>
          )}
        </div>
        <p className="text-[13px] sm:text-[14px] text-[#747475] mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-2 text-[#747475] mb-4 sm:mb-6">
          <div
            className="w-[18px] h-[18px] bg-[#FE7200]"
            style={{
              maskImage: "url('/images/calendar-event 1.svg')",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
              WebkitMaskImage: "url('/images/calendar-event 1.svg')",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
            }}
          />
          <span className="text-[12px] font-medium text-[#747475]">
            {dateRange}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={() => id && onEdit?.(id)}
            className="w-full h-[38px] sm:h-[42px] bg-[#F8F8F8] flex items-center justify-center gap-1.5 sm:gap-3 border border-[#EAEAEA] rounded-[8px] text-[12px] sm:text-[16px] font-medium text-[#191C1C] hover:bg-gray-100 transition-all"
          >
            <div
              className="w-3.5 sm:w-4 h-3.5 sm:h-4 bg-[#191C1C] shrink-0"
              style={{
                maskImage: "url('/images/pencil-square 1.svg')",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
                WebkitMaskImage: "url('/images/pencil-square 1.svg')",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
              }}
            />
            Edit
          </button>
          <button
            onClick={() => id && onToggleStatus?.(id)}
            className="w-full h-[38px] sm:h-[42px] bg-[#F8F8F8] flex items-center justify-center gap-1.5 sm:gap-3 border border-[#EAEAEA] rounded-[8px] text-[12px] sm:text-[16px] font-medium text-[#191C1C] hover:bg-gray-100 transition-all"
          >
            <div
              className={`w-[16px] sm:w-[24px] h-[16px] sm:h-[24px] shrink-0 ${status === "active" ? "bg-[#191C1C]" : "bg-[#747475]"}`}
              style={{
                maskImage: "url('/images/toggle2-on 1.svg')",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
                WebkitMaskImage: "url('/images/toggle2-on 1.svg')",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
              }}
            />
            {status === "active" ? "Disable" : "Enable"}
          </button>
          <button
            onClick={() => id && onDelete?.(id)}
            className="w-full h-[38px] sm:h-[42px] bg-[#F8F8F8] flex items-center justify-center gap-1.5 sm:gap-3 border border-[#EF4343] rounded-[8px] text-[#EF4343] hover:bg-[#FEF2F2] transition-all"
          >
            <div
              className="w-4 sm:w-6 h-4 sm:h-6 bg-[#EF4343] shrink-0"
              style={{
                maskImage: "url('/images/trash3 1.svg')",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
                WebkitMaskImage: "url('/images/trash3 1.svg')",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
              }}
            />
            <span className="text-[12px] sm:text-[16px] font-medium">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContentManagementPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [activeTab, setActiveTab] = useState("banners");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Banner Added");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(
    null,
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Form states
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");

  const storeBanners = useAdminStore((state) => state.banners);
  const storePromotions = useAdminStore((state) => state.promotions);
  const [banners, setBanners] = useState<BannerCardProps[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    if (storeBanners.length > 0) {
      setBanners(storeBanners.map(b => ({
        id: b.id,
        title: b.title,
        description: b.description,
        dateRange: b.dateRange,
        image: b.image,
        status: b.status
      })));
    }
    if (storePromotions.length > 0) {
      setPromotions(storePromotions.map(p => ({
        id: p.id,
        title: p.title,
        code: p.code,
        discount: p.discount,
        minOrder: p.minOrder,
        usage: p.usage,
        status: p.status,
        period: p.period
      })));
    }
  }, [storeBanners, storePromotions]);

  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);


  const {
    addBannerOnServer,
    updateBannerOnServer,
    addPromotionOnServer,
    updatePromotionOnServer,
  } = useAdminStore();

  const handleSaveBanner = async () => {
    if (editingBannerId) {
      // Update existing banner
      const bannerData = {
        title: bannerTitle,
        description: bannerDescription,
        dateRange: startDate && endDate ? `${startDate} → ${endDate}` : undefined,
        // image handled normally
      };
      await updateBannerOnServer(editingBannerId, bannerData);

      setBanners(
        banners.map((b) => {
          if (b.id === editingBannerId) {
            return {
              ...b,
              title: bannerTitle || b.title,
              description: bannerDescription || b.description,
              dateRange:
                startDate && endDate
                  ? `${startDate} → ${endDate}`
                  : b.dateRange,
              image: selectedFile ? URL.createObjectURL(selectedFile) : b.image,
            };
          }
          return b;
        }),
      );
      setToastMessage("Banner Edited");
    } else {
      // Create a temporary URL for the selected file if it exists
      const imageUrl = selectedFile
        ? URL.createObjectURL(selectedFile)
        : "/images/free_delivery.png";

      const newBannerData = {
        title: bannerTitle || "New Banner",
        description: bannerDescription || "Description goes here...",
        dateRange: `${startDate || "2024-01-01"} → ${endDate || "2024-01-01"}`,
        image: imageUrl,
        status: "active",
      };

      await addBannerOnServer(newBannerData);
      setToastMessage("Banner Added");
    }

    setIsModalOpen(false);
    setShowToast(true);
    resetForm();
    setTimeout(() => setShowToast(false), 3000);
  };


  // initialPromotions removed

  // State for promotions moved up
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(
    null,
  );

  // Promotion Form States
  const [promoTitle, setPromoTitle] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoMinOrder, setPromoMinOrder] = useState("");
  const [promoUsageLimit, setPromoUsageLimit] = useState("");

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  const resetForm = () => {
    setBannerTitle("");
    setBannerDescription("");
    setSelectedFile(null);
    setSelectedImageName(null);
    setStartDate("");
    setEndDate("");
    setEditingBannerId(null);

    // Promo reset
    setPromoTitle("");
    setPromoCode("");
    setPromoDiscount("");
    setPromoMinOrder("");
    setPromoUsageLimit("");
    setEditingPromotionId(null);
  };

  const handleEditBanner = (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (banner) {
      setBannerTitle(banner.title);
      setBannerDescription(banner.description);
      const [start, end] = banner.dateRange.split(" → ");
      setStartDate(start || "");
      setEndDate(end || "");
      setSelectedImageName(banner.image.split("/").pop() || "Current Image");
      setEditingBannerId(id);
      setIsModalOpen(true);
    }
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter((b) => b.id !== id));
  };

  const handleSavePromotion = async () => {
    if (editingPromotionId) {
      // Update
      const promoData = {
        title: promoTitle,
        discount: promoDiscount,
        code: promoCode,
        minOrder: promoMinOrder,
        usageLimit: promoUsageLimit,
        period: startDate && endDate ? `${startDate} - ${endDate}` : undefined,
      };
      await updatePromotionOnServer(editingPromotionId, promoData);

      setPromotions(
        promotions.map((p) => {
          if (p.id === editingPromotionId) {
            return {
              ...p,
              title: promoTitle || p.title,
              discount: promoDiscount || p.discount,
              code: promoCode || p.code,
              minOrder: promoMinOrder || p.minOrder,
              period: startDate && endDate ? `${startDate} - ${endDate}` : p.period,
            };
          }
          return p;
        }),
      );
      setToastMessage("Promotion Edited");
    } else {
      // Add
      const newPromoData = {
        title: promoTitle || "New Promotion",
        discount: promoDiscount || "0%",
        code: promoCode || "CODE",
        minOrder: promoMinOrder || "N0",
        usage: `0/${promoUsageLimit || "100"}`,
        status: "active",
        period: `${startDate || "2024/01/01"} - ${endDate || "2024/12/31"}`,
      };

      await addPromotionOnServer(newPromoData);
      setToastMessage("Promotion Added");
    }

    setIsModalOpen(false);
    setShowToast(true);
    resetForm();
    setTimeout(() => setShowToast(false), 3000);
  };


  const handleEditPromotion = (id: string) => {
    const promo = promotions.find((p) => p.id === id);
    if (promo) {
      setPromoTitle(promo.title);
      setPromoCode(promo.code);
      setPromoDiscount(promo.discount);
      setPromoMinOrder(promo.minOrder);
      const [start, end] = promo.period.split(" - ");
      setStartDate(start || "");
      setEndDate(end || "");
      setEditingPromotionId(id);
      setIsModalOpen(true);
    }
  };

  const handleDeletePromotion = (id: string) => {
    setPromotions(promotions.filter((p) => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setBanners(
      banners.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "active" ? "inactive" : "active" }
          : b,
      ),
    );
  };

  return (
    <>

        {/* Page Content */}
        <div className="px-3 py-4 sm:px-6 sm:py-8 flex flex-col items-center flex-1">
          <div className="w-full pb-8 flex flex-col gap-4 sm:gap-8 px-0 sm:px-2">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <h1 className="text-[22px] sm:text-[28px] font-bold text-[#191C1C] leading-tight break-words">
                Content Management
              </h1>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-[#F9811F] text-white h-[40px] px-3 sm:px-6 rounded-[10px] border border-[#EAEAEA] flex items-center justify-center gap-1.5 sm:gap-2 font-medium text-[13px] sm:text-[16px] hover:bg-[#e0741b] transition-all whitespace-nowrap self-stretch sm:self-auto"
              >
                <span className="text-[16px] sm:text-[20px] font-bold">+</span>
                <span>
                  {activeTab === "banners" ? "Banners" : "Add Promotion"}
                </span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                onClick={() => setActiveTab("banners")}
                className={`flex items-center justify-center gap-2 min-h-[40px] py-2 px-4 rounded-[10px] border border-[#EAEAEA] text-[14px] font-bold transition-all ${
                  activeTab === "banners"
                    ? "bg-[#F9811F] text-white"
                    : "bg-white text-[#747475] hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 ${activeTab === "banners" ? "bg-white" : "bg-[#747475]"}`}
                  style={{
                    maskImage: "url('/images/card-image 1.svg')",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskImage: "url('/images/card-image 1.svg')",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    WebkitMaskSize: "contain",
                  }}
                />
                Banners
              </button>
              <button
                onClick={() => setActiveTab("promotions")}
                className={`flex items-center justify-center gap-2 min-h-[40px] py-2 px-4 rounded-[10px] border border-[#EAEAEA] text-[14px] font-bold leading-[1.1] sm:leading-normal transition-all text-left sm:text-center ${
                  activeTab === "promotions"
                    ? "bg-[#F9811F] text-white"
                    : "bg-white text-[#747475] hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 shrink-0 ${activeTab === "promotions" ? "bg-white" : "bg-[#747475]"}`}
                  style={{
                    maskImage: "url('/images/promo_icon.svg')",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskImage: "url('/images/promo_icon.svg')",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    WebkitMaskSize: "contain",
                  }}
                />
                Promotions & Coupons
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "banners" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {banners.map((banner) => (
                  <BannerCard
                    key={banner.id}
                    {...banner}
                    onDelete={handleDeleteBanner}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEditBanner}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* Promo Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {[
                    { label: "Active Promos", value: "3", color: "#F9811F" },
                    {
                      label: "Total Redemptions",
                      value: "1106",
                      color: "#3DD26A",
                    },
                    {
                      label: "Total Savings Given",
                      value: "N245K",
                      color: "#0A85FF",
                    },
                    {
                      label: "Conversion Rate",
                      value: "34%",
                      color: "#FFB800",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-[12px] border border-[#EAEAEA] shadow-sm"
                    >
                      <p className="text-[14px] text-[#747475] mb-2">
                        {stat.label}
                      </p>
                      <h4
                        className="text-[32px] font-semibold leading-none"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </h4>
                    </div>
                  ))}
                </div>

                {/* Promos Table */}
                <div className="bg-white overflow-hidden rounded-[12px] border border-[#EAEAEA]">
                  <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[760px]">
                      <thead className="bg-[#F7F6F4]">
                        <tr>
                          <th className="px-3 py-4 text-[14px] font-bold text-[#747475]">
                            Promo
                          </th>
                          <th className="px-3 py-4 text-[14px] font-bold text-[#747475]">
                            Code
                          </th>
                          <th className="px-3 py-4 text-[14px] font-bold text-[#747475]">
                            Discount
                          </th>
                          <th className="pl-3 pr-1 py-4 text-[14px] font-bold text-[#747475]">
                            Min Orders
                          </th>
                          <th className="pl-1 pr-3 py-4 text-[14px] font-bold text-[#747475]">
                            Usage
                          </th>
                          <th className="px-3 py-4 text-[14px] font-bold text-[#747475]">
                            Status
                          </th>
                          <th className="px-3 py-4 text-[14px] font-bold text-[#747475]">
                            Period
                          </th>
                          <th className="px-3 py-4 text-[14px] font-bold text-[#747475] text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {promotions.map((promo) => (
                          <tr
                            key={promo.id}
                            className="border-b border-[#747475] hover:bg-gray-50 transition-colors last:border-0"
                          >
                            <td className="px-3 py-4 text-[16px] font-normal text-[#212121] whitespace-nowrap">
                              {promo.title}
                            </td>
                            <td className="px-3 py-4">
                              <div className="w-[92px] h-[27px] bg-[#FEF0E7] flex items-center justify-center rounded-full">
                                <span className="text-[10px] font-medium text-[#EF4343]">
                                  {promo.code}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-[16px] font-normal text-[#212121]">
                              {promo.discount}
                            </td>
                            <td className="pl-3 pr-1 py-4 text-[16px] font-normal text-[#212121]">
                              {promo.minOrder}
                            </td>
                            <td className="pl-1 pr-3 py-4 text-[16px] font-normal text-[#212121]">
                              {promo.usage}
                            </td>
                            <td className="px-3 py-4 text-[16px]">
                              <span
                                className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                                  promo.status === "active"
                                    ? "bg-[#E9F5EF] text-[#3DD26A]"
                                    : "bg-[#F5F5F5] text-[#747475]"
                                }`}
                              >
                                {promo.status.charAt(0).toUpperCase() +
                                  promo.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-3 py-4 text-[16px] font-normal text-[#747475] whitespace-nowrap">
                              {promo.period}
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleEditPromotion(promo.id)}
                                  className="p-2 hover:bg-gray-100 rounded-md transition-colors border border-[#EAEAEA]"
                                >
                                  <div
                                    className="w-4 h-4 bg-[#191C1C]"
                                    style={{
                                      maskImage:
                                        "url('/images/pencil-square 1.svg')",
                                      maskRepeat: "no-repeat",
                                      maskPosition: "center",
                                      maskSize: "contain",
                                      WebkitMaskImage:
                                        "url('/images/pencil-square 1.svg')",
                                      WebkitMaskRepeat: "no-repeat",
                                      WebkitMaskPosition: "center",
                                      WebkitMaskSize: "contain",
                                    }}
                                  />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeletePromotion(promo.id)
                                  }
                                  className="p-2 hover:bg-red-50 rounded-md transition-colors border border-[#EAEAEA]"
                                >
                                  <div
                                    className="w-4 h-4 bg-[#EF4343]"
                                    style={{
                                      maskImage: "url('/images/trash3 1.svg')",
                                      maskRepeat: "no-repeat",
                                      maskPosition: "center",
                                      maskSize: "contain",
                                      WebkitMaskImage:
                                        "url('/images/trash3 1.svg')",
                                      WebkitMaskRepeat: "no-repeat",
                                      WebkitMaskPosition: "center",
                                      WebkitMaskSize: "contain",
                                    }}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden divide-y divide-[#EAEAEA]">
                    {promotions.map((promo) => (
                      <div key={promo.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-[#191C1C] break-words">
                              {promo.title}
                            </p>
                            <p className="text-[12px] text-[#747475] break-words">
                              {promo.period}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[12px] font-bold shrink-0 ${
                              promo.status === "active"
                                ? "bg-[#E9F5EF] text-[#3DD26A]"
                                : "bg-[#F5F5F5] text-[#747475]"
                            }`}
                          >
                            {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center justify-center rounded-full bg-[#FEF0E7] px-3 py-1 text-[12px] font-medium text-[#EF4343]">
                            {promo.code}
                          </span>
                          <span className="text-[#212121]">{promo.discount}</span>
                          <span className="text-[#747475]">Min {promo.minOrder}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] text-[#212121]">{promo.usage}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditPromotion(promo.id)}
                              className="p-2 hover:bg-gray-100 rounded-md transition-colors border border-[#EAEAEA]"
                            >
                              <div
                                className="w-4 h-4 bg-[#191C1C]"
                                style={{
                                  maskImage: "url('/images/pencil-square 1.svg')",
                                  maskRepeat: "no-repeat",
                                  maskPosition: "center",
                                  maskSize: "contain",
                                  WebkitMaskImage: "url('/images/pencil-square 1.svg')",
                                  WebkitMaskRepeat: "no-repeat",
                                  WebkitMaskPosition: "center",
                                  WebkitMaskSize: "contain",
                                }}
                              />
                            </button>
                            <button
                              onClick={() => handleDeletePromotion(promo.id)}
                              className="p-2 hover:bg-red-50 rounded-md transition-colors border border-[#EAEAEA]"
                            >
                              <div
                                className="w-4 h-4 bg-[#EF4343]"
                                style={{
                                  maskImage: "url('/images/trash3 1.svg')",
                                  maskRepeat: "no-repeat",
                                  maskPosition: "center",
                                  maskSize: "contain",
                                  WebkitMaskImage: "url('/images/trash3 1.svg')",
                                  WebkitMaskRepeat: "no-repeat",
                                  WebkitMaskPosition: "center",
                                  WebkitMaskSize: "contain",
                                }}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      

      {/* Add New Banner/Promotion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-[668px] rounded-[16px] sm:rounded-[21px] shadow-2xl overflow-hidden relative border border-[#EAEAEA]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-[40px] py-4 sm:py-[24px] border-b border-[#EAEAEA]">
              <h2 className="text-[18px] sm:text-[24px] font-bold text-[#191C1C]">
                {activeTab === "banners"
                  ? editingBannerId
                    ? "Edit Banner"
                    : "Add New Banner"
                  : editingPromotionId
                    ? "Edit Promotion"
                    : "Add New Promotion"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#191C1C] hover:opacity-70 transition-opacity"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="sm:w-6 sm:h-6"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 sm:px-[40px] py-5 sm:py-[32px] flex flex-col gap-3 sm:gap-[16px]">
              {activeTab === "banners" ? (
                <>
                  {/* Banner Title */}
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Banner Title"
                    className="w-full h-[44px] sm:h-[52px] px-4 sm:px-[24px] border border-[#747475] rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none focus:border-[#F9811F] transition-all bg-white"
                  />

                  {/* Banner Description */}
                  <textarea
                    value={bannerDescription}
                    onChange={(e) => setBannerDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full h-[100px] sm:h-[135px] px-4 sm:px-[24px] py-3 sm:py-[20px] border border-[#747475] rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none focus:border-[#F9811F] transition-all resize-none bg-white"
                  />

                  {/* Banner Image */}
                  <div className="relative w-full h-[44px] sm:h-[52px]">
                    <div className="absolute left-4 sm:left-[24px] top-1/2 -translate-y-1/2 flex items-center gap-[12px] pointer-events-none">
                      <div
                        className="w-[18px] sm:w-5 h-[18px] sm:h-5 bg-[#747475]"
                        style={{
                          maskImage: "url('/images/card-image 1.svg')",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                          maskSize: "contain",
                          WebkitMaskImage: "url('/images/card-image 1.svg')",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          WebkitMaskSize: "contain",
                        }}
                      />
                      <span
                        className={`text-[14px] sm:text-[16px] ${selectedImageName ? "text-[#191C1C]" : "text-[#747475]"}`}
                      >
                        {selectedImageName || "Choose Image"}
                      </span>
                    </div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        setSelectedImageName(file?.name || null);
                      }}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0 border border-[#747475] rounded-[8px] sm:rounded-[12px] pointer-events-none" />
                  </div>
                </>
              ) : (
                <>
                  {/* Promotion Title */}
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="Promo Title"
                    className="w-full h-[44px] sm:h-[52px] px-4 sm:px-[24px] border border-[#747475] rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none focus:border-[#F9811F] transition-all bg-white"
                  />

                  {/* Coupon Code */}
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Coupon Code"
                    className="w-full h-[44px] sm:h-[52px] px-4 sm:px-[24px] border border-[#747475] rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none focus:border-[#F9811F] transition-all bg-white"
                  />

                  {/* Discount & Min Order */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-[16px]">
                    <input
                      type="text"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      placeholder="Discount Amount"
                      className="w-full h-[44px] sm:h-[52px] px-4 sm:px-[24px] border border-[#747475] rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none focus:border-[#F9811F] transition-all bg-white"
                    />
                    <input
                      type="text"
                      value={promoMinOrder}
                      onChange={(e) => setPromoMinOrder(e.target.value)}
                      placeholder="Min Order (N)"
                      className="w-full h-[44px] sm:h-[52px] px-4 sm:px-[24px] border border-[#747475] rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none focus:border-[#F9811F] transition-all bg-white"
                    />
                  </div>

                  {/* Usage Limit */}
                  <input
                    type="text"
                    value={promoUsageLimit}
                    onChange={(e) => setPromoUsageLimit(e.target.value)}
                    placeholder="Usage Limit"
                    className="w-full h-[44px] sm:h-[52px] px-4 sm:px-[24px] border border-[#747475] rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] text-[#191C1C] placeholder:text-[#747475] focus:outline-none focus:border-[#F9811F] transition-all bg-white"
                  />
                </>
              )}

              {/* Shared Date Selection */}
              <div className="grid grid-cols-2 gap-3 sm:gap-[16px]">
                {/* Start Date */}
                <div
                  className="relative h-[44px] sm:h-[52px] cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector("input");
                    if (input && "showPicker" in input) {
                      (input as HTMLInputElement).showPicker();
                    }
                  }}
                >
                  <div className="absolute left-4 sm:left-[24px] top-1/2 -translate-y-1/2 flex items-center gap-[12px] pointer-events-none">
                    <div
                      className="w-[18px] sm:w-5 h-[18px] sm:h-5 bg-[#747475]"
                      style={{
                        maskImage: "url('/images/calendar-event 1.svg')",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskImage: "url('/images/calendar-event 1.svg')",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        WebkitMaskSize: "contain",
                      }}
                    />
                    <span
                      className={`text-[14px] sm:text-[16px] ${startDate ? "text-[#191C1C]" : "text-[#747475]"}`}
                    >
                      {startDate || "mm/dd/yyyy"}
                    </span>
                  </div>
                  <input
                    type="date"
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 border border-[#747475] rounded-[8px] sm:rounded-[12px] pointer-events-none" />
                </div>

                {/* End Date */}
                <div
                  className="relative h-[44px] sm:h-[52px] cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector("input");
                    if (input && "showPicker" in input) {
                      (input as HTMLInputElement).showPicker();
                    }
                  }}
                >
                  <div className="absolute left-4 sm:left-[24px] top-1/2 -translate-y-1/2 flex items-center gap-[12px] pointer-events-none">
                    <div
                      className="w-[18px] sm:w-5 h-[18px] sm:h-5 bg-[#747475]"
                      style={{
                        maskImage: "url('/images/calendar-event 1.svg')",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskImage: "url('/images/calendar-event 1.svg')",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        WebkitMaskSize: "contain",
                      }}
                    />
                    <span
                      className={`text-[14px] sm:text-[16px] ${endDate ? "text-[#191C1C]" : "text-[#747475]"}`}
                    >
                      {endDate || "mm/dd/yyyy"}
                    </span>
                  </div>
                  <input
                    type="date"
                    onChange={(e) => setEndDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 border border-[#747475] rounded-[8px] sm:rounded-[12px] pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={
                  activeTab === "banners"
                    ? handleSaveBanner
                    : handleSavePromotion
                }
                className="w-full h-[44px] sm:h-[52px] bg-[#F9811F] text-white rounded-[8px] sm:rounded-[12px] text-[14px] sm:text-[16px] font-bold hover:bg-[#e0741b] transition-all mt-2 sm:mt-[8px]"
              >
                {activeTab === "banners"
                  ? editingBannerId
                    ? "Save Changes"
                    : "Create Banner"
                  : editingPromotionId
                    ? "Save Changes"
                    : "Create Promotion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-110 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white w-[320px] h-[64px] rounded-[6px] shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center px-4 gap-3 border border-[#F5F5F5]">
            <div className="w-[32px] h-[32px] rounded-full bg-[#FFF1F1] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#FF8C21"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[14px] font-normal text-[#687280] flex-1">
              {toastMessage}
            </span>
            <button
              onClick={() => setShowToast(false)}
              className="text-[#687280] hover:text-[#191C1C] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
