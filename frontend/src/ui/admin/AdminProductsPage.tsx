import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../lib/api";
import { imageUrl } from "../../lib/api";
import { adminApi } from "../../lib/adminApi";
import { getAdminToken } from "./auth";

export function AdminProductsPage() {
  const token = getAdminToken()!;
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setError(null);
    const list = await adminApi.listProducts(token);
    setItems(list);
  };

  useEffect(() => {
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Hata"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canCreate = useMemo(() => name.trim().length >= 2, [name]);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setName("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setIsNew(true);
    setCreating(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ürün Yönetimi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ürün ekleyin, düzenleyin ve reklam videolarını yönetin.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-torkuGreen-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-torkuGreen-800 active:scale-[0.98]"
          onClick={() => {
            if (creating) resetForm();
            else setCreating(true);
          }}
        >
          {creating ? (
            <>
              <span className="text-lg leading-none">&times;</span> Kapat
            </>
          ) : (
            <>
              <span className="text-lg leading-none">+</span> Yeni Ürün
            </>
          )}
        </button>
      </div>

      {creating && (
        <div className="rounded-2xl border border-torkuGreen-200 bg-torkuGreen-50/40 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-torkuGreen-800">Yeni Ürün Oluştur</h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Ürün Adı <span className="text-red-500">*</span>
              </span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-torkuGreen-500 focus:ring-2 focus:ring-torkuGreen-500/20"
                placeholder="Örn: Torku Banada"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">Kapak Fotoğrafı</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-torkuGreen-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-torkuGreen-700 hover:file:bg-torkuGreen-200"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Önizleme"
                className="h-32 w-auto rounded-xl border object-cover"
              />
            </div>
          )}

          <label className="mt-4 inline-flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-torkuGreen-600 focus:ring-torkuGreen-500"
            />
            Yeni ürün olarak göster
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canCreate || submitting}
              className="rounded-xl bg-torkuGreen-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-torkuGreen-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={async () => {
                try {
                  setError(null);
                  setSubmitting(true);
                  const product = await adminApi.createProduct(token, {
                    name,
                    is_new: isNew,
                  });
                  if (imageFile) {
                    await adminApi.uploadProductImage(token, product.id, imageFile);
                  }
                  resetForm();
                  await load();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Ürün oluşturma hatası");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Oluşturuluyor..." : "Oluştur"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={resetForm}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="text-lg">!</span>
          <span>{error}</span>
        </div>
      )}

      {!items ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border bg-white" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <div className="text-3xl">📦</div>
          <p className="mt-3 text-sm font-semibold text-slate-700">Henüz ürün eklenmedi</p>
          <p className="mt-1 text-xs text-slate-500">
            Yukarıdaki "Yeni Ürün" butonuyla ilk ürününüzü ekleyin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-torkuGreen-300 hover:shadow-md"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {p.image_url ? (
                  <img
                    src={imageUrl(p.image_url)}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg text-slate-400">
                    📷
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-slate-900">{p.name}</span>
                  {p.is_new && (
                    <span className="rounded-full bg-torkuGreen-100 px-2 py-0.5 text-[10px] font-bold text-torkuGreen-700">
                      YENİ
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  ID: {p.id} &middot; {new Date(p.created_at).toLocaleDateString("tr-TR")}
                </div>
              </div>

              <Link
                to={`/admin/products/${p.id}`}
                className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                Yönet →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
