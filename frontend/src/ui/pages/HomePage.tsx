import { useEffect, useState } from "react";
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

  const heroImage = "/assets/torku1.jpg";
  const heroLogo = "/assets/main-logo.png";

  const scrollToProducts = () => {
    const el = document.getElementById("urunler");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <section
        className="relative min-h-[100svh] overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          filter: "brightness(1.08) saturate(1.06)"
        }}
      >
        <div className="absolute inset-0 bg-black/18" />
        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 text-center">
          <img
            src={heroLogo}
            alt="Torku"
            className="-mt-20 w-[190px] max-w-[55vw] drop-shadow-[0_8px_30px_rgba(0,0,0,0.55)] sm:-mt-24 sm:w-[240px]"
          />
          <p className="mt-6 text-2xl font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-4xl">
            Bereketi Toprağından
          </p>
          <button
            type="button"
            onClick={scrollToProducts}
            className="group mt-16 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
            aria-label="Aşağı kaydır"
          >
            <span className="text-2xl transition-transform group-hover:translate-y-1">
              ↓
            </span>
          </button>
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
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

