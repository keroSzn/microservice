import { useEffect, useMemo, useState } from "react";
import { api, type Product } from "../../lib/api";
import { ProductCard } from "../components/ProductCard";

export function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .listNewProducts(true)
      .then((p) => {
        if (!alive) return;
        setProducts(p);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Bilinmeyen hata");
      });
    return () => {
      alive = false;
    };
  }, []);

  const featured = useMemo(() => products?.[0] ?? null, [products]);

  return (
    <div>
      <section className="bg-gradient-to-b from-torkuGreen-800 to-torkuGreen-700">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center">
          <div className="text-white">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              Yeni çıkan ürünler & reklam filmleri
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Ürünleri keşfedin, reklamları izleyin.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Torku’nun yeni ürünlerini tek sayfada görün. Ürün detayına girip
              tanıtım videolarını doğrudan siteden izleyin.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#urunler"
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-torkuGreen-800 hover:bg-white/90"
              >
                Ürünleri gör
              </a>
              <a
                href={featured ? `/products/${featured.slug}` : "#"}
                className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                Öne çıkan ürün
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-3 shadow-sm">
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              {featured ? (
                <div className="grid h-full place-items-center px-6 text-center text-white/80">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/60">
                      Öne çıkan
                    </div>
                    <div className="mt-2 text-lg font-bold">{featured.name}</div>
                    <div className="mt-2 text-sm text-white/70">
                      Detay sayfasında reklam videosunu izleyebilirsiniz.
                    </div>
                    <a
                      className="mt-4 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-semibold text-torkuGreen-800 hover:bg-white/90"
                      href={`/products/${featured.slug}`}
                    >
                      Detaya git
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid h-full place-items-center text-sm text-white/70">
                  {error ? "API hatası" : "Yükleniyor..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="urunler" className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Ürünlerimizi keşfedin
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Yeni ürünler listesi API’den canlı gelir.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {products ? `${products.length} ürün` : "…"}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border bg-white p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!products ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl border bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section id="reklamlar" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-xl font-black tracking-tight">Reklam filmlerimiz</h2>
          <p className="mt-1 text-sm text-slate-600">
            Her ürünün detay sayfasında reklam videosu oynatılır.
          </p>
        </div>
      </section>
    </div>
  );
}

