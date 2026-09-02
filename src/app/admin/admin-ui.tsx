"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}

export function AdminToast() {
  const params = useSearchParams();
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);
  const message = params.get("message");
  if (!message || dismissedMessage === message) return null;

  return (
    <div role="status" className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-950 px-4 py-3 text-sm text-emerald-100 shadow-2xl">
      <span>{message}</span>
      <button aria-label="Tutup" onClick={() => setDismissedMessage(message)} className="font-bold">
        x
      </button>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-400">{text}</div>;
}
