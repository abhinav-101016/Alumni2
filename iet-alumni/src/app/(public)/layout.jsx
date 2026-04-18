"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Footer from "@/components/Footer"
import Header from "@/components/Header"

// Only these pages should redirect logged-in users away
const AUTH_ONLY_PAGES = ["/login", "/signup", "/verify-email", "/forgot-password"]

export default function AuthLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If this is not an auth page, just render it — no redirect check needed
    if (!AUTH_ONLY_PAGES.includes(pathname)) {
      setLoading(false)
      return
    }

    const checkGuestStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
          credentials: "include",
        })

        if (res.ok) {
          const { user } = await res.json()
          // Already logged in on an auth page → send them home
          if (user.role === "alumni" && !user.isProfileComplete) {
            router.replace("/complete-profile")
          } else {
            router.replace("/dashboard")
          }
        } else {
          // Not logged in → let them see the page
          setLoading(false)
        }
      } catch (err) {
        setLoading(false)
      }
    }

    checkGuestStatus()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#951114] border-t-transparent"></div>
      </div>
    )
  }

  return <><Header/>{children}<Footer/></>
}