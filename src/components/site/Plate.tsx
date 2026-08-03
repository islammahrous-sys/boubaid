import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A photograph presented as a plate: it resolves out of a paper-toned
 * ground rather than flashing in, so imagery arrives like ink drying
 * instead of like a browser loading.
 */
export function PlateImage({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      loading={props.loading ?? "lazy"}
      decoding="async"
      data-loaded={loaded ? "true" : "false"}
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
      onError={(e) => {
        // A failed plate should still be visible for its alt text.
        setLoaded(true);
        props.onError?.(e);
      }}
      className={cn("plate-img", className)}
    />
  );
}

/**
 * One caption treatment for every figure on the site: a hairline, a small
 * caps label, and the note itself. Consistency here is what makes a set of
 * images read as a plate section rather than as scattered pictures.
 */
export function PlateCaption({
  label,
  children,
  className,
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figcaption className={cn("mt-3 border-t border-border pt-2.5", className)}>
      {label ? <span className="label-caps block text-bronze">{label}</span> : null}
      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{children}</span>
    </figcaption>
  );
}
