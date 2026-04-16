import { Link, Outlet, NavLink } from "react-router-dom";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "text-sm font-medium transition-colors",
    isActive ? "text-white" : "text-white/80 hover:text-white"
  ].join(" ");
}

export function RootLayout() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-torkuGreen-800/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 font-black">
              T
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Torku</div>
              <div className="text-xs text-white/75">Yeni Ürünler & Reklamlar</div>
            </div>
          </Link>

          <nav className="flex items-center gap-5">
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

