import { useState } from "react";
import { Navigate } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";
import { getAdminToken, setAdminToken } from "./auth";

export function AdminLoginPage() {
  const existing = getAdminToken();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existing) return <Navigate to="/admin/products" replace />;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-black">Giriş</div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          try {
            const token = await adminApi.login(email, password);
            setAdminToken(token);
            window.location.href = "/admin/products";
          } catch (err) {
            // Güvenlik/UX: Login hatalarında detay vermeyelim (validasyon, uzunluk, vb.)
            setError("E-posta veya şifre hatalı.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <label className="block">
          <div className="text-xs font-semibold text-slate-700">E-posta</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-torkuGreen-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="block">
          <div className="text-xs font-semibold text-slate-700">Şifre</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-torkuGreen-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>

        <button
          className="w-full rounded-xl bg-torkuGreen-700 px-4 py-3 text-sm font-semibold text-white hover:bg-torkuGreen-800 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş yap"}
        </button>
      </form>
    </div>
  );
}

