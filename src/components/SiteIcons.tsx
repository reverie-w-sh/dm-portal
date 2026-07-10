type IconProps = {
  className?: string;
};

const commonProps = {
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const accent = "#56A8E8";

export function MapIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path
        d="M7 13.5 22 8l20 6 15-5.5v42L42 56 22 50 7 55.5v-42Z"
        {...strokeProps}
      />

      <path d="M22 8v42M42 14v42" {...strokeProps} />

      <path
        d="m13 38 7-7 6 4 7-11 8 6 10-9"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="13" cy="38" r="2.8" fill={accent} />
      <circle cx="51" cy="21" r="2.8" fill={accent} />
    </svg>
  );
}

export function SmilesCollectionIcon({
  className,
}: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <rect
        x="7"
        y="10"
        width="50"
        height="44"
        rx="9"
        {...strokeProps}
      />

      <path d="M7 22h50" {...strokeProps} />

      <circle cx="18" cy="16" r="1.7" fill={accent} />
      <circle cx="24" cy="16" r="1.7" fill={accent} />

      <circle cx="21" cy="36" r="8" {...strokeProps} />
      <circle cx="43" cy="36" r="8" {...strokeProps} />

      <path d="M18 34h.1M24 34h.1" {...strokeProps} />
      <path d="M18 39c2 2 4 2 6 0" {...strokeProps} />

      <path d="M40 34h.1M46 34h.1" {...strokeProps} />

      <path
        d="M40 39c2-2 4-2 6 0"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <path
        d="M31 26v20"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".7"
      />
    </svg>
  );
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <rect
        x="9"
        y="25"
        width="46"
        height="30"
        rx="5"
        {...strokeProps}
      />

      <path d="M7 19h50v11H7z" {...strokeProps} />
      <path d="M32 19v36" {...strokeProps} />

      <path
        d="M32 19c-8 0-13-3-13-8 0-3 2-5 5-5 5 0 8 7 8 13Z"
        {...strokeProps}
      />

      <path
        d="M32 19c8 0 13-3 13-8 0-3-2-5-5-5-5 0-8 7-8 13Z"
        {...strokeProps}
      />

      <path
        d="M32 19v36"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClanIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path
        d="M32 6 52 14v15c0 13-8 23-20 29C20 52 12 42 12 29V14L32 6Z"
        {...strokeProps}
      />

      <path
        d="m21 38 5-14 6 8 6-8 5 14"
        {...strokeProps}
      />

      <path
        d="M24 41h16"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="26" cy="24" r="2.5" fill={accent} />
      <circle cx="38" cy="24" r="2.5" fill={accent} />
    </svg>
  );
}

export function PlayersIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <circle cx="32" cy="20" r="9" {...strokeProps} />

      <path
        d="M16 53c1-11 7-18 16-18s15 7 16 18"
        {...strokeProps}
      />

      <circle cx="14" cy="25" r="6" {...strokeProps} />
      <circle cx="50" cy="25" r="6" {...strokeProps} />

      <path d="M4 50c1-8 5-13 11-13" {...strokeProps} />
      <path d="M60 50c-1-8-5-13-11-13" {...strokeProps} />

      <path
        d="M24 51h16"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HunterBoardIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* планшет */}
      <rect
        x="10"
        y="8"
        width="38"
        height="48"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.4"
      />

      {/* крепление */}
      <rect
        x="22"
        y="4"
        width="14"
        height="7"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2.4"
      />

      {/* сетка */}
      <path
        d="M22 20V44M34 20V44M10 20H48M10 32H48M10 44H48"
        stroke="#67B7FF"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* лапка */}
      <g transform="translate(25 26)">
        <circle cx="7" cy="9" r="3.2" fill="#67B7FF" />
        <circle cx="2.5" cy="4.5" r="1.3" fill="#67B7FF" />
        <circle cx="6" cy="2.3" r="1.3" fill="#67B7FF" />
        <circle cx="10" cy="2.3" r="1.3" fill="#67B7FF" />
        <circle cx="13.5" cy="4.5" r="1.3" fill="#67B7FF" />
      </g>

      {/* карандаш */}
      <path
        d="M50 46L58 54"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M47.5 48.5L50 46L58 54L55.5 56.5L47.5 48.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
