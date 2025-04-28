"use client"

import { sendTestEmail } from "@/lib/test-email"
import { useState } from "react"

export function TestEmailButton() {
    const [status, setStatus] = useState("")

    const handleClick = async () => {
        try {
            setStatus("Отправка...")
            await sendTestEmail()
            setStatus("Письмо успешно отправлено! ✅")
        } catch (error) {
            console.error(error)
            setStatus("Ошибка отправки ❌")
        }
    }

    return (
        <div>
            <button onClick={handleClick} className="p-2 bg-blue-500 text-white rounded">
                Отправить тестовое письмо
            </button>
            {status && <p className="mt-2">{status}</p>}
        </div>
    )
}
