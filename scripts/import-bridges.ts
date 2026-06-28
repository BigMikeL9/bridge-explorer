import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";
import { mapRawBridgeRow } from "@/importer/bridgeMapper";

const BATCH_SIZE = 1000;

const prisma = new PrismaClient();

async function flushBatch(
  batch: NonNullable<ReturnType<typeof mapRawBridgeRow>>[]
): Promise<number> {
  if (batch.length === 0) {
    return 0;
  }

  const result = await prisma.bridge.createMany({
    data: batch,
    skipDuplicates: true,
  });

  batch.length = 0;
  return result.count;
}

async function importBridges(inputPath: string): Promise<void> {
  const absolutePath = resolve(inputPath);
  await access(absolutePath);

  const parser = createReadStream(absolutePath).pipe(
    parse({
      bom: true,
      columns: true,
      relax_column_count: true,
      relax_quotes: true,
      skip_empty_lines: true,
      trim: false,
    })
  );

  const batch: NonNullable<ReturnType<typeof mapRawBridgeRow>>[] = [];
  let seenRows = 0;
  let mappedRows = 0;
  let insertedRows = 0;

  for await (const row of parser) {
    seenRows += 1;
    const bridge = mapRawBridgeRow(row);

    if (!bridge) {
      continue;
    }

    mappedRows += 1;
    batch.push(bridge);

    if (batch.length >= BATCH_SIZE) {
      insertedRows += await flushBatch(batch);
      console.log(`Imported ${insertedRows} bridges...`);
    }
  }

  insertedRows += await flushBatch(batch);

  console.log(
    `Import complete. Read ${seenRows} rows, mapped ${mappedRows}, inserted ${insertedRows}.`
  );
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.log("Usage: npm run import:bridges -- <path-to-nbi-csv>");
    return;
  }

  try {
    await importBridges(inputPath);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
