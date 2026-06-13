import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',       href: '#features',     external: true },
      { label: 'How It Works',   href: '#how-it-works', external: true },
      { label: 'Stories',        href: '#testimonials', external: true },
      { label: 'Get Started',    to: '/signup' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Log In',         to: '/login' },
      { label: 'Sign Up',        to: '/signup' },
      { label: 'Reset Password', to: '/forgot-password' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#', external: true },
      { label: 'Terms of Service', href: '#', external: true },
      { label: 'Cookie Policy',  href: '#', external: true },
    ],
  },
]

function Footer() {
  return (
    <footer className="bg-[#030110] border-t border-violet-500/10 pt-16">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="text-lg bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">✦</span>
            <span className="text-[18px] font-extrabold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              LifeMate
            </span>
          </Link>
          <p className="text-[#6B5E8A] text-sm leading-relaxed mb-6 max-w-[260px]">
            Your personal companion for a life well-lived. Build habits, reach goals, and transform every day.
          </p>
          <div className="flex gap-2">
            {['𝕏', 'ig', 'in'].map(icon => (
              <a key={icon} href="#"
                className="w-9 h-9 flex items-center justify-center bg-violet-500/8 border border-violet-500/15 rounded-lg text-violet-400 text-xs font-semibold hover:bg-violet-500/18 hover:border-violet-500/40 hover:text-violet-300 transition-all duration-200">
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link groups */}
        {FOOTER_LINKS.map(group => (
          <div key={group.heading} className="flex flex-col gap-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#E2D9F3] mb-1">
              {group.heading}
            </h4>
            {group.links.map(link =>
              link.to ? (
                <Link key={link.label} to={link.to}
                  className="text-[#6B5E8A] hover:text-violet-300 text-sm transition-colors duration-200">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href}
                  className="text-[#6B5E8A] hover:text-violet-300 text-sm transition-colors duration-200">
                  {link.label}
                </a>
              )
            )}
          </div>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-12 py-5 border-t border-violet-500/8">
        <p className="text-[#3D2F5A] text-xs text-center">
          © 2026 LifeMate. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
