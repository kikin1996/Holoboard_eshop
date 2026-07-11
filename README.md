# HoloBoard – e-shop (Next.js, headless)

Viz `ARCHITECTURE.md` pro popis architektury a `prisma/schema.prisma` pro datový model.

## Lokální spuštění

```bash
npm install
cp .env.example .env.local   # doplň reálné hodnoty
npm run dev
```

Otevři http://localhost:3000 – uvidíš košík s ukázkovými produkty.

---

## Nahrání na GitHub

1. **Založ prázdné repo na GitHubu** (github.com → New repository, bez README/gitignore – ty už máš).
2. V tomto adresáři (`holoboard-shop/`) spusť:

```bash
git init
git add .
git commit -m "Initial commit: HoloBoard headless e-shop skeleton"
git branch -M main
git remote add origin https://github.com/<tvuj-github-ucet>/holoboard-shop.git
git push -u origin main
```

`.gitignore` už je nastavený tak, aby se `node_modules/`, `.next/` ani `.env*` (tajné klíče) nikdy nenahrály do repa.

---

## Nasazení na Vercel

**Nejrychlejší cesta – přes web:**

1. Jdi na [vercel.com](https://vercel.com) → přihlas se přes GitHub účet.
2. „Add New… → Project“ → vyber repo `holoboard-shop`.
3. Vercel automaticky pozná Next.js (framework preset se nastaví sám, build command `next build`, output `.next`).
4. V kroku „Environment Variables“ vlož obsah `.env.example` s reálnými hodnotami (min. `NEXT_PUBLIC_PACKETA_API_KEY`; `COMGATE_MERCHANT_ID` a `COMGATE_SECRET` až budeš mít ostrý/testovací ComGate účet).
5. Klikni „Deploy“. Po pár desítkách sekund dostaneš URL typu `holoboard-shop.vercel.app`.
6. Nastav `NEXT_PUBLIC_SITE_URL` na tuto finální URL (Vercel → Settings → Environment Variables) a redeployni (Vercel → Deployments → „Redeploy“), protože se používá jako `redirectUrl`/`cancelUrl` pro ComGate.

**Alternativa – přes Vercel CLI:**

```bash
npm i -g vercel
vercel login
vercel            # propojí a nasadí preview
vercel --prod     # nasadí na produkční doménu
```

**Automatické nasazování:** jakmile je repo propojené s Vercel projektem, každý `git push` na `main` spustí produkční deploy a každý push do jiné větve / pull requestu vytvoří samostatný preview deploy s vlastní URL – ideální pro testování před spojením do `main`.

### Až budeš mít reálný ComGate a Packeta účet

- U ComGate v administraci nastav URL pro notifikace na `https://<tvoje-domena>/api/webhooks/comgate`.
- `COMGATE_SECRET` a `MEDUSA_ADMIN_TOKEN`/`STRAPI_API_TOKEN` nastavuj **jen** ve Vercel Environment Variables (ne `NEXT_PUBLIC_*`), ať nikdy neskončí v kódu prohlížeče.
- Napojení na MedusaJS/Strapi (viz `[TODO]` komentáře v `app/api/checkout/route.ts`) dopiš podle konkrétní instance, kterou zprovozníš (Medusa Cloud, self-hosted, Strapi Cloud…).
