import { Link, Outlet, NavLink, useLocation } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "text-sm font-medium transition-colors",
    isActive ? "text-white" : "text-white/80 hover:text-white"
  ].join(" ");
}

export function RootLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const socials = [
    { name: "Facebook", href: "https://www.facebook.com/torku", Icon: FaFacebookF },
    { name: "X", href: "https://x.com/torku", Icon: FaXTwitter },
    {
      name: "YouTube",
      href: "https://www.youtube.com/channel/UCs9HUj8a1BApLcTVME4527w",
      Icon: FaYoutube
    },
    { name: "Instagram", href: "https://www.instagram.com/torku/", Icon: FaInstagram },
    { name: "TikTok", href: "https://www.tiktok.com/@torku_kurumsall", Icon: FaTiktok }
  ];

  return (
    <div className="min-h-dvh">
      <header
        className={[
          "top-0 z-30",
          isHome
            ? "absolute inset-x-0 border-b border-white/15 bg-black/15 backdrop-blur-sm"
            : "sticky border-b border-white/10 bg-torkuGreen-800/95 backdrop-blur"
        ].join(" ")}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/85 sm:text-xs">
            Torku Bir Çiftçi Kooperatifi Markasıdır
          </div>

          <nav className="flex items-center justify-center gap-5">
            <NavLink to="/" className={navClass} end>
              Anasayfa
            </NavLink>
            <a
              className="text-sm font-medium text-white/80 hover:text-white"
              href="#urunler"
            >
              Ürünler
            </a>
            <a
              className="text-sm font-medium text-white/80 hover:text-white"
              href="#reklamlar"
            >
              Reklamlar
            </a>
          </nav>

          <div className="flex items-center justify-end gap-2">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-black/20 text-white transition hover:-translate-y-0.5 hover:bg-black/40"
                title={social.name}
              >
                <social.Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Torku</div>
            <div className="text-slate-500">Tanıtım amaçlı demo uygulama</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

