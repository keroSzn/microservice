import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { type ProductDetail, imageUrl } from "../../lib/api";
import { adminApi } from "../../lib/adminApi";
import { getAdminToken } from "./auth";

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return null;
}

export function AdminProductDetailPage() {
  const token = getAdminToken()!;
  const { productId } = useParams();
  const numericId = Number(productId);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [videoTitle, setVideoTitle] = useState("Reklam");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const canAdd = useMemo(
    () => videoTitle.trim().length >= 1 && !!extractYoutubeId(youtubeUrl),
    [videoTitle, youtubeUrl]
  );

  const load = async () => {
    const detail = await adminApi.getProduct(token, numericId);
    setProduct(detail);
  };

  useEffect(() => {
    setError(null);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setError("Geçersiz ürün");
      return;
    }
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Hata"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-bold text-red-700">Hata</div>
        <div className="mt-2 text-sm text-slate-700">{error}</div>
        <Link
          to="/admin/products"
          className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          ← Ürünlere dön
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-2xl border bg-white" />
        <div className="h-48 animate-pulse rounded-2xl border bg-white" />
      </div>
    );
  }

  const previewId = extractYoutubeId(youtubeUrl);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      await adminApi.uploadProductImage(token, numericId, file);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Resim yükleme hatası");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Product image with upload overlay */}
          <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {product.image_url ? (
              <img
                src={imageUrl(product.image_url)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-slate-400">
                📷
              </div>
            )}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
            >
              {uploadingImage ? "..." : "Değiştir"}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f);
              }}
            />
          </div>

          <div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-torkuGreen-700 transition hover:text-torkuGreen-800"
            >
              ← Ürünlere dön
            </Link>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{product.name}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              ID: {product.id} &middot; {new Date(product.created_at).toLocaleDateString("tr-TR")}
              {product.is_new && (
                <span className="ml-2 rounded-full bg-torkuGreen-100 px-2 py-0.5 text-[10px] font-bold text-torkuGreen-700">
                  YENİ
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          onClick={async () => {
            if (!confirm("Bu ürünü ve tüm videolarını silmek istiyor musunuz?")) return;
            try {
              await adminApi.deleteProduct(token, numericId);
              window.location.href = "/admin/products";
            } catch (e) {
              alert(e instanceof Error ? e.message : "Silme hatası");
            }
          }}
        >
          Ürünü Sil
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Video Ekle */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">YouTube Video Ekle</h3>
          <p className="mt-1 text-xs text-slate-500">
            YouTube video linkini yapıştırın, otomatik olarak embed edilecek.
          </p>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">Video Başlığı</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-torkuGreen-500 focus:ring-2 focus:ring-torkuGreen-500/20"
                placeholder="Örn: Torku Banada Reklam Filmi"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                YouTube URL <span className="text-red-500">*</span>
              </span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-torkuGreen-500 focus:ring-2 focus:ring-torkuGreen-500/20"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              {youtubeUrl && !previewId && (
                <p className="mt-1.5 text-xs text-red-500">
                  Geçerli bir YouTube URL'si girin
                </p>
              )}
            </label>

            {previewId && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${previewId}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Önizleme"
                  />
                </div>
                <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Önizleme
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!canAdd || adding}
              className="w-full rounded-xl bg-torkuGreen-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-torkuGreen-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={async () => {
                setAdding(true);
                try {
                  await adminApi.addVideo(token, numericId, {
                    title: videoTitle,
                    youtube_url: youtubeUrl,
                  });
                  setYoutubeUrl("");
                  setVideoTitle("Reklam");
                  await load();
                } catch (e) {
                  alert(e instanceof Error ? e.message : "Video ekleme hatası");
                } finally {
                  setAdding(false);
                }
              }}
            >
              {adding ? "Ekleniyor..." : "Video Ekle"}
            </button>
          </div>
        </div>

        {/* Mevcut Videolar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">
            Mevcut Videolar
            {product.videos.length > 0 && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                {product.videos.length}
              </span>
            )}
          </h3>

          <div className="mt-4 space-y-3">
            {product.videos.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div className="text-2xl">🎬</div>
                <p className="mt-2 text-xs text-slate-500">
                  Henüz video eklenmedi
                </p>
              </div>
            ) : (
              product.videos.map((v) => {
                const vid = extractYoutubeId(v.youtube_url);
                return (
                  <div
                    key={v.id}
                    className="overflow-hidden rounded-xl border border-slate-200 transition hover:border-slate-300"
                  >
                    {vid && (
                      <div className="aspect-video bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${vid}`}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={v.title}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {v.title}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-500">
                          {v.youtube_url}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        onClick={async () => {
                          if (!confirm("Bu videoyu silmek istiyor musunuz?")) return;
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
