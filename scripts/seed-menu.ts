// scripts/seed-menu.ts
//
// Migrasi SEKALI JALAN: salin seluruh data di INITIAL_MENU (lib/data/menuData.ts)
// ke tabel MenuItem di database. Dijalankan manual lewat `npm run seed:menu`
// — bukan bagian dari predev/prebuild, karena hanya perlu dijalankan sekali
// saat pertama kali database ditambahkan (upsert, jadi aman dijalankan ulang
// tanpa duplikasi data).
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { INITIAL_MENU } from "../lib/data/menuData";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  let created = 0;
  let updated = 0;

  for (const item of INITIAL_MENU) {
    const existing = await prisma.menuItem.findUnique({ where: { id: item.id } });

    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image,
        unit: item.unit || "pcs",
        isPopular: item.isPopular ?? false,
        isAvailable: item.isAvailable,
      },
      create: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image,
        unit: item.unit || "pcs",
        isPopular: item.isPopular ?? false,
        isAvailable: item.isAvailable,
      },
    });

    if (existing) updated++;
    else created++;
  }

  console.log(`✓ Seed menu selesai: ${created} dibuat, ${updated} diperbarui.`);
}

main()
  .catch((err) => {
    console.error("Seed menu gagal:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
