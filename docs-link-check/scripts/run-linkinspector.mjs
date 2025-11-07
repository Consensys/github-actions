#!/usr/bin/env node
/**
 * Wrapper for @umbrelladocs/linkspector
 * Fixes CommonJS import of @umbrelladocs/rdformat-validator for Node 20+.
 * Works when dependencies are installed in the caller repository.
 */

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function importValidator() {
  try {
    // Try local import first
    return await import("@umbrelladocs/rdformat-validator");
  } catch {
    console.warn("⚠️ validator not found locally; resolving from caller repo...");
    try {
      // Dynamically resolve from the parent repository
      const require = createRequire(import.meta.url);
      const path = require.resolve("@umbrelladocs/rdformat-validator", {
        paths: [resolve(process.cwd(), "node_modules")],
      });
      return await import(`file://${path}`);
    } catch (err) {
      console.error("❌ Could not resolve @umbrelladocs/rdformat-validator", err);
      process.exit(1);
    }
  }
}

async function main() {
  // Import linkspector CLI
  let linkspector;
  try {
    linkspector = await import("@umbrelladocs/linkspector/lib/cli.js");
  } catch (err) {
    console.error("❌ Could not import @umbrelladocs/linkspector CLI:", err);
    process.exit(1);
  }

  // Import validator safely
  const validatorPkg = await importValidator();
  const { validateAndFix } = validatorPkg;
  globalThis.validateAndFix = validateAndFix;

  // Run linkspector’s CLI
  const cli = linkspector.default || linkspector.run;
  if (typeof cli === "function") {
    await cli();
  } else {
    console.error("⚠️ No valid entry point found in linkspector.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ linkspector wrapper failed:", err);
  process.exit(1);
});
