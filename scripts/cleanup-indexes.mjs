/**
 * One-shot index cleanup for nvpsa.forms.
 * Drops the legacy 4-field text index and creates the strict
 * { name: 1, email: 1 } compound index.
 * Idempotent: safe to re-run.
 */
import mongoose from "mongoose";

const URI = process.env.MIGRATION_URI;
if (!URI) {
  console.error("MIGRATION_URI is required");
  process.exit(1);
}

async function main() {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 15000 });
  const forms = mongoose.connection.db.collection("forms");

  console.log("=== Before ===");
  for (const idx of await forms.indexes()) {
    console.log("-", idx.name, JSON.stringify(idx.key), idx.unique ? "(unique)" : "");
  }

  const TEXT_INDEX_NAME = "name_text_email_text_pass_text_year_text";
  const textIndex = await forms.indexExists(TEXT_INDEX_NAME);
  if (textIndex) {
    await forms.dropIndex(TEXT_INDEX_NAME);
    console.log("\nDropped text index:", TEXT_INDEX_NAME);
  } else {
    console.log("\nText index already absent");
  }

  const hasCompound = await forms.indexExists("name_1_email_1");
  if (!hasCompound) {
    await forms.createIndex({ name: 1, email: 1 }, { name: "name_1_email_1" });
    console.log("Created compound index: name_1_email_1");
  } else {
    console.log("Compound index name_1_email_1 already exists");
  }

  console.log("\n=== After ===");
  for (const idx of await forms.indexes()) {
    console.log("-", idx.name, JSON.stringify(idx.key), idx.unique ? "(unique)" : "");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("INDEX CLEANUP FAILED:", error);
  process.exit(1);
});
