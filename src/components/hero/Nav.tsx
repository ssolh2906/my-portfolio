const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
      <nav className="flex h-14 w-full max-w-5xl items-center justify-between rounded-full border border-slate-200/70 bg-white/70 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_40px_rgba(18,22,27,0.08)] backdrop-blur-xl sm:px-6">
        <a
          href="#home"
          className="text-sm font-semibold tracking-tight text-slate-900"
        >
          Solhee Tucker
        </a>

        <div className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors duration-300 hover:text-denim-600"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
