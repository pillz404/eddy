# Vercel Blob + Postgres E-commerce Demo

## Prerequisites
- Vercel account
- Vercel CLI (optional)
- Vercel Postgres created for your project

## Environment variables (Vercel Project Settings)
Set the following env vars in your Vercel project:
- `BLOB_READ_WRITE_TOKEN` — token created in Vercel Blob settings (Read & Write)
- `POSTGRES_URL` — (automatically provided if you created a Vercel Postgres database)

## DB Setup
Run the SQL in `db/schema.sql` once to create the `products` table:

```bash
vercel postgres execute --file db/schema.sql
