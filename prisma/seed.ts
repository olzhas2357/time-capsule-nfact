import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const capsule1 = await prisma.capsule.create({
        data: {
            recipient: "test1@example.com",
            subject: "Test Capsule 1",
            message: "This is a test capsule message.",
            scheduledDate: new Date(new Date().getTime() + 3600 * 1000), // через 1 час
            status: "pending",
            attachments: [],
        },
    })

    const capsule2 = await prisma.capsule.create({
        data: {
            recipient: "test2@example.com",
            subject: "Test Capsule 2",
            message: "This is another test capsule message.",
            scheduledDate: new Date(new Date().getTime() + 7200 * 1000), // через 2 часа
            status: "pending",
            attachments: [],
        },
    })

    console.log("Created test capsules:", { capsule1, capsule2 })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
