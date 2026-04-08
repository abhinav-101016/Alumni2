// 📁 src/components/Header.jsx
"use client"

import { useState, useEffect, useContext } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Menu, X, ChevronDown, ArrowRight,
  Plus, Minus, User, LogOut, ShieldCheck
} from "lucide-react"
import "@fontsource/playfair-display/700.css"
import { ChatContext } from "@/context/ChatContext"


function useSafeChat() {
  const ctx = useContext(ChatContext)
  return {
    unreadTotal: ctx?.unreadTotal || 0,
    isAvailable: !!ctx,
    openSidebar: ctx?.openSidebar || null,
  }
}

export default function Header() {
  const router   = useRouter()
  const pathname = usePathname()

  const [isLoggedIn,    setIsLoggedIn]    = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userRole,      setUserRole]      = useState(null)
  const [open,          setOpen]          = useState(false)
  const [active,        setActive]        = useState(null)
  const [hoverNav,      setHoverNav]      = useState(false)
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(null)

  const checkAuth = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`,
        { credentials: "include" }
      )
      if (res.ok) {
        const data = await res.json()
        setIsLoggedIn(true)
        setCurrentUserId(data.user?._id || data.user?.id || data.userId || null)
        setUserRole(data.user?.role || null)
      } else {
        setIsLoggedIn(false)
        setCurrentUserId(null)
        setUserRole(null)
      }
    } catch {
      setIsLoggedIn(false)
      setCurrentUserId(null)
      setUserRole(null)
    }
  }

  useEffect(() => {
    checkAuth()
    window.addEventListener("authChange", checkAuth)
    return () => window.removeEventListener("authChange", checkAuth)
  }, [])

  // ── Close everything on route change ──
  useEffect(() => {
    setOpen(false)
    setActive(null)
    setMobileOpen(null)
    setHoverNav(false)
  }, [pathname])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(prev => {
          if (!prev && y > 60) return true
          if (prev  && y < 30) return false
          return prev
        })
        ticking = false
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isAdmin = userRole === "admin"

  // ── Scroll to a section on the home page ──
  const scrollToSection = (sectionId) => {
    setOpen(false)
    setActive(null)
    if (window.location.pathname !== "/") {
      router.push(`/#${sectionId}`)
    } else {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }

  // ── Admin nav guard ──
  const handleAdminNav = (path) => {
    setActive(null)
    setOpen(false)
    if (!isLoggedIn || !isAdmin) {
      router.push("/login")
    } else {
      router.push(path)
    }
  }

  const handleProfileClick = () => router.push("/dashboard")
  const handleLoginClick   = () => router.push("/login")

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST", credentials: "include",
      })
    } catch (err) { console.error("Logout error", err) }
    finally {
      setIsLoggedIn(false)
      setCurrentUserId(null)
      setUserRole(null)
      window.dispatchEvent(new Event("authChange"))
      setOpen(false)
      router.push("/login")
    }
  }

  const newNavItems = ["Committees", "Events", "Blogs", "News", "Chat"]

  const menuData = {
    Committees: ["Executive Committee", "Advisory Committee"],
    Events:     ["Featured Alumni", "Upcoming Events", "Post New Event"],
    Blogs:      ["Latest Posts", "Post New Blog"],
    News:       ["Announcements", "Post New Article"],
    Chat:       [],
  }

  const adminCreateLinks = ["Post New Blog", "Post New Event", "Post New Article"]

  const getAdminRoute = (link) => {
    if (link === "Post New Blog")    return "/admin/blogs/new"
    if (link === "Post New Event")   return "/admin/events/new"
    if (link === "Post New Article") return "/admin/news/new"
    return "/"
  }

  const clickableItems = ["Featured Alumni", "Executive Committee", "Advisory Committee"]

  const sectionMap = {
    Events:            "events",
    Blogs:             "blogs",
    News:              "news",
    "Upcoming Events": "events",
    "Latest Posts":    "blogs",
    "Announcements":   "news",
  }

  const getRoute = (link) => {
    if (link === "Featured Alumni")     return "/connect/featured-alumni"
    if (link === "Executive Committee") return "/committee/executive-committee"
    if (link === "Advisory Committee")  return "/committee/advisory-committee"
    return "/"
  }

  const isLightMode = open || (hoverNav && active !== null)

  // ── Shared link renderer ──
  const renderLink = (link, item, isMobile = false) => {
    if (adminCreateLinks.includes(link)) {
      return (
        <button
          onClick={() => handleAdminNav(getAdminRoute(link))}
          className={isMobile
            ? "hover:text-blue-500 transition-colors text-left"
            : "text-gray-700 hover:text-[#951114]"
          }
        >
          {link}
        </button>
      )
    }

    if (clickableItems.includes(link)) {
      return (
        <Link
          href={getRoute(link)}
          className={isMobile
            ? "hover:text-blue-500 transition-colors flex items-center gap-2"
            : "text-gray-700 hover:text-[#951114] flex items-center gap-2"
          }
        >
          {link}
        </Link>
      )
    }

    return (
      <button
        onClick={() => scrollToSection(sectionMap[link] || sectionMap[item])}
        className={isMobile
          ? "hover:text-blue-500 transition-colors text-left"
          : "text-gray-700 hover:text-[#951114]"
        }
      >
        {link}
      </button>
    )
  }

  return (
    <header className="sticky top-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]">

      {/* ── Top bar ── */}
      <div className={`hidden md:block bg-white text-blue-600 text-[14px] transition-all duration-500 ease-in-out overflow-hidden ${scrolled ? "max-h-0 opacity-0" : "max-h-20 py-2 opacity-100"}`}>
        <div className="max-w-[1600px] mx-auto px-12 flex justify-end gap-6 font-bold uppercase tracking-widest items-center">
          {!isLoggedIn ? (
            <button onClick={handleLoginClick} className="hover:text-blue-900 transition-colors cursor-pointer text-[12px]">
              LOGIN
            </button>
          ) : (
            <div className="flex items-center gap-5">
              <button onClick={handleProfileClick} className="hover:text-blue-900 transition-colors cursor-pointer" title="My Dashboard">
                <User size={18} />
              </button>
              <button onClick={handleLogout} className="hover:text-blue-900 transition-colors cursor-pointer text-[12px] flex items-center gap-1">
                <LogOut size={14} /> LOGOUT
              </button>
            </div>
          )}
          <a
            href="https://www.iethub.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#951114] transition-colors text-[12px] font-black"
          >
            IETHUB.ORG ↗
          </a>
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav
        onMouseEnter={() => { if (typeof window !== "undefined" && window.innerWidth >= 1024) setHoverNav(true) }}
        onMouseLeave={() => { setHoverNav(false); setActive(null) }}
        className={`transition-all duration-500 shadow-xl ${isLightMode ? "bg-white text-black" : "bg-[#951114] text-white"} ${scrolled ? "py-1" : "py-2"}`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex justify-between items-center">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center flex-1 justify-start cursor-pointer">
            <div className={`transition-all duration-500 relative flex-shrink-0 ${scrolled ? "w-16 h-16 md:w-24 md:h-24" : "w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40"}`}>
              <Image
                src="/images/IETLAA.svg"
                alt="logo"
                fill
                priority
                className={`object-contain transition-all duration-500 transform scale-125 ${!isLightMode ? "brightness-0 invert" : ""}`}
              />
            </div>
            <div
              style={{ fontFamily: "Playfair Display" }}
              className={`leading-tight transition-all duration-500 flex flex-col justify-center ${isLightMode ? "text-[#951114]" : "text-white"}`}
            >
              <div className={`font-bold transition-all duration-500 whitespace-nowrap ${scrolled ? "text-base md:text-xl" : "text-lg md:text-3xl"}`}>
                IET LUCKNOW
              </div>
              <div className={`font-medium transition-all duration-500 ${scrolled ? "text-[10px] md:text-xs" : "text-xs md:text-xl"}`}>
                Alumni Association
              </div>
            </div>
          </Link>

          {/* ── Desktop nav items ── */}
          <div className="flex items-center gap-4">
            <ul className="hidden lg:flex gap-6 xl:gap-8 transition-all duration-500 items-center">
              {newNavItems.map((item, i) => {

                // ── Chat slot: logout / login button ──
                if (item === "Chat") {
                  return (
                    <li key={i} className="flex items-center gap-3">
                      {isLoggedIn ? (
                        <button
                          onClick={handleLogout}
                          className={`flex items-center gap-1.5 px-4 py-2 font-bold uppercase tracking-wide border rounded transition-all duration-300 ${scrolled ? "text-xs" : "text-sm"} ${isLightMode ? "border-slate-300 text-slate-600 hover:bg-slate-100" : "border-white/40 text-white hover:bg-white/10"}`}
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      ) : (
                        <button
                          onClick={handleLoginClick}
                          className={`px-4 py-2 font-bold uppercase tracking-wide border rounded transition-all duration-300 ${scrolled ? "text-xs" : "text-sm"} ${isLightMode ? "border-[#951114] text-[#951114] hover:bg-[#951114] hover:text-white" : "border-white text-white hover:bg-white hover:text-[#951114]"}`}
                        >
                          Login
                        </button>
                      )}
                    </li>
                  )
                }

                // ── Committees / Events / Blogs / News ──
                return (
                  <li
                    key={i}
                    onMouseEnter={() => setActive(i)}
                    className={`cursor-pointer flex items-center gap-1 transition-all duration-300 font-bold uppercase tracking-wide ${scrolled ? "text-sm" : "text-base"} ${active === i ? "text-blue-700" : isLightMode ? "hover:text-blue-700" : "hover:text-gray-300"}`}
                  >
                    {item}
                    <ChevronDown
                      size={scrolled ? 14 : 18}
                      className={`transition-transform duration-300 ${active === i ? "rotate-180" : ""}`}
                    />
                  </li>
                )
              })}
            </ul>

            {/* ── Mobile hamburger ── */}
            <div className="lg:hidden flex items-center gap-3">
              <button
                className="p-2"
                onClick={() => { setOpen(!open); if (open) setMobileOpen(null); setHoverNav(false) }}
              >
                {open ? <X size={scrolled ? 24 : 30} /> : <Menu size={scrolled ? 24 : 30} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`lg:hidden fixed left-0 w-full transition-all duration-500 ease-in-out z-40 overflow-y-auto
            ${open ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible"}
            ${isLightMode ? "bg-white text-black" : "bg-[#951114] text-white"}`}
          style={{ top: scrolled ? "56px" : "84px", height: scrolled ? "calc(100vh - 56px)" : "calc(100vh - 84px)" }}
        >
          <div className="px-6 py-6 space-y-1 pb-24">

            {/* ── Mobile auth block ── */}
            <div className={`mb-6 pb-6 border-b ${isLightMode ? "border-gray-200" : "border-white/20"}`}>
              {!isLoggedIn ? (
                <button
                  onClick={handleLoginClick}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isLightMode ? "bg-[#951114] text-white" : "bg-white text-[#951114]"}`}
                >
                  <User size={20} /> Login
                </button>
              ) : (
                <>
                  <button
                    onClick={handleProfileClick}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all mb-3 ${isLightMode ? "bg-gray-100 text-black" : "bg-white/10 text-white"}`}
                  >
                    <User size={20} /> My Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isLightMode ? "bg-gray-100 text-black" : "bg-white/10 text-white"}`}
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </>
              )}
            </div>

            {/* ── Mobile accordion ── */}
            {newNavItems.filter(item => item !== "Chat").map((item, i) => (
              <div key={i} className={`border-b ${isLightMode ? "border-gray-100" : "border-white/10"}`}>
                <button
                  onClick={() => setMobileOpen(mobileOpen === i ? null : i)}
                  className="w-full flex justify-between items-center py-4 text-base font-bold uppercase"
                >
                  <span>{item}</span>
                  {mobileOpen === i
                    ? <Minus size={18} className="text-blue-500" />
                    : <Plus  size={18} className="text-blue-500" />
                  }
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${mobileOpen === i ? "max-h-[400px] pb-4" : "max-h-0"}`}>
                  <ul className="space-y-3 pl-4 border-l-2 border-blue-500/30 ml-1">
                    {menuData[item]?.map((link, idx) => (
                      <li key={idx} className={`text-sm font-medium ${isLightMode ? "text-gray-600" : "text-gray-200"}`}>
                        {renderLink(link, item, true)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* ── Desktop Dropdown ── */}
        {active !== null && !open &&
          newNavItems[active] !== "Chat" &&
          menuData[newNavItems[active]]?.length > 0 && (
          <div className="absolute left-0 w-full bg-white text-black shadow-2xl border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-w-[1600px] mx-auto px-12 py-8">
              <div className="mb-4 flex items-center gap-3 w-fit">
                <div className="text-xl font-bold text-[#951114] uppercase tracking-tight">
                  {newNavItems[active]}
                </div>
                <ArrowRight size={20} className="text-[#951114]" />
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {menuData[newNavItems[active]]?.map((link, idx) => (
                  <div key={idx} className="text-base cursor-pointer font-medium transition-colors">
                    {renderLink(link, newNavItems[active], false)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </nav>
    </header>
  )
}