"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Clock, UserCheck, AlertCircle } from "lucide-react"

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading") // loading, authenticated, restricted
  const [reason, setReason] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
          credentials: "include",
        })
        
        if (!res.ok) {
          setStatus("restricted")
          setReason("NOT_LOGGED_IN")
          return
        }

        const { user } = await res.json()

        // 1. Check Account Status (Suspended/Rejected)
        if (user.accountStatus !== "active") {
          setStatus("restricted")
          setReason("ACCOUNT_INACTIVE")
          return
        }

        // 2. Check Admin Verification
        if (!user.verification?.isVerifiedByAdmin) {
          setStatus("restricted")
          setReason("PENDING_ADMIN")
          return
        }

        // 3. Check Profile Completion
        if (user.role === "alumni" && !user.isProfileComplete) {
          setStatus("restricted")
          setReason("PROFILE_INCOMPLETE")
          return
        }

        setStatus("authenticated")
      } catch (err) {
        setStatus("restricted")
        setReason("ERROR")
      }
    }

    checkAuth()
  }, [])

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (status === "restricted") {
    return <RestrictionUI reason={reason} />
  }

  return children
}

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
    }
  }

  const config = configs[reason] || configs.NOT_LOGGED_IN

  return (
    /* Changed bg-white to bg-gray-50 and min-h-[70vh] to h-[calc(100vh-80px)] */
    /* Adjust the 80px based on your actual Header height */
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