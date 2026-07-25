import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "start" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-start"}>
      {eyebrow ? (
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-3xl font-semibold text-navy md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      ) : null}
      <div className={`gold-divider mt-6 w-24 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
