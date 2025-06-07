"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/app/lib/firebase'
import { User } from '@/types/panel'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Mapear los datos del usuario al formato esperado
            const mappedUser: User = {
              id: firebaseUser.uid,
              email: userData.email || firebaseUser.email || '',
              firstName: userData.firstName || userData.nombre || '',
              lastName: userData.lastName || userData.apellido || '',
              tipoUsuario: userData.tipoUsuario || userData.userType || 'apoderado',
              children: userData.children || userData.hijos || [],
              active: userData.active !== false,
              createdAt: userData.createdAt?.toDate() || new Date()
            }
            
            setUser(mappedUser)
          } else {
            // Usuario no encontrado en Firestore
            setUser(null)
            router.push('/auth/registro')
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error)
          setUser(null)
          router.push('/auth/login')
        }
      } else {
        setUser(null)
        router.push('/auth/login')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  }
}