import { MessageList } from "@/components/message-list"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Капсулы времени
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Просмотр и управление вашими капсулами времени</p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <MessageList />
          </div>
        </div>
      </main>
    </div>
  )
}
