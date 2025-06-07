export interface AdminMenuItem {
  id?: string
  code: string
  description: string
  type: 'almuerzo' | 'colacion'
  date: string
  day: string
  weekStart: string
  active: boolean
  published?: boolean // Nuevo campo para controlar la publicación
  createdAt?: Date
  updatedAt?: Date
}

export interface AdminDayMenu {
  date: string
  day: string
  dayName: string
  almuerzos: AdminMenuItem[]
  colaciones: AdminMenuItem[]
  isEditable: boolean
}

export interface AdminWeekMenu {
  weekStart: string
  weekEnd: string
  weekLabel: string
  days: AdminDayMenu[]
  isPublished: boolean
  totalItems: number
}

export interface MenuFormData {
  type: 'almuerzo' | 'colacion'
  code: string
  description: string
  active: boolean
}

export interface WeekNavigation {
  currentWeek: string
  canGoBack: boolean
  canGoForward: boolean
  weekLabel: string
}

export interface MenuValidationError {
  field: string
  message: string
}

export interface MenuOperationResult<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: MenuValidationError[]
}

export type MenuModalMode = 'create' | 'edit' | 'view'

export interface MenuModalState {
  isOpen: boolean
  mode: MenuModalMode
  item?: AdminMenuItem
  date: string
  day: string
  type?: 'almuerzo' | 'colacion'
}
