# Návod na instalaci a nastavení

Tento soubor obsahuje podrobný návod na instalaci a nastavení aplikace VinařstvíQR.

## Požadavky

- Node.js 18.x nebo novější
- PostgreSQL 14.x nebo novější
- Yarn nebo npm

## Instalace

### 1. Klonování repozitáře

```bash
git clone https://github.com/vase-uzivatelske-jmeno/vinarstvibadin_etikety.git
cd vinarstvibadin_etikety
```

### 2. Instalace závislostí

```bash
yarn install
# nebo
npm install
```

### 3. Nastavení prostředí

Vytvořte soubor `.env` v kořenovém adresáři projektu s následujícím obsahem:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wine_qr_codes?schema=public"
JWT_SECRET="vas-tajny-klic-zde"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Upravte připojení k databázi podle vašeho nastavení:
- Nahraďte `postgres:postgres` vaším uživatelským jménem a heslem k PostgreSQL
- Nahraďte `localhost:5432` vaším hostitelem a portem PostgreSQL
- Nahraďte `wine_qr_codes` názvem vaší databáze
- Nastavte bezpečný `JWT_SECRET` pro šifrování tokenů
- Nastavte `NEXT_PUBLIC_BASE_URL` na URL vaší aplikace (v produkci to bude vaše doména)

### 4. Vytvoření databáze

Vytvořte databázi v PostgreSQL:

```bash
createdb wine_qr_codes
# nebo použijte PostgreSQL GUI klienta
```

### 5. Inicializace databáze

Pro vytvoření tabulek v databázi spusťte:

```bash
yarn db:migrate
# nebo
npm run db:migrate
```

### 6. Nastavení administrátorského účtu

Pro vytvoření výchozího účtu a příkladových vín:

```bash
yarn db:setup
# nebo
npm run db:setup
```

Tento příkaz vytvoří administrátorský účet s následujícími údaji:
- **Email**: admin@vinarstviqr.cz
- **Heslo**: Admin123456

Tyto údaje byste měli po prvním přihlášení změnit.

### 7. Spuštění aplikace

Pro spuštění vývojového serveru:

```bash
yarn dev
# nebo
npm run dev
```

Pro produkční build:

```bash
yarn build
yarn start
# nebo
npm run build
npm run start
```

## Užitečné příkazy

| Příkaz | Popis |
|--------|-------|
| `yarn dev` | Spustí vývojový server |
| `yarn build` | Vytvoří produkční build |
| `yarn start` | Spustí produkční server |
| `yarn db:migrate` | Spustí migrace databáze |
| `yarn db:setup` | Inicializuje databázi s administrátorským účtem |
| `yarn db:reset` | Resetuje databázi (smaže všechna data) |
| `yarn db:seed` | Naplní databázi testovacími daty |
| `yarn db:studio` | Spustí Prisma Studio pro prohlížení databáze |

## Struktura adresářů

```
/
├── prisma/             # Prisma schema a migrace
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

Pro nasazení do produkce doporučujeme použít Vercel, který je optimalizovaný pro Next.js aplikace:

1. Vytvořte účet na [Vercel](https://vercel.com)
2. Nahrajte kód na GitHub, GitLab nebo Bitbucket
3. Importujte projekt do Vercel
4. Nastavte proměnné prostředí:
   - `DATABASE_URL`: Připojení k vaší produkční databázi
   - `JWT_SECRET`: Bezpečný tajný klíč pro JWT
   - `NEXT_PUBLIC_BASE_URL`: URL vaší produkční aplikace

Pro jiné platformy (AWS, DigitalOcean, atd.) postupujte podle standardních postupů pro nasazení Next.js aplikací.

## Řešení problémů

### Problém s připojením k databázi

Ujistěte se, že:
- PostgreSQL běží
- Databáze `wine_qr_codes` existuje
- Uživatel má přístup k databázi
- Připojovací řetězec v `.env` je správný

### Problémy s Node.js verzí

Aplikace vyžaduje Node.js 18.x nebo novější. Zkontrolujte vaši verzi:

```bash
node --version
```

Pokud používáte starší verzi, zvažte použití [nvm](https://github.com/nvm-sh/nvm) pro správu verzí Node.js.