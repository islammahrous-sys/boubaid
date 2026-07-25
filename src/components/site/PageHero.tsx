import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-ivory">
      {image ? (
        <div className="absolute inset-0">
          <img src={image} alt="" className="h-full w-full object-cover opacity-30" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/85 to-navy" />
        </div>
      ) : null}
      <div className="container-page relative py-20 md:py-28">
        {eyebrow ? (
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-lg text-ivory/80 md:text-xl">{subtitle}</p>
        ) : null}
        <div className="gold-divider mt-8 w-24" />
      </div>
    </section>
  );
}
