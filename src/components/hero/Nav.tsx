const NAV_LINKS = [
  // About section is commented out on the page for now - re-add
  // { label: "About", href: "#about" } here when it comes back.
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

        <div className="flex items-center gap-8">
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

          <a
            href="https://github.com/ssolh2906?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors duration-300 hover:text-denim-600"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-5 w-5 fill-current"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.08.78 2.18 0 1.57-.01 2.83-.01 3.22 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}
