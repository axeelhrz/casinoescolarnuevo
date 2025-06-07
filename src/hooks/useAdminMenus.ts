import { useState, useEffect, useCallback } from 'react'
import { AdminMenuService } from '@/services/adminMenuService'
import { AdminWeekMenu, AdminMenuItem, MenuModalState, MenuOperationResult } from '@/types/adminMenu'
import { useToast } from '@/hooks/use-toast'

interface WeekStats {
  totalItems: number
  activeItems: number
  publishedItems: number
  daysWithMenus: number
  totalAlmuerzos: number
  totalColaciones: number
}

interface UseAdminMenusReturn {
  // Estado
  currentWeek: string
  weekMenu: AdminWeekMenu | null
  weekStats: WeekStats | null
  isLoading: boolean
  error: string | null
  modalState: MenuModalState
  
  // Navegación
  navigateWeek: (direction: 'next' | 'prev') => void
  getWeekNavigation: () => {
    currentWeek: string
    canGoBack: boolean
    canGoForward: boolean
    weekLabel: string
  }
  
  // Modal
  openModal: (
    mode: 'create' | 'edit',
    date: string,
    day: string,
    type?: 'almuerzo' | 'colacion',
    item?: AdminMenuItem
  ) => void
  closeModal: () => void
  
  // CRUD Operations
  createMenuItem: (itemData: Omit<AdminMenuItem, 'id'>) => Promise<MenuOperationResult>
  updateMenuItem: (id: string, updates: Partial<AdminMenuItem>) => Promise<MenuOperationResult>
  deleteMenuItem: (item: AdminMenuItem) => Promise<MenuOperationResult>
  duplicateWeek: (targetWeek: string) => Promise<MenuOperationResult>
  
  // Operaciones de semana
  toggleWeekPublication: (publish: boolean) => Promise<MenuOperationResult>
  deleteWeekMenu: () => Promise<MenuOperationResult>
  
  // Utilidades
  refreshMenu: () => void
}

