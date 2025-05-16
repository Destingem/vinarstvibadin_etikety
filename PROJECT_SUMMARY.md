# VinařstvíQR - Shrnutí projektu

## Přehled projektu

VinařstvíQR je webová aplikace, která umožňuje vinařstvím vytvářet a spravovat QR kódy pro etikety vín v souladu s legislativními požadavky EU. Aplikace umožňuje:

1. Registraci a přihlášení vinařství
2. Správu informací o vínech včetně výživových údajů
3. Automatické generování QR kódů
4. Veřejně dostupné stránky s informacemi o víně, na které QR kódy odkazují

## Hlavní funkce

### Správa uživatelů (vinařství)
- Registrace nových vinařství
- Přihlášení a autentizace
- Správa profilu vinařství

### Správa vín
- Přidávání nových vín
- Editace a smazání vín
- Zadávání výživových údajů a složení
- Zadávání původu vína (region, podoblast, obec, trať)

### QR kódy
- Automatické generování QR kódů pro každé víno
- Stahování QR kódů pro tisk na etikety
- Možnost testování funkčnosti QR kódů

### Veřejné stránky s informacemi
- Pro každé víno je vytvořena veřejná stránka s informacemi
- Stránka obsahuje všechny povinné údaje vyžadované legislativou
- Stránka je optimalizovaná pro mobilní zařízení (pro snadné čtení po naskenování QR kódu)

## Technické detaily

### Použité technologie
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Prisma ORM
- Databáze: PostgreSQL
- Autentizace: JWT (JSON Web Tokens)
- QR kódy: qrcode knihovna pro Node.js

### Struktura projektu
- Moderní architektura s Next.js App Routerem
- Oddělení klientského a serverového kódu
- Typová bezpečnost s TypeScriptem
- Validace dat pomocí Zod
- Formuláře s React Hook Form

### Bezpečnost
- Hashování hesel s bcrypt
- JWT autentizace
- CSRF ochrana
- Validace všech vstupních dat

## Budoucí rozšíření

Pro budoucí vývoj jsou naplánovány následující funkce:

1. **Statistiky a analytika**
   - Sledování počtu naskenování QR kódů
   - Geografická distribuce skenování
   - Uživatelské metriky

2. **Týmová spolupráce**
   - Přidání více uživatelů do jednoho vinařství
   - Přidělení rolí a oprávnění

3. **Pokročilá správa QR kódů**
   - Různé styly QR kódů
   - Možnost integrace loga vinařství do QR kódu
   - Alternativní barvy

4. **Více jazykových verzí**
   - Vícejazyčné rozhraní aplikace
   - Vícejazyčné veřejné stránky pro QR kódy (pro export vín)

5. **Integrace s etiketovacími systémy**
   - Export QR kódů ve formátech kompatibilních s běžnými etiketovacími systémy

## Závěr

Projekt VinařstvíQR poskytuje kompletní řešení pro vinařství, která potřebují splnit legislativní požadavky na označování vín QR kódy. Aplikace je navržena s důrazem na uživatelskou přívětivost, bezpečnost a spolehlivost.