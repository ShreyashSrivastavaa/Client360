import { testCalculations } from "./calculations/engine.test";
import { testCsvParser } from "./csv/parser.test";
import { testMultiTenantIsolation } from "./security/multi-tenant.test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function runAll() {
  console.log("=== ProfitLens Test Suite ===");
  try {
    testCalculations();
    testCsvParser();
    await testMultiTenantIsolation();
    console.log("=============================");
    console.log("ALL TESTS PASSED SUCCESSFULLY! ✓");
  } catch (error) {
    console.error("Test failure:", error);
    process.exit(1);
  }
}

runAll();
