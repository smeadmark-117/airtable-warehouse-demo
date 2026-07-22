import { readFileSync } from "node:fs";

const schema = readFileSync(new URL("../schema.md", import.meta.url), "utf8");
const tableSection = schema.split("## Tables")[1]?.split("## Seed Data Needed")[0] ?? "";
const tables = [...tableSection.matchAll(/^### (.+)$/gm)].map((match) => match[1]);

console.log("Airtable setup plan");
console.log("====================");
console.log("");
console.log("Create or verify these tables:");
for (const table of tables) {
  console.log(`- ${table}`);
}
console.log("");
console.log("Next automation step once token permissions allow base access:");
console.log("1. Read current base tables.");
console.log("2. Create missing tables with primary fields.");
console.log("3. Add fields from schema.md.");
console.log("4. Seed demo customers, products, lots, bins, pallets, orders, assignments, and exceptions.");
console.log("5. Create Airtable forms/interfaces where the CLI supports it.");