export function useAdminMenus(): UseAdminMenusReturn {
  const [currentWeek, setCurrentWeek] = useState<string>('')
  const [weekMenu, setWeekMenu] = useState<AdminWeekMenu | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<MenuModalState>({
    isOpen: false,
    mode: 'create',
    date: '',
    day: ''
  })
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null)
  const { toast } = useToast()

  const loadWeekMenu = useCallback(async (weekStart: string) => {
    if (!weekStart) {
      setError('Fecha de semana no válida')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Cargar menú y estadísticas en paralelo
      const [menu, stats] = await Promise.all([
        AdminMenuService.getWeeklyMenu(weekStart),
        AdminMenuService.getWeekStats(weekStart)
      ])
      
      if (menu) {
        setWeekMenu(menu)
      } else {
        throw new Error('No se pudo cargar el menú')
      }
      
      if (stats) {
        // Transform the stats to match our interface
        const transformedStats: WeekStats = {
          totalItems: stats.totalItems,
          activeItems: stats.activeItems,
          publishedItems: stats.publishedItems,
          daysWithMenus: stats.daysWithMenus,
          totalAlmuerzos: stats.almuerzoCount,
          totalColaciones: stats.colacionCount
        }
        setWeekStats(transformedStats)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el menú'
      console.error('Error loading week menu:', err)
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Inicializar con la semana actual
  useEffect(() => {
    try {
      const currentWeekStart = AdminMenuService.getCurrentWeekStart()
      if (currentWeekStart) {
        setCurrentWeek(currentWeekStart)
      } else {
        throw new Error('No se pudo obtener la semana actual')
      }
    } catch (err) {
      console.error('Error initializing current week:', err)
      setError('Error al inicializar la semana actual')
      // Fallback: usar fecha actual
      const fallbackDate = new Date().toISOString().split('T')[0]
      setCurrentWeek(fallbackDate)
    }
  }, [])

  // Cargar menú cuando cambia la semana
  useEffect(() => {
    if (currentWeek) {
      loadWeekMenu(currentWeek)
    }
  }, [currentWeek, loadWeekMenu])

  const navigateWeek = useCallback((direction: 'next' | 'prev') => {
    if (!currentWeek) {
      toast({
        title: 'Error',
        description: 'No hay semana actual definida',
        variant: 'destructive'
      })
      return
    }

    try {
      const navigation = AdminMenuService.getWeekNavigation(currentWeek)
      
      if (direction === 'next' && navigation.canGoForward) {
        const nextWeek = AdminMenuService.getNextWeek(currentWeek)
        if (nextWeek && nextWeek !== currentWeek) {
          setCurrentWeek(nextWeek)
        }
      } else if (direction === 'prev' && navigation.canGoBack) {
        const prevWeek = AdminMenuService.getPreviousWeek(currentWeek)
        if (prevWeek && prevWeek !== currentWeek) {
          setCurrentWeek(prevWeek)
        }
      }
    } catch (err) {
      console.error('Error navigating week:', err)
      toast({
        title: 'Error',
        description: 'Error al navegar entre semanas',
        variant: 'destructive'
      })
    }
  }, [currentWeek, toast])

  const openModal = useCallback((
    mode: 'create' | 'edit',
    date: string,
    day: string,
    type?: 'almuerzo' | 'colacion',
    item?: AdminMenuItem
  ) => {
    setModalState({
      isOpen: true,
      mode,
      date,
      day,
      type,
      item
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      mode: 'create',
      date: '',
      day: ''
    })
  }, [])

  const createMenuItem = useCallback(async (itemData: Omit<AdminMenuItem, 'id'>): Promise<MenuOperationResult> => {
    try {
      const result = await AdminMenuService.createMenuItem(itemData)
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message
        })
        // Recargar el menú para mostrar el nuevo item
        if (currentWeek) {
          await loadWeekMenu(currentWeek)
        }
        closeModal()
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = 'Error al crear el menú'
      console.error('Error creating menu item:', error)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [currentWeek, loadWeekMenu, closeModal, toast])

  const updateMenuItem = useCallback(async (id: string, updates: Partial<AdminMenuItem>): Promise<MenuOperationResult> => {
    try {
      const result = await AdminMenuService.updateMenuItem(id, updates)
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message
        })
        // Recargar el menú para mostrar los cambios
        if (currentWeek) {
          await loadWeekMenu(currentWeek)
        }
        closeModal()
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = 'Error al actualizar el menú'
      console.error('Error updating menu item:', error)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [currentWeek, loadWeekMenu, closeModal, toast])

  const deleteMenuItem = useCallback(async (item: AdminMenuItem): Promise<MenuOperationResult> => {
    try {
      if (!item.id) {
        return {
          success: false,
          message: 'ID del menú no válido'
        }
      }

      const result = await AdminMenuService.deleteMenuItem(item.id)
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message
        })
        // Recargar el menú para reflejar la eliminación
        if (currentWeek) {
          await loadWeekMenu(currentWeek)
        }
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = 'Error al eliminar el menú'
      console.error('Error deleting menu item:', error)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [currentWeek, loadWeekMenu, toast])

  const duplicateWeek = useCallback(async (targetWeek: string): Promise<MenuOperationResult> => {
    try {
      if (!currentWeek) {
        return {
          success: false,
          message: 'No hay semana actual definida'
        }
      }

      const result = await AdminMenuService.duplicateWeekMenu(currentWeek, targetWeek)
      
      toast({
        title: result.success ? 'Éxito' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      })
      
      return result
    } catch (error) {
      const errorMessage = 'Error al duplicar el menú semanal'
      console.error('Error duplicating week:', error)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [currentWeek, toast])

  const toggleWeekPublication = useCallback(async (publish: boolean): Promise<MenuOperationResult> => {
    try {
      if (!currentWeek) {
        return {
          success: false,
          message: 'No hay semana actual definida'
        }
      }

      const result = await AdminMenuService.toggleWeekMenuPublication(currentWeek, publish)
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message
        })
        // Recargar el menú para reflejar los cambios
        await loadWeekMenu(currentWeek)
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = 'Error al cambiar el estado de publicación'
      console.error('Error toggling publication:', error)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [currentWeek, loadWeekMenu, toast])

  const deleteWeekMenu = useCallback(async (): Promise<MenuOperationResult> => {
    try {
      if (!currentWeek) {
        return {
          success: false,
          message: 'No hay semana actual definida'
        }
      }

      const result = await AdminMenuService.deleteWeekMenu(currentWeek)
      
      if (result.success) {
        toast({
          title: 'Éxito',
          description: result.message
        })
        // Recargar el menú para reflejar los cambios
        await loadWeekMenu(currentWeek)
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = 'Error al eliminar el menú semanal'
      console.error('Error deleting week menu:', error)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [currentWeek, loadWeekMenu, toast])

  const refreshMenu = useCallback(() => {
    if (currentWeek) {
      loadWeekMenu(currentWeek)
    } else {
      // Reinicializar si no hay semana actual
      try {
        const newCurrentWeek = AdminMenuService.getCurrentWeekStart()
        setCurrentWeek(newCurrentWeek)
      } catch (err) {
        console.error('Error refreshing menu:', err)
        setError('Error al actualizar el menú')
      }
    }
  }, [currentWeek, loadWeekMenu])

  const getWeekNavigation = useCallback(() => {
    try {
      if (!currentWeek) {
        return {
          currentWeek: '',
          canGoBack: false,
          canGoForward: false,
          weekLabel: 'Sin semana'
        }
      }

      return AdminMenuService.getWeekNavigation(currentWeek)
    } catch (err) {
      console.error('Error getting week navigation:', err)
      // Fallback navigation
      return {
        currentWeek,
        canGoBack: true,
        canGoForward: true,
        weekLabel: 'Semana actual'
      }
    }
  }, [currentWeek])

  return {
    // Estado
    currentWeek,
    weekMenu,
    weekStats,
    isLoading,
    error,
    modalState,
    
    // Navegación
    navigateWeek,
    getWeekNavigation,
    
    // Modal
    openModal,
    closeModal,
    
    // CRUD Operations
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    duplicateWeek,
    
    // Operaciones de semana
    toggleWeekPublication,
    deleteWeekMenu,
    
    // Utilidades
    refreshMenu
  }
}