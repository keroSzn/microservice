import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../lib/api";
import { adminApi } from "../../lib/adminApi";
import { getAdminToken } from "./auth";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminProductsPage() {
  const token = getAdminToken()!;
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isNew, setIsNew] = useState(true);

  const load = async () => {
    setError(null);
    const list = await adminApi.listProducts(token);
    setItems(list);
  };

  useEffect(() => {
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Hata"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canCreate = useMemo(() => name.trim().length >= 2 && slug.trim().length >= 2, [name, slug]);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black">Ürünler</div>
          <div className="mt-1 text-sm text-slate-600">
            Ürün oluşturun, düzenleyin ve videoları yönetin.
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={() => setCreating((v) => !v)}
        >
          {creating ? "Kapat" : "Yeni ürün"}
        </button>
      </div>

      {creating ? (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-xs font-semibold text-slate-700">Ürün adı</div>
              <input
                className="mt-1 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-torkuGreen-400"
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v);
                  if (!slug) setSlug(slugify(v));
                }}
              />
            </label>
            <label className="block">
              <div className="text-xs font-semibold text-slate-700">Slug</div>
              <input
                className="mt-1 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-torkuGreen-400"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
            />
            Yeni ürün olarak işaretle
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canCreate}
              className="rounded-xl bg-torkuGreen-700 px-4 py-3 text-sm font-semibold text-white hover:bg-torkuGreen-800 disabled:opacity-60"
              onClick={async () => {
                try {
                  setError(null);
                  await adminApi.createProduct(token, { name, slug, is_new: isNew });
                  setName("");
                  setSlug("");
                  setIsNew(true);
                  setCreating(false);
                  await load();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Ürün oluşturma hatası");
                }
              }}
            >
              Oluştur
            </button>
            <button
              type="button"
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setCreating(false);
                setName("");
                setSlug("");
                setIsNew(true);
              }}
            >
              İptal
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!items ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl border bg-slate-50" />
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-6 text-sm text-slate-600">
          Henüz ürün yok.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Ad</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Yeni</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.slug}</td>
                  <td className="px-4 py-3">
                    {p.is_new ? (
                      <span className="rounded-full bg-torkuGreen-50 px-2 py-1 text-xs font-semibold text-torkuGreen-700">
                        Evet
                      </span>
                    ) : (
                      <span className="text-slate-500">Hayır</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      to={`/admin/products/${p.id}`}
                      state={{ slug: p.slug, name: p.name }}
                    >
                      Yönet
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

