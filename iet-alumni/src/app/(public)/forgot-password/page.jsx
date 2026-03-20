// 📁 src/app/(public)/forgot-password/page.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const STEPS = [
  { id: 1, label: "Email",    icon: Mail        },
  { id: 2, label: "OTP",      icon: ShieldCheck },
  { id: 3, label: "Password", icon: KeyRound    },
];

export default function ForgotPassword() {
  const router = useRouter();

  const [step,        setStep]       = useState(1);
  const [email,       setEmail]      = useState("");
  const [otp,         setOtp]        = useState(["", "", "", "", "", ""]);
  const [resetToken,  setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass,    setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [message,     setMessage]    = useState({ text: "", type: "" });
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const setMsg   = (text, type = "error") => setMessage({ text, type });
  const clearMsg = () => setMessage({ text: "", type: "" });

  // ── Step 1: Send OTP ────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setMsg("Please enter your email address");
    setLoading(true); clearMsg();
    try {
      const res  = await fetch(`${BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("OTP sent to your email. Check your inbox.", "success");
        setStep(2);
        setResendTimer(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setMsg(data.message || "Something went wrong");
      }
    } catch {
      setMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return setMsg("Please enter the full 6-digit OTP");
    setLoading(true); clearMsg();
    try {
      const res  = await fetch(`${BASE}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetToken(data.resetToken);
        setMsg("OTP verified successfully.", "success");
        setStep(3);
      } else {
        setMsg(data.message || "Invalid OTP");
      }
    } catch {
      setMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setMsg("Password must be at least 6 characters");
    if (newPassword !== confirmPass) return setMsg("Passwords do not match");
    setLoading(true); clearMsg();
    try {
      const res  = await fetch(`${BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Password reset successfully! Redirecting to login...", "success");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMsg(data.message || "Reset failed. Please try again.");
      }
    } catch {
      setMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true); clearMsg();
    try {
      const res = await fetch(`${BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setOtp(["", "", "", "", "", ""]);
        setMsg("New OTP sent to your email.", "success");
        setResendTimer(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setMsg("Failed to resend OTP.");
      }
    } catch {
      setMsg("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ──────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx]  = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft"  && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next   = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#951114] outline-none text-xs text-black font-medium placeholder:text-slate-400 transition-all";

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full lg:w-1/2 max-w-2xl bg-white border border-slate-200 shadow-sm overflow-hidden rounded-sm">

        {/* Header */}
        <div className="pt-12 pb-8 text-center border-b border-slate-100">
          <div className="w-10 h-1 bg-[#951114] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Reset Password</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">IET Lucknow Alumni Portal</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center px-8 pt-8">
          {STEPS.map((s, i) => {
            const done   = step > s.id;
            const active = step === s.id;
            const Icon   = s.icon;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done   ? "bg-[#951114] border-[#951114]"
                    : active ? "bg-white border-[#951114]"
                    :          "bg-white border-slate-200"
                  }`}>
                    {done ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Icon size={14} className={active ? "text-[#951114]" : "text-slate-300"} />
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    active ? "text-[#951114]" : done ? "text-slate-500" : "text-slate-300"
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-16 h-px mx-2 mb-5 transition-all duration-300 ${step > s.id ? "bg-[#951114]" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Forms */}
        <div className="p-8 md:p-14">
          <div className="w-full max-w-md mx-auto space-y-6">

            {/* ── STEP 1: Email ── */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                  Enter your registered email and we'll send you a 6-digit OTP.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Email Address</label>
                  <input
                    type="email" placeholder="your@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoFocus className={inputClass}
                  />
                </div>
                <MessageBox message={message} />
                <div className="flex flex-col items-center gap-4 pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full max-w-[240px] py-4 px-6 bg-[#951114] text-white text-[11px] font-black uppercase hover:bg-black transition-all duration-300 active:scale-95 shadow-md disabled:opacity-50 rounded-sm">
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                  <Link href="/login" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#951114] transition-colors">
                    <ArrowLeft size={11} /> Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-1">
                    OTP sent to
                  </p>
                  <p className="text-sm font-black text-[#951114] text-center mb-6">{email}</p>

                  {/* ── OTP boxes — fixed width, no shifting ── */}
                  <div
                    className="flex justify-center gap-3 flex-nowrap"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        style={{ width: "44px", height: "52px", flexShrink: 0 }}
                        className={`text-center text-lg font-black border-2 rounded-lg outline-none transition-colors duration-150 bg-white ${
                          digit
                            ? "border-[#951114] text-[#951114] bg-red-50"
                            : "border-slate-200 text-black"
                        } focus:border-[#951114] focus:bg-red-50`}
                      />
                    ))}
                  </div>

                  {/* Resend */}
                  <div className="text-center mt-5">
                    {resendTimer > 0 ? (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Resend in {resendTimer}s
                      </p>
                    ) : (
                      <button type="button" onClick={handleResend} disabled={loading}
                        className="text-[10px] font-black uppercase tracking-widest text-[#951114] hover:text-black transition-colors disabled:opacity-50">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <MessageBox message={message} />

                <div className="flex flex-col items-center gap-4 pt-2">
                  <button type="submit" disabled={loading || otp.join("").length < 6}
                    className="w-full max-w-[240px] py-4 px-6 bg-[#951114] text-white text-[11px] font-black uppercase hover:bg-black transition-all duration-300 active:scale-95 shadow-md disabled:opacity-50 rounded-sm">
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button type="button"
                    onClick={() => { setStep(1); clearMsg(); setOtp(["","","","","",""]); }}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#951114] transition-colors">
                    <ArrowLeft size={11} /> Change Email
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3: New Password ── */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                  Choose a strong new password.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      required autoFocus className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {newPassword && <PasswordStrength password={newPassword} />}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                      required
                      className={`${inputClass} pr-10 ${
                        confirmPass && confirmPass !== newPassword ? "border-red-400" :
                        confirmPass && confirmPass === newPassword ? "border-green-500" : ""
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPass && confirmPass !== newPassword && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">Passwords do not match</p>
                  )}
                  {confirmPass && confirmPass === newPassword && (
                    <p className="text-[10px] text-green-600 font-bold ml-1">✓ Passwords match</p>
                  )}
                </div>

                <MessageBox message={message} />

                <div className="flex flex-col items-center gap-4 pt-2">
                  <button type="submit"
                    disabled={loading || newPassword !== confirmPass || newPassword.length < 6}
                    className="w-full max-w-[240px] py-4 px-6 bg-[#951114] text-white text-[11px] font-black uppercase hover:bg-black transition-all duration-300 active:scale-95 shadow-md disabled:opacity-50 rounded-sm">
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      <p className="mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
        Secure Gateway • IET Lucknow
      </p>
    </main>
  );
}

function MessageBox({ message }) {
  if (!message.text) return null;
  return (
    <div className={`px-4 py-3 text-xs font-bold border-l-2 ${
      message.type === "success"
        ? "bg-green-50 text-green-700 border-green-500"
        : "bg-red-50 text-red-600 border-[#951114]"
    }`}>
      {message.text}
    </div>
  );
}

function PasswordStrength({ password }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const label     = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][score];
  const color     = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500", "bg-green-600"][score];
  const textColor = ["", "text-red-500", "text-orange-500", "text-yellow-600", "text-green-600", "text-green-700"][score];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : "bg-slate-200"}`} />
        ))}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>{label}</p>
    </div>
  );
}
