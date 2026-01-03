import { PrismaClient, Program } from "../generated/client.js";

// Course data with new structure (code instead of id)
const courses = [
    {
        code: "ds",
        title: "Data Science",
        programs: [Program.DTI],
    },
    {
        code: "hti",
        title: "Human-Technology Interaction",
        programs: [Program.DTI],
    },
    {
        code: "inno",
        title: "Innovation Design",
        programs: [Program.DTI, Program.DI],
    },
    {
        code: "networks",
        title: "Innovation Teams and Networks",
        programs: [Program.DTI, Program.DI],
    },
    {
        code: "software",
        title: "Agile Software Engineering",
        programs: [Program.DTI, Program.DI],
    },
    {
        code: "dg",
        title: "Data Governance",
        programs: [Program.DI],
    },
    {
        code: "c7",
        title: "Cloud-based IT-Infrastructure",
        programs: [Program.DI],
    },
];

export async function seedCourses(prisma: PrismaClient) {
    console.log('📖 Seeding courses...');

    let count = 0;

    for (const course of courses) {
        await prisma.course.upsert({
            where: { code: course.code },
            update: {
                title: course.title,
                programs: course.programs,
            },
            create: {
                code: course.code,
                title: course.title,
                programs: course.programs,
            },
        });
        count++;
    }

    console.log(`  ✅ Seeded ${count} courses`);
}

// Helper function to get course ID by code
export async function getCourseIdByCode(prisma: PrismaClient, code: string): Promise<number | null> {
    const course = await prisma.course.findUnique({
        where: { code },
        select: { id: true }
    });
    return course?.id ?? null;
}
