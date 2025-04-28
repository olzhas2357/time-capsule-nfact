"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Clock, File, Paperclip, Save, X } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { updateCapsule } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { uploadFile } from "@/lib/firebase"
import type { Capsule, Attachment } from "@/components/message-list"
import { useRouter } from "next/navigation"

interface EditFormProps {
  capsule: Capsule
}

export function EditForm({ capsule }: EditFormProps) {
  const router = useRouter()
  const scheduledDate = new Date(capsule.scheduledDate)

  const [date, setDate] = useState<Date>(scheduledDate)
  const [time, setTime] = useState<string>(
    `${String(scheduledDate.getHours()).padStart(2, "0")}:${String(scheduledDate.getMinutes()).padStart(2, "0")}`,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(capsule.attachments || [])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [recipient, setRecipient] = useState(capsule.recipient)
  const [subject, setSubject] = useState(capsule.subject)
  const [message, setMessage] = useState(capsule.message)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and add to existing files
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      if (!date) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, выберите дату отправки",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number)
      const scheduledDate = new Date(date)
      scheduledDate.setHours(hours, minutes)

      // Check if date is in the future
      if (scheduledDate <= new Date() && capsule.status === "pending") {
        toast({
          title: "Ошибка",
          description: "Дата отправки должна быть в будущем",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Upload new files if any
      const attachments: Attachment[] = [...existingAttachments]

      if (files.length > 0) {
        // Upload each file and track progress
        const totalSize = files.reduce((sum, file) => sum + file.size, 0)
        let uploadedSize = 0

        for (const file of files) {
          const fileUrl = await uploadFile(file, (progress) => {
            // Update progress based on this file's contribution to total size
            const fileProgress = (progress * file.size) / totalSize
            uploadedSize += fileProgress
            setUploadProgress(Math.round((uploadedSize / totalSize) * 100))
          })

          attachments.push({
            name: file.name,
            url: fileUrl,
            size: file.size,
            type: file.type,
          })
        }
      }

      setUploadProgress(100)

      // Update capsule data
      const updatedCapsule = {
        id: capsule.id,
        recipient,
        subject,
        message,
        scheduledDate: scheduledDate.toISOString(),
        attachments,
      }

      const result = await updateCapsule(updatedCapsule)

      if (result.success) {
        toast({
          title: "Капсула обновлена",
          description: `Ваша капсула была успешно обновлена`,
        })

        // Redirect back to dashboard
        router.push("/dashboard")
        router.refresh()
      } else {
        toast({
          title: "Ошибка",
          description: result.error || "Не удалось обновить капсулу",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating capsule:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении капсулы",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="recipient">Email получателя</Label>
          <Input
            id="recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="subject">Тема</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Тема сообщения"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="message">Сообщение</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите текст сообщения..."
            className="min-h-32"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="attachments">Вложения</Label>

          {existingAttachments.length > 0 && (
            <div className="mt-2 space-y-2">
              <h4 className="text-sm font-medium">Существующие файлы:</h4>
              {existingAttachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">{attachment.name}</span>
                    <span className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExistingAttachment(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Удалить файл</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="flex items-center gap-2"
            >
              <Paperclip className="h-4 w-4" />
              Добавить файлы
            </Button>
            <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            <span className="text-sm text-slate-500">
              {files.length > 0 ? `${files.length} новых файл(ов)` : "Нет новых файлов"}
            </span>
          </div>

          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              <h4 className="text-sm font-medium">Новые файлы:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Удалить файл</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Дата отправки</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ru}
                  disabled={(date) => (capsule.status !== "pending" ? false : date < new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Время отправки</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                <Clock className="mr-2 h-4 w-4" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-none bg-transparent p-0 focus:outline-none focus:ring-0"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {uploadProgress !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Загрузка файлов</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Save className="mr-2 h-4 w-4" />
        {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
      </Button>
    </form>
  )
}
