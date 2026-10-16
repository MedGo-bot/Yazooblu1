import React from 'react';
import { BrandKey, BRANDS } from '../types';

interface BrandLogoProps {
  brandKey: BrandKey;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  showLabel?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
  hero: 'w-48 h-48 sm:w-56 sm:h-56',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brandKey,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const brand = BRANDS[brandKey];
  const sizeClass = SIZE_MAP[size];

  // Authentic vector renderers for each sovereign brand persona
  const renderLogoGraphic = () => {
    switch (brandKey) {
      // 1. BH&W Public Relations Firm (from BH&W logo1.jfif)
      case 'bhw_pr':
        return (
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-md select-none"
            aria-label="BH&W Public Relations Firm Official Logo"
          >
            <defs>
              <linearGradient id="bhw-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DFBA68" />
                <stop offset="25%" stopColor="#F3DC93" />
                <stop offset="50%" stopColor="#C99E4B" />
                <stop offset="75%" stopColor="#E7C577" />
                <stop offset="100%" stopColor="#B38634" />
              </linearGradient>

              <linearGradient id="bhw-border-gold" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5E2A8" />
                <stop offset="50%" stopColor="#C69B46" />
                <stop offset="100%" stopColor="#E2C172" />
              </linearGradient>

              <linearGradient id="bhw-navy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B1D3A" />
                <stop offset="40%" stopColor="#122A54" />
                <stop offset="80%" stopColor="#0C2042" />
                <stop offset="100%" stopColor="#08152B" />
              </linearGradient>

              <filter id="bhw-letter-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0.8" dy="1.2" stdDeviation="0.6" floodColor="#422904" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Dark Espresso / Charcoal Outer Mat */}
            <rect width="300" height="300" fill="#140E0B" rx="8" />

            {/* Outer Gold Border Frame */}
            <rect
              x="22"
              y="22"
              width="256"
              height="256"
              fill="none"
              stroke="url(#bhw-border-gold)"
              strokeWidth="6"
            />

            {/* Inner Gold Field / Plate */}
            <rect
              x="42"
              y="42"
              width="216"
              height="216"
              fill="url(#bhw-gold-grad)"
              stroke="#A67B2A"
              strokeWidth="1.5"
            />

            {/* Inset Border */}
            <rect
              x="45"
              y="45"
              width="210"
              height="210"
              fill="none"
              stroke="#D8B15D"
              strokeWidth="0.8"
              opacity="0.8"
            />

            {/* Monogram Letters (B, H, W) & Ampersand */}
            <g filter="url(#bhw-letter-shadow)">
              {/* "B" letter */}
              <path
                d="M 52 56 L 86 56 C 104 56 114 65 114 78 C 114 88 107 96 97 100 C 111 104 120 114 120 128 C 120 144 105 152 86 152 L 52 152 Z 
                   M 70 70 L 70 96 L 85 96 C 94 96 100 90 100 83 C 100 76 94 70 85 70 Z 
                   M 70 108 L 70 138 L 86 138 C 96 138 103 131 103 123 C 103 115 96 108 86 108 Z"
                fill="url(#bhw-navy-grad)"
                stroke="#684E18"
                strokeWidth="0.8"
              />

              {/* "H" letter */}
              <path
                d="M 125 56 L 143 56 L 143 97 L 163 97 L 163 56 L 181 56 L 181 152 L 163 152 L 163 111 L 143 111 L 143 152 L 125 152 Z"
                fill="url(#bhw-navy-grad)"
                stroke="#684E18"
                strokeWidth="0.8"
              />

              {/* Big Flourished Ampersand "&" in Top-Right */}
              <path
                d="M 230 63 C 215 54 200 60 195 72 C 190 82 196 92 205 99 C 193 109 184 120 184 135 C 184 153 200 166 220 166 C 238 166 250 156 253 145 C 255 137 249 133 241 133 C 234 133 229 137 228 143 C 226 149 220 154 213 154 C 204 154 197 146 197 136 C 197 125 206 115 218 106 C 224 112 232 118 240 120 C 248 122 254 116 254 109 C 254 99 242 88 230 63 Z 
                   M 207 77 C 209 70 216 67 222 71 C 228 75 233 83 234 91 C 225 87 218 82 207 77 Z"
                fill="url(#bhw-navy-grad)"
                stroke="#684E18"
                strokeWidth="0.8"
              />

              {/* "W" letter */}
              <path
                d="M 54 163 L 73 163 L 88 234 L 102 163 L 118 163 L 132 234 L 147 163 L 166 163 L 143 259 L 125 259 L 110 192 L 95 259 L 77 259 Z"
                fill="url(#bhw-navy-grad)"
                stroke="#684E18"
                strokeWidth="0.8"
              />
            </g>

            {/* "Public Relations Firm" Stacked Serif */}
            <g
              fill="url(#bhw-navy-grad)"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="600"
              filter="url(#bhw-letter-shadow)"
            >
              <text x="175" y="196" fontSize="24" letterSpacing="0.5">
                Public
              </text>
              <text x="175" y="228" fontSize="22" letterSpacing="0.3">
                Relations
              </text>
              <text x="182" y="258" fontSize="23" letterSpacing="0.8">
                Firm
              </text>
            </g>
          </svg>
        );

      // 2. Bes Outkast Society (from BOS LOGO1.png)
      // Heterochromia eyes (left cyan, right amber) with molten gold lashes & dripping tear,
      // "Bes Outkast Society" top brush script and "For the love of the Dare / Since 2003" bottom script
      case 'bes_outkast':
        return (
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-md select-none"
            aria-label="Bes Outkast Society Official Logo"
          >
            <defs>
              {/* Cyan Iris Gradient */}
              <radialGradient id="bos-left-iris" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#48CAE4" />
                <stop offset="70%" stopColor="#0096C7" />
                <stop offset="100%" stopColor="#023E8A" />
              </radialGradient>

              {/* Amber Iris Gradient */}
              <radialGradient id="bos-right-iris" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF3B0" />
                <stop offset="30%" stopColor="#FFB703" />
                <stop offset="70%" stopColor="#FB8500" />
                <stop offset="100%" stopColor="#9E2A2B" />
              </radialGradient>

              {/* Molten Gold Gradient for filigree lashes & tear */}
              <linearGradient id="bos-molten-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE066" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>

              {/* Left Eye Turquoise Skin Gradient */}
              <linearGradient id="bos-left-skin" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0077B6" />
                <stop offset="50%" stopColor="#00B4D8" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>

              {/* Right Eye Sunset Coral Skin Gradient */}
              <linearGradient id="bos-right-skin" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="60%" stopColor="#FB8500" />
                <stop offset="100%" stopColor="#C9184A" />
              </linearGradient>
            </defs>

            {/* Pure Clean White Canvas Background */}
            <rect width="300" height="300" fill="#FFFFFF" rx="8" />

            {/* Top Brush Script: "Bes Outkast Society" */}
            <g fontFamily="'Brush Script MT', 'Segoe Script', cursive, sans-serif" fill="#111111">
              <text
                x="150"
                y="46"
                textAnchor="middle"
                fontSize="27"
                fontWeight="bold"
                letterSpacing="0.8"
                style={{ fontStyle: 'italic' }}
              >
                Bes Outkast Society
              </text>
            </g>

            {/* Center Heterochromia Artwork Banner (Y: 65 to 198) */}
            <g>
              {/* Artwork Base Clipping Mask / Container */}
              <rect x="6" y="66" width="288" height="132" rx="4" fill="#0A0A0A" />

              {/* Left Face Skin Tint (Cyan / Aqua) */}
              <path d="M 6 66 L 150 66 L 150 198 L 6 198 Z" fill="url(#bos-left-skin)" opacity="0.95" />

              {/* Right Face Skin Tint (Amber / Coral / Magenta) */}
              <path d="M 150 66 L 294 66 L 294 198 L 150 198 Z" fill="url(#bos-right-skin)" opacity="0.95" />

              {/* Center Molten Gold Nose Bridge & Teardrop */}
              <path
                d="M 147 66 Q 146 95 144 130 Q 142 165 148 185 Q 150 190 152 185 Q 158 165 156 130 Q 154 95 153 66 Z"
                fill="url(#bos-molten-gold)"
              />
              {/* Dripping Gold Bead */}
              <ellipse cx="150" cy="74" rx="4" ry="7" fill="url(#bos-molten-gold)" />

              {/* ── LEFT EYE (Piercing Cyan Iris) ── */}
              {/* Eye Shape White / Sclera */}
              <path
                d="M 28 132 Q 78 94 128 132 Q 78 168 28 132 Z"
                fill="#F0F8FF"
                stroke="#1B4965"
                strokeWidth="1.5"
              />
              {/* Cyan Iris */}
              <circle cx="78" cy="132" r="23" fill="url(#bos-left-iris)" />
              {/* Pupil */}
              <circle cx="78" cy="132" r="9" fill="#03045E" />
              <circle cx="74" cy="128" r="3" fill="#FFFFFF" />
              {/* Sculpted Gold Upper Eyelashes */}
              <path
                d="M 28 130 Q 78 90 128 130"
                stroke="url(#bos-molten-gold)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Gold Filigree Spike Rays (Upper) */}
              <path
                d="M 45 116 L 40 102 M 60 108 L 57 93 M 78 105 L 78 88 M 96 108 L 100 93 M 112 116 L 118 102"
                stroke="url(#bos-molten-gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Lower Lash Gold Beads */}
              <path
                d="M 32 136 Q 78 166 124 136"
                stroke="url(#bos-molten-gold)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 3"
              />

              {/* ── RIGHT EYE (Fiery Molten Amber Iris) ── */}
              {/* Eye Shape White / Sclera */}
              <path
                d="M 172 132 Q 222 94 272 132 Q 222 168 172 132 Z"
                fill="#FFFDF0"
                stroke="#7F1D1D"
                strokeWidth="1.5"
              />
              {/* Amber Iris */}
              <circle cx="222" cy="132" r="23" fill="url(#bos-right-iris)" />
              {/* Pupil */}
              <circle cx="222" cy="132" r="9" fill="#2B0505" />
              <circle cx="218" cy="128" r="3" fill="#FFFFFF" />
              {/* Sculpted Gold Upper Eyelashes */}
              <path
                d="M 172 130 Q 222 90 272 130"
                stroke="url(#bos-molten-gold)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Gold Filigree Spike Rays (Upper) */}
              <path
                d="M 188 116 L 182 102 M 204 108 L 200 93 M 222 105 L 222 88 M 240 108 L 244 93 M 256 116 L 262 102"
                stroke="url(#bos-molten-gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Lower Lash Gold Beads & Dripping Drops */}
              <path
                d="M 176 136 Q 222 166 268 136"
                stroke="url(#bos-molten-gold)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 3"
              />
              <circle cx="265" cy="154" r="3" fill="url(#bos-molten-gold)" />
              <circle cx="272" cy="162" r="2.2" fill="url(#bos-molten-gold)" />
            </g>

            {/* Bottom Brush Script: "For the love of the Dare" and "Since 2003" */}
            <g fontFamily="'Brush Script MT', 'Segoe Script', cursive, sans-serif" fill="#111111">
              <text
                x="150"
                y="244"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                letterSpacing="0.8"
                style={{ fontStyle: 'italic' }}
              >
                For the love of the Dare
              </text>
              <text
                x="150"
                y="278"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                letterSpacing="0.8"
                style={{ fontStyle: 'italic' }}
              >
                Since 2003
              </text>
            </g>
          </svg>
        );

      // 3. Fyrrion Cybersecurity (from Fyrrion cybersecurtiy logo.png)
      // Complex 3-node spirographic topological wireframe torus mesh in steel blue on off-white field,
      // with bold "FYRRION" and widely tracked "CYBERSECURITY" core typography
      case 'fyrrion':
        return (
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-md select-none"
            aria-label="Fyrrion Cybersecurity Official Logo"
          >
            {/* Off-White Clean Field */}
            <rect width="300" height="300" fill="#F0F2F4" rx="8" />

            {/* 3-Node Spirographic Geometric Mesh in Steel Blue */}
            <g transform="translate(150, 150)" stroke="#2C5D7D" strokeWidth="1.2" fill="none" opacity="0.9">
              {/* Node 1 Ellipse Array (0 deg) */}
              <g>
                {Array.from({ length: 18 }).map((_, i) => (
                  <ellipse
                    key={`n1-${i}`}
                    cx={35 + i * 2.5}
                    cy={-20}
                    rx={45 + i * 2.8}
                    ry={25 + i * 2}
                    transform={`rotate(${i * 6})`}
                  />
                ))}
              </g>

              {/* Node 2 Ellipse Array (120 deg) */}
              <g transform="rotate(120)">
                {Array.from({ length: 18 }).map((_, i) => (
                  <ellipse
                    key={`n2-${i}`}
                    cx={35 + i * 2.5}
                    cy={-20}
                    rx={45 + i * 2.8}
                    ry={25 + i * 2}
                    transform={`rotate(${i * 6})`}
                  />
                ))}
              </g>

              {/* Node 3 Ellipse Array (240 deg) */}
              <g transform="rotate(240)">
                {Array.from({ length: 18 }).map((_, i) => (
                  <ellipse
                    key={`n3-${i}`}
                    cx={35 + i * 2.5}
                    cy={-20}
                    rx={45 + i * 2.8}
                    ry={25 + i * 2}
                    transform={`rotate(${i * 6})`}
                  />
                ))}
              </g>
            </g>

            {/* Center Overlay Typography */}
            <g textAnchor="middle" fill="#181B1F">
              {/* "FYRRION" in Heavy Geometric Sans-Serif */}
              <text
                x="150"
                y="152"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="35"
                fontWeight="900"
                letterSpacing="3"
              >
                FYRRION
              </text>

              {/* "CYBERSECURITY" with wide tracking */}
              <text
                x="150"
                y="174"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="12.5"
                fontWeight="600"
                letterSpacing="7"
                opacity="0.95"
              >
                CYBERSECURITY
              </text>
            </g>
          </svg>
        );

      // 4. The International Consortium of Creatives (from ICC logo.png)
      // Heavy blacksmith anvil on timber stump with macramé feathers, suspended antique bronze laurel medallion
      // enclosing "ICC" monogram and arched "THE INTERNATIONAL CONSORTIUM" "OF CREATIVES" Trajan typography
      case 'creatives':
        return (
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-md select-none"
            aria-label="The International Consortium of Creatives Official Logo"
          >
            <defs>
              <radialGradient id="icc-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#222329" />
                <stop offset="70%" stopColor="#121316" />
                <stop offset="100%" stopColor="#08080A" />
              </radialGradient>

              {/* Bronze Gold Gradient for Medallion */}
              <linearGradient id="icc-bronze-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2BD75" />
                <stop offset="35%" stopColor="#C59B4B" />
                <stop offset="70%" stopColor="#966F2A" />
                <stop offset="100%" stopColor="#624614" />
              </linearGradient>

              {/* Anvil Cast Iron Gradient */}
              <linearGradient id="icc-anvil-iron" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3A3C44" />
                <stop offset="50%" stopColor="#25262B" />
                <stop offset="100%" stopColor="#151619" />
              </linearGradient>

              {/* Circular Path for Upper Text Arc */}
              <path
                id="icc-top-arc"
                d="M 40 150 A 110 110 0 0 1 260 150"
                fill="none"
              />

              {/* Circular Path for Lower Text Arc */}
              <path
                id="icc-bottom-arc"
                d="M 50 150 A 100 100 0 0 0 250 150"
                fill="none"
              />
            </defs>

            {/* Circular Black Backdrop */}
            <circle cx="150" cy="150" r="148" fill="url(#icc-bg)" />

            {/* Background Macramé / Woven Craft Feathers */}
            <g opacity="0.35" stroke="#B37142" strokeWidth="1.5" fill="none">
              {/* Feathers Left */}
              <path d="M 60 70 Q 75 140 70 200 M 50 85 L 72 100 M 45 110 L 73 125 M 48 135 L 72 145" />
              {/* Feathers Right */}
              <path d="M 240 70 Q 225 140 230 200 M 250 85 L 228 100 M 255 110 L 227 125 M 252 135 L 228 145" />
            </g>

            {/* Heavy Blacksmith Anvil Silhouette */}
            <path
              d="M 55 132 L 95 132 L 105 118 L 195 118 L 245 132 L 205 148 L 180 148 L 188 190 L 210 202 L 90 202 L 112 190 L 120 148 L 95 148 Z"
              fill="url(#icc-anvil-iron)"
              stroke="#4E515C"
              strokeWidth="2"
            />
            {/* Wooden Stump Base & Chain */}
            <rect x="75" y="200" width="150" height="25" fill="#3D291D" rx="2" stroke="#261910" strokeWidth="1.5" />
            <path d="M 85 220 Q 150 232 215 220" stroke="#606470" strokeWidth="3" fill="none" strokeDasharray="6 3" />

            {/* Suspended Circular Antique Bronze Medallion */}
            <circle cx="150" cy="148" r="58" fill="#1C1E23" stroke="url(#icc-bronze-grad)" strokeWidth="6" />
            <circle cx="150" cy="148" r="51" fill="none" stroke="url(#icc-bronze-grad)" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Laurel Wreath Flanking Inside Medallion */}
            <g stroke="url(#icc-bronze-grad)" strokeWidth="2.2" fill="none" opacity="0.9">
              <path d="M 108 152 Q 112 182 140 192" />
              <path d="M 192 152 Q 188 182 160 192" />
              {/* Leaves Left */}
              <circle cx="112" cy="162" r="2.5" fill="url(#icc-bronze-grad)" />
              <circle cx="118" cy="174" r="2.5" fill="url(#icc-bronze-grad)" />
              <circle cx="128" cy="184" r="2.5" fill="url(#icc-bronze-grad)" />
              {/* Leaves Right */}
              <circle cx="188" cy="162" r="2.5" fill="url(#icc-bronze-grad)" />
              <circle cx="182" cy="174" r="2.5" fill="url(#icc-bronze-grad)" />
              <circle cx="172" cy="184" r="2.5" fill="url(#icc-bronze-grad)" />
            </g>

            {/* Top Compass Star on Medallion */}
            <polygon points="150,94 153,101 160,104 153,107 150,114 147,107 140,104 147,101" fill="url(#icc-bronze-grad)" />
            {/* Bottom Compass Star on Medallion */}
            <polygon points="150,188 153,195 160,198 153,201 150,208 147,201 140,198 147,195" fill="url(#icc-bronze-grad)" />

            {/* Interlocking Roman "ICC" Monogram */}
            <g
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="bold"
              fontSize="48"
              fill="url(#icc-bronze-grad)"
              textAnchor="middle"
            >
              {/* "I" */}
              <text x="126" y="163">I</text>
              {/* "C" first */}
              <text x="154" y="163">C</text>
              {/* "C" second nested */}
              <text x="174" y="167" fontSize="40">C</text>
            </g>

            {/* Arched Classical Serif Typography */}
            {/* Top: THE INTERNATIONAL CONSORTIUM */}
            <text
              fontFamily="Georgia, 'Cinzel', serif"
              fontSize="16.5"
              fill="#F5F3EF"
              letterSpacing="2.5"
              textAnchor="middle"
            >
              <textPath href="#icc-top-arc" startOffset="50%">
                THE INTERNATIONAL CONSORTIUM
              </textPath>
            </text>

            {/* Bottom: OF CREATIVES */}
            <text
              x="150"
              y="266"
              fontFamily="Georgia, 'Cinzel', serif"
              fontSize="18"
              fill="#F5F3EF"
              letterSpacing="3"
              textAnchor="middle"
            >
              OF CREATIVES
            </text>
          </svg>
        );

