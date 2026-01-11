import { PrismaClient, Program, UserRole } from "../generated/client.js";
import fs from 'fs';
import path from 'path';

export async function seedStudents(prisma: PrismaClient) {
    console.log('📚 Seeding students from CSV...');

    const csvPath = path.join(process.cwd(), 'shared/data/Users.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');

    let count = 0;

    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [familienname, vorname, programStr, email] = line.split(';');

        if (!email || !vorname || !familienname) {
            console.warn(`  ⚠️ Skipping invalid line ${i + 1}: ${line}`);
            continue;
        }

        const name = `${vorname} ${familienname}`;
        const initials = (vorname[0] + familienname[0]).toUpperCase();

        let program: Program | null = null;
        if (programStr === 'DTI') program = Program.DTI;
        if (programStr === 'DI') program = Program.DI;

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
        count++;
    }

    console.log(`  ✅ Seeded ${count} students`);
}
