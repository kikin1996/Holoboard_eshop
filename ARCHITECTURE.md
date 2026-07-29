
# HoloBoard – Headless e-shop: technická architektura

Stack: **Next.js (App Router) + Tailwind** (frontend) / **MedusaJS nebo Strapi** (e-commerce jádro) / **Stripe** (platby) / **Packeta (Zásilkovna)** (doprava).

---

## 1. Architektura a API toky

### 1.1 Základní princip

Next.js nikdy nemluví s platební bránou ani se skladem přímo z prohlížeče, pokud jde o citlivé operace (vytvoření platby, potvrzení zaplacení, změna skladu). Prohlížeč (klient) smí:

- číst veřejná data produktů (katalog, ceny, dostupnost) přes REST/GraphQL API backendu,
- zapisovat do *vlastního* košíku (Medusa Cart API je k tomu určené a bezpečné i z klienta – pracuje s cart ID uloženým v cookie),
- volat *vlastní* Next.js API routy (`/app/api/*`), které teprve server-to-server komunikují se Stripe a Medusa/Strapi admin API.

Tajné klíče (Stripe `secret key`, Medusa admin token, Strapi API token se zápisem) žijí **pouze** v `.env` na serveru a používají se výhradně uvnitř Next.js Route Handlers (Node runtime), nikdy v `NEXT_PUBLIC_*` proměnných.

```
┌─────────────┐        veřejné REST/GraphQL          ┌──────────────────┐
│   Next.js   │ ────────────────────────────────────▶ │ MedusaJS/Strapi  │
│  (Server    │ ◀──────────────────────────────────── │  (produkty,      │
│ Components) │        JSON (produkty, ceny, sklad)   │   sklad, cart)   │
└─────┬───────┘                                        └────────┬─────────┘
      │ React (client)                                          │ admin API
      │ Cart state + Packeta widget                             │ (server-to-server,
      ▼                                                          │  tajný token)
┌─────────────┐   POST /api/checkout      ┌──────────────┐       │
│   Košík     │ ─────────────────────────▶│ Next.js API  │───────┘
│ (Client Cmp)│                           │  Route Handler│
└─────────────┘                           │  (Node runtime)│
                                          └──────┬────────┘
                                                 │ server-to-server (secret)
                                                 ▼
                                          ┌──────────────┐
                                          │   Stripe      │
                                          │ Checkout API  │
                                          └──────┬────────┘
                                                 │ redirect (302) uživatele na branu
                                                 ▼
                                          uživatel platí na checkout.stripe.com
                                                 │
                                                 │ webhook (server-to-server, podepsané)
                                                 ▼
                                          POST /api/webhooks/stripe ──▶ ověření
                                          (Next.js API Route)          podpisu + update
                                                                        objednávky
```

### 1.2 Tok dat – produkty a katalog

1. Next.js Server Component (`app/produkty/[slug]/page.tsx`) v build-time (SSG) nebo přes ISR (`revalidate: 60`) volá REST/GraphQL endpoint Medusy (`/store/products`) nebo Strapi (`/api/products?populate=*`).
2. Data se renderují server-side → SEO friendly, žádný tajný klíč není potřeba (store/veřejné API má vlastní publishable key, ne admin token).
3. Cena, sklad, varianty se cachují (ISR) a revalidují buď na čas, nebo přes **on-demand revalidation** – Medusa/Strapi po změně produktu zavolá webhook na `POST /api/revalidate?tag=products&secret=...`, který v Next.js zavolá `revalidateTag('products')`.

### 1.3 Tok dat – košík

- Košík se vytváří přes Medusa Cart API (`POST /store/carts`) hned při první návštěvě, cart ID se uloží do `httpOnly` cookie (nebo localStorage, pokud chcete plnou klientskou kontrolu).
- Přidání položky, změna množství → přímé volání `POST /store/carts/:id/line-items` z klienta (toto je bezpečné, protože Medusa store API nepracuje s penězi, jen se skladem a cenami, které si server sám dopočítá – klient nemůže poslat vlastní cenu).
- **Doprava a platba** se do košíku dopisují jako metadata (viz 1.4 a 1.5) a teprve poslední krok (checkout) jde přes vlastní server route, protože tam se řeší peníze.

