import React from "react";

export type MascotId = "evan" | "atlas" | "nico" | "nova" | "iris";

export interface MascotInfo {
  id: MascotId;
  name: string;
  role: string;
  colorName: string;
  shape: string;
  accentColor: string;
  description: string;
}

export const MASCOTS: Record<MascotId, MascotInfo> = {
  evan: {
    id: "evan",
    name: "Evan",
    role: "Meeting Prep",
    colorName: "Pastel Green",
    shape: "Pyramid",
    accentColor: "#4ade80",
    description: "Audits historical margins, flags loss-making deals, and drafts executive briefing notes before every client review.",
  },
  atlas: {
    id: "atlas",
    name: "Atlas",
    role: "CRM Manager",
    colorName: "Sky Blue",
    shape: "Sphere",
    accentColor: "#38bdf8",
    description: "Monitors ledger transaction feeds, alerts account executives when costs surge, and tracks portfolio health.",
  },
  nico: {
    id: "nico",
    name: "Nico",
    role: "Margin Auditor",
    colorName: "Teal",
    shape: "Cylinder",
    accentColor: "#2dd4bf",
    description: "Validates direct invoicing costs against contracted SLAs and pinpoints margin leakage across billing lines.",
  },
  nova: {
    id: "nova",
    name: "Nova",
    role: "Contract Pricing",
    colorName: "Butter Yellow",
    shape: "Pentagon",
    accentColor: "#facc15",
    description: "Calculates break-even contract rates and recommends healthy gross margin tiers for upcoming renewals.",
  },
  iris: {
    id: "iris",
    name: "Iris",
    role: "Cost Attribution",
    colorName: "Magenta",
    shape: "Teardrop",
    accentColor: "#f472b6",
    description: "Apportions shared operational overheads directly to client deliverables with precision multi-ledger mapping.",
  },
};

/**
 * High-fidelity 3D claymation character mascots:
 * Saturated pastel play-doh surface, volumetric soft lighting, googly eyes with specular shine, and cute smiles.
 */
