"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ChevronDown, ArrowRight, Gift, Search, Plus, Minus } from "lucide-react"
import "@fontsource/playfair-display/700.css"

export default function Header() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [hoverNav, setHoverNav] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = ["Connect", "Services", "Committees", "Giving", "Events", "News"]

  const menuData = {
    Connect: ["Alumnae Resources", "Featured Alumni", "Affinity Programs", "Professional Alliances", "Regional Networks", "Alumni Programs", "Volunteer Leadership", "Young Alumni", "Class Correspondence"],
    Services: ["Alumni Extras", "Order a Transcript", "Vistex Online Courses", "Epitome Yearbook"],
    Committees: ["Executive Committee", "Advisory Committee"],
    Giving: ["IET Lucknow Fund", "Parents' Council", "Recognition Societies", "Planned Giving", "Matching Gift", "Partnerships", "Giving Day + March Mania"],
    Events: ["Reunion", "Family Weekend", "Founder's Weekend", "The Rally", "IET Rivalry Telecasts"],
    News: ["IET Lucknow News", "Alumni News Archive"]
  }

  const clickableItems = [
    "Featured Alumni", 
    "Alumnae Resources", 
    "Affinity Programs", 
    "Executive Committee", 
    "Advisory Committee"
  ];

  // LOGIC: Maps links to /committee/executive-committee, etc.
  const getRoute = (link) => {
    const slug = link.toLowerCase().replace(/\s+/g, '-');
    
    const connectLinks = ["Featured Alumni", "Alumnae Resources", "Affinity Programs"];
    if (connectLinks.includes(link)) {
      return `/connect/${slug}`;
    }
    
    const committeeLinks = ["Executive Committee", "Advisory Committee"];
    if (committeeLinks.includes(link)) {
      return `/committee/${slug}`;
    }
    
    return `/${slug}`;
  };

  const isLightMode = open || (hoverNav && active !== null);

  const handleLoginClick = () => {
    router.push('/login');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]">
      
      {/* TOP UTILITY BAR */}
      <div className={`hidden md:block bg-white text-blue-600 text-[14px] transition-all duration-500 ease-in-out overflow-hidden ${scrolled ? "max-h-0 opacity-0" : "max-h-35 py-2 opacity-100"}`}>
        <div className="max-w-[1600px] mx-auto px-12 flex justify-end gap-6 font-bold uppercase tracking-widest">
          <button onClick={handleLoginClick} className="hover:text-blue-900 transition-colors cursor-pointer text-[12px]">LOGIN</button>
          <button className="flex gap-1 items-center hover:text-blue-900 transition-colors text-[12px]">
            <Gift size={14} /> MAKE A GIFT
          </button>
          <button className="hover:text-blue-900 transition-colors text-[12px]">CONTACT US</button>
          <Search size={16} className="cursor-pointer hover:text-blue-900" />
        </div>
      </div>

      <nav
        onMouseEnter={() => { if (typeof window !== 'undefined' && window.innerWidth >= 1024) setHoverNav(true) }}
        onMouseLeave={() => { 
            setHoverNav(false); 
            setActive(null); 
        }}
        className={`transition-all duration-500 shadow-xl ${
          isLightMode ? "bg-white text-black" : "bg-[#951114] text-white"
        } ${scrolled ? "py-1" : "py-2"}`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex justify-between items-center">
          
          {/* LOGO */}
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

            <div style={{ fontFamily: "Playfair Display" }} className={`leading-tight transition-all duration-500 flex flex-col justify-center ${isLightMode ? "text-[#951114]" : "text-white"}`}>
              <div className={`font-bold transition-all duration-500 whitespace-nowrap ${scrolled ? "text-base md:text-xl" : "text-lg md:text-3xl"}`}>
                IET LUCKNOW
              </div>
              <div className={`font-medium transition-all duration-500 ${scrolled ? "text-[10px] md:text-xs" : "text-xs md:text-xl"}`}>
                Alumni
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="flex items-center gap-4">
            <ul className="hidden lg:flex gap-8 transition-all duration-500">
              {navItems.map((item, i) => (
                <li
                  key={i}
                  onMouseEnter={() => setActive(i)}
                  className={`cursor-pointer flex items-center gap-1 transition-all duration-300 font-bold uppercase tracking-wide
                  ${scrolled ? "text-sm" : "text-base"}
                  ${active === i ? "text-blue-700" : isLightMode ? "hover:text-blue-700" : "hover:text-gray-300"}`}
                >
                  {item}
                  <ChevronDown size={scrolled ? 14 : 18} className={`transition-transform duration-300 ${active === i ? "rotate-180" : ""}`} />
                </li>
              ))}
            </ul>

            <button className="lg:hidden p-2" onClick={() => { setOpen(!open); if(open) setMobileOpen(null); setHoverNav(false); }}>
              {open ? <X size={scrolled ? 24 : 30} /> : <Menu size={scrolled ? 24 : 30} />}
            </button>
          </div>
        </div>

        {/* MOBILE PANEL */}
        <div className={`lg:hidden fixed left-0 w-full transition-all duration-500 ease-in-out z-40 overflow-y-auto ${open ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible"} ${isLightMode ? "bg-white text-black" : "bg-[#951114] text-white"}`}
          style={{ top: scrolled ? "56px" : "84px", height: scrolled ? "calc(100vh - 56px)" : "calc(100vh - 84px)" }}>
          <div className="px-6 py-6 space-y-1 pb-24">
            {navItems.map((item, i) => (
              <div key={i} className={`border-b ${isLightMode ? "border-gray-100" : "border-white/10"}`}>
                <button onClick={() => setMobileOpen(mobileOpen === i ? null : i)} className="w-full flex justify-between items-center py-4 text-base font-bold uppercase">
                  {item} {mobileOpen === i ? <Minus size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${mobileOpen === i ? "max-h-[800px] pb-4" : "max-h-0"}`}>
                  <ul className="space-y-3 pl-4 border-l-2 border-blue-500/30 ml-1">
                    {menuData[item].map((link, idx) => (
                      <li key={idx} className={`text-sm font-medium opacity-80 ${isLightMode ? "text-gray-600" : "text-gray-200"}`}>
                        {clickableItems.includes(link) ? (
                          <Link href={getRoute(link)} onClick={() => setOpen(false)} className="hover:text-blue-500 transition-colors">
                            {link}
                          </Link>
                        ) : ( link )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP DROPDOWN */}
        {active !== null && !open && (
          <div className="absolute left-0 w-full bg-white text-black shadow-2xl border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-w-[1600px] mx-auto px-12 py-8">
               <div className="mb-4 flex items-center gap-3 group w-fit">
                  <div className="text-xl font-bold text-[#951114] uppercase tracking-tight">{navItems[active]}</div>
                  <ArrowRight size={20} className="text-[#951114]" />
               </div>
               <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                  {menuData[navItems[active]].map((link, idx) => (
                    <div key={idx} className="text-base cursor-pointer font-medium transition-colors">
                      {clickableItems.includes(link) ? (
                        <Link href={getRoute(link)} className="text-gray-700 hover:text-[#951114]">
                          {link}
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