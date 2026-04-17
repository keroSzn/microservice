import { useEffect, useMemo, useRef, useState } from "react";
import { api, type Product } from "../../lib/api";
import { ProductCard } from "../components/ProductCard";

export function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .listNewProducts(true)
      .then((p) => {
        if (!alive) return;
        setProducts(p);
        setActiveIdx(0);
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

  const dotCount = useMemo(() => products?.length ?? 0, [products]);

  const syncActiveFromScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.children.item(0) as HTMLElement | null;
    if (!first) return;
    const gap = 20; // gap-5
    const step = first.offsetWidth + gap;
    if (step <= 0) return;
    const idx = Math.round(track.scrollLeft / step);
    setActiveIdx(Math.max(0, Math.min(idx, (products?.length ?? 1) - 1)));
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncActiveFromScroll);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const scrollToIndex = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const el = track.children.item(idx) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActiveIdx(idx);
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
          <div className="relative mt-6">
            <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 w-[78%] shrink-0 snap-start animate-pulse rounded-2xl border bg-white sm:w-[48%] lg:w-[calc((100%-40px)/3)]"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative mt-6">
            <div
              ref={trackRef}
              className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
            >
              {products.map((p) => (
                <div
                  key={p.id}
                  className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[calc((100%-40px)/3)]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {dotCount > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: dotCount }).map((_, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ürün ${i + 1}`}
                      onClick={() => scrollToIndex(i)}
                      className={[
                        "h-2.5 w-2.5 rounded-full transition",
                        isActive ? "bg-red-500" : "bg-slate-300 hover:bg-slate-400"
                      ].join(" ")}
                    />
                  );
                })}
              </div>
            ) : null}
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

