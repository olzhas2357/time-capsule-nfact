import { MessageForm } from "@/components/message-form"
import { TestEmailButton } from "@/components/test"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              Future Message
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Отправляйте сообщения в будущее. Запланируйте email для доставки в указанную дату.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <MessageForm/>
          </div>

          {/*<div className="min-h-screen flex flex-col items-center justify-center bg-black " >*/}
          {/*  <h1 className="text-2xl font-bold mb-4">Проверка отправки email</h1>*/}
          {/*  <TestEmailButton/>*/}
          {/*</div>*/}
        </div>
      </main>
    </div>
  )
}
