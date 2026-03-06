"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute" // Adjust path if needed

export default function ProtectedLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
          credentials: "include",
        })

        if (!res.ok) {
          // If not logged in at all, they don't belong in (protected)
          router.replace("/login")
        } else {
          setLoading(false)
        }
      } catch (err) {
        router.replace("/login")
      }
    }
    verifyAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#951114] border-t-transparent"></div>
      </div>
    )
  }

  // Use the ProtectedRoute component to show the specific Restriction UI (Inactive/Incomplete)
  return <ProtectedRoute>{children}</ProtectedRoute>
}