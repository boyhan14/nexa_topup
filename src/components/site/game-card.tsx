import Link from "next/link";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import { cn, Badge } from "@/components/ui/primitives";

type GameCardProps = {
  href: string;
  name: string;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  priceLabel: string;
  index?: number;
};

const gradients = [
  "from-cyan-400/95 via-sky-500/95 to-blue-700/95",
  "from-blue-400/95 via-indigo-500/95 to-cyan-500/90",
  "from-slate-500/95 via-blue-600/95 to-cyan-500/90",
  "from-cyan-500/95 via-teal-500/90 to-blue-700/95",
];

export function GameCard({ href, name, description, category, imageUrl, priceLabel, index = 0 }: GameCardProps) {
  return (
    <Link href={href} className="game-card group premium-card relative isolate overflow-hidden rounded-[1.35rem]">
      <div
        className={cn("game-card-visual relative h-36 overflow-hidden bg-gradient-to-br transition duration-500 group-hover:scale-[1.03] sm:h-44", gradients[index % gradients.length])}
        style={
          imageUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(5,8,22,.08), rgba(5,8,22,.84)), url(${imageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : undefined
        }
      >
        <div className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur">
          <Gamepad2 size={20} />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-white">{name}</h3>
            <p className="mt-1 text-sm font-semibold text-cyan-200">{priceLabel}</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 translate-y-1 place-items-center rounded-full border border-white/10 bg-white/5 text-cyan-200 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={17} />
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Badge tone="neutral">{category ?? "Game"}</Badge>
          {description ? <p className="max-w-[9rem] truncate text-right text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
    </Link>
  );
}
