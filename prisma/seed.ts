import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client.js";

//Import all seed functions decomment already created ones if second run necessary
//import { seedStudents } from "./seeds/seedStudents.js";
//import { seedProfessors } from "./seeds/seedProfessors.js";
//import { seedCourses } from "./seeds/seedCourses.js";
import { seedSessions } from "./seeds/seedSessions.js";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL!;

//Errorhandler if no connection string is found
if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Seed in correct order (respecting foreign key constraints)

    // 1. First seed courses (sessions depend on them)
    //await seedCourses(prisma);

    // 2. Seed users (students and professors)
    //await seedStudents(prisma);
    //await seedProfessors(prisma);

    // 3. Seed sessions (depend on courses)
    await seedSessions(prisma);

    console.log('\n✨ Seeding finished successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
