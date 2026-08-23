import React from "react";

interface SaudiCulturalAvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const DEFAULT_SAUDI_AVATAR = "/images/avatars/default-saudi-avatar.jpg";

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

  const imageSrc = src && src.trim() !== "" ? src : DEFAULT_SAUDI_AVATAR;

  return (
    <div
      className={`relative shrink-0 rounded-2xl overflow-hidden border-2 border-gold/50 shadow-md bg-card ${sizeMap[size]} ${className}`}
      title={alt}
    >
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          // Fallback to local default if remote fails
          const target = e.currentTarget;
          if (!target.src.includes("default-saudi-avatar.jpg")) {
            target.src = DEFAULT_SAUDI_AVATAR;
          }
        }}
      />
    </div>
  );
}

