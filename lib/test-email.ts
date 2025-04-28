"use server"

import { sendEmail } from "@/lib/email"

export async function sendTestEmail() {
    await sendEmail({
        to: "olzhas.koshkarbay@gmail.com",
        subject: "Тестовое письмо с капсулы времени",
        text: "Это тестовое письмо отправленное через Nodemailer 🚀",
    })
}
