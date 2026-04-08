// ProtectedRoute.jsx
"use client"
import { useEffect, useState, createContext, useContext } from "react"
import { useRouter } from "next/navigation"  // ← add this
import Link from "next/link"
import { Lock, Clock, UserCheck, AlertCircle } from "lucide-react"
import { ChatProvider } from "@/context/ChatContext"
import ChatSidebar from "@/components/chat/ChatSidebar"

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading")
  const [reason, setReason] = useState(null)
  const [user,   setUser]   = useState(null)
  const router = useRouter()  // ← add this

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`,
          { credentials: "include" }
        )

        if (!res.ok) {
          // ← redirect directly instead of showing RestrictionUI
          router.replace("/login")
          return
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
        router.replace("/login")  // ← same here
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

  return (
    <AuthContext.Provider value={user}>
      <ChatProvider isLoggedIn={true}>
        {children}
        <ChatSidebar currentUserId={userId} />
      </ChatProvider>
    </AuthContext.Provider>
  )
}