export function ClayMascot({
  id,
  size = 120,
  className = "",
}: {
  id: MascotId;
  size?: number;
  className?: string;
}) {
  switch (id) {
    case "evan":
      // Chubby Pastel Green Pyramid
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            {/* Clay base gradient */}
            <linearGradient id="evanClay" x1="40" y1="20" x2="130" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="45%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <radialGradient id="evanShine" cx="70" cy="50" r="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </radialGradient>
            <filter id="clayShadow" x="10" y="125" width="140" height="30" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          {/* Ground contact shadow */}
          <ellipse cx="80" cy="142" rx="46" ry="10" fill="#272727" fillOpacity="0.12" filter="url(#clayShadow)" />
          {/* Chubby Pyramid body with rounded corners */}
          <path
            d="M80 26C83 26 86 28 88 32L128 116C131 123 126 132 118 132H42C34 132 29 123 32 116L72 32C74 28 77 26 80 26Z"
            fill="url(#evanClay)"
          />
          {/* Volumetric highlight */}
          <path
            d="M80 28C81.5 28 83 29 84 32L116 102C105 110 93 114 80 114C67 114 55 110 44 102L76 32C77 29 78.5 28 80 28Z"
            fill="url(#evanShine)"
          />
          {/* Left Googly Eye */}
          <g transform="translate(62, 74)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="1.5" cy="1.5" r="4.5" fill="#272727" />
            <circle cx="0.5" cy="-0.5" r="2" fill="#ffffff" />
          </g>
          {/* Right Googly Eye */}
          <g transform="translate(86, 74)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="-1" cy="1.5" r="4.5" fill="#272727" />
            <circle cx="-2" cy="-0.5" r="2" fill="#ffffff" />
          </g>
          {/* Play-Doh cute smile */}
          <path
            d="M70 94C74 99 82 99 86 94"
            stroke="#166534"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Rosy cheeks */}
          <ellipse cx="56" cy="88" rx="4" ry="2" fill="#15803d" fillOpacity="0.25" />
          <ellipse cx="92" cy="88" rx="4" ry="2" fill="#15803d" fillOpacity="0.25" />
        </svg>
      );

    case "atlas":
      // Chubby Sky Blue Sphere
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <radialGradient id="atlasClay" cx="65" cy="55" r="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
            <filter id="atlasShadow" x="15" y="125" width="130" height="30" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <ellipse cx="80" cy="142" rx="44" ry="10" fill="#272727" fillOpacity="0.12" filter="url(#atlasShadow)" />
          {/* Chubby round ball */}
          <circle cx="80" cy="80" r="52" fill="url(#atlasClay)" />
          {/* Left Googly Eye */}
          <g transform="translate(67, 72)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="1.5" cy="1" r="4.5" fill="#272727" />
            <circle cx="0.5" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Right Googly Eye */}
          <g transform="translate(93, 72)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="-1" cy="1" r="4.5" fill="#272727" />
            <circle cx="-2" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Happy smile */}
          <path
            d="M74 92C78 98 86 98 90 92"
            stroke="#0369a1"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <ellipse cx="60" cy="86" rx="4" ry="2" fill="#075985" fillOpacity="0.25" />
          <ellipse cx="100" cy="86" rx="4" ry="2" fill="#075985" fillOpacity="0.25" />
        </svg>
      );

    case "nico":
      // Chubby Teal Cylinder
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="nicoCylinder" x1="45" y1="40" x2="115" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="50%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="nicoTop" x1="45" y1="40" x2="115" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
            <filter id="nicoShadow" x="15" y="125" width="130" height="30" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <ellipse cx="80" cy="142" rx="44" ry="10" fill="#272727" fillOpacity="0.12" filter="url(#nicoShadow)" />
          {/* Cylinder body */}
          <rect x="38" y="52" width="84" height="74" rx="16" fill="url(#nicoCylinder)" />
          {/* Rounded bottom rim */}
          <ellipse cx="80" cy="122" rx="42" ry="12" fill="#0f766e" fillOpacity="0.3" />
          {/* Rounded top rim */}
          <ellipse cx="80" cy="52" rx="42" ry="15" fill="url(#nicoTop)" stroke="#2dd4bf" strokeWidth="1" />
          {/* Left Googly Eye */}
          <g transform="translate(68, 76)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="1.5" cy="1" r="4.5" fill="#272727" />
            <circle cx="0.5" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Right Googly Eye */}
          <g transform="translate(92, 76)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="-1" cy="1" r="4.5" fill="#272727" />
            <circle cx="-2" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Smirk */}
          <path
            d="M74 95C78 100 86 100 90 96"
            stroke="#115e59"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Rosy cheeks */}
          <ellipse cx="61" cy="90" rx="4" ry="2" fill="#134e4a" fillOpacity="0.25" />
          <ellipse cx="99" cy="90" rx="4" ry="2" fill="#134e4a" fillOpacity="0.25" />
        </svg>
      );

    case "nova":
      // Chubby Butter Yellow Pentagon
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <radialGradient id="novaClay" cx="70" cy="60" r="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
            <filter id="novaShadow" x="15" y="125" width="130" height="30" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <ellipse cx="80" cy="142" rx="44" ry="10" fill="#272727" fillOpacity="0.12" filter="url(#novaShadow)" />
          {/* Rounded Pentagon */}
          <path
            d="M80 32C84 32 87 34 89 38L124 74C127 77 128 82 126 86L108 128C106 132 101 135 97 135H63C59 135 54 132 52 128L34 86C32 82 33 77 36 74L71 38C73 34 76 32 80 32Z"
            fill="url(#novaClay)"
          />
          {/* Left Googly Eye */}
          <g transform="translate(68, 76)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="1.5" cy="1" r="4.5" fill="#272727" />
            <circle cx="0.5" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Right Googly Eye */}
          <g transform="translate(92, 76)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="-1" cy="1" r="4.5" fill="#272727" />
            <circle cx="-2" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Cheerful wide smile */}
          <path
            d="M73 95C77 101 87 101 91 95"
            stroke="#854d0e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <ellipse cx="60" cy="90" rx="4" ry="2" fill="#a16207" fillOpacity="0.3" />
          <ellipse cx="100" cy="90" rx="4" ry="2" fill="#a16207" fillOpacity="0.3" />
        </svg>
      );

    case "iris":
      // Chubby Soft Magenta-Pink Teardrop / Gumdrop
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <radialGradient id="irisClay" cx="70" cy="65" r="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="55%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </radialGradient>
            <filter id="irisShadow" x="15" y="125" width="130" height="30" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <ellipse cx="80" cy="142" rx="44" ry="10" fill="#272727" fillOpacity="0.12" filter="url(#irisShadow)" />
          {/* Rounded Teardrop / Gumdrop */}
          <path
            d="M80 34C87 48 126 95 126 112C126 126 105 136 80 136C55 136 34 126 34 112C34 95 73 48 80 34Z"
            fill="url(#irisClay)"
          />
          {/* Left Googly Eye */}
          <g transform="translate(68, 86)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="1.5" cy="1" r="4.5" fill="#272727" />
            <circle cx="0.5" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Right Googly Eye */}
          <g transform="translate(92, 86)">
            <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ffffff" stroke="#272727" strokeWidth="1.5" />
            <circle cx="-1" cy="1" r="4.5" fill="#272727" />
            <circle cx="-2" cy="-1" r="2" fill="#ffffff" />
          </g>
          {/* Smile */}
          <path
            d="M74 104C78 109 86 109 90 104"
            stroke="#9d174d"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <ellipse cx="61" cy="98" rx="4" ry="2" fill="#be185d" fillOpacity="0.25" />
          <ellipse cx="99" cy="98" rx="4" ry="2" fill="#be185d" fillOpacity="0.25" />
        </svg>
      );
  }
}

/**
 * Mascot Lineup banner for the hero section:
 * All 5 mascots standing side-by-side in front of the platform preview.
 */
export function MascotLineup({ className = "" }: { className?: string }) {
  const mascotOrder: MascotId[] = ["evan", "atlas", "nico", "nova", "iris"];

  return (
    <div className={`flex items-end justify-center -space-x-4 sm:-space-x-6 ${className}`}>
      {mascotOrder.map((id, index) => (
        <div
          key={id}
          className="transition-transform duration-300 hover:-translate-y-2 hover:z-10 cursor-pointer"
          title={`${MASCOTS[id].name} — ${MASCOTS[id].role}`}
          style={{ zIndex: index + 1 }}
        >
          <ClayMascot id={id} size={84} />
        </div>
      ))}
    </div>
  );
}
