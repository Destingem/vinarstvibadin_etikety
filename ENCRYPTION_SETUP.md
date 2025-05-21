# Setting Up Encryption for Wine Data Import/Export

This guide explains how to set up the encryption key for the wine data import/export feature.

## Background

The wine data import/export feature uses a simple obfuscation mechanism to ensure that only your application can read the exported data. This prevents unauthorized access and modification of the data while allowing users to back up their wines or migrate them between instances.

## Setup Instructions

### 1. Generate an Encryption Key

Generate a random string to use as your encryption key. This should be a long, random string that is difficult to guess.

You can generate a suitable key by running the following command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a 64-character hexadecimal string that is suitable for use as your encryption key.

### 2. Add the Key to Your `.env` File

Open your `.env` file and add the following line, replacing `YOUR_GENERATED_KEY` with the key you generated in step 1:

```
ENCRYPTION_KEY=YOUR_GENERATED_KEY
```

### 3. Add the Key to Your Production Environment

If you're deploying your application to a production environment (like Vercel, Netlify, etc.), make sure to add the same `ENCRYPTION_KEY` to your production environment variables as well.

For Vercel, you can add environment variables in the project settings:
1. Go to your Vercel project
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add a new environment variable named `ENCRYPTION_KEY` with your generated key

### Important Notes

- **Keep Your Key Secret**: Do not share your encryption key or commit it to public repositories. Treat it like a password.
- **Consistency**: Once you start using an encryption key, don't change it. If you change the key, users won't be able to import previously exported data.
- **Backup**: Make sure to back up your encryption key. If you lose it, you won't be able to decrypt exported data.

## How It Works

When a user exports their wine data:
1. The data is converted to JSON
2. The JSON is combined with metadata (timestamp, version, etc.)
3. The combined data is encoded to base64
4. A signature is added based on the encoded data and your encryption key

When a user imports wine data:
1. The signature is verified using your encryption key
2. The base64 data is decoded
3. The metadata and wine data are extracted
4. The wine data is imported into the database

This approach ensures that the exported data can only be imported into systems with the same encryption key, preventing unauthorized data manipulation.