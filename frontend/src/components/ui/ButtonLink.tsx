import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "brand" | "onDark";

const styles: Record<Variant, string> = {
  primary:
    "rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90",
  brand:
    "rounded-full bg-brand px-6 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95",
  secondary:
    "rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50",
  onDark:
    "rounded-full border border-white/40 bg-white/5 px-6 py-3 text-sm font-medium text-white shadow-sm backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/10",
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
