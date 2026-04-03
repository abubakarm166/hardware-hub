import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90",
  secondary:
    "rounded-full border border-border bg-white px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent-soft",
  ghost: "text-sm font-medium text-foreground underline-offset-4 hover:underline",
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`inline-flex items-center justify-center ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
