import { Link, NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "./auth";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
    isActive
      ? "bg-torkuGreen-700 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  ].join(" ");
}

export function AdminLayout() {
  const location = useLocation();
  const token = getAdminToken();

  const isLogin = location.pathname.endsWith("/admin/login");
  if (!token && !isLogin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-torkuGreen-700 text-sm font-bold text-white">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Admin Panel</h1>
              <p className="text-xs text-slate-500">Torku Reklam Yönetim Sistemi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Siteyi Gör
            </Link>
            {token && (
              <button
                type="button"
                onClick={() => {
                  clearAdminToken();
                  window.location.href = "/admin/login";
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                Çıkış Yap
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:self-start lg:sticky lg:top-8">
            <nav className="flex flex-col gap-1">
              <NavLink to="/admin/products" className={navClass} end>
                <span>📦</span> Ürünler
              </NavLink>
              <NavLink to="/admin/admins" className={navClass}>
                <span>👤</span> Adminler
              </NavLink>
            </nav>
          </aside>

          {/* Content */}
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
