type VisualPlaceholderProps = {
  label: string;
  className?: string;
  circle?: boolean;
};

export function VisualPlaceholder({ label, className = "", circle = false }: VisualPlaceholderProps) {
  return (
    <div className={`visual-placeholder ${circle ? "visual-placeholder--circle" : ""} ${className}`} aria-label={label}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
        <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="m4 17 5-5 3 3 2-2 6 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {label.trim() ? <span>{label}</span> : null}
    </div>
  );
}

export function QrMark() {
  return <span className="qr-mark" aria-hidden="true" />;
}
