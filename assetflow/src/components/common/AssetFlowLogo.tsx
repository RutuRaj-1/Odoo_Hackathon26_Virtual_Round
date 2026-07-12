import React from 'react'

export function AssetFlowLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        fill="url(#sidebar-logo-grad)"
      />
      <path
        d="M2 17L12 22L22 17M2 12L12 17L22 12"
        stroke="url(#sidebar-logo-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="sidebar-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#714B67" />
          <stop offset="1" stopColor="#B36B9E" />
        </linearGradient>
      </defs>
    </svg>
  )
}