      // 5. Hilton Head Leadership Summit (from HHLS Logo (1).png)
      // Greek key circular meander gold border, sunset Harbour Town lighthouse harbor view,
      // painterly ocean blue brush strokes and centered "HILTON HEAD LEADERSHIP SUMMIT" serif typography
      case 'hilton_head':
        return (
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-md select-none"
            aria-label="Hilton Head Leadership Summit Official Logo"
          >
            <defs>
              {/* Burnished Greek Key Gold Gradient */}
              <linearGradient id="hhls-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5DF9E" />
                <stop offset="40%" stopColor="#C89D3C" />
                <stop offset="70%" stopColor="#9C7722" />
                <stop offset="100%" stopColor="#D8B15D" />
              </linearGradient>

              {/* Harbour Sunset Sky & Marina Gradient */}
              <linearGradient id="hhls-sunset" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F89B73" />
                <stop offset="30%" stopColor="#F6C088" />
                <stop offset="55%" stopColor="#2E6588" />
                <stop offset="100%" stopColor="#14344E" />
              </linearGradient>

              {/* Clip Path for the Inner Circular Harbour Scene */}
              <clipPath id="hhls-harbour-clip">
                <circle cx="150" cy="150" r="95" />
              </clipPath>
            </defs>

            {/* Crisp Background Field */}
            <rect width="300" height="300" fill="#FFFFFF" rx="8" />

            {/* Sweeping Ocean Blue Painterly Brush Strokes (Top-Left & Bottom-Right) */}
            <path
              d="M -10 100 C 30 40, 90 20, 160 5 C 130 35, 70 70, 0 115 Z"
              fill="#38A3D2"
              opacity="0.9"
            />
            <path
              d="M 300 200 C 260 260, 200 280, 140 295 C 170 265, 230 230, 300 185 Z"
              fill="#38A3D2"
              opacity="0.9"
            />

            {/* Outer Greek Key Meander Pattern Gold Border Ring */}
            <circle cx="150" cy="150" r="124" fill="none" stroke="url(#hhls-gold)" strokeWidth="18" />
            <circle cx="150" cy="150" r="133" fill="none" stroke="url(#hhls-gold)" strokeWidth="2.5" />
            <circle cx="150" cy="150" r="115" fill="none" stroke="url(#hhls-gold)" strokeWidth="2.5" />

            {/* Geometric Greek Key Steps (Ring Accents) */}
            <circle
              cx="150"
              cy="150"
              r="124"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeDasharray="8 6 4 6"
              opacity="0.9"
            />

            {/* Inner Circular Harbour Scene (Harbour Town Lighthouse at Sunset) */}
            <g clipPath="url(#hhls-harbour-clip)">
              {/* Sunset Sky and Water Background */}
              <rect x="50" y="50" width="200" height="200" fill="url(#hhls-sunset)" />

              {/* Distant Trees & Marina Shoreline */}
              <path
                d="M 50 155 Q 90 148 130 155 Q 170 148 250 155 L 250 162 L 50 162 Z"
                fill="#162D22"
              />

              {/* Yachts & Sailboats */}
              <path d="M 72 155 L 86 155 L 80 159 Z M 79 140 L 79 155" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 98 155 L 114 155 L 106 159 Z M 106 138 L 106 155" stroke="#FFFFFF" strokeWidth="1.2" />
              <path d="M 210 155 L 226 155 L 218 159 Z M 218 142 L 218 155" stroke="#FFFFFF" strokeWidth="1.2" />

              {/* Iconic Red & White Striped Harbour Town Lighthouse */}
              {/* Base */}
              <path d="M 144 156 L 156 156 L 158 160 L 142 160 Z" fill="#2B303A" />
              {/* Lighthouse Tower Stripes */}
              <polygon points="145,156 146,144 154,144 155,156" fill="#D90429" />
              <polygon points="146,144 147,132 153,132 154,144" fill="#FFFFFF" />
              <polygon points="147,132 148,120 152,120 153,132" fill="#D90429" />
              <polygon points="148,120 148.5,108 151.5,108 152,120" fill="#FFFFFF" />
              <polygon points="148.5,108 149,96 151,96 151.5,108" fill="#D90429" />
              {/* Lantern Room & Beacon Top */}
              <rect x="148" y="90" width="4" height="6" fill="#1C1E24" />
              <circle cx="150" cy="93" r="4" fill="#FFFBEA" opacity="0.9" />
              <polygon points="147,90 150,83 153,90" fill="#1C1E24" />

              {/* Water Reflection of Lighthouse */}
              <path
                d="M 148 162 L 152 162 L 151 220 L 149 220 Z"
                fill="#F89B73"
                opacity="0.45"
              />
            </g>

            {/* Inner Thin Border */}
            <circle cx="150" cy="150" r="95" fill="none" stroke="url(#hhls-gold)" strokeWidth="3" />

            {/* Centered Stately All-Caps Typography */}
            <g
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="bold"
              textAnchor="middle"
              fill="#FFFFFF"
            >
              <text
                x="150"
                y="136"
                fontSize="18"
                letterSpacing="3"
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.8))"
              >
                HILTON HEAD
              </text>
              <text
                x="150"
                y="160"
                fontSize="17.5"
                letterSpacing="2.5"
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.8))"
              >
                LEADERSHIP
              </text>
              <text
                x="150"
                y="184"
                fontSize="18.5"
                letterSpacing="3"
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.8))"
              >
                SUMMIT
              </text>
            </g>
          </svg>
        );

      // 6. NuEcoFab (from NuEcoFab logo1 (1).png)
      // Organic dual-leaf / flame emblem (vibrant sprout-lime left leaf, deep forest green right leaf,
      // white negative space curve) on textured linen field with "NuEcoFab™" rounded sans-serif
      case 'nuecofab':
        return (
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-md select-none"
            aria-label="NuEcoFab Official Logo"
          >
            <defs>
              {/* Sprout Lime Green Leaf Gradient */}
              <linearGradient id="nef-lime-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A3E635" />
                <stop offset="40%" stopColor="#70C024" />
                <stop offset="100%" stopColor="#3E8914" />
              </linearGradient>

              {/* Deep Forest Emerald Green Leaf Gradient */}
              <linearGradient id="nef-forest-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E7A46" />
                <stop offset="50%" stopColor="#0C4A28" />
                <stop offset="100%" stopColor="#062E19" />
              </linearGradient>
            </defs>

            {/* Organic Textured Linen Paper Background */}
            <rect width="300" height="300" fill="#F6F5F0" rx="8" />

            {/* Dual Organic Leaf / Flame Sprout Emblem (Center X: 150, Y: 110) */}
            <g transform="translate(150, 105) scale(0.95)">
              {/* Right Forest Canopy Leaf */}
              <path
                d="M 5 -70 C 15 -45, 35 -15, 42 15 C 48 45, 32 75, -5 85 C 28 65, 35 25, 20 -15 C 10 -40, -2 -58, 5 -70 Z"
                fill="url(#nef-forest-grad)"
              />

              {/* Left Sprout Lime Green Leaf Swirl */}
              <path
                d="M 5 -70 C -5 -35, -35 -5, -42 25 C -48 55, -25 80, -2 85 C -25 75, -32 45, -22 18 C -12 -10, -2 -45, 5 -70 Z"
                fill="url(#nef-lime-grad)"
              />

              {/* Interior Negative Space Swoosh dividing the two leaves */}
              <path
                d="M 5 -70 Q -8 0 -4 85 Q 12 10 5 -70 Z"
                fill="#F6F5F0"
              />

              {/* Central Dynamic Eco-Energy Leaflet */}
              <path
                d="M -4 85 C -2 45, 8 15, 22 -5 C 28 20, 20 60, -4 85 Z"
                fill="url(#nef-forest-grad)"
                opacity="0.85"
              />
            </g>

            {/* Typography: "NuEcoFab™" in deep forest green */}
            <g textAnchor="middle" fill="#0C4A28">
              <text
                x="146"
                y="238"
                fontFamily="system-ui, -apple-system, 'Inter', sans-serif"
                fontSize="42"
                fontWeight="800"
                letterSpacing="-0.5"
              >
                NuEcoFab
              </text>
              <text
                x="248"
                y="222"
                fontFamily="system-ui, sans-serif"
                fontSize="12"
                fontWeight="bold"
              >
                TM
              </text>
            </g>
          </svg>
        );

      // 7. Porch MD (from PorchMD log.png)
      // Elliptical vortex of halftone circular gradient dots (green -> turquoise -> royal blue -> purple -> magenta)
      // encircling "Porch MD™" typography in clinical azure blue
      case 'porch_md':
        return (
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-md select-none"
            aria-label="Porch MD Official Logo"
          >
            {/* Pure Clean Clinical White Field */}
            <rect width="300" height="300" fill="#FFFFFF" rx="8" />

            {/* Dynamic Swirling Ellipse Vortex of Halftone Gradient Dots */}
            <g transform="translate(150, 150)">
              {/* Rings of Halftone Dots with radial color shifts */}
              {/* Ring 1: Outer Green-to-Teal dots (Top & Left) */}
              <circle cx="-110" cy="-35" r="4" fill="#2ECC71" />
              <circle cx="-95" cy="-60" r="4.5" fill="#27AE60" />
              <circle cx="-75" cy="-80" r="5" fill="#1ABC9C" />
              <circle cx="-50" cy="-95" r="5.5" fill="#16A085" />
              <circle cx="-20" cy="-105" r="5.5" fill="#00A8B5" />
              <circle cx="10" cy="-108" r="5.5" fill="#0096C7" />
              <circle cx="40" cy="-102" r="5" fill="#0077B6" />

              {/* Ring 2: Cobalt to Violet/Purple dots (Top-Right & Right) */}
              <circle cx="70" cy="-90" r="4.8" fill="#1D4ED8" />
              <circle cx="95" cy="-70" r="5" fill="#2563EB" />
              <circle cx="112" cy="-45" r="5.2" fill="#3B82F6" />
              <circle cx="120" cy="-18" r="5.5" fill="#6366F1" />
              <circle cx="122" cy="12" r="5.8" fill="#7C3AED" />
              <circle cx="115" cy="40" r="6" fill="#8B5CF6" />
              <circle cx="100" cy="65" r="6.2" fill="#9333EA" />

              {/* Ring 3: Purple to Magenta & Bottom Trail */}
              <circle cx="78" cy="88" r="6.5" fill="#A855F7" />
              <circle cx="50" cy="102" r="6.2" fill="#C026D3" />
              <circle cx="20" cy="108" r="5.8" fill="#DB2777" />
              <circle cx="-10" cy="106" r="5.5" fill="#6D28D9" />
              <circle cx="-40" cy="98" r="5" fill="#4F46E5" />
              <circle cx="-70" cy="80" r="4.5" fill="#2563EB" />
              <circle cx="-95" cy="55" r="4.2" fill="#0284C7" />
              <circle cx="-112" cy="25" r="3.8" fill="#0D9488" />
              <circle cx="-118" cy="-5" r="3.5" fill="#10B981" />

              {/* Inner Swirl Halftone Orbit Dots */}
              <circle cx="-78" cy="-35" r="3.8" fill="#2ECC71" />
              <circle cx="-62" cy="-55" r="4.2" fill="#1ABC9C" />
              <circle cx="-35" cy="-68" r="4.5" fill="#00A8B5" />
              <circle cx="-5" cy="-72" r="4.8" fill="#0284C7" />
              <circle cx="28" cy="-68" r="5" fill="#2563EB" />
              <circle cx="58" cy="-55" r="5.2" fill="#6366F1" />
              <circle cx="78" cy="-32" r="5.5" fill="#8B5CF6" />
              <circle cx="85" cy="-5" r="5.8" fill="#9333EA" />
              <circle cx="80" cy="22" r="6" fill="#A855F7" />
              <circle cx="62" cy="48" r="5.8" fill="#C026D3" />
              <circle cx="35" cy="65" r="5.2" fill="#7C3AED" />
              <circle cx="5" cy="72" r="4.8" fill="#4F46E5" />
              <circle cx="-28" cy="68" r="4.2" fill="#2563EB" />
              <circle cx="-58" cy="52" r="3.8" fill="#0284C7" />
              <circle cx="-75" cy="25" r="3.5" fill="#14B8A6" />
              <circle cx="-82" cy="-5" r="3.2" fill="#10B981" />

              {/* Fine Outer Dispersion Dots */}
              <circle cx="130" cy="-60" r="2.5" fill="#60A5FA" opacity="0.7" />
              <circle cx="140" cy="-30" r="2.8" fill="#818CF8" opacity="0.7" />
              <circle cx="142" cy="5" r="3" fill="#A78BFA" opacity="0.8" />
              <circle cx="135" cy="38" r="3.2" fill="#C084FC" opacity="0.8" />
              <circle cx="120" cy="72" r="3.5" fill="#E879F9" opacity="0.8" />
            </g>

            {/* Central Typography: "Porch MD™" in Clinical Royal Azure Blue */}
            <g textAnchor="middle" fill="#005A9C">
              <text
                x="146"
                y="162"
                fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                fontSize="42"
                fontWeight="bold"
                letterSpacing="0.5"
              >
                Porch MD
              </text>
              <text
                x="250"
                y="150"
                fontFamily="system-ui, sans-serif"
                fontSize="11"
                fontWeight="bold"
              >
                TM
              </text>
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className={`relative overflow-hidden rounded-lg flex items-center justify-center shrink-0 ${sizeClass}`}>
        {renderLogoGraphic()}
      </div>
      {showLabel && (
        <span className="mt-1.5 text-xs font-semibold text-neutral-300 text-center truncate max-w-full">
          {brand.name}
        </span>
      )}
    </div>
  );
};
