import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, Settings, LogOut } from "lucide-react";
import { useAdminStore } from "../../lib/store";

interface Notification { id: string; title: string; message: string; time: string; read: boolean; }

export function TopNavbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const admin = useAdminStore((state) => state.admin);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(
          data.notifications.map((n: any) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: n.read,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen && !isNotificationsOpen) return;
    const close = () => { setIsMenuOpen(false); setIsNotificationsOpen(false); };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [isMenuOpen, isNotificationsOpen]);

  return (
    <div
      style={{
        background: "#fff",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 20,
        gap: 8,
        borderBottom: isScrolled ? "1px solid #EAEAEA" : "1px solid transparent",
        boxShadow: isScrolled ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
        transition: "all 0.3s",
      }}
    >
      {/* Left side: hamburger (mobile only) + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        {isMobile && (
          <button
            onClick={() => window.dispatchEvent(new Event("openSidebar"))}
            aria-label="Open sidebar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={22} color="#191C1C" />
          </button>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            maxWidth: 320,
            height: 40,
            padding: "0 14px",
            border: "1px solid #DCDCDC",
            borderRadius: 8,
            background: "#F8FAF9",
            minWidth: 0,
          }}
        >
          <Search size={16} color="#747475" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              border: "none",
              background: "transparent",
              fontSize: 14,
              color: "#191C1C",
              outline: "none",
              width: "100%",
              minWidth: 0,
            }}
          />
        </div>
      </div>

      {/* Right side: bell + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", flexShrink: 0 }}>
        {/* Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsMenuOpen(false);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid #EAEAEA",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={18} color="#747475" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#EF4444",
                  border: "2px solid white",
                }}
              />
            )}
          </button>

          {isNotificationsOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                right: 12,
                top: 72,
                width: "min(340px, calc(100vw - 24px))",
                background: "white",
                borderRadius: 20,
                border: "1px solid #F2F4F3",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                zIndex: 30,
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #F8FAF9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: "rgba(249,129,31,0.1)",
                        color: "#F9811F",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch("/api/admin/notifications/read-all", { method: "PATCH" });
                      fetchNotifications();
                    }}
                    style={{ fontSize: 11, color: "#207951", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {notifications.length === 0 && (
                  <p style={{ padding: "20px", textAlign: "center", fontSize: 13, color: "#9A9A9A" }}>
                    No notifications
                  </p>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (!n.read) {
                        await fetch(`/api/admin/notifications/${n.id}/read`, { method: "PATCH" });
                        fetchNotifications();
                      }
                    }}
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #F8FAF9",
                      background: n.read ? "white" : "rgba(249,129,31,0.04)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 13, fontWeight: 700 }}>{n.title}</p>
                      <span style={{ fontSize: 10, color: "#9A9A9A", whiteSpace: "nowrap", marginLeft: 8 }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#747475", marginTop: 4 }}>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
            setIsNotificationsOpen(false);
          }}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        >
          <img
            src={admin?.image || "/images/missionpageImages/cake.png"}
            alt="Admin"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #EAEAEA",
            }}
          />
        </div>

        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 12px)",
              width: 180,
              background: "white",
              borderRadius: 16,
              border: "1px solid #F2F4F3",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              padding: "8px 0",
              zIndex: 30,
            }}
          >
            <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid #F8FAF9" }}>
              <p style={{ fontSize: 13, fontWeight: 700 }}>{admin?.name || "Admin Portal"}</p>
              <p style={{ fontSize: 11, color: "#747475" }}>{admin?.email || "admin@denish.com"}</p>
            </div>
            <NavLink
              to="/settings"
              onClick={() => setIsMenuOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", fontSize: 13, color: "#191C1C", textDecoration: "none" }}
            >
              <Settings size={16} color="#747475" /> Settings
            </NavLink>
            <button
              onClick={() => { setIsMenuOpen(false); handleLogout(); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 16px",
                fontSize: 13,
                color: "#EF4444",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: 600,
              }}
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
