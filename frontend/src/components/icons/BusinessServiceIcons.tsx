import type { SVGProps } from "react";

const base = "h-9 w-9 shrink-0 text-brand";

export function IconOem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base} aria-hidden {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5V3M15 5V3M9 21v-2M15 21v-2M5 9H3M5 15H3M21 9h-2M21 15h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M10 15V9M12 15v-4M14 15v-2M16 15V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconOperator(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base} aria-hidden {...props}>
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
      <path
        d="M12 7v4M10 9h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 8c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4M8 8C6.5 9 5.5 10.5 5.5 12s1 3 2.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMvno(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base} aria-hidden {...props}>
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="4" r="1.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="12" cy="20" r="1.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="4" cy="12" r="1.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="20" cy="12" r="1.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="6.3" cy="6.3" r="1.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="17.7" cy="17.7" r="1.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="6.3" cy="17.7" r="1.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="17.7" cy="6.3" r="1.25" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function IconInsurer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base} aria-hidden {...props}>
      <path
        d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v8M9.5 10.5h2.25a1.25 1.25 0 0 1 0 2.5H11a1.25 1.25 0 0 0 0 2.5h2.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconDistributors(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base} aria-hidden {...props}>
      <path
        d="M4 10 12 5l8 5v9H4v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M16 14h3v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function IconBusinesses(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={base} aria-hidden {...props}>
      <ellipse cx="12" cy="14" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
