"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TimePickerDemoProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const [hour, setHour] = React.useState<number>(date ? date.getHours() : 12)
  const [minute, setMinute] = React.useState<number>(date ? date.getMinutes() : 0)
  const [isPM, setIsPM] = React.useState<boolean>(date ? date.getHours() >= 12 : true)

  React.useEffect(() => {
    if (!date) return

    const newHour = date.getHours()
    const newMinute = date.getMinutes()

    setHour(newHour % 12 || 12)
    setMinute(newMinute)
    setIsPM(newHour >= 12)
  }, [date])

  const handleHourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10)
    if (isNaN(value)) {
      setHour(0)
      return
    }

    if (value > 12) {
      setHour(12)
    } else if (value < 0) {
      setHour(0)
    } else {
      setHour(value)
    }

    if (value === 0) {
      minuteRef.current?.focus()
    }
  }

  const handleMinuteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10)
    if (isNaN(value)) {
      setMinute(0)
      return
    }

    if (value > 59) {
      setMinute(59)
    } else if (value < 0) {
      setMinute(0)
    } else {
      setMinute(value)
    }
  }

  const handleAMPMToggle = () => {
    setIsPM(!isPM)
  }

  React.useEffect(() => {
    if (!date) return

    const newDate = new Date(date)
    const hours = isPM ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour
    newDate.setHours(hours)
    newDate.setMinutes(minute)
    setDate(newDate)
  }, [hour, minute, isPM, date, setDate])

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Часы
        </Label>
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center"
          value={hour}
          onChange={handleHourChange}
          type="number"
          min={1}
          max={12}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Минуты
        </Label>
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center"
          value={minute}
          onChange={handleMinuteChange}
          type="number"
          min={0}
          max={59}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="ampm" className="text-xs">
          AM/PM
        </Label>
        <button
          id="ampm"
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          onClick={handleAMPMToggle}
        >
          {isPM ? "PM" : "AM"}
        </button>
      </div>
    </div>
  )
}
