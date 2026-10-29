import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

export const IconDashboard = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

export const IconOrders = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h6" />
  </svg>
);

export const IconBox = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96 12 12l8.73-5.04M12 22.08V12" />
  </svg>
);

export const IconPackage = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);

export const IconTag = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);

export const IconUsers = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconUserTag = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 11h-6" />
  </svg>
);

export const IconLogout = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const IconCheck = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconX = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconArrowLeft = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const IconAlert = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const IconInbox = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export const IconChevronLeft = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const IconChevronRight = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const IconEye = ({ size = 20, className, style }: IconProps) => (
  <svg {...base(size)} className={className} style={style}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
