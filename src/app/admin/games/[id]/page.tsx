import { notFound } from "next/navigation";
import { requireAdminArea } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { GameForm } from "../game-form";
import { updateGame } from "../actions";
export default async function EditGame({ params }: { params: Promise<{ id: string }> }) { await requireAdminArea("catalog"); const { id } = await params; const [game, categories] = await Promise.all([prisma.game.findUnique({ where: { id } }), prisma.gameCategory.findMany({ orderBy: { name: "asc" } })]); if (!game) notFound(); return <div><h1 className="text-3xl font-black">Edit game</h1><section className="mt-6 rounded-2xl border border-white/10 bg-[#101a31] p-5"><GameForm categories={categories} game={game} action={updateGame}/></section></div>; }
