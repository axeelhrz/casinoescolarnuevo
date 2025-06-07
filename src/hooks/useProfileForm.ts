"use client"

import { useState, useEffect } from 'react'
import { updateProfile, updateEmail, sendEmailVerification } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/app/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { Child } from '@/types/panel'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface ExtendedChild extends Child {
  edad: number
  level: 'basico' | 'medio'
}

interface UseProfileFormReturn {
  formData: ProfileFormData
  children: ExtendedChild[]
  isLoading: boolean
  isSaving: boolean
  hasChanges: boolean
  emailVerified: boolean
  errors: Record<string, string>
  updateFormData: (field: keyof ProfileFormData, value: string) => void
  addChild: () => void
  updateChild: (id: string, field: keyof ExtendedChild, value: string | number | boolean) => void
  removeChild: (id: string) => void
  saveChanges: () => Promise<boolean>
  resendEmailVerification: () => Promise<boolean>
  validateForm: () => boolean
}

export function useProfileForm(): UseProfileFormReturn {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [children, setChildren] = useState<ExtendedChild[]>([])
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [originalChildren, setOriginalChildren] = useState<ExtendedChild[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as { phone?: string }).phone || ''
      }
      
      // Transform children to include edad and level properties
      const transformedChildren: ExtendedChild[] = (user.children || []).map(child => {
        const childWithAge = child as Child & { edad?: number; age?: number; level?: 'basico' | 'medio' }
        return {
          ...child,
          edad: childWithAge.edad || childWithAge.age || 0,
          level: childWithAge.level || 'basico'
        }
      })
      
      setFormData(userData)
      setOriginalData(userData)
      setChildren(transformedChildren)
      setOriginalChildren(transformedChildren)
      setEmailVerified(auth.currentUser?.emailVerified || false)
      setIsLoading(false)
    }
  }, [user])

  // Verificar si hay cambios
  const hasChanges = 
    JSON.stringify(formData) !== JSON.stringify(originalData) ||
    JSON.stringify(children) !== JSON.stringify(originalChildren)

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addChild = () => {
    const newChild: ExtendedChild = {
      id: Date.now().toString(),
      name: '',
      curso: '',
      rut: undefined,
      active: true,
      edad: 0,
      level: 'basico'
    }
    setChildren(prev => [...prev, newChild])
  }

  const updateChild = (id: string, field: keyof ExtendedChild, value: string | number | boolean) => {
    setChildren(prev => prev.map(child => 
      child.id === id ? { ...child, [field]: value } : child
    ))
    
    // Clear error for this field
    const errorKey = `child_${id}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }))
    }
  }

  const removeChild = (id: string) => {
    setChildren(prev => prev.filter(child => child.id !== id))
    
    // Remove any errors for this child
    setErrors(prev => {
      const newErrors = { ...prev }
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`child_${id}_`)) {
          delete newErrors[key]
        }
      })
      return newErrors
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar campos requeridos
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido'
    }

    // Validar hijos si es apoderado
    if (user?.tipoUsuario === 'apoderado' && children.length > 0) {
      children.forEach((child, index) => {
        if (!child.name.trim()) {
          newErrors[`child_${child.id}_name`] = `Nombre del hijo ${index + 1} es requerido`
        }
        if (!child.edad || child.edad < 1 || child.edad > 18) {
          newErrors[`child_${child.id}_edad`] = `Edad del hijo ${index + 1} debe estar entre 1 y 18 años`
        }
        if (!child.curso.trim()) {
          newErrors[`child_${child.id}_curso`] = `Curso del hijo ${index + 1} es requerido`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveChanges = async (): Promise<boolean> => {
    if (!validateForm() || !user || !auth.currentUser) {
      return false
    }

    setIsSaving(true)
    try {
      const currentUser = auth.currentUser
      const userDocRef = doc(db, 'users', user.id)

      // Actualizar perfil en Firebase Auth si cambió el nombre
      if (formData.firstName !== originalData.firstName || formData.lastName !== originalData.lastName) {
        await updateProfile(currentUser, {
          displayName: `${formData.firstName} ${formData.lastName}`
        })
      }

      // Actualizar email si cambió
      if (formData.email !== originalData.email) {
        await updateEmail(currentUser, formData.email)
        await sendEmailVerification(currentUser)
        setEmailVerified(false)
      }

      // Transform children back to the format expected by the database
      const transformedChildren = children.map(child => ({
        id: child.id,
        name: child.name,
        curso: child.curso,
        rut: child.rut,
        active: child.active,
        age: child.edad, // Map edad back to age
        level: child.level
      }))

      // Actualizar documento en Firestore
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        children: transformedChildren,
        updatedAt: new Date()
      }

      await updateDoc(userDocRef, updateData)

      // Actualizar datos originales
      setOriginalData(formData)
      setOriginalChildren([...children])

      return true
    } catch (error) {
      console.error('Error al guardar cambios:', error)
      const firebaseError = error as { code?: string; message?: string }
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        setErrors({ email: 'Este correo electrónico ya está en uso' })
      } else if (firebaseError.code === 'auth/invalid-email') {
        setErrors({ email: 'Formato de correo electrónico inválido' })
      } else if (firebaseError.code === 'auth/requires-recent-login') {
        setErrors({ email: 'Debes volver a iniciar sesión para cambiar tu correo' })
      } else {
        setErrors({ general: 'Error al guardar los cambios. Intenta nuevamente.' })
      }
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const resendEmailVerification = async (): Promise<boolean> => {
    if (!auth.currentUser) return false

    try {
      await sendEmailVerification(auth.currentUser)
      return true
    } catch (error) {
      console.error('Error al reenviar verificación:', error)
      return false
    }
  }

  return {
    formData,
    children,
    isLoading,
    isSaving,
    hasChanges,
    emailVerified,
    errors,
    updateFormData,
    addChild,
    updateChild,
    removeChild,
    saveChanges,
    resendEmailVerification,
    validateForm
  }
}