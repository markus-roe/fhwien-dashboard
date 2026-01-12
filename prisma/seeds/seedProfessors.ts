import { PrismaClient, UserRole } from "../generated/client.js";

//create professors const to store data to be seeded
const professors = [
    {
        name: "Manfred Bornemann",
        initials: "MB",
        email: "manfred.bornemann@fhwien.ac.at",
    },
    {
        name: "Doro Erharter",
        initials: "DE",
        email: "doro.erharter@fhwien.ac.at",
    },
    {
        name: "Tilia Stingl",
        initials: "TS",
        email: "tilia.stingl@fhwien.ac.at",
    },
    {
        name: "Sebastian Eschenbach",
        initials: "SE",
        email: "sebastian.eschenbach@fhwien.ac.at",
    },
    {
        name: "Elka Xharo",
        initials: "EX",
        email: "elka.xharo@fhwien.ac.at",
    },
    {
        name: "Jackie Klaura",
        initials: "JK",
        email: "jackie.klaura@fhwien.ac.at",
    },
    {
        name: "Barbara Kainz",
        initials: "BK",
        email: "barbara.kainz@fhwien.ac.at",
    },
    {
        name: "Leo Weber",
        initials: "LW",
        email: "leo.weber@fhwien.ac.at",
    },
    {
        name: "Paul Schmidinger",
        initials: "PS",
        email: "paul.schmidinger@fhwien.ac.at",
    },
    {
        name: "René Gröbner",
        initials: "RG",
        email: "rene.groebner@fhwien.ac.at",
    },
];

//execute seeding to database with const
export async function seedProfessors(prisma: PrismaClient) {
    console.log('Seeding professors...');

    let count = 0;

    for (const prof of professors) {
        await prisma.user.upsert({
            where: { email: prof.email },
            update: {
                name: prof.name,
                initials: prof.initials,
                role: UserRole.professor,
            },
            create: {
                name: prof.name,
                initials: prof.initials,
                email: prof.email,
                role: UserRole.professor,
                program: null,
            },
        });
        count++;
    }

    console.log(`Seeded ${count} professors`);
}
