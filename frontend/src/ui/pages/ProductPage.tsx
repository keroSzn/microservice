import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type ProductDetail, type Video } from "../../lib/api";
import { VideoPlayer } from "../components/VideoPlayer";

export function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setError(null);
    setProduct(null);
    api
      .getProduct(slug)
      .then((p) => {
        if (!alive) return;
        setProduct(p);
        setActiveVideoId(p.videos[0]?.id ?? null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Bilinmeyen hata");
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const activeVideo: Video | null = useMemo(() => {
    if (!product) return null;
    if (activeVideoId == null) return product.videos[0] ?? null;
    return product.videos.find((v) => v.id === activeVideoId) ?? null;
  }, [product, activeVideoId]);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-red-700">Hata</div>
          <div className="mt-2 text-sm text-slate-700">{error}</div>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Anasayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-72 animate-pulse rounded-2xl border bg-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm font-semibold text-torkuGreen-700">
            ← Ürünlere dön
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight">{product.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {product.description ?? "Bu ürün için tanıtım videosunu aşağıdan izleyebilirsiniz."}
          </p>
        </div>
        {product.is_new ? (
          <span className="rounded-full bg-torkuGreen-50 px-3 py-2 text-xs font-semibold text-torkuGreen-700">
            Yeni ürün
          </span>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activeVideo ? (
            <VideoPlayer video={activeVideo} posterUrl={product.image_url} />
          ) : (
            <div className="grid aspect-video place-items-center rounded-2xl border bg-white text-sm text-slate-600">
              Bu ürün için henüz video yüklenmemiş.
            </div>
          )}
        </div>

        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-black">Videolar</div>
          <div className="mt-3 space-y-2">
            {product.videos.length === 0 ? (
              <div className="text-sm text-slate-600">Video bulunamadı.</div>
            ) : (
              product.videos.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveVideoId(v.id)}
                  className={[
                    "w-full rounded-xl border px-3 py-3 text-left text-sm transition",
                    v.id === activeVideo?.id
                      ? "border-torkuGreen-300 bg-torkuGreen-50"
                      : "border-slate-200 hover:bg-slate-50"
                  ].join(" ")}
                >
                  <div className="font-semibold">{v.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{v.mime_type}</div>
                </button>
              ))
            )}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Video oynatma endpoint’i HTTP Range destekler; bu sayede ileri/geri sarma stabil çalışır.
          </div>
        </aside>
      </div>
    </div>
  );
}

