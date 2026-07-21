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

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-semibold tracking-tight ${accentColor}`}>
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        <span className="text-2xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}
