"use client"
import { useEffect, useState, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Clock, UserCheck, AlertCircle } from "lucide-react"
import { ChatProvider } from "@/context/ChatContext"
import ChatSidebar from "@/components/chat/ChatSidebar"

// ─────────────────────────────────────────────────────────────
// Auth context — lets any child component read the current user
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading")
  const [reason, setReason] = useState(null)
  const [user,   setUser]   = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`,
          { credentials: "include" }
        )

        if (!res.ok) {
          setStatus("restricted"); setReason("NOT_LOGGED_IN"); return
        }

        const data = await res.json()
        const user = data.user

        if (user.accountStatus !== "active") {
          setStatus("restricted"); setReason("ACCOUNT_INACTIVE"); return
        }
        if (!user.verification?.isVerifiedByAdmin) {
          setStatus("restricted"); setReason("PENDING_ADMIN"); return
        }
        if (user.role === "alumni" && !user.isProfileComplete) {
          setStatus("restricted"); setReason("PROFILE_INCOMPLETE"); return
        }

        setUser(user)
        setStatus("authenticated")
      } catch (err) {
        setStatus("restricted"); setReason("ERROR")
      }
    }

    checkAuth()
    window.addEventListener("authChange", checkAuth)
    return () => window.removeEventListener("authChange", checkAuth)
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#951114] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-900 font-black text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "restricted") {
    return <RestrictionUI reason={reason} />
  }

  const userId = user?._id || user?.id || null

  // ── KEY FIX ──────────────────────────────────────────────────
  // ChatProvider AND ChatSidebar both live here — inside the same
  // provider tree. Header (in root layout) is outside and only reads
  // the context safely via useContext(ChatContext) which returns null
  // on public pages and the real value on protected pages.
  // ─────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider value={user}>
      <ChatProvider isLoggedIn={true}>
        {children}
        {/* ChatSidebar must be INSIDE ChatProvider to read context correctly */}
        <ChatSidebar currentUserId={userId} />
      </ChatProvider>
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// RestrictionUI
// ─────────────────────────────────────────────────────────────
function RestrictionUI({ reason }) {
  const configs = {
    NOT_LOGGED_IN: {
      icon: <Lock className="text-red-600" size={48} />,
      title: "Login Required",
      desc: "You need to be logged in to access this page.",
      btnText: "Go to Login",
      link: "/login"
    },
    ACCOUNT_INACTIVE: {
      icon: <AlertCircle className="text-orange-600" size={48} />,
      title: "Account Inactive",
      desc: "Your account is currently suspended or under review.",
      btnText: "Contact Support",
      link: "/contact"
    },
    PENDING_ADMIN: {
      icon: <Clock className="text-blue-600" size={48} />,
      title: "Pending Verification",
      desc: "An admin is currently reviewing your registration. This usually takes 24-48 hours.",
      btnText: "View Status",
      link: "/status"
    },
    PROFILE_INCOMPLETE: {
      icon: <UserCheck className="text-[#951114]" size={48} />,
      title: "Complete Your Profile",
      desc: "To access the directory and community features, please finish setting up your profile.",
      btnText: "Complete Profile Now",
      link: "/complete-profile"
    },
    ERROR: {
      icon: <AlertCircle className="text-red-600" size={48} />,
      title: "Something went wrong",
      desc: "Unable to verify your session. Please try again.",
      btnText: "Go to Login",
      link: "/login"
    }
  }

  const config = configs[reason] || configs.NOT_LOGGED_IN

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <div className="mb-6 p-6 bg-white shadow-sm rounded-full">
        {config.icon}
      </div>
      <h2 className="text-3xl font-black uppercase mb-3 tracking-tight text-gray-900">
        {config.title}
      </h2>
      <p className="text-gray-500 max-w-md mb-10 text-lg leading-relaxed">
        {config.desc}
      </p>
      <Link
        href={config.link}
        className="bg-[#951114] text-white px-10 py-4 font-bold uppercase text-xs tracking-[0.2em] hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        {config.btnText}
      </Link>
    </div>
  )
}
