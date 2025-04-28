// Имитация планировщика задач для демонстрации
// В реальном приложении здесь был бы код для планирования задач (например, с использованием cron, Bull, или внешнего сервиса)

import { processCapsule } from "@/app/actions"

// In-memory scheduler for demo purposes
const scheduledTasks: Map<string, NodeJS.Timeout> = new Map()

export async function scheduleTask(capsuleId: string, scheduledDate: Date, cancel = false): Promise<void> {
  // Cancel existing task if any
  if (scheduledTasks.has(capsuleId)) {
    clearTimeout(scheduledTasks.get(capsuleId))
    scheduledTasks.delete(capsuleId)
  }

  // If cancel flag is true, just remove the task
  if (cancel) return

  // Calculate delay in milliseconds
  const now = new Date()
  const delay = scheduledDate.getTime() - now.getTime()

  // Schedule task
  if (delay > 0) {
    const timeout = setTimeout(async () => {
      await processCapsule(capsuleId)
      scheduledTasks.delete(capsuleId)
    }, delay)

    scheduledTasks.set(capsuleId, timeout)
  } else {
    // If the scheduled date is in the past, process immediately
    await processCapsule(capsuleId)
  }
}

// В реальном приложении здесь был бы код для планирования задач
// Например, с использованием Bull:
/*
import Queue from "bull"

const emailQueue = new Queue("email-queue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
})

emailQueue.process(async (job) => {
  const { capsuleId } = job.data
  await processCapsule(capsuleId)
})

export async function scheduleTask(
  capsuleId: string,
  scheduledDate: Date,
  cancel: boolean = false
): Promise<void> {
  // Remove existing job if any
  const existingJobs = await emailQueue.getJobs(["delayed", "waiting"])
  for (const job of existingJobs) {
    if (job.data.capsuleId === capsuleId) {
      await job.remove()
    }
  }

  // If cancel flag is true, just remove the job
  if (cancel) return

  // Schedule new job
  await emailQueue.add(
    { capsuleId },
    {
      delay: Math.max(0, scheduledDate.getTime() - Date.now()),
      jobId: capsuleId
    }
  )
}
*/
