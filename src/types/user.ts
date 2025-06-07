export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'funcionario' | 'estudiante' | 'admin' | 'super_admin'
  userType: 'funcionario' | 'estudiante'
  emailVerified: boolean
  createdAt: Date
  lastLogin?: Date
  phone?: string
  isActive: boolean
  children?: AdminUserChild[]
  ordersCount: number
  lastOrderDate?: Date
}

export interface AdminUserChild {
  id: string
  name: string
  age: number
  class: string
  level: 'basico' | 'medio'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'funcionario' | 'estudiante'
  tipoUsuario: 'funcionario' | 'estudiante'
  children?: Child[]
  isActive: boolean
  createdAt: Date
}

export interface Child {
  id: string
  name: string
  curso: string
  rut?: string
  active: boolean
}

export type UserType = 'apoderado' | 'funcionario'
