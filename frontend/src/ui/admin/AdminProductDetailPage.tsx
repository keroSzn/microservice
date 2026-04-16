import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { api, type ProductDetail } from "../../lib/api";
import { adminApi } from "../../lib/adminApi";
import { getAdminToken } from "./auth";

type LocationState = { slug?: string; name?: string } | null;

export function AdminProductDetailPage() {
  const token = getAdminToken()!;
  const { productId } = useParams();
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;

  const numericId = Number(productId);
  const slug = state?.slug;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("Reklam");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const canUpload = useMemo(() => !!file && title.trim().length >= 2, [file, title]);

  const load = async () => {
    if (!slug) return;
    const detail = await adminApi.getPublicProductBySlug(slug);
    setProduct(detail);
  };

  useEffect(() => {
    setError(null);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setError("Geçersiz ürün");
      return;
    }
    if (!slug) {
      setError("Bu sayfaya ürün listesinden gelin (slug gerekli).");
      return;
    }
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Hata"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId, slug]);

  if (error) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-black text-red-700">Hata</div>
        <div className="mt-2 text-sm text-slate-700">{error}</div>
        <Link
          to="/admin/products"
          className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Ürünlere dön
        </Link>
      </div>
    );
  }

  if (!product) {
    return <div className="h-48 animate-pulse rounded-2xl border bg-white" />;
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/products" className="text-sm font-semibold text-torkuGreen-700">
            ← Ürünler
          </Link>
          <div className="mt-2 text-xl font-black">{product.name}</div>
          <div className="mt-1 text-sm text-slate-600">Slug: {product.slug}</div>
        </div>
        <button
          type="button"
          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
          onClick={async () => {
            if (!confirm("Ürünü silmek istiyor musunuz?")) return;
            try {
              await adminApi.deleteProduct(token, numericId);
              window.location.href = "/admin/products";
            } catch (e) {
              alert(e instanceof Error ? e.message : "Silme hatası");
            }
          }}
        >
          Ürünü sil
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-sm font-black">Video yükle</div>
          <div className="mt-3 space-y-3">
            <label className="block">
              <div className="text-xs font-semibold text-slate-700">Başlık</div>
              <input
                className="mt-1 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-torkuGreen-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="block">
              <div className="text-xs font-semibold text-slate-700">Dosya (mp4/webm)</div>
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="mt-1 w-full rounded-xl border bg-white px-3 py-3 text-sm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              type="button"
              disabled={!canUpload || uploading}
              className="w-full rounded-xl bg-torkuGreen-700 px-4 py-3 text-sm font-semibold text-white hover:bg-torkuGreen-800 disabled:opacity-60"
              onClick={async () => {
                if (!file) return;
                setUploading(true);
                setProgress(0);
                try {
                  await adminApi.uploadVideo(token, numericId, title, file, setProgress);
                  setFile(null);
                  setTitle("Reklam");
                  await load();
                } catch (e) {
                  alert(e instanceof Error ? e.message : "Upload hatası");
                } finally {
                  setUploading(false);
                  setProgress(0);
                }
              }}
            >
              {uploading ? `Yükleniyor... %${progress}` : "Yükle"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-sm font-black">Videolar</div>
          <div className="mt-3 space-y-2">
            {product.videos.length === 0 ? (
              <div className="text-sm text-slate-600">Henüz video yok.</div>
            ) : (
              product.videos.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{v.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{v.mime_type}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      href={api.videoStreamUrl(v.id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Aç
                    </a>
                    <button
                      type="button"
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      onClick={async () => {
                        if (!confirm("Videoyu silmek istiyor musunuz?")) return;
                        try {
                          await adminApi.deleteVideo(token, v.id);
                          await load();
                        } catch (e) {
                          alert(e instanceof Error ? e.message : "Silme hatası");
                        }
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