### 1.4 Doprava – Zásilkovna / Packeta Widget

**Krok A – výběr výdejního místa (klient):**

1. Do `app/layout.tsx` nebo přímo do komponenty košíku se dynamicky načte oficiální knihovna:
   `https://widget.packeta.com/v6/www/js/library.js` (přes `next/script`, strategie `lazyOnload`).
2. Po kliknutí na tlačítko „Vybrat výdejní místo“ se zavolá `Packeta.Widget.pick(apiKey, callback, options)`.
   - `apiKey` = **veřejný** Packeta API klíč (smí být v `NEXT_PUBLIC_PACKETA_API_KEY`, není citlivý).
   - `callback(point)` – widget vrátí objekt bodu (`id`, `name`, `city`, `street`, `zip`, `country`, …).
3. `id` a `name` (případně celá adresa) se uloží do React state košíku (`selectedPickupPoint`) a zobrazí se uživateli jako potvrzení.

**Krok B – uložení do objednávky (server):**

4. Při odeslání checkoutu (`POST /api/checkout`) se `packetaBranchId` a `packetaBranchName` pošlou spolu s obsahem košíku na server.
5. Next.js API route zapíše tyto hodnoty do `shipping_address.metadata` objednávky v Meduse (nebo do vlastního pole v Strapi Order content-type) – viz schéma v části 2.
6. Přepravní štítek se generuje později (fulfillment): Next.js/Medusa zavolá Packeta API (`/api/packeta/createPacket`) se stejným `packetaBranchId` jako cílovou pobočkou.

Widget běží jen na klientovi, žádný tajný klíč se nepřenáší – jediné, co server potřebuje uchovat, je **ID pobočky**.

### 1.5 Platba – Stripe

Stripe Checkout Session se vytváří server-to-server pomocí tajného `STRIPE_SECRET_KEY` (Stripe SDK, ne holé REST volání jako u dřívějšího ComGate). Webhook se ověřuje kryptografickým podpisem (HMAC nad syrovým tělem požadavku), ne IP whitelistingem.

**Krok A – vytvoření platby (server):**

1. Klient klikne na „Přejít k platbě“ → `POST /api/checkout` s obsahem košíku (položky, doprava, `packetaBranchId`/adresa, jméno, e-mail, telefon).
2. Next.js API route (`app/api/checkout/route.ts`):
   - založí objednávku (status `PENDING`, uloží doručovací údaje),
   - zavolá `stripe.checkout.sessions.create({...})` s položkami (`line_items`), dopravou jako extra položkou, `metadata.orderNumber` (pro pozdější spárování webhooku), `success_url` a `cancel_url`.
   - Stripe vrátí `checkoutSession.url` a `checkoutSession.id`; `id` se uloží k objednávce (`paymentTransactionId`).
3. Next.js vrátí klientovi `redirectUrl` (= `checkoutSession.url`), klient prohlížeč přesměruje (`window.location.href = redirectUrl`) na Stripe Checkout.

**Krok B – potvrzení platby (webhook, server-to-server):**

4. Po zaplacení Stripe zavolá `POST /api/webhooks/stripe` s eventem `checkout.session.completed` (podepsaným v hlavičce `stripe-signature`).
5. **Nikdy se nevěří tělu webhooku bez ověření** – `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)` ověří, že požadavek opravdu přišel od Stripe (jinak vyhodí výjimku a route vrátí 400).
6. Až po tomto ověření se objednávka označí jako zaplacená (`status = PAID`), odešle se potvrzovací e-mail (Resend) a případně (`[TODO]`) sníží sklad.
7. Zákazník se po návratu z brány (`success_url`) dostane na "Děkujeme" stránku – **stránka nikdy sama netvrdí, že je zaplaceno jen proto, že se tam uživatel dostal**, protože webhook a redirect přichází asynchronně a nezávisle na sobě (viz demo-režim banner na téže stránce, když Stripe není nakonfigurované vůbec).

