"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await response.json();
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login page error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Admin_sign.jpg"
          alt="Admin background"
          fill
          priority
          className="object-cover blur-[22px] scale-110"
        />
        {/* Dark Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full" style={{ maxWidth: "clamp(330px, 85vw, 367px)" }}>
        <div 
          className="bg-white/85 backdrop-blur-md rounded-[14px] p-6 shadow-2xl animate-in fade-in zoom-in duration-500"
          style={{ border: "1px solid rgba(255, 255, 255, 0.3)" }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-[26px]">
            <div 
              className="w-[120px] h-[40px] bg-[#207951]"
              style={{
                maskImage: 'url(/images/BrandLogo/Denish.svg)',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'contain',
                WebkitMaskImage: 'url(/images/BrandLogo/Denish.svg)',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: 'contain',
              }}
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-[26px]">
            {/* Username Field */}
            <div className="space-y-1">
              <label 
                htmlFor="username" 
                className="text-[16px] font-medium text-[#747475] block"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-[52px] px-4 rounded-[12px] border border-[#D9D9D9] bg-[#F8F8F8] focus:outline-none focus:border-[#F9811F] transition-all text-[#191C1C]"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label 
                htmlFor="password" 
                className="text-[16px] font-medium text-[#747475] block"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] px-4 pr-12 rounded-[12px] border border-[#D9D9D9] bg-[#F8F8F8] focus:outline-none focus:border-[#F9811F] transition-all text-[#191C1C]"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#747475] hover:text-[#191C1C] transition-colors"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[13px] font-medium text-center animate-shake">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] bg-[#207951] text-white font-bold rounded-[12px] hover:bg-[#1a6342] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shiny-btn"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
