import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client.js";
import bcrypt from "bcryptjs";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "FHWien123!";

async function setPasswords() {
  console.log("🔐 Starting password update...\n");

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (users.length === 0) {
      console.log("⚠️  No users found in database.");
      return;
    }

    console.log(`📋 Found ${users.length} user(s) to update.\n`);

    // Hash the default password once
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log("✅ Password hashed successfully.\n");

    // Update all users
    let updated = 0;
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      console.log(`✓ Updated password for: ${user.name} (${user.email})`);
      updated++;
    }

    console.log(`\n✨ Successfully updated passwords for ${updated} user(s)!`);
    console.log(`🔑 Default password: ${DEFAULT_PASSWORD}`);
    console.log("\n⚠️  Please change passwords after first login!");
  } catch (error) {
    console.error("❌ Error updating passwords:", error);
    throw error;
  }
}

setPasswords()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Script failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
