export default function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  accent?: "blue" | "green" | "amber" | "red";
}) {
  const accentColor =
    accent === "green"
      ? "text-success"
      : accent === "amber"
        ? "text-warning"
        : accent === "red"
          ? "text-danger"
          : "text-accent";

  const barColor =
    accent === "green"
      ? "bg-success"
      : accent === "amber"
        ? "bg-warning"
        : accent === "red"
          ? "bg-danger"
          : "bg-accent";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:bg-card-hover hover:shadow-lg hover:shadow-black/20">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${barColor} opacity-40 transition-opacity group-hover:opacity-80`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p
            className={`mt-1.5 text-2xl font-semibold tracking-tight tabular-nums ${accentColor}`}
          >
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-muted truncate">{sub}</p>
          )}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-xl transition-transform group-hover:scale-105">
          {icon}
        </span>
      </div>
    </div>
  );
}
