export default function KpiCard({ title, value, sub, color = 'sky', icon }) {
  const colors = {
    sky: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    red: 'text-red-400 border-red-500/30 bg-red-500/10',
    yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    green: 'text-green-400 border-green-500/30 bg-green-500/10',
    teal: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
  };

  const colorClass = colors[color] || colors.sky;

  return (
    <div className={`rounded-2xl border p-5 ${colorClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
        </div>
        {icon ? <span className="text-2xl">{icon}</span> : null}
      </div>
    </div>
  );
}
