# HoloBoard – design systém (minimalistický/premium, "Apple-like")

## Barvy
- `--color-ink`   #0A0A0A   — hlavní text, nadpisy
- `--color-paper` #FFFFFF   — pozadí
- `--color-mist`  #F5F5F4   — alternující sekce, karty
- `--color-line`  #E7E5E4   — jemné linky/oddělovače
- `--color-accent`#0E7C86   — jediná barevná akcentní barva (oceán/tyrkys), použitá jen na CTA, odkazy a drobné detaily
- `--color-muted` #6B7280   — sekundární text

Zásada: 95 % plochy černobílá/šedá, barva jen tam, kde má vést pozornost (primární tlačítko, aktivní stav, cena).

## Typografie
- Font: **Inter** (`next/font/google`), variabilní řez.
- Nadpisy: `font-semibold`, záporný `tracking-tight`, velké řádkování (`leading-[1.05]` u hero).
- Hero nadpis: `text-6xl md:text-7xl`
- Sekční nadpis: `text-4xl md:text-5xl`
- Běžný text: `text-base md:text-lg text-muted`

## Layout
- Kontejner: `max-w-6xl mx-auto px-6`
- Vertikální rytmus sekcí: `py-28 md:py-36`
- Karty: `rounded-3xl`, jemný stín (`shadow-sm`), žádné tvrdé ohraničení

## Pohyb (animace)
- Knihovna: `framer-motion`
- Vzor: prvky se při scrollu jemně zvednou a prolnou (`opacity 0→1`, `y: 24→0`), `viewport={{ once: true }}`
- Žádné agresivní/rychlé animace – vše `duration ~0.6-0.8s`, `ease: [0.16, 1, 0.3, 1]` (typický Apple "ease-out-expo" pocit)

## Tlačítka
- Primární: `rounded-full bg-ink text-white px-8 py-4`, hover mírně tmavší + `scale-[1.02]`
- Sekundární: `rounded-full border border-line text-ink px-8 py-4`, hover `bg-mist`

## Produktové fotky
Reálné fotky HoloBoardu (`public/gallery/`) - v Hero sekci a galerii se zobrazují přes `next/image` s `object-cover` uvnitř `rounded-3xl` rámu, aby držely stejný jazyk jako zbytek layoutu (karty, zaoblení, žádné tvrdé ohraničení).
