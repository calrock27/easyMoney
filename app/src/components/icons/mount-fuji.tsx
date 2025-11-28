import * as React from "react"

export function MountFuji(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Sun/Moon */}
            <circle cx="12" cy="6" r="3" />
            {/* Mountain peak */}
            <path d="M8 10 L12 4 L16 10" />
            {/* Mountain body */}
            <path d="M4 16 L8 10 L12 14 L16 10 L20 16" />
            {/* Base lines */}
            <line x1="4" y1="18" x2="9" y2="18" />
            <line x1="11" y1="18" x2="20" y2="18" />
            <line x1="6" y1="20" x2="18" y2="20" />
        </svg>
    )
}
