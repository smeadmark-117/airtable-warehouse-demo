# Setup Notes

## Airtable Credentials

Put the Airtable personal access token in `.env`:

```sh
AIRTABLE_TOKEN=pat_xxx
```

The Airtable CLI uses `AIRTABLE_TOKEN`, so once `.env` is loaded we can discover tools, create the base/tables if supported, and seed fake data.

Recommended token scopes for the demo:

- Read base metadata
- Write base schema
- Read records
- Write records

The exact Airtable scope names may vary in the token UI. The token also needs access to the workspace/base where the demo will live.

## Loading `.env`

From this folder:

```sh
set -a
source .env
set +a
```

Then check access:

```sh
airtable-mcp whoami
airtable-mcp tools --json
```

## Next Setup Step

After the token is in place, we should:

1. Discover the available Airtable MCP tools.
2. Confirm whether the tools can create bases, tables, fields, and forms.
3. Create or select the demo base.
4. Build tables from `schema.md`.
5. Seed demo products, bins, drivers, incoming orders, outbound orders, pallets, and pick tasks.
6. Create Airtable forms if the MCP tools expose form creation. If not, create forms manually in Airtable and use the same table schema.

