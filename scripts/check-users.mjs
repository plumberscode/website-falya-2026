import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const res = await pool.query('SELECT id, email, "createdAt" FROM "User"');
  console.log("USERS IN DB:", JSON.stringify(res.rows, null, 2));
  await pool.end();
}

main().catch(console.error);
