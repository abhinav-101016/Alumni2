"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
        credentials: "include",
      })
      if (!res.ok) {
        router.push("/login") // Only redirect to login if they aren't authenticated at all
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return children
}