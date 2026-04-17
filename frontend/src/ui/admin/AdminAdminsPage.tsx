import { useEffect, useMemo, useState } from "react";
import { adminApi, type AdminUser } from "../../lib/adminApi";
import { getAdminToken } from "./auth";

export function AdminAdminsPage() {
  const token = getAdminToken()!;
  const [items, setItems] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setError(null);
    const list = await adminApi.listAdmins(token);
    setItems(list);
  };

  useEffect(() => {
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Hata"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length >= 6,
    [email, password]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Admin Yönetimi</h2>
        <p className="mt-1 text-sm text-slate-500">
          Yeni admin hesabı oluşturun ve mevcut adminleri görüntüleyin.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="text-xs font-semibold text-slate-700">E-posta</div>
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-torkuGreen-500 focus:ring-2 focus:ring-torkuGreen-500/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              placeholder="admin2@ornek.com"
            />
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-700">Şifre</div>
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-torkuGreen-500 focus:ring-2 focus:ring-torkuGreen-500/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="En az 6 karakter"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={!canSubmit || submitting}
            className="rounded-xl bg-torkuGreen-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-torkuGreen-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              try {
                await adminApi.createAdmin(token, { email, password });
                setEmail("");
                setPassword("");
                await load();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Admin oluşturulamadı");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? "Oluşturuluyor..." : "Admin Oluştur"}
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              setEmail("");
              setPassword("");
              setError(null);
            }}
          >
            Temizle
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Mevcut Adminler
            {items ? (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                {items.length}
              </span>
            ) : null}
          </h3>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => load().catch(() => {})}
          >
            Yenile
          </button>
        </div>

        {!items ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl border bg-white" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-600">
            Admin bulunamadı.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">E-posta</th>
                  <th className="px-4 py-3 font-semibold">Oluşturma</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(u.created_at).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

