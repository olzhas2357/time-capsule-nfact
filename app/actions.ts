"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { scheduleTask } from "@/lib/scheduler"
import { v4 as uuidv4 } from "uuid"
import type { Attachment } from "@/components/message-list"

type CapsuleData = {
  recipient: string
  subject: string
  message: string
  scheduledDate: string
  attachments: Attachment[]
}

type UpdateCapsuleData = CapsuleData & {
  id: string
}

type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export async function createCapsule(data: CapsuleData): Promise<ApiResponse> {
  try {
    // Validate inputs
    if (!data.recipient || !data.subject || !data.message || !data.scheduledDate) {
      return {
        success: false,
        error: "Все поля обязательны для заполнения",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.recipient)) {
      return {
        success: false,
        error: "Неверный формат email",
      }
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(data.scheduledDate)
    if (scheduledDate <= new Date()) {
      return {
        success: false,
        error: "Дата отправки должна быть в будущем",
      }
    }

    // Create capsule in database
    const capsuleId = uuidv4()
    const capsule = {
      id: capsuleId,
      recipient: data.recipient,
      subject: data.subject,
      message: data.message,
      scheduledDate: data.scheduledDate,
      status: "pending",
      createdAt: new Date().toISOString(),
      attachments: data.attachments || [],
    }

    await db.capsules.create(capsule)

    // Schedule the email delivery
    await scheduleTask(capsuleId, scheduledDate)

    // Revalidate the dashboard path
    revalidatePath("/dashboard")

    return { success: true, data: capsule }
  } catch (error) {
    console.error("Error creating capsule:", error)
    return {
      success: false,
      error: "Произошла ошибка при создании капсулы",
    }
  }
}

export async function getCapsules(): Promise<ApiResponse> {
  try {
    const capsules = await db.capsules.findMany({
      orderBy: { scheduledDate: "asc" },
    })

    return { success: true, data: capsules }
  } catch (error) {
    console.error("Error getting capsules:", error)
    return {
      success: false,
      error: "Произошла ошибка при получении капсул",
    }
  }
}

export async function getCapsuleById(id: string): Promise<ApiResponse> {
  try {
    const capsule = await db.capsules.findUnique({
      where: { id },
    })

    if (!capsule) {
      return {
        success: false,
        error: "Капсула не найдена",
      }
    }

    return { success: true, data: capsule }
  } catch (error) {
    console.error("Error getting capsule:", error)
    return {
      success: false,
      error: "Произошла ошибка при получении капсулы",
    }
  }
}

export async function updateCapsule(data: UpdateCapsuleData): Promise<ApiResponse> {
  try {
    // Validate inputs
    if (!data.id || !data.recipient || !data.subject || !data.message || !data.scheduledDate) {
      return {
        success: false,
        error: "Все поля обязательны для заполнения",
      }
    }

    // Get existing capsule
    const existingCapsule = await db.capsules.findUnique({
      where: { id: data.id },
    })

    if (!existingCapsule) {
      return {
        success: false,
        error: "Капсула не найдена",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.recipient)) {
      return {
        success: false,
        error: "Неверный формат email",
      }
    }

    // Validate scheduled date is in the future if status is pending
    const scheduledDate = new Date(data.scheduledDate)
    if (existingCapsule.status === "pending" && scheduledDate <= new Date()) {
      return {
        success: false,
        error: "Дата отправки должна быть в будущем",
      }
    }

    // Update capsule in database
    const updatedCapsule = {
      recipient: data.recipient,
      subject: data.subject,
      message: data.message,
      scheduledDate: data.scheduledDate,
      attachments: data.attachments || [],
    }

    await db.capsules.update({
      where: { id: data.id },
      data: updatedCapsule,
    })

    // If the scheduled date changed and status is pending, reschedule the task
    if (existingCapsule.status === "pending" && existingCapsule.scheduledDate !== data.scheduledDate) {
      await scheduleTask(data.id, scheduledDate, true)
    }

    // Revalidate the dashboard path
    revalidatePath("/dashboard")
    revalidatePath(`/edit/${data.id}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating capsule:", error)
    return {
      success: false,
      error: "Произошла ошибка при обновлении капсулы",
    }
  }
}

export async function deleteCapsule(id: string): Promise<ApiResponse> {
  try {
    // Get existing capsule
    const existingCapsule = await db.capsules.findUnique({
      where: { id },
    })

    if (!existingCapsule) {
      return {
        success: false,
        error: "Капсула не найдена",
      }
    }

    // Delete capsule from database
    await db.capsules.delete({
      where: { id },
    })

    // If status is pending, cancel the scheduled task
    if (existingCapsule.status === "pending") {
      await scheduleTask(id, new Date(), true)
    }

    // Revalidate the dashboard path
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting capsule:", error)
    return {
      success: false,
      error: "Произошла ошибка при удалении капсулы",
    }
  }
}

export async function processCapsule(id: string): Promise<ApiResponse> {
  try {
    // Get capsule
    const capsule = await db.capsules.findUnique({
      where: { id },
    })

    if (!capsule) {
      return {
        success: false,
        error: "Капсула не найдена",
      }
    }

    // Send email
    try {
      await sendEmail({
        to: capsule.recipient,
        subject: capsule.subject,
        text: capsule.message,
        attachments: capsule.attachments,
      })

      // Update capsule status
      await db.capsules.update({
        where: { id },
        data: { status: "sent" },
      })

      return { success: true }
    } catch (error) {
      console.error("Error sending email:", error)

      // Update capsule status to failed
      await db.capsules.update({
        where: { id },
        data: { status: "failed" },
      })

      return {
        success: false,
        error: "Произошла ошибка при отправке email",
      }
    }
  } catch (error) {
    console.error("Error processing capsule:", error)
    return {
      success: false,
      error: "Произошла ошибка при обработке капсулы",
    }
  }
}
