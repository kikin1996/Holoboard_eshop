// Minimalistická line-art ilustrace HoloBoard sedačky na paddleboardu.
// Nahrazuje reálnou produktovou fotografii, dokud není k dispozici -
// drží se stejné jedné akcentní barvy (teal) jako zbytek designu.
export default function HoloBoardIllustration() {
  return (
    <svg
      viewBox="0 0 800 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
    >
      {/* Hladina vody */}
      <path
        d="M0 420 C 100 400, 200 440, 320 420 C 440 400, 520 440, 640 420 C 720 408, 760 412, 800 420"
        stroke="#E7E5E4"
        strokeWidth="2"
      />
      <path
        d="M0 450 C 120 435, 220 460, 340 448 C 460 436, 560 460, 680 448 C 740 442, 770 444, 800 448"
        stroke="#E7E5E4"
        strokeWidth="2"
      />

      {/* Tělo paddleboardu (boční pohled) */}
      <path
        d="M60 380 C 60 366 74 360 100 358 L 650 340 C 690 338 730 348 760 366 C 730 380 690 386 650 386 L 100 400 C 74 398 60 394 60 380 Z"
        stroke="#0A0A0A"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Rám hybridní sedačky - sklopná konstrukce */}
      <path
        d="M260 350 L 260 230 C 260 216 270 208 284 208 L 420 208 C 434 208 444 216 444 230 L 444 300"
        stroke="#0E7C86"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Opěrka zad */}
      <path
        d="M262 232 L 420 220"
        stroke="#0E7C86"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Sedací plocha */}
      <path
        d="M258 320 L 446 305"
        stroke="#0E7C86"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Kloub/pant sklápění - zvýrazněný detail */}
      <circle cx="260" cy="322" r="9" fill="#0E7C86" />
      <circle cx="444" cy="303" r="9" fill="#0E7C86" />

      {/* Opora nohou */}
      <path
        d="M300 355 L 300 400"
        stroke="#0A0A0A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M400 350 L 400 398"
        stroke="#0A0A0A"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
