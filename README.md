# etiketa.wine

`etiketa.wine` je Next.js aplikace pro česká vinařství. Aktuální stack je App Router + React 19 + TypeScript + Appwrite, s veřejnými stránkami vína, dashboardem a interními API route handlery.

## Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Appwrite](https://appwrite.io/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Zod](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Vitest](https://vitest.dev/)

## Požadavky

- Node.js 20
- npm 10
- Lokální nebo cloudové Appwrite prostředí

## Rychlý start

1. Nainstalujte závislosti:
   ```bash
   npm install
   ```

2. Vytvořte lokální env soubor podle `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

3. Doplňte Appwrite a runtime proměnné:
   ```bash
   APPWRITE_ENDPOINT="https://your-appwrite/v1"
   APPWRITE_PROJECT_ID="your-project-id"
   APPWRITE_KEY="your-appwrite-api-key"

   NEXT_PUBLIC_APPWRITE_ENDPOINT="https://your-appwrite/v1"
   NEXT_PUBLIC_APPWRITE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_APPWRITE_PROJECT_NAME="etiketa.wine"
   NEXT_PUBLIC_APP_URL="http://localhost:3232"

   JWT_SECRET="change-me"
   CRON_SECRET="change-me"
   ENCRYPTION_KEY="change-me"
   ```

4. Spusťte aplikaci:
   ```bash
   npm run dev
   ```

5. Otevřete [http://localhost:3232](http://localhost:3232).

## Skripty

- `npm run dev` - vývojový server
- `npm run build` - produkční build
- `npm run start` - spuštění buildu
- `npm run lint` - ESLint kontrola
- `npm run typecheck` - TypeScript kontrola
- `npm run test` - Vitest smoke testy
- `npm run test:watch` - Vitest watch mód
- `npm run appwrite:migrate` - migrace Appwrite struktur a dat mezi prostředími
- `npm run appwrite:setup:winery-profiles` - vytvoření kolekce `winery_profiles` pro dedicated profile path

## Testy

Vitest smoke testy jsou v `tests/` a ověřují základní Appwrite env kontrakt. Stejný adresář obsahuje i starší pomocné Node skripty, které nejsou součástí Vitest discovery.

## CI

GitHub Actions workflow v `.github/workflows/ci.yml` běží na Node 20 a kontroluje `lint`, `typecheck`, `test` a `build`.

## Deploy na Coolify

- Produkční image se staví z root [Dockerfile](/Users/mpmp/development/vinarstvibadin_etikety/Dockerfile) přes `npm ci` na Node 20.
- Coolify service musí používat port `3232`.
- Liveness endpoint je `/api/health`.
- Readiness endpoint je `/api/ready`.

### Build-time proměnné

Tyto proměnné musí být dostupné už při buildu image:

```bash
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_KEY=
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=
NEXT_PUBLIC_APP_URL=
```

### Runtime proměnné

Tyto proměnné musí být dostupné při startu služby:

```bash
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_KEY=
JWT_SECRET=
CRON_SECRET=
ENCRYPTION_KEY=
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=
NEXT_PUBLIC_APP_URL=
ADMIN_EMAILS=
IP_INFO_KEY=
ENABLE_INTERNAL_ROUTES=false
```
