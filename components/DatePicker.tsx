'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const newDate = new Date(value + 'T00:00:00')
      onDateChange(newDate)
    }
  }

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div className="flex items-center gap-4">
        <span
          className="text-2xl font-medium text-black"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Choisissez une date
        </span>
        <input
          type="date"
          value={dateString}
          onChange={handleChange}
          className="px-6 py-4 text-xl bg-white border-2 border-black focus:outline-none focus:border-gray-600 text-center"
          style={{ fontFamily: 'var(--font-heading)' }}
        />
      </div>

      {/* removed duplicate long date label (already shown in section title below) */}
    </div>
  )
}
