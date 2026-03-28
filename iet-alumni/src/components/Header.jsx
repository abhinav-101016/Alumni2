// 📁 src/components/Header.jsx
"use client"

import { useState, useEffect, useContext } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Menu, X, ChevronDown, ArrowRight, Gift, Search,
  Plus, Minus, User, Bell, MessageCircle, LogOut, ShieldCheck
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

function openChat(openSidebar) {
  if (openSidebar) {
    openSidebar()
  } else {
    window.dispatchEvent(new CustomEvent("openChatSidebar"))
  }
}

export default function Header() {
  const router = useRouter()

  const [isLoggedIn,    setIsLoggedIn]    = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userRole,      setUserRole]      = useState(null)  
  const [pendingCount,  setPendingCount]  = useState(0)
  const [open,          setOpen]          = useState(false)
  const [active,        setActive]        = useState(null)
  const [hoverNav,      setHoverNav]      = useState(false)
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(null)

  const { unreadTotal, openSidebar } = useSafeChat()

  const handleOpenChat = () => openChat(openSidebar)

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
        fetchPendingCount()
      } else {
        setIsLoggedIn(false)
        setCurrentUserId(null)
        setUserRole(null)                      
        setPendingCount(0)
      }
    } catch {
      setIsLoggedIn(false)
      setCurrentUserId(null)
      setUserRole(null)                        
    }
  }

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connections/requests/received`,
        { credentials: "include" }
      )
      if (res.ok) {
        const data = await res.json()
        setPendingCount(data.count || 0)
      }
    } catch { setPendingCount(0) }
  }

  useEffect(() => {
    checkAuth()
    window.addEventListener("authChange", checkAuth)
    return () => window.removeEventListener("authChange", checkAuth)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    const interval = setInterval(fetchPendingCount, 60000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  const isAdmin = userRole === "admin"

  // Admin sees "Verify Users" instead of "Giving"
  const navItems = isAdmin
    ? ["Connect", "Services", "Committees", "Verify Users", "Chat"]
    : ["Connect", "Services", "Committees", "Giving", "Chat"]

  const menuData = {
    Connect: [
      "Alumni Directory",
      ...(userRole === "alumni" || userRole === "admin" ? ["Student Directory"] : []),  
      "My Network", "Connection Requests", "Alumnae Resources", "Featured Alumni",
      "Affinity Programs", "Professional Alliances", "Regional Networks",
      "Alumni Programs", "Volunteer Leadership", "Young Alumni", "Class Correspondence",
    ],
    Services:      ["Alumni Extras", "Order a Transcript", "Vistex Online Courses", "Epitome Yearbook"],
    Committees:    ["Executive Committee", "Advisory Committee"],
    Giving:        ["IET Lucknow Fund", "Parents' Council", "Recognition Societies", "Planned Giving", "Matching Gift", "Partnerships", "Giving Day + March Mania"],
    "Verify Users": [], // handled as a direct link, no dropdown needed
    Chat:          [],
  }

  const clickableItems = [
    "Alumni Directory", "Student Directory",   
    "My Network", "Connection Requests", "Featured Alumni",
    "Affinity Programs",
    "Executive Committee", "Advisory Committee",
  ]

  const handleProfileClick = () => { router.push("/dashboard"); setOpen(false) }
  const handleLoginClick   = () => { router.push("/login");     setOpen(false) }

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
      setPendingCount(0)
      window.dispatchEvent(new Event("authChange"))
      setOpen(false)
      router.push("/login")
    }
  }

  const getRoute = (link) => {
    if (link === "Alumni Directory")    return "/alumni"
    if (link === "Student Directory")   return "/students"
    if (link === "My Network")          return "/connections"
    if (link === "Connection Requests") return "/connections/requests"
    const slug = link.toLowerCase().replace(/\s+/g, "-")
    if (["Featured Alumni", "Alumnae Resources", "Affinity Programs"].includes(link)) return `/connect/${slug}`
    if (["Executive Committee", "Advisory Committee"].includes(link)) return `/committee/${slug}`
    return "/"
  }

  const isLightMode = open || (hoverNav && active !== null)

  const UnreadBadge = ({ light = false }) => unreadTotal > 0 ? (
    <span className={`absolute -top-2 -right-2 text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-white shadow-sm ${light ? "bg-white text-[#951114]" : "bg-[#951114] text-white"}`}>
      {unreadTotal > 9 ? "9+" : unreadTotal}
    </span>
  ) : null

  const PendingBadge = ({ light = false }) => pendingCount > 0 ? (
    <span className={`absolute -top-2 -right-2 text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-white shadow-sm ${light ? "bg-white text-[#951114]" : "bg-[#951114] text-white"}`}>
      {pendingCount > 9 ? "9+" : pendingCount}
    </span>
  ) : null

  return (
    <header className="sticky top-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]">

      <div className={`hidden md:block bg-white text-blue-600 text-[14px] transition-all duration-500 ease-in-out overflow-hidden ${scrolled ? "max-h-0 opacity-0" : "max-h-20 py-2 opacity-100"}`}>
        <div className="max-w-[1600px] mx-auto px-12 flex justify-end gap-6 font-bold uppercase tracking-widest items-center">
          {!isLoggedIn ? (
            <button onClick={handleLoginClick} className="hover:text-blue-900 transition-colors cursor-pointer text-[12px]">LOGIN</button>
          ) : (
            <div className="flex items-center gap-5">
              {/* Admin shortcut in top bar */}
              {isAdmin && (
                <Link
                  href="/admin/verify-users"
                  className="flex items-center gap-1.5 hover:text-[#951114] transition-colors cursor-pointer text-[12px] text-[#951114] font-black"
                >
                  <ShieldCheck size={14} /> VERIFY USERS
                </Link>
              )}
              <button onClick={handleOpenChat} className="relative hover:text-blue-900 transition-colors cursor-pointer" title="Messages">
                <MessageCircle size={18} />
                <UnreadBadge />
              </button>
              <button onClick={() => router.push("/connections/requests")} className="relative hover:text-blue-900 transition-colors cursor-pointer" title="Connection Requests">
                <Bell size={18} />
                <PendingBadge />
              </button>
              <button onClick={handleProfileClick} className="hover:text-blue-900 transition-colors cursor-pointer" title="My Dashboard">
                <User size={18} />
              </button>
              <button onClick={handleLogout} className="hover:text-blue-900 transition-colors cursor-pointer text-[12px] flex items-center gap-1">
                <LogOut size={14} /> LOGOUT
              </button>
            </div>
          )}
          {!isAdmin && (
            <button className="flex gap-1 items-center hover:text-blue-900 transition-colors text-[12px]"><Gift size={14} /> MAKE A GIFT</button>
          )}
          <button className="hover:text-blue-900 transition-colors text-[12px]">CONTACT US</button>
          <Search size={16} className="cursor-pointer hover:text-blue-900" />
        </div>
      </div>

      <nav
        onMouseEnter={() => { if (typeof window !== "undefined" && window.innerWidth >= 1024) setHoverNav(true) }}
        onMouseLeave={() => { setHoverNav(false); setActive(null) }}
        className={`transition-all duration-500 shadow-xl ${isLightMode ? "bg-white text-black" : "bg-[#951114] text-white"} ${scrolled ? "py-1" : "py-2"}`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex justify-between items-center">

          <Link href="/" className="flex items-center flex-1 justify-start cursor-pointer">
            <div className={`transition-all duration-500 relative flex-shrink-0 ${scrolled ? "w-16 h-16 md:w-24 md:h-24" : "w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40"}`}>
              <Image src="/images/IETLAA.svg" alt="logo" fill priority className={`object-contain transition-all duration-500 transform scale-125 ${!isLightMode ? "brightness-0 invert" : ""}`} />
            </div>
            <div style={{ fontFamily: "Playfair Display" }} className={`leading-tight transition-all duration-500 flex flex-col justify-center ${isLightMode ? "text-[#951114]" : "text-white"}`}>
              <div className={`font-bold transition-all duration-500 whitespace-nowrap ${scrolled ? "text-base md:text-xl" : "text-lg md:text-3xl"}`}>IET LUCKNOW</div>
              <div className={`font-medium transition-all duration-500 ${scrolled ? "text-[10px] md:text-xs" : "text-xs md:text-xl"}`}>Alumni</div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <ul className="hidden lg:flex gap-6 xl:gap-8 transition-all duration-500 items-center">
              {navItems.map((item, i) => {

                if (item === "Chat") {
                  return (
                    <li key={i} className="flex items-center gap-3">
                      {scrolled && isLoggedIn && (
                        <button
                          onClick={() => router.push("/connections/requests")}
                          className={`relative transition-colors ${isLightMode ? "text-slate-600 hover:text-[#951114]" : "text-white/80 hover:text-white"}`}
                        >
                          <Bell size={18} />
                          <PendingBadge />
                        </button>
                      )}
                      {isLoggedIn && (
                        <button
                          onClick={handleOpenChat}
                          title="Messages"
                          className={`relative transition-colors ${isLightMode ? "text-slate-700 hover:text-[#951114]" : "text-white hover:text-gray-200"}`}
                        >
                          <MessageCircle size={scrolled ? 20 : 24} />
                          <UnreadBadge />
                        </button>
                      )}
                      {isLoggedIn && (
                        <button
                          onClick={handleLogout}
                          className={`flex items-center gap-1.5 px-4 py-2 font-bold uppercase tracking-wide border rounded transition-all duration-300 ${scrolled ? "text-xs" : "text-sm"} ${isLightMode ? "border-slate-300 text-slate-600 hover:bg-slate-100" : "border-white/40 text-white hover:bg-white/10"}`}
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      )}
                      {!isLoggedIn && (
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

                // ── Verify Users: direct link, no dropdown ──
                if (item === "Verify Users") {
                  return (
                    <li key={i}>
                      <Link
                        href="/admin/verify-users"
                        className={`flex items-center gap-1.5 font-black uppercase tracking-wide transition-all duration-300 ${scrolled ? "text-sm" : "text-base"} ${isLightMode ? "text-[#951114] hover:text-blue-700" : "text-white hover:text-yellow-300"}`}
                      >
                        <ShieldCheck size={scrolled ? 14 : 18} />
                        Verify Users
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={i} onMouseEnter={() => setActive(i)}
                    className={`cursor-pointer flex items-center gap-1 transition-all duration-300 font-bold uppercase tracking-wide ${scrolled ? "text-sm" : "text-base"} ${active === i ? "text-blue-700" : isLightMode ? "hover:text-blue-700" : "hover:text-gray-300"}`}
                  >
                    {item}
                    <ChevronDown size={scrolled ? 14 : 18} className={`transition-transform duration-300 ${active === i ? "rotate-180" : ""}`} />
                  </li>
                )
              })}
            </ul>

            <div className="lg:hidden flex items-center gap-3">
              {isLoggedIn && (
                <>
                  <button onClick={() => router.push("/connections/requests")} className="relative p-1">
                    <Bell size={22} />
                    <PendingBadge light />
                  </button>
                  <button onClick={handleOpenChat} className="relative p-1" title="Messages">
                    <MessageCircle size={22} />
                    <UnreadBadge light />
                  </button>
                </>
              )}
              <button className="p-2" onClick={() => { setOpen(!open); if (open) setMobileOpen(null); setHoverNav(false) }}>
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
            <div className={`mb-6 pb-6 border-b ${isLightMode ? "border-gray-200" : "border-white/20"}`}>
              {!isLoggedIn ? (
                <button onClick={handleLoginClick} className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isLightMode ? "bg-[#951114] text-white" : "bg-white text-[#951114]"}`}>
                  <User size={20} /> Login
                </button>
              ) : (
                <>
                  <button onClick={handleProfileClick} className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all mb-3 ${isLightMode ? "bg-gray-100 text-black" : "bg-white/10 text-white"}`}>
                    <User size={20} /> My Dashboard
                  </button>
                  <button
                    onClick={() => { handleOpenChat(); setOpen(false) }}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all mb-3 ${isLightMode ? "bg-gray-100 text-black" : "bg-white/10 text-white"}`}
                  >
                    <MessageCircle size={20} /> Messages
                    {unreadTotal > 0 && (
                      <span className={`text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 ${isLightMode ? "bg-[#951114] text-white" : "bg-white text-[#951114]"}`}>
                        {unreadTotal > 9 ? "9+" : unreadTotal}
                      </span>
                    )}
                  </button>
                  {/* Admin mobile shortcut */}
                  {isAdmin && (
                    <Link
                      href="/admin/verify-users"
                      onClick={() => setOpen(false)}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all mb-3 ${isLightMode ? "bg-[#951114]/10 text-[#951114]" : "bg-white/10 text-white"}`}
                    >
                      <ShieldCheck size={20} /> Verify Users
                    </Link>
                  )}
                  <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isLightMode ? "bg-gray-100 text-black" : "bg-white/10 text-white"}`}>
                    <LogOut size={20} /> Logout
                  </button>
                </>
              )}
            </div>

            {navItems.filter(item => item !== "Chat" && item !== "Verify Users").map((item, i) => (
              <div key={i} className={`border-b ${isLightMode ? "border-gray-100" : "border-white/10"}`}>
                <button onClick={() => setMobileOpen(mobileOpen === i ? null : i)} className="w-full flex justify-between items-center py-4 text-base font-bold uppercase">
                  <span className="flex items-center gap-2">
                    {item}
                    {item === "Connect" && pendingCount > 0 && (
                      <span className="bg-white text-[#951114] text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                  </span>
                  {mobileOpen === i ? <Minus size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${mobileOpen === i ? "max-h-[800px] pb-4" : "max-h-0"}`}>
                  <ul className="space-y-3 pl-4 border-l-2 border-blue-500/30 ml-1">
                    {menuData[item]?.map((link, idx) => (
                      <li key={idx} className={`text-sm font-medium opacity-80 ${isLightMode ? "text-gray-600" : "text-gray-200"}`}>
                        {clickableItems.includes(link) ? (
                          <Link href={getRoute(link)} onClick={() => setOpen(false)} className="hover:text-blue-500 transition-colors flex items-center gap-2">
                            {link}
                            {link === "Connection Requests" && pendingCount > 0 && (
                              <span className="bg-[#951114] text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                                {pendingCount > 9 ? "9+" : pendingCount}
                              </span>
                            )}
                          </Link>
                        ) : link}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Desktop Dropdown ── */}
        {active !== null && !open && navItems[active] !== "Chat" && navItems[active] !== "Verify Users" && menuData[navItems[active]]?.length > 0 && (
          <div className="absolute left-0 w-full bg-white text-black shadow-2xl border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-w-[1600px] mx-auto px-12 py-8">
              <div className="mb-4 flex items-center gap-3 w-fit">
                <div className="text-xl font-bold text-[#951114] uppercase tracking-tight">{navItems[active]}</div>
                <ArrowRight size={20} className="text-[#951114]" />
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                {menuData[navItems[active]]?.map((link, idx) => (
                  <div key={idx} className="text-base cursor-pointer font-medium transition-colors">
                    {clickableItems.includes(link) ? (
                      <Link href={getRoute(link)} className="text-gray-700 hover:text-[#951114] flex items-center gap-2">
                        {link}
                        {link === "Connection Requests" && pendingCount > 0 && (
                          <span className="bg-[#951114] text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                            {pendingCount > 9 ? "9+" : pendingCount}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="text-gray-700 hover:text-[#951114]">{link}</span>
                    )}
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