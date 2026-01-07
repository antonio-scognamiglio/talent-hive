import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash.util";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Crea admin di default
  const adminEmail = "admin@talenthive.com";

  // Controlla se admin esiste già
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists, skipping creation");
    return;
  }

  // Crea admin con password hashata
  const hashedPassword = await hashPassword("Admin123!");

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      firstName: "Admin",
      lastName: "TalentHive",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:");
  console.log("   Email:", admin.email);
  console.log("   Password: Admin123!");
  console.log("   ⚠️  REMEMBER: Change this password in production!");

  console.log("\n🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
