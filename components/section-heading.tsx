import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
  actions?: React.ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  actions,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-lg shadow-black/5 backdrop-blur sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
