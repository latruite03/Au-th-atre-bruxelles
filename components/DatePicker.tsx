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
    <div className="space-y-2">
      <input
        type="date"
        value={dateString}
        onChange={handleChange}
        className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
      />
      <p className="text-sm text-gray-600">
        {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
      </p>
    </div>
  )
}
