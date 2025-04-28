"use client"

import { useState, useEffect } from "react"
import { EditForm } from "@/components/edit-form"
import { getCapsuleById } from "@/app/actions"
import { notFound } from "next/navigation"

export default function EditPage({ params }: { params: { id: string } }) {
  const [capsule, setCapsule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const result = await getCapsuleById(params.id)
        if (!result.success || !result.data) {
          notFound()
        } else {
          setCapsule(result.data)
        }
      } catch (err) {
        console.error("Error fetching capsule data:", err)
        setError("Не удалось загрузить данные капсулы")
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchCapsule()
  }, [params.id])

  if (loading) {
    return <div>Загрузка...</div>
  }

  if (error) {
    return <div>Ошибка: {error}</div>
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Редактирование капсулы
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Измените детали вашей капсулы времени</p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <EditForm capsule={capsule} />
            </div>
          </div>
        </main>
      </div>
  )
}
