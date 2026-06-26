

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AdminPageSkeleton } from "@/components/layout/AdminPageSkeleton";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { useAdminStore } from "@/lib/store";
// --- State Interfaces ---

interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  image?: string;
}

interface PlatformState {
  platformName: string;
  currency: string;
  deliveryModel: "flat" | "distance";
  baseFee: string;
  commission: string;
  autoCancelMin: number;
  deliveryDeadlineMin: number;
}

interface NotificationsState {
  vendorEmails: boolean;
  disputeAlerts: boolean;
  smsAlerts: boolean;
  notificationEmail: string;
}

interface PaymentsState {
  gateway: string;
  payoutCycle: "weekly" | "monthly";
  minThreshold: string;
}

interface SecurityState {
  twoFactor: boolean;
}

interface SystemState {
  maintenanceMode: boolean;
}

interface SettingsState {
  profile: ProfileState;
  platform: PlatformState;
  notifications: NotificationsState;
  payments: PaymentsState;
  security: SecurityState;
  system: SystemState;
}

const initialSettings: SettingsState = {
  profile: {
    fullName: "Denish Admin",
    email: "admin@denish.com",
    phone: "+234 813 048 5734",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
  platform: {
    platformName: "Denish |",
    currency: "NGN",
    deliveryModel: "flat",
    baseFee: "500",
    commission: "15",
    autoCancelMin: 60,
    deliveryDeadlineMin: 40,
  },
  notifications: {
    vendorEmails: true,
    disputeAlerts: true,
    smsAlerts: false,
    notificationEmail: "denishadmin@gmail.com",
  },
  payments: {
    gateway: "Flutterwave",
    payoutCycle: "weekly",
    minThreshold: "5000",
  },
  security: {
    twoFactor: true,
  },
  system: {
    maintenanceMode: false,
  },
};

// --- Components ---

interface SettingsSectionProps {
  id: string;
  title: string;
  iconPath: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  hasUnsavedChanges: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  id,
  title,
  iconPath,
  isOpen,
  onToggle,
  children,
  hasUnsavedChanges,
}) => {
  return (
    <div className="border border-[#EAEAEA] rounded-[12px] bg-white overflow-hidden mb-4 transition-all duration-300">
      <div
        className={`flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
          isOpen ? "border-b border-dashed border-[#EAEAEA]" : ""
        }`}
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 relative shrink-0">
            <img src={iconPath} alt={title} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[18px] font-medium text-[#191C1C]">{title}</h3>
            {hasUnsavedChanges && (
              <p className="text-[12px] text-[#F9811F]">Unsaved changes</p>
            )}
          </div>
        </div>
        <div className="text-[#A1A1A1]">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && <div className="p-8">{children}</div>}
    </div>
  );
};

