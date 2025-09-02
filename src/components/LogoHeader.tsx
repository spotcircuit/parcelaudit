import Link from "next/link";

interface LogoHeaderProps {
  size?: "small" | "medium" | "large";
  opacity?: number;
}

export default function LogoHeader({ size = "large", opacity = 80 }: LogoHeaderProps) {
  const sizeClasses = {
    small: "h-32",
    medium: "h-48",
    large: "h-64"
  };

  return (
    <Link href="/" className="flex justify-center">
      <img 
        src="/images/logos/parcel-audit-logo.png" 
        alt="Parcel Audit Logo" 
        className={`${sizeClasses[size]} w-auto object-contain opacity-${opacity}`}
        style={{ opacity: opacity / 100 }}
      />
    </Link>
  );
}