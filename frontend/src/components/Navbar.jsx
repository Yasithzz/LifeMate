import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const NAV_LINKS = [
  { href: '/#features',     label: 'Features'     },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#testimonials', label: 'Stories'       },
]

function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname)
  const solidBar = scrolled || isAuthPage

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${solidBar
        ? 'bg-[#050213]/92 backdrop-blur-2xl border-b border-violet-500/10 shadow-[0_4px_32px_rgba(0,0,0,0.5)] py-3'
        : 'bg-transparent py-5'}`}>

      <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <Sparkles size={16} className="text-violet-400" />
          <span className="text-[15px] font-bold text-white tracking-tight">LifeMate</span>
        </Link>

        {/* Desktop Nav Links — always visible so auth pages can navigate home */}
        <div className="hidden md:flex items-center gap-8 flex-1">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href}
              className="text-violet-300 hover:text-white text-[15px] font-medium transition-colors duration-200">
              {label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Link to="/login"
            className="text-violet-300 hover:text-white hover:bg-violet-500/10 text-[14px] font-medium px-4 py-2 rounded-lg transition-all duration-200">
            Log in
          </Link>
          <Link to="/signup"
            className="bg-gradient-to-r from-violet-600 to-pink-500 text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg
              shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_24px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-200">
            Get Started
          </Link>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex flex-col gap-[5px] p-1 ml-1" aria-label="Toggle menu">
            <span className={`block w-[22px] h-[2px] bg-violet-300 rounded transition-all duration-300
              ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-[22px] h-[2px] bg-violet-300 rounded transition-all duration-300
              ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-[22px] h-[2px] bg-violet-300 rounded transition-all duration-300
              ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#050213]/97 backdrop-blur-xl border-b border-violet-500/10 px-6 py-5 flex flex-col gap-5">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-violet-300 hover:text-white text-[15px] font-medium transition-colors">
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar
