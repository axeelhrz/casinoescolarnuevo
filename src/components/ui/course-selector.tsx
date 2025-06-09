"use client"

import { SchoolLevel, getCourseOptions, getSchoolLevelInfo } from '@/lib/courseUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface CourseSelectorProps {
  level: SchoolLevel
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  allowCustom?: boolean
}

export function CourseSelector({
  level,
  value,
  onValueChange,
  placeholder = "Selecciona un curso",
  disabled = false,
  className = "",
  allowCustom = false
}: CourseSelectorProps) {
  const [isCustomMode, setIsCustomMode] = useState(false)
  const courseOptions = getCourseOptions(level)
  const levelInfo = getSchoolLevelInfo(level)

  // Si el valor actual no está en las opciones predefinidas, activar modo custom
  const isValueInOptions = courseOptions.some(option => option.value === value)
  const shouldShowCustom = allowCustom && (!isValueInOptions || isCustomMode)

  if (shouldShowCustom) {
    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={`Ej: ${courseOptions[0]?.label || '1° A'}`}
          disabled={disabled}
          className={className}
        />
        {allowCustom && (
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false)
              onValueChange('')
            }}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            disabled={disabled}
          >
            Usar opciones predefinidas
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            {levelInfo.description}
          </div>
          {courseOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {allowCustom && (
        <button
          type="button"
          onClick={() => setIsCustomMode(true)}
          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          disabled={disabled}
        >
          Ingresar curso personalizado
        </button>
      )}
    </div>
  )
}
