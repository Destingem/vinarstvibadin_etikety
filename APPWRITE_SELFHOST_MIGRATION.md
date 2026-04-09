# Self-Hosted Appwrite Migration

This repository now includes a one-off migration script for moving `etiketa.wine`
from Appwrite Cloud to `https://appwrite.bytedev.cz/v1`.

## Required environment variables

Runtime app variables:

```env
APPWRITE_ENDPOINT="https://appwrite.bytedev.cz/v1"
APPWRITE_PROJECT_ID="etiketawine"
APPWRITE_KEY="..."
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://appwrite.bytedev.cz/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="etiketawine"
NEXT_PUBLIC_APPWRITE_PROJECT_NAME="etiketawine"
NEXT_PUBLIC_APP_URL="https://etiketa.wine"
```

Migration-only variables:

```env
MIGRATION_SOURCE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
MIGRATION_SOURCE_PROJECT_ID="vinarstviqr"
MIGRATION_SOURCE_API_KEY="..."
MIGRATION_TARGET_ENDPOINT="https://appwrite.bytedev.cz/v1"
MIGRATION_TARGET_PROJECT_ID="etiketawine"
MIGRATION_TARGET_API_KEY="..."
MIGRATION_TARGET_WEB_HOSTS="https://etiketa.wine,http://localhost:3232"
MIGRATION_RECREATE_DOCUMENTS="false"
```

## Run

```bash
npm run appwrite:migrate
```

Important:

- Do not run the cutover on self-hosted Appwrite `1.7.x`. On `appwrite.bytedev.cz` version `1.7.4`, documents are created without the `$sequence` system field, which breaks Appwrite Console document routes and produces `document-undefined` URLs.
- Upgrade the target Appwrite instance to `1.8.0+` first and run Appwrite's own internal migrate command.
- After the Appwrite upgrade, rerun this script with `MIGRATION_RECREATE_DOCUMENTS=true` so target documents are deleted and recreated with fresh server metadata, including `$sequence`.

The script is idempotent for the current migration scope:

- creates missing databases, collections, attributes, and indexes from `appwrite.json`
- imports Appwrite users with hashed passwords
- upserts documents with original IDs and permissions
- verifies source and target totals after the run

## Known limitation

The current target API key does not have `platforms.read` / `platforms.write`, so the
script can only warn about required Web platforms. Create these manually in Appwrite:

- `https://etiketa.wine`
- `http://localhost:3232`

SMTP is intentionally out of scope for this migration. Until SMTP is configured on
`appwrite.bytedev.cz`, password recovery e-mails will not work.
