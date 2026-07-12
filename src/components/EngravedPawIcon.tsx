type EngravedPawIconProps = {
  className?: string;
  title?: string;
};

export default function EngravedPawIcon({
  className = "w-4 h-4",
  title,
}: EngravedPawIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}

      <path d="M6.15 9.2C4.9 9.2 4.05 8.05 4.05 6.62C4.05 5.18 4.84 4.08 6.1 4.08C7.4 4.08 8.18 5.24 8.18 6.67C8.18 8.08 7.39 9.2 6.15 9.2Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.18 7.4C8.93 7.4 8.12 6.2 8.12 4.78C8.12 3.35 8.91 2.25 10.2 2.25C11.48 2.25 12.28 3.42 12.28 4.84C12.28 6.25 11.46 7.4 10.18 7.4Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 7.4C13.22 7.4 12.4 6.25 12.4 4.84C12.4 3.42 13.2 2.25 14.48 2.25C15.77 2.25 16.56 3.35 16.56 4.78C16.56 6.2 15.75 7.4 14.5 7.4Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.22 9.2C16.98 9.2 16.19 8.08 16.19 6.67C16.19 5.24 16.97 4.08 18.27 4.08C19.53 4.08 20.32 5.18 20.32 6.62C20.32 8.05 19.47 9.2 18.22 9.2Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.2 9.3C9.78 9.3 7.12 11.35 6.12 13.82C5.24 16.03 5.9 18.76 8.08 19.97C9.92 20.98 11 19.82 12.2 19.82C13.4 19.82 14.48 20.98 16.31 19.97C18.49 18.76 19.16 16.03 18.27 13.82C17.28 11.35 14.62 9.3 12.2 9.3Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.95 15.42C9.86 14.43 10.95 13.9 12.18 13.9C13.42 13.9 14.51 14.43 15.42 15.42" stroke="currentColor" strokeWidth="0.72" strokeLinecap="round" opacity="0.58" />
      <path d="M10.02 17.24C10.72 16.74 11.45 16.5 12.19 16.5C12.94 16.5 13.68 16.74 14.37 17.24" stroke="currentColor" strokeWidth="0.62" strokeLinecap="round" opacity="0.42" />
      <path d="M7.45 14.1C8.38 12.18 10.23 10.7 12.2 10.7C14.17 10.7 16.01 12.18 16.95 14.1" stroke="currentColor" strokeWidth="0.48" strokeLinecap="round" strokeDasharray="1.15 1.15" opacity="0.34" />
    </svg>
  );
}