// Dynamic Save Button Component
const SaveButton = ({
  isDirty,
  onSave,
}: {
  isDirty: boolean;
  onSave: () => void;
}) => {
  if (isDirty) {
    return (
      <div className="flex justify-end mt-4">
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#A1A1A1]">
            You have unsaved changes
          </span>
          <button
            onClick={onSave}
            className="bg-[#F9811F] text-white px-6 h-[42px] rounded-[8px] text-[14px] font-medium hover:bg-[#e0741b] transition-all shadow-[0_4px_10px_rgba(249,129,31,0.2)]"
          >
            Save changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end mt-4">
      <button className="bg-[#FEF0E7] text-[#F9811F] border border-[#F9811F] px-8 h-[42px] rounded-[8px] text-[14px] font-medium flex items-center justify-center gap-2 cursor-default">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Saved
      </button>
    </div>
  );
};

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("https://denish-production.up.railway.app/api/admin/profile");
        if (response.ok) {
          const data = await response.json();
          const profile = {
            fullName: data.admin.name,
            email: data.admin.email,
            phone: "+234 813 048 5734", // Keep original demo phone or update if in DB
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            image: data.admin.image,
          };
          setSavedSettings(prev => ({ ...prev, profile }));
          setDraftSettings(prev => ({ ...prev, profile }));
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      }
    };

    const timer = setTimeout(() => {
      setIsMounted(true);
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [openSection, setOpenSection] = useState<string>("profile");
  // --- Core CRUD State ---
  // savedSettings acts as our mock database response
  const [savedSettings, setSavedSettings] =
    useState<SettingsState>(initialSettings);
  // draftSettings holds the current edits the user is making
  const [draftSettings, setDraftSettings] =
    useState<SettingsState>(initialSettings);

  // UI Local State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const updateSettingsOnServer = useAdminStore((state) => state.updateSettingsOnServer);
  const updateProfileOnServer = useAdminStore((state) => state.updateProfileOnServer);

  if (!isMounted) {
    return <AdminPageSkeleton />;
  }

  // --- Handlers ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("https://denish-production.up.railway.app/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleUpdateDraft("profile", "image" as any, data.url);
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };
  const handleToggle = (id: string) => {
    setOpenSection(openSection === id ? "" : id);
  };

  const handleUpdateDraft = <K extends keyof SettingsState>(
    section: K,
    field: keyof SettingsState[K],
    value: any,
  ) => {
    setDraftSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };


  const handleSaveChanges = async (section: keyof SettingsState) => {
    if (section === "profile") {
      const { fullName, email, newPassword, image } = draftSettings.profile;
      await updateProfileOnServer({
        name: fullName,
        email,
        password: newPassword || undefined,
        image,
      });
      toast.success("Profile updated successfully!");
    } else {
      await updateSettingsOnServer({ [section]: draftSettings[section] });
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved!`);
    }

    setSavedSettings((prev) => ({
      ...prev,
      [section]: draftSettings[section],
    }));
  };


  // Helper to check if a specific section has unsaved edits
  const hasUnsavedChanges = (section: keyof SettingsState) => {
    return (
      JSON.stringify(savedSettings[section]) !==
      JSON.stringify(draftSettings[section])
    );
  };

  return (
    <>
      <div className="p-[clamp(1rem,3vw,2.5rem)] max-w-[1012px] mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-bold text-[#191C1C] mb-2">
            Settings
          </h1>
          <p className="text-[14px] text-[#747475]">
            Manage your profile, platform, notifications, payouts, security and
            system preferences.
          </p>
        </div>

        <div className="flex flex-col">
          {/* 1. Profile */}
          <SettingsSection
            id="profile"
            title="Profile"
            iconPath="/images/settings/profile.svg"
            isOpen={openSection === "profile"}
            onToggle={handleToggle}
            hasUnsavedChanges={hasUnsavedChanges("profile")}
          >
            <div className="flex flex-col gap-10">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="w-[88px] h-[88px] rounded-full bg-[#F4F4F4] border border-[#EAEAEA] flex items-center justify-center shrink-0 relative overflow-hidden">
                  {draftSettings.profile.image ? (
                    <img src={draftSettings.profile.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="#F9811F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21"
                        stroke="#F9811F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center justify-center gap-2 border border-[#EAEAEA] rounded-[8px] px-4 py-2 w-fit hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        stroke="#747475"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[14px] text-[#747475] font-medium">
                      {isUploading ? "Uploading..." : "Upload photo"}
                    </span>
                  </label>
                  <p className="text-[12px] text-[#A1A1A1]">
                    PNG or JPG, up to 5MB
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={draftSettings.profile.fullName}
                    onChange={(e) =>
                      handleUpdateDraft("profile", "fullName", e.target.value)
                    }
                    className="w-full h-[48px] border border-[#F9811F] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={draftSettings.profile.email}
                    onChange={(e) =>
                      handleUpdateDraft("profile", "email", e.target.value)
                    }
                    className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={draftSettings.profile.phone}
                    onChange={(e) =>
                      handleUpdateDraft("profile", "phone", e.target.value)
                    }
                    className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="flex flex-col gap-4">
                <p className="text-[14px] font-bold text-[#191C1C]">
                  Change password
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[12px] text-[#191C1C]">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={draftSettings.profile.currentPassword}
                        onChange={(e) =>
                          handleUpdateDraft(
                            "profile",
                            "currentPassword",
                            e.target.value,
                          )
                        }
                        className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none pr-10"
                      />
                      <button
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A1A1A1]"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[12px] text-[#191C1C]">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={draftSettings.profile.newPassword}
                        onChange={(e) =>
                          handleUpdateDraft(
                            "profile",
                            "newPassword",
                            e.target.value,
                          )
                        }
                        className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none pr-10"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A1A1A1]"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[12px] text-[#191C1C]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={draftSettings.profile.confirmPassword}
                        onChange={(e) =>
                          handleUpdateDraft(
                            "profile",
                            "confirmPassword",
                            e.target.value,
                          )
                        }
                        className={`w-full h-[48px] border ${
                          draftSettings.profile.newPassword !==
                            draftSettings.profile.confirmPassword &&
                          draftSettings.profile.confirmPassword !== ""
                            ? "border-[#EF4343]"
                            : "border-[#EAEAEA]"
                        } rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none pr-10`}
                      />
                      <button
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A1A1A1]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {draftSettings.profile.newPassword !==
                      draftSettings.profile.confirmPassword &&
                      draftSettings.profile.confirmPassword !== "" && (
                        <span className="text-[12px] text-[#EF4343] mt-1 text-right">
                          x Passwords doesn&apos;t match
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <SaveButton
                isDirty={hasUnsavedChanges("profile")}
                onSave={() => handleSaveChanges("profile")}
              />
            </div>
          </SettingsSection>

          {/* 2. Platform Configuration */}
          <SettingsSection
            id="platform"
            title="Platform Configuration"
            iconPath="/images/settings/platform_config.svg"
            isOpen={openSection === "platform"}
            onToggle={handleToggle}
            hasUnsavedChanges={hasUnsavedChanges("platform")}
          >
            <div className="flex flex-col gap-8">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="w-[88px] h-[88px] rounded-full bg-[#F4F4F4] border border-[#EAEAEA] flex items-center justify-center shrink-0 relative overflow-hidden">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      stroke="#F9811F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21"
                      stroke="#F9811F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="flex items-center justify-center gap-2 border border-[#EAEAEA] rounded-[8px] px-4 py-2 w-fit hover:bg-gray-50 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        stroke="#747475"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[14px] text-[#747475] font-medium">
                      Upload logo
                    </span>
                  </button>
                  <p className="text-[12px] text-[#A1A1A1]">
                    Square logo, PNG/SVG recommended
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Platform name
                  </label>
                  <input
                    type="text"
                    value={draftSettings.platform.platformName}
                    onChange={(e) =>
                      handleUpdateDraft(
                        "platform",
                        "platformName",
                        e.target.value,
                      )
                    }
                    className="w-full h-[48px] border border-[#F9811F] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Default currency
                  </label>
                  <div className="relative">
                    <select
                      value={draftSettings.platform.currency}
                      onChange={(e) =>
                        handleUpdateDraft(
                          "platform",
                          "currency",
                          e.target.value,
                        )
                      }
                      className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="NGN">₦ Nigerian Naira (NGN)</option>
                      <option value="USD">$ US Dollar (USD)</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#747475] pointer-events-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Delivery fee model
                  </label>
                  <div className="flex w-full h-[48px] bg-[#F4F4F4] rounded-[8px] p-1">
                    <button
                      onClick={() =>
                        handleUpdateDraft("platform", "deliveryModel", "flat")
                      }
                      className={`flex-1 rounded-[6px] text-[14px] font-medium transition-all ${draftSettings.platform.deliveryModel === "flat" ? "bg-white shadow-sm text-[#191C1C]" : "text-[#747475]"}`}
                    >
                      Flat Rate
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateDraft(
                          "platform",
                          "deliveryModel",
                          "distance",
                        )
                      }
                      className={`flex-1 rounded-[6px] text-[14px] font-medium transition-all ${draftSettings.platform.deliveryModel === "distance" ? "bg-white shadow-sm text-[#191C1C]" : "text-[#747475]"}`}
                    >
                      Distance-Based
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Base delivery fee (₦)
                  </label>
                  <input
                    type="text"
                    value={draftSettings.platform.baseFee}
                    onChange={(e) =>
                      handleUpdateDraft("platform", "baseFee", e.target.value)
                    }
                    className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#191C1C]">
                    Vendor commission rate
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={draftSettings.platform.commission}
                      onChange={(e) =>
                        handleUpdateDraft(
                          "platform",
                          "commission",
                          e.target.value,
                        )
                      }
                      className="w-24 h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none text-center"
                    />
                    <span className="text-[18px] text-[#191C1C]">%</span>
                  </div>
                  <p className="text-[12px] text-[#A1A1A1] mt-1">
                    Live preview: on a ₦5,000 order, platform earns ₦750
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-8 mt-2">
                {/* Slider 1 */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[14px] text-[#191C1C] font-bold">
                      Order auto-cancellation
                    </label>
                    <span className="text-[14px] font-bold text-[#F9811F]">
                      {draftSettings.platform.autoCancelMin} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={draftSettings.platform.autoCancelMin}
                    onChange={(e) =>
                      handleUpdateDraft(
                        "platform",
                        "autoCancelMin",
                        Number(e.target.value),
                      )
                    }
                    className="w-full h-1 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F9811F] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm"
                    style={{
                      background: `linear-gradient(to right, #F9811F ${(draftSettings.platform.autoCancelMin / 120) * 100}%, #F4F4F4 ${(draftSettings.platform.autoCancelMin / 120) * 100}%)`,
                    }}
                  />
                  <p className="text-[12px] text-[#747475] mt-2">
                    If a vendor doesn&apos;t accept within this time, the order
                    auto-cancels.
                  </p>
                </div>

                {/* Slider 2 */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[14px] text-[#191C1C] font-bold">
                      Delivery deadline
                    </label>
                    <span className="text-[14px] font-bold text-[#F9811F]">
                      {draftSettings.platform.deliveryDeadlineMin} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={draftSettings.platform.deliveryDeadlineMin}
                    onChange={(e) =>
                      handleUpdateDraft(
                        "platform",
                        "deliveryDeadlineMin",
                        Number(e.target.value),
                      )
                    }
                    className="w-full h-1 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F9811F] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm"
                    style={{
                      background: `linear-gradient(to right, #F9811F ${(draftSettings.platform.deliveryDeadlineMin / 120) * 100}%, #F4F4F4 ${(draftSettings.platform.deliveryDeadlineMin / 120) * 100}%)`,
                    }}
                  />
                  <p className="text-[12px] text-[#747475] mt-2">
                    Maximum time a driver has to deliver after pickup.
                  </p>
                </div>
              </div>

              <SaveButton
                isDirty={hasUnsavedChanges("platform")}
                onSave={() => handleSaveChanges("platform")}
              />
            </div>
          </SettingsSection>

          {/* 3. Notifications */}
          <SettingsSection
            id="notifications"
            title="Notifications"
            iconPath="/images/settings/notifications.svg"
            isOpen={openSection === "notifications"}
            onToggle={handleToggle}
            hasUnsavedChanges={hasUnsavedChanges("notifications")}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#191C1C]">
                    New vendor registration emails
                  </p>
                  <p className="text-[12px] text-[#747475]">
                    Get notified when a vendor signs up and needs review.
                  </p>
                </div>
                <div
                  onClick={() =>
                    handleUpdateDraft(
                      "notifications",
                      "vendorEmails",
                      !draftSettings.notifications.vendorEmails,
                    )
                  }
                  className={`w-10 h-6 rounded-full relative cursor-pointer border transition-colors ${
                    draftSettings.notifications.vendorEmails
                      ? "bg-[#FEF0E7] border-[#F9811F]"
                      : "bg-[#F4F4F4] border-[#EAEAEA]"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm transition-all ${
                      draftSettings.notifications.vendorEmails
                        ? "bg-[#F9811F] right-1"
                        : "bg-[#A1A1A1] left-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#191C1C]">
                    New dispute alerts
                  </p>
                  <p className="text-[12px] text-[#747475]">
                    Email alerts whenever a customer or vendor raises a dispute.
                  </p>
                </div>
                <div
                  onClick={() =>
                    handleUpdateDraft(
                      "notifications",
                      "disputeAlerts",
                      !draftSettings.notifications.disputeAlerts,
                    )
                  }
                  className={`w-10 h-6 rounded-full relative cursor-pointer border transition-colors ${
                    draftSettings.notifications.disputeAlerts
                      ? "bg-[#FEF0E7] border-[#F9811F]"
                      : "bg-[#F4F4F4] border-[#EAEAEA]"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm transition-all ${
                      draftSettings.notifications.disputeAlerts
                        ? "bg-[#F9811F] right-1"
                        : "bg-[#A1A1A1] left-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#191C1C]">
                    SMS alerts for critical events
                  </p>
                  <p className="text-[12px] text-[#747475]">
                    Outages, payment failure, fraud flags.
                  </p>
                </div>
                <div
                  onClick={() =>
                    handleUpdateDraft(
                      "notifications",
                      "smsAlerts",
                      !draftSettings.notifications.smsAlerts,
                    )
                  }
                  className={`w-10 h-6 rounded-full relative cursor-pointer border transition-colors ${
                    draftSettings.notifications.smsAlerts
                      ? "bg-[#FEF0E7] border-[#F9811F]"
                      : "bg-[#F4F4F4] border-[#EAEAEA]"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm transition-all ${
                      draftSettings.notifications.smsAlerts
                        ? "bg-[#F9811F] right-1"
                        : "bg-[#A1A1A1] left-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-w-[500px]">
                <label className="text-[12px] text-[#191C1C]">
                  Notification email
                </label>
                <input
                  type="email"
                  value={draftSettings.notifications.notificationEmail}
                  onChange={(e) =>
                    handleUpdateDraft(
                      "notifications",
                      "notificationEmail",
                      e.target.value,
                    )
                  }
                  className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none"
                />
              </div>

              <SaveButton
                isDirty={hasUnsavedChanges("notifications")}
                onSave={() => handleSaveChanges("notifications")}
              />
            </div>
          </SettingsSection>

          {/* 4. Payments & Payouts */}
          <SettingsSection
            id="payments"
            title="Payments & Payouts"
            iconPath="/images/settings/payments.svg"
            isOpen={openSection === "payments"}
            onToggle={handleToggle}
            hasUnsavedChanges={hasUnsavedChanges("payments")}
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 max-w-[500px]">
                <label className="text-[12px] text-[#191C1C]">
                  Connected payment gateway
                </label>
                <div className="relative">
                  <select
                    value={draftSettings.payments.gateway}
                    onChange={(e) =>
                      handleUpdateDraft("payments", "gateway", e.target.value)
                    }
                    className="w-full h-[48px] border border-[#F9811F] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none appearance-none cursor-pointer bg-white"
                  >
                    <option value="Flutterwave">Flutterwave</option>
                    <option value="Paystack">Paystack</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#F9811F] pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 max-w-[500px]">
                <label className="text-[12px] text-[#191C1C]">
                  Vendor payout cycle
                </label>
                <div className="flex w-full h-[48px] bg-[#F4F4F4] rounded-[8px] p-1">
                  <button
                    onClick={() =>
                      handleUpdateDraft("payments", "payoutCycle", "weekly")
                    }
                    className={`flex-1 rounded-[6px] text-[14px] font-medium transition-all ${draftSettings.payments.payoutCycle === "weekly" ? "bg-white shadow-sm text-[#191C1C]" : "text-[#747475]"}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateDraft("payments", "payoutCycle", "monthly")
                    }
                    className={`flex-1 rounded-[6px] text-[14px] font-medium transition-all ${draftSettings.payments.payoutCycle === "monthly" ? "bg-white shadow-sm text-[#191C1C]" : "text-[#747475]"}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-w-[500px]">
                <label className="text-[12px] text-[#191C1C]">
                  Minimum payout threshold (₦)
                </label>
                <input
                  type="text"
                  value={draftSettings.payments.minThreshold}
                  onChange={(e) =>
                    handleUpdateDraft(
                      "payments",
                      "minThreshold",
                      e.target.value,
                    )
                  }
                  className="w-full h-[48px] border border-[#EAEAEA] rounded-[8px] px-4 text-[14px] text-[#191C1C] focus:outline-none"
                />
              </div>

              <SaveButton
                isDirty={hasUnsavedChanges("payments")}
                onSave={() => handleSaveChanges("payments")}
              />
            </div>
          </SettingsSection>

          {/* 5. Security */}
          <SettingsSection
            id="security"
            title="Security"
            iconPath="/images/settings/security.svg"
            isOpen={openSection === "security"}
            onToggle={handleToggle}
            hasUnsavedChanges={hasUnsavedChanges("security")}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#191C1C]">
                    Two-factor authentication
                  </p>
                  <p className="text-[12px] text-[#747475]">
                    Add an extra layer of security with an authenticated app.
                  </p>
                </div>
                <div
                  onClick={() =>
                    handleUpdateDraft(
                      "security",
                      "twoFactor",
                      !draftSettings.security.twoFactor,
                    )
                  }
                  className={`w-10 h-6 rounded-full relative cursor-pointer border transition-colors ${
                    draftSettings.security.twoFactor
                      ? "bg-[#FEF0E7] border-[#F9811F]"
                      : "bg-[#F4F4F4] border-[#EAEAEA]"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm transition-all ${
                      draftSettings.security.twoFactor
                        ? "bg-[#F9811F] right-1"
                        : "bg-[#A1A1A1] left-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-[14px] font-medium text-[#191C1C]">
                  Active sessions
                </p>

                {/* Session 1 (Current) */}
                <div className="flex items-center justify-between border border-[#EAEAEA] rounded-[8px] p-4 bg-[#FDFDFD]">
                  <div className="flex items-center gap-4">
                    <div className="text-[#A1A1A1]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 18h16a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 22h.01M2 18h20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-[#191C1C]">
                          MacBook Pro | Chrome
                        </p>
                        <span className="bg-[#E5F6EE] text-[#29A378] text-[10px] font-medium px-2 py-0.5 rounded-[4px]">
                          Current
                        </span>
                      </div>
                      <p className="text-[12px] text-[#747475]">
                        Lagos, NG | 102.89.34.12 | Just now
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session 2 */}
                <div className="flex items-center justify-between border border-[#EAEAEA] rounded-[8px] p-4 bg-[#FDFDFD]">
                  <div className="flex items-center gap-4">
                    <div className="text-[#A1A1A1]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="5"
                          y="2"
                          width="14"
                          height="20"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 18h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[14px] font-medium text-[#191C1C]">
                        iPhone 15 | Safari
                      </p>
                      <p className="text-[12px] text-[#747475]">
                        Lagos, NG | 197.210.55.84 | 2 hours ago
                      </p>
                    </div>
                  </div>
                  <button className="bg-[#F4F4F4] text-[#747475] border border-[#EAEAEA] px-4 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-gray-100 transition-colors">
                    Revoke
                  </button>
                </div>

                {/* Session 3 */}
                <div className="flex items-center justify-between border border-[#EAEAEA] rounded-[8px] p-4 bg-[#FDFDFD]">
                  <div className="flex items-center gap-4">
                    <div className="text-[#A1A1A1]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 18h16a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 22h.01M2 18h20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[14px] font-medium text-[#191C1C]">
                        Windows | Edge
                      </p>
                      <p className="text-[12px] text-[#747475]">
                        Abuja, NG | 105.112.19.40 | Yesterday
                      </p>
                    </div>
                  </div>
                  <button className="bg-[#F4F4F4] text-[#747475] border border-[#EAEAEA] px-4 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-gray-100 transition-colors">
                    Revoke
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <p className="text-[14px] font-medium text-[#191C1C]">
                  Last login
                </p>
                <p className="text-[12px] text-[#747475]">
                  Apr 17, 2018 | 08:14 | MacBook Pro | Chrome | IP: 102.89.34.12
                </p>
              </div>

              <SaveButton
                isDirty={hasUnsavedChanges("security")}
                onSave={() => handleSaveChanges("security")}
              />
            </div>
          </SettingsSection>

          {/* 6. System */}
          <SettingsSection
            id="system"
            title="System"
            iconPath="/images/settings/system.svg"
            isOpen={openSection === "system"}
            onToggle={handleToggle}
            hasUnsavedChanges={hasUnsavedChanges("system")}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#191C1C]">
                    Maintenance mode
                  </p>
                  <p className="text-[12px] text-[#747475]">
                    Temporarily prevent customers from placing new orders.
                  </p>
                </div>
                <div
                  onClick={() =>
                    handleUpdateDraft(
                      "system",
                      "maintenanceMode",
                      !draftSettings.system.maintenanceMode,
                    )
                  }
                  className={`w-10 h-6 rounded-full relative cursor-pointer border transition-colors ${
                    draftSettings.system.maintenanceMode
                      ? "bg-[#FEF0E7] border-[#F9811F]"
                      : "bg-[#F4F4F4] border-[#EAEAEA]"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm transition-all ${
                      draftSettings.system.maintenanceMode
                        ? "bg-[#F9811F] right-1"
                        : "bg-[#A1A1A1] left-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-medium text-[#191C1C]">
                  App version
                </p>
                <div className="w-full h-[48px] bg-[#F4F4F4] rounded-[8px] px-4 flex items-center">
                  <p className="text-[14px] text-[#747475]">
                    v1.4.2 (build 2026.04.18)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border border-[#EAEAEA] rounded-[8px] p-4 bg-[#FDFDFD]">
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] font-medium text-[#191C1C]">
                    Clear cache
                  </p>
                  <p className="text-[12px] text-[#747475]">
                    Refresh cached data across the admin panel.
                  </p>
                </div>
                <button className="bg-[#F4F4F4] text-[#747475] border border-[#EAEAEA] px-4 py-2 rounded-[8px] text-[12px] font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Clear cache
                </button>
              </div>

              <SaveButton
                isDirty={hasUnsavedChanges("system")}
                onSave={() => handleSaveChanges("system")}
              />
            </div>
          </SettingsSection>
        </div>
      </div>
    </>
  );
}
