import { cn } from "@/lib/utils"

type Variant = "bull" | "bear" | "neutral" | "primary" | "accent"

const styles: Record<Variant, string> = {
  bull: "bg-bull/15 text-bull border-bull/30",
  bear: "bg-bear/15 text-bear border-bear/30",
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/15 text-primary border-primary/30",
  accent: "bg-accent/15 text-accent border-accent/30",
}

export function Badge({
  variant,
  tone,
  className,
  children,
}: {
  variant?: Variant
  tone?: Variant
  className?: string
  children: React.ReactNode
}) {
  const v = tone ?? variant ?? "neutral"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[v],
        className,
      )}
    >
      {children}
    </span>
  )
}
