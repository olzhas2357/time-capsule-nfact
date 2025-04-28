import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-50">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">Страница не найдена</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Извините, запрашиваемая страница не существует.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
