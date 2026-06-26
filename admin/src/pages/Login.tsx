import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const API_BASE = "https://denish-production.up.railway.app/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) localStorage.setItem("admin_token", data.token);
        navigate("/dashboard");
      } else {
        const data = await response.json();
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Server unreachable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src="/images/Admin_sign.jpg" alt="bg" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(22px)", transform: "scale(1.1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 367, padding: "0 16px" }}>
        <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 32, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 140, height: 45, background: "#207951", maskImage: "url(/images/BrandLogo/Denish.svg)", maskRepeat: "no-repeat", maskSize: "contain", WebkitMaskImage: "url(/images/BrandLogo/Denish.svg)", WebkitMaskRepeat: "no-repeat", WebkitMaskSize: "contain" }} />
          </div>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#191C1C" }}>Admin Login</h1>
            <p style={{ fontSize: 14, color: "#747475", marginTop: 4 }}>Please enter your credentials</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#191C1C" }}>Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username or Email"
                required
                style={{ height: 52, borderRadius: 12, border: "1px solid #E5E7EB", padding: "0 16px", fontSize: 14, color: "#191C1C", outline: "none", background: "white" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#191C1C" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  style={{ width: "100%", height: 52, borderRadius: 12, border: "1px solid #E5E7EB", padding: "0 48px 0 16px", fontSize: 14, color: "#191C1C", outline: "none", background: "white", boxSizing: "border-box" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#747475", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{ height: 52, background: "#207951", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isLoading ? 0.7 : 1, transition: "all 0.2s" }}
            >
              {isLoading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : "Login to Dashboard"}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
