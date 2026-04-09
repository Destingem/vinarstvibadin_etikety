# Návod na instalaci a nastavení

Tento soubor popisuje aktuální nastavení aplikace `etiketa.wine`.

## Požadavky

- Node.js 20
- npm 10
- Appwrite projekt pro produkční i lokální provoz

## Instalace

### 1. Klonování repozitáře

```bash
git clone https://github.com/vase-uzivatelske-jmeno/vinarstvibadin_etikety.git
cd vinarstvibadin_etikety
```

### 2. Instalace závislostí

```bash
npm install
```

### 3. Nastavení prostředí

Vytvořte soubor `.env` v kořenovém adresáři projektu s následujícím obsahem:

```
APPWRITE_ENDPOINT="https://your-appwrite/v1"
APPWRITE_PROJECT_ID="your-project-id"
APPWRITE_KEY="your-appwrite-api-key"

NEXT_PUBLIC_APPWRITE_ENDPOINT="https://your-appwrite/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_APPWRITE_PROJECT_NAME="etiketa.wine"
NEXT_PUBLIC_APP_URL="http://localhost:3232"

JWT_SECRET="vas-tajny-klic-zde"
CRON_SECRET="vas-cron-secret"
ENCRYPTION_KEY="vas-encryption-key"
```

Pokud používáte dedicated profile path, založte kolekci:

```bash
npm run appwrite:setup:winery-profiles
```

### 4. Spuštění aplikace

Pro spuštění vývojového serveru:

```bash
npm run dev
```

Pro produkční build:

```bash
npm run build
npm run start
```

## Užitečné příkazy

| Příkaz | Popis |
|--------|-------|
| `npm run dev` | Spustí vývojový server |
| `npm run build` | Vytvoří produkční build |
| `npm run start` | Spustí produkční server |
| `npm run lint` | ESLint kontrola |
| `npm run typecheck` | TypeScript kontrola |
| `npm run test` | Vitest smoke testy |
| `npm run appwrite:migrate` | Jednorázová Appwrite migrace |
| `npm run appwrite:setup:winery-profiles` | Vytvoří kolekci `winery_profiles` |

## Struktura adresářů

```
/
├── public/             # Statické soubory
└── src/
    ├── app/            # Next.js App Router
    │   ├── api/        # API routes
    │   ├── dashboard/  # Dashboard pages
    │   ├── [winery]/   # Veřejné stránky s informacemi o víně
    │   └── ...
    ├── components/     # React komponenty
    ├── lib/            # Sdílené knihovny a utility
    └── types/          # TypeScript typy
```

## Nasazení do produkce

Coolify má používat root `Dockerfile`, port `3232`, liveness `/api/health` a readiness `/api/ready`.

Nutné proměnné prostředí:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_KEY`
- `JWT_SECRET`
- `CRON_SECRET`
- `ENCRYPTION_KEY`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `NEXT_PUBLIC_APPWRITE_PROJECT_NAME`
- `NEXT_PUBLIC_APP_URL`

## Řešení problémů

### Problém s Appwrite připojením

Ujistěte se, že:
- Appwrite běží
- API key má oprávnění pro users/documents/storage, které aplikace potřebuje
- `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID` a `APPWRITE_KEY` jsou správně nastavené

### Problémy s Node.js verzí

Aplikace vyžaduje Node.js 20. Zkontrolujte vaši verzi:

```bash
node --version
```

Pokud používáte starší verzi, zvažte použití [nvm](https://github.com/nvm-sh/nvm) pro správu verzí Node.js.
