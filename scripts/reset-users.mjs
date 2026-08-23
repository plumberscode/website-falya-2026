import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await pool.query('DELETE FROM "User"');
  console.log("SUCCESS: User table has been completely reset!");
  await pool.end();
}

main().catch(console.error);
