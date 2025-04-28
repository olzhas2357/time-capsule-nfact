import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const db = {
  capsules: {
    create: async (data: { id: string, content: string, scheduledDate: Date }) => {
      return prisma.capsule.create({
        data,
      })
    },
    findMany: async ({ orderBy }: { orderBy: { scheduledDate: 'asc' | 'desc' } }) => {
      return prisma.capsule.findMany({
        orderBy: {
          scheduledDate: orderBy.scheduledDate,
        },
      })
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return prisma.capsule.findUnique({
        where,
      })
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<{ content: string; scheduledDate: Date }> }) => {
      return prisma.capsule.update({
        where,
        data,
      })
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return prisma.capsule.delete({
        where,
      })
    },
  },
}
