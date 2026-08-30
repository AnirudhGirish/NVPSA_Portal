/**
 * One-shot migration: test.forms -> nvpsa.forms (with sequential serialNumber)
 *                      test.admins -> nvpsa.admins
 *                      nvpsa.counters <- { _id: "alumni_serial_number", seq: 562 }
 *                      indexes on nvpsa.forms / nvpsa.admins
 *
 * Idempotent: safe to re-run.
 */
import mongoose from "mongoose";

const URI = process.env.MIGRATION_URI;
if (!URI) {
  console.error("MIGRATION_URI is required");
  process.exit(1);
}

const BATCH = 200;

async function main() {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 15000 });
  const client = mongoose.connection.getClient();
  const testDb = client.db("test");
  const nvpsaDb = client.db("nvpsa");

  console.log("=== Step 1: Pre-migration checks ===");
  const totalDocs = await testDb.collection("forms").countDocuments({});
  console.log("test.forms count:", totalDocs);
  if (totalDocs !== 562) {
    console.error("ABORT: expected 562 documents");
    process.exit(1);
  }
  const adminCount = await testDb.collection("admins").countDocuments({});
  console.log("test.admins count:", adminCount);

  const existingForms = await nvpsaDb.collection("forms").countDocuments({});
  console.log("nvpsa.forms existing count:", existingForms);
  if (existingForms > 0 && existingForms !== totalDocs) {
    console.error("ABORT: nvpsa.forms has partial data, manual cleanup needed");
    process.exit(1);
  }

  console.log("\n=== Step 2a: Migrate forms with serialNumber ===");
  if (existingForms === 0) {
    const cursor = testDb
      .collection("forms")
      .find({})
      .sort({ createdAt: 1, _id: 1 });

    let serial = 1;
    let batch = [];
    let migrated = 0;

    for await (const doc of cursor) {
      batch.push({
        ...doc,
        serialNumber: serial++,
        __v: 0,
      });
      if (batch.length >= BATCH) {
        await nvpsaDb.collection("forms").insertMany(batch);
        migrated += batch.length;
        console.log(`migrated ${migrated}/${totalDocs}`);
        batch = [];
      }
    }
    if (batch.length > 0) {
      await nvpsaDb.collection("forms").insertMany(batch);
      migrated += batch.length;
      console.log(`migrated ${migrated}/${totalDocs}`);
    }
    console.log("forms migration done:", migrated);
  } else {
    console.log("nvpsa.forms already populated, skipping copy");
  }

  console.log("\n=== Step 2b: Migrate admin record ===");
  const existingAdmins = await nvpsaDb.collection("admins").countDocuments({});
  if (existingAdmins === 0) {
    const adminDocs = await testDb.collection("admins").find({}).toArray();
    if (adminDocs.length > 0) {
      await nvpsaDb.collection("admins").insertMany(adminDocs);
      console.log("admins migrated:", adminDocs.length);
    } else {
      console.warn("WARNING: no admin documents in test.admins");
    }
  } else {
    console.log("nvpsa.admins already populated, skipping copy");
  }

  console.log("\n=== Step 2c: Counter ===");
  const counterDoc = await nvpsaDb
    .collection("counters")
    .findOne({ _id: "alumni_serial_number" });
  const maxSerial = await nvpsaDb
    .collection("forms")
    .find({})
    .sort({ serialNumber: -1 })
    .limit(1)
    .toArray();
  const expectedSeq = maxSerial[0]?.serialNumber ?? 562;

  if (!counterDoc) {
    await nvpsaDb
      .collection("counters")
      .insertOne({ _id: "alumni_serial_number", seq: expectedSeq });
    console.log("counter inserted with seq:", expectedSeq);
  } else if (counterDoc.seq < expectedSeq) {
    await nvpsaDb
      .collection("counters")
      .updateOne({ _id: "alumni_serial_number" }, { $set: { seq: expectedSeq } });
    console.log("counter seq corrected to:", expectedSeq);
  } else {
    console.log("counter already at seq:", counterDoc.seq);
  }

  console.log("\n=== Step 2d: Indexes ===");
  await nvpsaDb.collection("forms").createIndex({ serialNumber: 1 }, { unique: true });
  console.log("index: serialNumber_1 (unique)");
  await nvpsaDb.collection("forms").createIndex({ number: 1 }, { unique: true });
  console.log("index: number_1 (unique)");
  await nvpsaDb
    .collection("forms")
    .createIndex({ name: "text", email: "text", pass: "text", year: "text" });
  console.log("index: text (name,email,pass,year)");
  await nvpsaDb.collection("forms").createIndex({ createdAt: -1 });
  console.log("index: createdAt_-1");
  await nvpsaDb.collection("admins").createIndex({ username: 1 }, { unique: true });
  console.log("index: admins username_1 (unique)");
  await nvpsaDb.collection("admins").createIndex({ email: 1 }, { unique: true });
  console.log("index: admins email_1 (unique)");

  console.log("\n=== Step 2e: Verification ===");
  const finalCount = await nvpsaDb.collection("forms").countDocuments({});
  const maxFinal = await nvpsaDb
    .collection("forms")
    .find({})
    .sort({ serialNumber: -1 })
    .limit(1)
    .toArray();
  console.log("nvpsa.forms count:", finalCount);
  console.log("highest serialNumber:", maxFinal[0]?.serialNumber);

  if (finalCount !== 562 || maxFinal[0]?.serialNumber !== 562) {
    console.error("VERIFICATION FAILED - not dropping test database");
    process.exit(1);
  }

  console.log("\n=== Step 2f: Drop legacy test database ===");
  await testDb.dropDatabase();
  console.log("test database dropped");

  console.log("\nMIGRATION COMPLETE");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("MIGRATION FAILED:", error);
  process.exit(1);
});
