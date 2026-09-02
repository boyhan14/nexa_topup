export default function AdminLoading() {
  return <div className="animate-pulse space-y-5"><div className="h-9 w-52 rounded bg-white/10" /><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-28 rounded-2xl bg-white/10" />)}</div><div className="h-72 rounded-2xl bg-white/10" /></div>;
}
