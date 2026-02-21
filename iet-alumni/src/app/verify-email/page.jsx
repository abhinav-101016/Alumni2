"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get email from query param or sessionStorage
  useEffect(() => {
    const queryEmail = searchParams.get("email");
    const storedEmail = sessionStorage.getItem("verifyEmail");

    if (queryEmail) setEmail(queryEmail);
    else if (storedEmail) setEmail(storedEmail);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      setMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);

    } catch (err) {
      setMessage("Error! " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resend failed");
      setMessage("OTP resent. Check your email.");
    } catch (err) {
      setMessage("Error!" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      {/* Smaller width container */}
      <div className="w-full sm:w-96 md:w-80 lg:w-96 bg-white border border-slate-200 shadow-sm rounded-sm p-8">
        <h2 className="text-2xl font-black text-black uppercase tracking-tighter text-center mb-4">
          Verify Your Email
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mb-6">
          Enter the OTP sent to <span className="text-[#951114]">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 focus:border-[#951114] outline-none text-sm font-medium text-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#951114] text-white font-black uppercase tracking-widest hover:bg-black transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm font-bold uppercase tracking-widest text-center ${
              message.includes("✅") ? "text-green-600" : "text-[#951114]"
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-xs text-[#951114] font-bold uppercase tracking-widest hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </main>
  );
}