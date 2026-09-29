export default function Paw({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g fill="currentColor" transform="rotate(28 50 50)">
        <ellipse cx="30" cy="42" rx="9" ry="12" transform="rotate(-18 30 42)" />
        <ellipse cx="70" cy="42" rx="9" ry="12" transform="rotate(18 70 42)" />
        <ellipse cx="42" cy="26" rx="8" ry="11" transform="rotate(-8 42 26)" />
        <ellipse cx="58" cy="26" rx="8" ry="11" transform="rotate(8 58 26)" />
        <path d="M50 52c10 0 18 8 18 17 0 7-6 11-18 11s-18-4-18-11c0-9 8-17 18-17z" />
      </g>
    </svg>
  );
}
