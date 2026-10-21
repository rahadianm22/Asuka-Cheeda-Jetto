// Inline stroke/fill icons for the karaoke player (no emoji, no icon library).
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 20, children, fill }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...(fill ? { fill: 'currentColor' } : stroke)}>
      {children}
    </svg>
  );
}

export const PlayIcon = (p) => (
  <Svg fill {...p}>
    <path d="M8 5v14l11-7z" />
  </Svg>
);
export const PauseIcon = (p) => (
  <Svg fill {...p}>
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </Svg>
);
export const PrevIcon = (p) => (
  <Svg fill {...p}>
    <path d="M6 5h2v14H6zM20 5v14L9 12z" />
  </Svg>
);
export const NextIcon = (p) => (
  <Svg fill {...p}>
    <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
  </Svg>
);
export const ShuffleIcon = (p) => (
  <Svg {...p}>
    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </Svg>
);
export const RepeatIcon = (p) => (
  <Svg {...p}>
    <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
  </Svg>
);
export const VolumeIcon = (p) => (
  <Svg {...p}>
    <path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </Svg>
);
export const KebabIcon = (p) => (
  <Svg fill {...p}>
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </Svg>
);
export const GripIcon = (p) => (
  <Svg fill {...p}>
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </Svg>
);
export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const QueueIcon = (p) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </Svg>
);
export const YoutubeIcon = (p) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="m10 9 5 3-5 3z" />
  </Svg>
);
export const PlayNextIcon = (p) => (
  <Svg {...p}>
    <path d="M3 6h12M3 12h12M3 18h7M16 15l5 3-5 3z" />
  </Svg>
);
export const QueueAddIcon = (p) => (
  <Svg {...p}>
    <path d="M3 6h14M3 12h14M3 18h8M18 15v6M15 18h6" />
  </Svg>
);
export const BookmarkIcon = (p) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </Svg>
);
export const ShareIcon = (p) => (
  <Svg {...p}>
    <path d="M4 12v8h16v-8M12 3v12M7 8l5-5 5 5" />
  </Svg>
);
export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);
export const PencilIcon = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
  </Svg>
);
export const BackIcon = (p) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export function PawIcon({ size = 40, color = 'var(--lav)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" focusable="false">
      <ellipse cx="6" cy="9" rx="2.2" ry="2.8" />
      <ellipse cx="10" cy="5.5" rx="2.2" ry="2.8" />
      <ellipse cx="14" cy="5.5" rx="2.2" ry="2.8" />
      <ellipse cx="18" cy="9" rx="2.2" ry="2.8" />
      <path d="M12 11c-3.5 0-6.5 4-6.5 6.5 0 2 1.6 3 3.3 3 1.3 0 2-.7 3.2-.7s1.9.7 3.2.7c1.7 0 3.3-1 3.3-3C18.5 15 15.5 11 12 11z" />
    </svg>
  );
}
