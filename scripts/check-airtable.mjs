import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv();

const required = ["AIRTABLE_TOKEN", "AIRTABLE_BASE_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required env values: ${missing.join(", ")}`);
  process.exit(1);
}

run("airtable-mcp", ["whoami"]);
run("airtable-mcp", ["list-tables-for-base", "--baseId", process.env.AIRTABLE_BASE_ID, "-q"]);

function run(command, args) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  try {
    const output = execFileSync(command, args, {
      encoding: "utf8",
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    console.log(output.trim());
  } catch (error) {
    const stderr = error.stderr?.toString() ?? "";
    console.error(stderr.trim() || error.message);
    process.exit(error.status || 1);
  }
}

function loadEnv() {
  const path = resolve(".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    process.env[key] = value;
  }
}

