import { writeFile } from "fs/promises";
import { join } from "path";
import { getPublicAccionaClient } from "../src";

async function main() {
  const acciona = await getPublicAccionaClient();
  const regions = await acciona.getRegions({ skipCache: true });

  await writeFile(
    join(__dirname, "../assets/regions.json"),
    JSON.stringify(regions),
    "utf-8"
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
