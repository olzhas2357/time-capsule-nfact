"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Clock, Download, Edit, File, Mail, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCapsules, deleteCapsule } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export type Attachment = {
  name: string
  url: string
  size: number
  type: string
}

export type Capsule = {
  id: string
  recipient: string
  subject: string
  message: string
  scheduledDate: string
  status: "pending" | "sent" | "failed"
  createdAt: string
  attachments: Attachment[]
}

export function MessageList() {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadCapsules = async () => {
    setLoading(true)
    try {
      const result = await getCapsules()
      if (result.success) {
        setCapsules(result.data)
      } else {
        toast({
          title: "Ошибка",
          description: result.error || "Не удалось загрузить капсулы",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading capsules:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке капсул",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCapsules()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCapsule(id)
      if (result.success) {
        setCapsules(capsules.filter((capsule) => capsule.id !== id))
        toast({
          title: "Капсула удалена",
          description: "Капсула была успешно удалена",
        })
      } else {
        toast({
          title: "Ошибка",
          description: result.error || "Не удалось удалить капсулу",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting capsule:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении капсулы",
        variant: "destructive",
      })
    }
    setDeleteId(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
          >
            Ожидает отправки
          </Badge>
        )
      case "sent":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
          >
            Отправлено
          </Badge>
        )
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
          >
            Ошибка отправки
          </Badge>
        )
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50 mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Загрузка капсул...</p>
        </div>
      </div>
    )
  }

  if (capsules.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-center">
        <Mail className="mb-2 h-10 w-10 text-slate-400" />
        <h3 className="text-lg font-medium">Нет капсул времени</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Создайте новую капсулу на главной странице</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {capsules.map((capsule) => (
        <Card key={capsule.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{capsule.subject}</CardTitle>
                <CardDescription>Получатель: {capsule.recipient}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(capsule.status)}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(capsule.scheduledDate), "PPp", { locale: ru })}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{capsule.message}</p>

            {capsule.attachments && capsule.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Вложения:</h4>
                <div className="space-y-2">
                  {capsule.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium">{attachment.name}</span>
                        <span className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Скачать файл</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Действия</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/edit/${capsule.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteId(capsule.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Капсула будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
