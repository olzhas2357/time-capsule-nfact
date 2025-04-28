"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Clock, File, Paperclip, Send, X } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createCapsule } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { uploadFile } from "@/lib/firebase"

export function MessageForm() {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("12:00")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

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

  const handleSubmit = async (formData: FormData) => {
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
      if (scheduledDate <= new Date()) {
        toast({
          title: "Ошибка",
          description: "Дата отправки должна быть в будущем",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Upload files if any
      const attachments: { name: string; url: string; size: number; type: string }[] = []

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

      // Create capsule data
      const capsuleData = {
        recipient: formData.get("recipient") as string,
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
        scheduledDate: scheduledDate.toISOString(),
        attachments,
      }

      const result = await createCapsule(capsuleData)

      if (result.success) {
        toast({
          title: "Капсула создана",
          description: `Ваше сообщение будет отправлено ${format(scheduledDate, "PPpp", { locale: ru })}`,
        })

        // Reset form
        const form = document.getElementById("message-form") as HTMLFormElement
        form.reset()
        setDate(undefined)
        setTime("12:00")
        setFiles([])
        setUploadProgress(null)
      } else {
        toast({
          title: "Ошибка",
          description: result.error || "Не удалось создать капсулу",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating capsule:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании капсулы",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="message-form" action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="recipient">Email получателя</Label>
          <Input id="recipient" name="recipient" type="email" placeholder="email@example.com" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="subject">Тема</Label>
          <Input id="subject" name="subject" placeholder="Тема сообщения" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="message">Сообщение</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Введите текст сообщения..."
            className="min-h-32"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="attachments">Вложения</Label>
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
              {files.length > 0 ? `${files.length} файл(ов)` : "Нет выбранных файлов"}
            </span>
          </div>

          {files.length > 0 && (
            <div className="mt-2 space-y-2">
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
                  disabled={(date) => date < new Date()}
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
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? "Создание капсулы..." : "Создать капсулу времени"}
      </Button>
    </form>
  )
}
