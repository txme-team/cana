import Image from "next/image";

export type IllustIconName =
  | "under-construction"
  | "shining-profile"
  | "shocked"
  | "rose"
  | "rate-search"
  | "chat"
  | "ticket"
  | "diamond-blue"
  | "creditcard"
  | "calander"
  | "paper";

interface IllustIconProps {
  name: IllustIconName;
  size?: number;
  className?: string;
}

export default function IllustIcon({ name, size = 40, className = "" }: IllustIconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
    />
  );
}
