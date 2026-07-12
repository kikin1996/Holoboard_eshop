export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-muted">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">HoloBoard</p>
            <p className="mt-2 max-w-xs">
              Všestranné rekreační plavidlo pro celou rodinu. 2v1 paddleboard a
              kajak, vyvinutý a patentovaný v České republice.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="mb-3 font-medium text-ink">Kontakt</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:info@holoboard.cz"
                    className="transition-colors hover:text-accent"
                  >
                    info@holoboard.cz
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+420777726001"
                    className="transition-colors hover:text-accent"
                  >
                    777 726 001
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/holoboard_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    @holoboard_
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-ink">Právní dokumenty</p>
              <ul className="space-y-2">
                <li>Podmínky ochrany osobních údajů</li>
                <li>Všeobecné obchodní podmínky</li>
                <li>Vzor odstoupení od smlouvy</li>
                <li>Vzor reklamačního formuláře</li>
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
