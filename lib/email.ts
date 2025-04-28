// Имитация отправки email для демонстрации
// В реальном приложении здесь был бы код для отправки email через SMTP или API сервиса
import nodemailer from "nodemailer"
import type { Attachment } from "@/components/message-list"

interface EmailOptions {
  to: string
  subject: string
  text: string
  attachments?: Attachment[]
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true для порта 465, иначе false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, text, attachments } = options

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    attachments: attachments?.map(attachment => ({
      filename: attachment.name,
      path: attachment.url,
    })),
  })
}