### 1.6 Shrnutí bezpečnostních zásad

1. Tajné klíče (Stripe `secret key`/`webhook secret`, admin tokeny) pouze v serverových `.env`, nikdy v `NEXT_PUBLIC_*`.
2. Cena se vždy dopočítává na serveru (Medusa/Strapi + Next.js route) – klient posílá jen ID varianty a množství, nikdy částku.
3. Platba se potvrzuje dvojitě: webhook je jen "spouštěč", jeho podpis se ověřuje kryptograficky (`stripe.webhooks.constructEvent`), ne jen tím, že požadavek přišel.
4. Next.js API routy pro checkout/webhook běží v Node runtime (ne Edge), protože potřebují tajné proměnné a plnou HTTP knihovnu.

---

## 2. Návrh databáze pro produkt HoloBoard

Schéma je navržené jako obecný datový model (nezávislý na tom, jestli finálně poběží nad Medusa moduly nebo Strapi content-types) – slouží jako specifikace polí, ne jako doslovný DDL. Prisma syntaxe je zvolená pro čitelnost vztahů. Plný soubor je v `prisma/schema.prisma`.

### 2.1 Produkt a varianty

- **Product** – samotný HoloBoard (může být do budoucna víc modelů: HoloBoard Sport, HoloBoard Cruiser).
- **ProductOption** – typ volby, např. „Barva“, „Balíček příslušenství“.
- **ProductOptionValue** – konkrétní hodnota volby, např. „Ocean Blue“, „Weekend Kit“.
- **ProductVariant** – konkrétní prodejná kombinace (barva × příslušenství), má vlastní SKU, cenu a sklad.
- **Inventory** – sklad k variantě, odděleně od varianty kvůli více skladům/rezervacím.

### 2.2 Objednávka

- **Order** – hlavička objednávky, včetně `shippingMethod`, `packetaBranchId`, `packetaBranchName`, `paymentProvider`, `paymentTransactionId`, `paymentStatus`.
- **OrderItem** – položky objednávky (řádky), vážou se na `ProductVariant` a uchovávají cenu **v čase objednání** (cena produktu se může později změnit, historická objednávka musí zůstat neměnná).

Klíčová pole pro tento zadání: `Order.packetaBranchId` a `Order.packetaBranchName` – ukládá se sem výstup z Packeta Widgetu (viz 1.4), nic víc z widgetu ukládat netřeba (celá adresa pobočky se dá kdykoliv dotáhnout přes Packeta API podle ID při generování štítku).

---

## 3. Co je v tomto repozitáři reálně funkční

- `npm run dev` spustí košík (`app/page.tsx` → `components/Cart.tsx`) s ukázkovými daty.
- Tlačítko „Vybrat výdejní místo“ opravdu otevře ostrý Packeta Widget (potřebuje `NEXT_PUBLIC_PACKETA_API_KEY`).
- Tlačítko „Přejít k platbě“ zavolá `app/api/checkout/route.ts`:
  - bez nastaveného `STRIPE_SECRET_KEY` vrátí mock redirect na `/objednavka/dekujeme` (demo režim, jasně označený bannerem),
  - s nastaveným klíčem reálně založí Stripe Checkout Session a přesměruje na ostrou/testovací bránu.
- `app/api/webhooks/stripe/route.ts` je připravený endpoint pro Stripe notifikace (potřebuje nastavit `STRIPE_WEBHOOK_SECRET` a URL webhooku ve Stripe Dashboardu → Developers → Webhooks).
- Napojení na MedusaJS/Strapi (načtení produktů, zápis objednávky, odečet skladu) je označené `[TODO]` v kódu – to už záleží na konkrétní zvolené instanci a jejím API.
