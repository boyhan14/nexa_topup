"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/components/ui/primitives";

type MagneticCTAProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function MagneticCTA({ href, children, variant = "primary", className }: MagneticCTAProps) {
  const [canMagnetize, setCanMagnetize] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setCanMagnetize(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function move(event: MouseEvent<HTMLAnchorElement>) {
    if (!canMagnetize) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    event.currentTarget.style.setProperty("--magnet-x", `${x}px`);
    event.currentTarget.style.setProperty("--magnet-y", `${y}px`);
  }

  function reset(event: MouseEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--magnet-x", "0px");
    event.currentTarget.style.setProperty("--magnet-y", "0px");
  }

  return (
    <Link
      href={href}
      onMouseMove={move}
      onMouseLeave={reset}
      className={cn("button magnetic-cta", variant === "secondary" && "button-secondary", className)}
      style={{ "--magnet-x": "0px", "--magnet-y": "0px" } as CSSProperties}
    >
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}
