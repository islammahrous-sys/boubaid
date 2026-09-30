import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaultSaudiAvatar from "@/assets/default-saudi-avatar-v3.jpg";

interface SaudiCulturalAvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const DEFAULT_SAUDI_AVATAR = defaultSaudiAvatar;

export function SaudiCulturalAvatar({
  src,
  alt = "عضو الأسرة",
  size = "md",
  className = "",
}: SaudiCulturalAvatarProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-20 h-20 text-lg",
    "2xl": "w-28 h-28 text-xl",
  };

  const [hasError, setHasError] = useState(false);

  // Reset error when the provided src prop changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  let resolvedSrc: string | null = null;
  if (src && typeof src === "string" && src.trim() !== "") {
    const trimmed = src.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/")
    ) {
      resolvedSrc = trimmed;
    } else if (trimmed.startsWith("site-media/")) {
      resolvedSrc = supabase.storage
        .from("site-media")
        .getPublicUrl(trimmed.replace(/^site-media\//, "")).data.publicUrl;
    } else {
      const cleanKey = trimmed.replace(/^avatars\//, "");
      resolvedSrc = supabase.storage.from("avatars").getPublicUrl(cleanKey).data.publicUrl;
    }
  }

  const finalSrc = !hasError && resolvedSrc ? resolvedSrc : DEFAULT_SAUDI_AVATAR;

  return (
    <div
      className={`relative shrink-0 rounded-2xl overflow-hidden border-2 border-gold/50 shadow-md bg-card ${sizeMap[size]} ${className}`}
      title={alt}
    >
      <img
        key={resolvedSrc || "default"}
        src={finalSrc}
        alt={alt}
        width={1024}
        height={1024}
        loading="lazy"
        className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
        onError={() => {
          if (!hasError && resolvedSrc) {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}
