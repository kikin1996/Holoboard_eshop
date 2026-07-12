export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-muted">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">HoloBoard</p>
            <p className="mt-2 max-w-xs">
              Patentovaný hybridní systém sezení pro paddleboardy. Navrženo pro vodu,
              postaveno na pohodlí.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="mb-3 font-medium text-ink">Produkt</p>
              <ul className="space-y-2">
                <li>Přehled</li>
                <li>Technologie</li>
                <li>Příslušenství</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-ink">Podpora</p>
              <ul className="space-y-2">
                <li>Doprava a Zásilkovna</li>
                <li>Platba a reklamace</li>
                <li>Kontakt</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-16 text-xs text-muted">
          © {new Date().getFullYear()} HoloBoard. Všechna práva vyhrazena.
        </p>
      </div>
    </footer>
  );
}
