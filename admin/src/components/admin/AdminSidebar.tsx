import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings, LogOut, X } from "lucide-react";
import { useAdminStore } from "../../lib/store";

const navItems = [
  { iconPath: "/images/Dashboard_sidebar_icons/overview.svg", label: "Overview", href: "/dashboard" },
  { iconPath: "/images/Dashboard_sidebar_icons/orders.svg", label: "Orders", href: "/orders" },
  { iconPath: "/images/Dashboard_sidebar_icons/vendors.svg", label: "Vendors", href: "/vendors" },
  { iconPath: "/images/Dashboard_sidebar_icons/drivers.svg", label: "Drivers", href: "/drivers" },
  { iconPath: "/images/Dashboard_sidebar_icons/users.svg", label: "Users", href: "/users" },
  { iconPath: "/images/Dashboard_sidebar_icons/commissions.svg", label: "Commissions", href: "/commissions" },
  { iconPath: "/images/Dashboard_sidebar_icons/payments.svg", label: "Payments", href: "/payments" },
  { iconPath: "/images/Dashboard_sidebar_icons/Analitycs.svg", label: "Analytics", href: "/analytics" },
  { iconPath: "/images/Dashboard_sidebar_icons/content.svg", label: "Content", href: "/content" },
  { iconPath: "/images/Dashboard_sidebar_icons/disputes.svg", label: "Disputes", href: "/disputes" },
  { iconPath: "", label: "Settings", href: "/settings", isSettings: true },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const admin = useAdminStore((state) => state.admin);

  useEffect(() => {
    const handleOpenSidebar = () => setIsOpen(true);
    window.addEventListener("openSidebar", handleOpenSidebar);
    return () => window.removeEventListener("openSidebar", handleOpenSidebar);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="md-hidden-overlay"
          onClick={() => setIsOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 45 }}
        />
      )}

      <aside
        style={{
          width: 280,
          height: "100dvh",
          background: "#207951",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 50,
          color: "white",
          transition: "transform 0.3s ease",
          transform: isOpen ? "translateX(0)" : undefined,
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{ position: "absolute", top: 18, right: 16, color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}
        >
          <X size={24} />
        </button>

        <div style={{ padding: "32px 0 8px", display: "flex", justifyContent: "center" }}>
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>
            <div
              style={{
                width: 100, height: 28, background: "white",
                maskImage: "url(/images/BrandLogo/Denish.svg)",
                maskRepeat: "no-repeat", maskSize: "contain",
                WebkitMaskImage: "url(/images/BrandLogo/Denish.svg)",
                WebkitMaskRepeat: "no-repeat", WebkitMaskSize: "contain",
              }}
            />
          </NavLink>
        </div>

        <div style={{ borderTop: "1px solid white", margin: "8px 0" }} />

        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setIsOpen(false)}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 32px", height: 52, textDecoration: "none",
                color: isActive ? "#F9811F" : "white",
                fontWeight: isActive ? 700 : 500,
                position: "relative",
                transition: "opacity 0.2s",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#F9811F", borderRadius: "0 2px 2px 0" }} />
                  )}
                  {item.isSettings ? (
                    <Settings style={{ width: 20, height: 20, color: isActive ? "#F9811F" : "white" }} />
                  ) : (
                    <div
                      style={{
                        width: 20, height: 20,
                        background: isActive ? "#F9811F" : "white",
                        maskImage: `url(${item.iconPath})`,
                        maskRepeat: "no-repeat", maskPosition: "center", maskSize: "contain",
                        WebkitMaskImage: `url(${item.iconPath})`,
                        WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", WebkitMaskSize: "contain",
                      }}
                    />
                  )}
                  <span style={{ fontSize: 16 }}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid white", margin: "8px 0" }} />

        <div style={{ padding: "12px 16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 16 }}>
            <img src={admin?.image || "/images/missionpageImages/cake.png"} alt="Admin" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{admin?.name || "Denish Admin"}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{admin?.email || "denish@admin.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px", borderRadius: 12, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#FEF2F2", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8,
              transition: "all 0.2s"
            }}
          >
            <LogOut size={20} color="#EF4444" />
            <span style={{ color: "#EF4444" }}>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
