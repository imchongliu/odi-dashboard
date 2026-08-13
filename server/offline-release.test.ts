import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const releaseRoot = resolve(process.cwd(), "..", "China-ODI-Dashboard-Offline");
const indexPath = resolve(releaseRoot, "index.html");

describe("static offline release", () => {
  it("contains the standalone dashboard, source data, documentation, and license", () => {
    expect(existsSync(indexPath)).toBe(true);
    expect(existsSync(resolve(releaseRoot, "data", "investments.json"))).toBe(true);
    expect(existsSync(resolve(releaseRoot, "README.md"))).toBe(true);
    expect(existsSync(resolve(releaseRoot, "LICENSE"))).toBe(true);
  });

  it("embeds data and the world map without requiring an API, database, or remote asset", () => {
    const html = readFileSync(indexPath, "utf8");

    expect(html).toContain("const RAW_DATA =");
    expect(html).toContain("data:image/jpeg;base64,");
    expect(html).not.toContain("/api/trpc");
    expect(html).not.toContain("fetch(");
    expect(html).not.toMatch(/https?:\/\//);
  });
});
