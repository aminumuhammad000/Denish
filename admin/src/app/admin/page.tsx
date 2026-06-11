"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
          className="bg-white/90 backdrop-blur-md rounded-[20px] p-8 shadow-2xl animate-in fade-in zoom-in duration-500"
          style={{ border: "1px solid rgba(255, 255, 255, 0.4)" }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-[140px] h-[45px] bg-[#207951]"
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

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#191C1C]">Admin Login</h1>
            <p className="text-sm text-[#747475] mt-1">Please enter your credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label 
                htmlFor="username" 
                className="text-sm font-semibold text-[#191C1C] block ml-1"
              >
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username or Email"
                className="w-full h-[52px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white text-[#191C1C] focus:ring-2 focus:ring-[#F9811F]/20 focus:border-[#F9811F] outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-sm font-semibold text-[#191C1C] block ml-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"

                  className="w-full h-[52px] px-4 pr-12 rounded-[12px] border border-[#E5E7EB] bg-white text-[#191C1C] focus:ring-2 focus:ring-[#F9811F]/20 focus:border-[#F9811F] outline-none transition-all placeholder:text-gray-400"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#747475] hover:text-[#191C1C] p-1 rounded-md hover:bg-gray-100 transition-all"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg animate-shake">
                <p className="text-red-600 text-xs font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-[#207951] text-white font-bold rounded-[12px] hover:bg-[#1a6342] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
