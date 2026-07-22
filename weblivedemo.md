# Web Live Demo Setup

## Current Status

The Airtable API key is now working for the selected base.

Verified with:

```sh
npm run airtable:check
```

Result:

- Airtable token authenticates.
- Base `appdSedUhOfcqzMUZ` is readable.
- Existing Airtable tables are visible.

The live web app currently runs from seeded demo data in `src/seedData.ts`. That means it can be deployed immediately as a polished clickable demo. Airtable is available now, but the app still needs a data integration pass before the live website reads/writes Airtable records.

## Current Airtable Base

Base ID:

```text
appdSedUhOfcqzMUZ
```

Base name from `.env`:

```text
Wearhouse Management System
```

Tables currently visible:

- Products
- Lots
- Customers
- Destinations
- Bins
- Units
- Inbound Transactions
- Outbound Transactions
- Docks

These are close to the warehouse model, but they are not exactly the same as the demo app schema yet. Before connecting the live app to Airtable, we need to map or add fields for:

- Driver assignments
- Pallet QR values
- Bin QR values
- Partial pallet state
- Open box state
- Customer order queue
- Office approval status
- Scan exceptions
- Map coordinates / rack face / shelf level fields

## Local Verification

From the project folder:

```sh
cd /Users/marksmead/gemini/airtable-warehouse-demo
npm install
npm run build
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

## Deploy To Vercel

### 1. Create A GitHub Repo

From the project folder:

```sh
git init
git add .
git commit -m "Build warehouse inventory demo"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Do not commit `.env`. It is already ignored by `.gitignore`.

### 2. Import Into Vercel

In Vercel:

1. Create a new project.
2. Import the GitHub repo.
3. Framework preset: `Vite`.
4. Build command:

```text
npm run build
```

5. Output directory:

```text
dist
```

6. Deploy.

## Environment Variables For Vercel

For the current seeded demo, no Airtable environment variables are required.

When we connect the live app to Airtable, add these in Vercel Project Settings:

```text
AIRTABLE_TOKEN=pat_xxx
AIRTABLE_BASE_ID=appdSedUhOfcqzMUZ
AIRTABLE_BASE_NAME=Wearhouse Management System
```

Important: do not expose the Airtable token in browser-side code. The deployed app must access Airtable through server-side API routes, serverless functions, or a backend proxy.

## Recommended Live Demo Path

### Fastest Demo

Deploy the current Vite app with seeded data.

This is best if the goal is to show:

- Office dashboard
- Driver receiving workflow
- Driver outbound scan workflow
- Interactive map
- Customer inventory view
- Order queue concept
- Pallet tag preview

### Airtable-Connected Demo

After the seeded demo is live, add an integration pass:

1. Map current Airtable tables to the app data model.
2. Add missing fields to Airtable.
3. Seed Airtable records to match the demo.
4. Add server-side API routes.
5. Replace `src/seedData.ts` reads with API calls.
6. Write customer order submissions into Airtable.
7. Write scan confirmations/exceptions into Airtable.

## Suggested Integration Mapping

Current Airtable table to app concept:

- `Products` -> product catalog
- `Lots` -> lot/batch tracking
- `Customers` -> customer selector and ownership
- `Bins` -> warehouse map locations
- `Units` -> pallets/cases in bins
- `Inbound Transactions` -> receiving history
- `Outbound Transactions` -> customer/order shipping history
- `Docks` -> dock/load assignment support

Likely new or expanded tables/fields:

- `Drivers`
- `Driver Assignments`
- `Pick Tasks`
- `Exceptions`
- `Customer Orders`
- `QR Value` fields on bins and units
- `Rack Row`, `Rack Face`, `Position`, and `Level` on bins
- `Current Full Boxes`, `Loose Bags In Open Box`, `Is Partial`, and `Has Open Box` on units

## Pre-Demo Checklist

Before sending the link:

```sh
npm run build
```

Then manually check:

- Office tab loads.
- Driver tab scan buttons work.
- Map tab lets you click bins and see bin/pallet detail.
- Customer tab shows inventory and order queue.
- Tags tab shows printable pallet tags.
- Mobile/tablet width does not break the workflow.

## Notes

The base name currently says `Wearhouse Management System`. If this is not intentional, rename it in Airtable and update `.env` later. The base ID is the important value for API access.

