import { Link, NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "./auth";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2 text-sm font-semibold transition",
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm font-semibold text-torkuGreen-700">
            ← Siteye dön
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Admin Panel</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ürünleri ve reklam videolarını yönetin.
          </p>
        </div>
        {token ? (
          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              window.location.href = "/admin/login";
            }}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Çıkış yap
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <aside className="rounded-2xl border bg-white p-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            <NavLink to="/admin/products" className={navClass}>
              Ürünler
            </NavLink>
            <NavLink to="/admin/login" className={navClass}>
              Giriş
            </NavLink>
          </nav>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Video yükleme multipart + progress ile yapılır.
          </div>
        </aside>

        <section className="lg:col-span-3">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

