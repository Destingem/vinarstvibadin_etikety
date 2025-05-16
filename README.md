# VinařstvíQR - Systém pro generování QR kódů pro etikety vín

Systém pro jednoduché a efektivní splnění legislativních požadavků na označování vín QR kódy s výživovými údaji a složením.

## O projektu

VinařstvíQR je webová aplikace, která umožňuje vinařstvím vytvářet a spravovat QR kódy pro etikety vín. Od roku 2023 je v EU povinné uvádět na etiketách vín výživové údaje a seznam složek, které mohou být poskytnuty prostřednictvím QR kódu.

### Hlavní funkce

- Registrace a přihlášení vinařství
- Správa vín a jejich údajů
- Automatické generování QR kódů
- Veřejně dostupné stránky s informacemi o víně
- Splnění legislativních požadavků EU

## Technologie

- [Next.js](https://nextjs.org/) 15.x - React framework
- [TypeScript](https://www.typescriptlang.org/) - Typový systém
- [Prisma](https://www.prisma.io/) - ORM pro práci s databází
- [PostgreSQL](https://www.postgresql.org/) - Databázový systém
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [React Hook Form](https://react-hook-form.com/) - Správa formulářů
- [Zod](https://zod.dev/) - Validace dat
- [QRCode](https://www.npmjs.com/package/qrcode) - Generování QR kódů

## Požadavky

- Node.js 18.x nebo novější
- PostgreSQL 14.x nebo novější
- Yarn nebo npm

## Instalace

1. Klonujte repozitář:
   ```bash
   git clone https://github.com/vase-uzivatelske-jmeno/vinarstvibadin_etikety.git
   cd vinarstvibadin_etikety
   ```

2. Nainstalujte závislosti:
   ```bash
   yarn install
   # nebo
   npm install
   ```

3. Vytvořte soubor `.env` s připojením k databázi:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wine_qr_codes?schema=public"
   JWT_SECRET="vas-tajny-klic-zde"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. Inicializujte databázi:
   ```bash
   yarn db:migrate
   # nebo
   npm run db:migrate
   ```

5. (Volitelně) Naplňte databázi testovacími daty:
   ```bash
   yarn db:seed
   # nebo
   npm run db:seed
   ```

6. Spusťte vývojový server:
   ```bash
   yarn dev
   # nebo
   npm run dev
   ```

7. Otevřete [http://localhost:3000](http://localhost:3000) ve vašem prohlížeči.

## Struktura projektu

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

## Legislativní požadavky

Od 8. prosince 2023 je v EU povinné uvádět na etiketách vín výživové údaje a seznam složek. Tyto informace mohou být poskytnuty prostřednictvím QR kódu.

### Požadované informace v QR kódu

1. **Výživové údaje (na 100 ml)**:
   - Energetická hodnota (kJ/kcal)
   - Množství tuků, nasycených mastných kyselin, sacharidů, cukrů, bílkovin a soli

2. **Seznam složek**:
   - Musí začínat slovem "Složení:"
   - Obsahuje hrozny, antioxidanty (např. oxid siřičitý), regulátory kyselosti a další

3. **Další povinné údaje**:
   - Přesná identifikace vína (název, ročník, šarže, obsah alkoholu)
   - Informace o plniči/výrobci
   - Odkaz na vinařskou oblast, podoblast, obec a trať

## Licence

Tento projekt je licencován pod MIT licencí - viz soubor [LICENSE](LICENSE) pro detaily.