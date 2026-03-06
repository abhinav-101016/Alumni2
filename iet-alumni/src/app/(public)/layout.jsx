"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkGuestStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
          credentials: "include",
        })

        if (res.ok) {
          const { user } = await res.json()
          // If already logged in, send them to the appropriate "Home"
          if (user.role === "alumni" && !user.isProfileComplete) {
            router.replace("/complete-profile")
          } else {
            router.replace("/dashboard")
          }
        } else {
          // Not logged in? Perfect. Let them see the Login/Signup page.
          setLoading(false)
        }
      } catch (err) {
        setLoading(false)
      }
    }
    checkGuestStatus()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#951114] border-t-transparent"></div>
      </div>
    )
  }

  return <>{children}</>
}