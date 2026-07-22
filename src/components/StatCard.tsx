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
      ? "bg-success/20"
      : accent === "amber"
        ? "bg-warning/20"
        : accent === "red"
          ? "bg-danger/20"
          : "bg-accent/20";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:bg-card-hover">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${barColor} opacity-0 transition-opacity group-hover:opacity-100`}
      />
      <div className="flex items-start justify-between">
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
        <span className="text-2xl opacity-70 transition-transform group-hover:scale-110">
          {icon}
        </span>
      </div>
    </div>
  );
}
