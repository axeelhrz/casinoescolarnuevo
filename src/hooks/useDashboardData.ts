"use client"

import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/app/lib/firebase'
import { useOrderStore } from '@/store/orderStore'
import { DashboardData, DashboardUser, OrderStatus, EconomicSummary, WeeklyMenuInfo, DashboardAlert } from '@/types/dashboard'
import { PRICES } from '@/types/panel'
import { startOfWeek, endOfWeek, format, addDays, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getOrderSummary, selections } = useOrderStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setDashboardData(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (!userDoc.exists()) {
          throw new Error('Usuario no encontrado')
        }

        const userData = userDoc.data() as Omit<DashboardUser, 'id'>
        const user: DashboardUser = {
          ...userData,
          id: firebaseUser.uid
        }

        // Calcular estado del pedido
        const orderSummary = getOrderSummary()
        const orderStatus: OrderStatus = {
          status: orderSummary.selections.length === 0 ? 'not_started' : 
                  orderSummary.selections.length < 5 ? 'in_progress' : 'confirmed',
          daysSelected: orderSummary.selections.length,
          totalDays: 5, // Lunes a viernes
          lastModified: new Date()
        }

        // Calcular resumen económico
        const prices = PRICES[user.userType as keyof typeof PRICES]
        const economicSummary: EconomicSummary = {
          selectedDays: orderSummary.selections.length,
          estimatedTotal: orderSummary.total,
          lunchPrice: prices.almuerzo,
          snackPrice: prices.colacion,
          totalLunches: orderSummary.totalAlmuerzos,
          totalSnacks: orderSummary.totalColaciones
        }

        // Verificar información del menú semanal
        const today = new Date()
        const weekStart = startOfWeek(today, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
        
        // Simular verificación del menú (en producción sería una consulta a Firestore)
        const weeklyMenuInfo: WeeklyMenuInfo = {
          isPublished: true, // Simulado como disponible
          weekStart: format(weekStart, 'yyyy-MM-dd'),
          weekEnd: format(weekEnd, 'yyyy-MM-dd'),
          publishedAt: new Date(),
          lastUpdated: new Date()
        }

        // Generar alertas dinámicas
        const alerts: DashboardAlert[] = []

        // Alerta por días sin seleccionar
        if (orderStatus.daysSelected > 0 && orderStatus.daysSelected < 5) {
          alerts.push({
            id: 'incomplete-week',
            type: 'warning',
            title: 'Semana incompleta',
            message: `Tenés ${5 - orderStatus.daysSelected} días sin seleccionar almuerzo esta semana`,
            actionText: 'Completar pedido',
            actionUrl: '/panel',
            dismissible: false,
            priority: 'high'
          })
        }

        // Alerta por pedido no pagado
        if (orderStatus.status === 'confirmed') {
          alerts.push({
            id: 'payment-pending',
            type: 'error',
            title: 'Pago pendiente',
            message: 'Tu pedido no ha sido pagado. Completa el pago para confirmar.',
            actionText: 'Pagar ahora',
            actionUrl: '/panel',
            dismissible: false,
            priority: 'high'
          })
        }

        // Alerta por fecha límite
        const wednesday = addDays(weekStart, 2) // Miércoles
        if (isBefore(new Date(), wednesday)) {
          alerts.push({
            id: 'deadline-reminder',
            type: 'info',
            title: 'Recordatorio',
            message: `Último día para realizar cambios: ${format(wednesday, 'EEEE dd', { locale: es })}`,
            dismissible: true,
            priority: 'medium'
          })
        }

        // Alerta de bienvenida para nuevos usuarios
        if (orderStatus.status === 'not_started') {
          alerts.push({
            id: 'welcome',
            type: 'success',
            title: '¡Bienvenido a Casino Escolar!',
            message: 'Comienza seleccionando tus almuerzos para esta semana.',
            actionText: 'Ver menú',
            actionUrl: '/panel',
            dismissible: true,
            priority: 'low'
          })
        }

        setDashboardData({
          user,
          orderStatus,
          economicSummary,
          weeklyMenuInfo,
          alerts,
          isLoading: false
        })

      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [getOrderSummary, selections])

  return { dashboardData, isLoading, error }
}
