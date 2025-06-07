"use client"
import { useState, useEffect } from 'react'
import { AdminService } from '@/services/adminService'
import { AdminDashboardData } from '@/types/admin'
import { generateSystemAlerts } from '@/lib/adminUtils'

interface UseAdminDashboardReturn {
  dashboardData: AdminDashboardData | null
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener información de la semana actual
      const currentWeek = AdminService.getCurrentWeekInfo()
      
      // Verificar si el menú está publicado
      const isMenuPublished = await AdminService.checkMenuStatus(currentWeek.start)
      
      // Obtener estadísticas semanales
      const stats = await AdminService.getWeeklyStats(currentWeek.start)
      
      // Obtener datos semanales detallados
      const weeklyData = await AdminService.getWeeklyOrderData(currentWeek.start)
      
      // Obtener estadísticas por tipo de usuario
      const userTypeStats = await AdminService.getUserTypeStats([])
      
      // Generar alertas del sistema
      const weekInfo = { ...currentWeek, isMenuPublished }
      const alerts = generateSystemAlerts(stats, weekInfo)

      const dashboardData: AdminDashboardData = {
        stats,
        weeklyData,
        userTypeStats,
        alerts,
        currentWeek: weekInfo,
        isLoading: false,
        lastUpdated: new Date()
      }

      setDashboardData(dashboardData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos del dashboard'
      setError(errorMessage)
      console.error('Error loading admin dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadDashboardData()
  }

  useEffect(() => {
    loadDashboardData()
    
    // Actualizar datos cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    dashboardData,
    isLoading,
    error,
    refreshData
  }
}
