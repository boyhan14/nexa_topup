"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/components/ui/primitives";

type PromoBanner = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  targetPath: string;
  sortOrder: number;
};

export default function PromoBannerCarousel({ banners }: { banners: PromoBanner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [pointerStart, setPointerStart] = useState<number | null>(null);
  const swiped = useRef(false);
  const hasMultiple = banners.length > 1;

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!hasMultiple || paused || reduceMotion) return;
    const timer = window.setInterval(() => goTo(activeIndex + 1), 6500);
    return () => window.clearInterval(timer);
  }, [activeIndex, goTo, hasMultiple, paused, reduceMotion]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!hasMultiple) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (pointerStart === null || !hasMultiple) return;
    const distance = event.clientX - pointerStart;
    setPointerStart(null);
    if (Math.abs(distance) < 48) return;
    swiped.current = true;
    goTo(distance < 0 ? activeIndex + 1 : activeIndex - 1);
  }

  return (
    <section
      className="promo-carousel reveal relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promo Nexa Topup"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onPointerDown={(event) => setPointerStart(event.clientX)}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setPointerStart(null)}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#0b1830] shadow-2xl shadow-cyan-950/20 sm:aspect-[21/8] lg:aspect-[21/7]">
        {banners.map((banner, index) => {
          const isActive = activeIndex === index;
          const failed = failedImages[banner.id];
          return (
            <Link
              key={banner.id}
              href={banner.targetPath}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={(event) => {
                if (!swiped.current) return;
                event.preventDefault();
                swiped.current = false;
              }}
              className={cn("group absolute inset-0 transition-[opacity,transform] duration-500 ease-out", isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0")}
            >
              {failed ? (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(0,217,255,.28),transparent_35%),linear-gradient(125deg,#111d36,#071122)]" />
              ) : (
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 92vw, 1280px"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                  onError={() => setFailedImages((current) => ({ ...current, [banner.id]: true }))}
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,12,29,.93)_0%,rgba(3,12,29,.68)_42%,rgba(3,12,29,.18)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(0deg,rgba(3,12,29,.72),transparent)]" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                <p className="text-xs font-black uppercase text-cyan-200">Promo terbatas</p>
                <h2 className="mt-2 max-w-2xl text-2xl font-black leading-tight text-white sm:text-4xl">{banner.title}</h2>
                {banner.description ? <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">{banner.description}</p> : null}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition group-hover:gap-3">
                  Lihat promo <ChevronRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMultiple ? (
        <>
          <div className="absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 justify-between sm:inset-x-5">
            <button type="button" onClick={() => goTo(activeIndex - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-[#050816]/60 text-white backdrop-blur transition hover:border-cyan-200/60 hover:text-cyan-100" aria-label="Promo sebelumnya">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => goTo(activeIndex + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-[#050816]/60 text-white backdrop-blur transition hover:border-cyan-200/60 hover:text-cyan-100" aria-label="Promo berikutnya">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 sm:bottom-6 sm:right-6">
            {banners.map((banner, index) => (
              <button
                type="button"
                key={banner.id}
                onClick={() => goTo(index)}
                className={cn("h-2.5 rounded-full transition", index === activeIndex ? "w-7 bg-cyan-200" : "w-2.5 bg-white/45 hover:bg-white/75")}
                aria-label={`Tampilkan promo ${index + 1}: ${banner.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
