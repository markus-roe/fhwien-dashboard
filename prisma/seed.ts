import { PrismaClient, Program, UserRole } from './generated';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(process.cwd(), 'shared/data/Users.csv');
    console.log(`Reading users from ${csvPath}...`);

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [familienname, vorname, programStr, email] = line.split(';');

        if (!email || !vorname || !familienname) {
            console.warn(`Skipping invalid line ${i + 1}: ${line}`);
            continue;
        }

        const name = `${vorname} ${familienname}`;
        // Initials: First letter of Firstname + First letter of Lastname
        const initials = (vorname[0] + familienname[0]).toUpperCase();

        // Map program string to Enum
        let program: Program | null = null;
        if (programStr === 'DTI') program = Program.DTI;
        if (programStr === 'DI') program = Program.DI;

        console.log(`Upserting user: ${name} (${email})`);

        await prisma.user.upsert({
            where: { email },
            update: {
                name,
                initials,
                program,
                role: UserRole.student,
            },
            create: {
                name,
                initials,
                email,
                program,
                role: UserRole.student,
            },
        });
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
