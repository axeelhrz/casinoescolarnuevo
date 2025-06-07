import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { AdminMenuItem, AdminWeekMenu, AdminDayMenu, MenuOperationResult, WeekNavigation } from '@/types/adminMenu'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

export class AdminMenuService {
  private static readonly COLLECTION_NAME = 'menus'

  // Helper para crear fecha local desde string YYYY-MM-DD
  static createLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // Obtener inicio de semana actual
  static getCurrentWeekStart(): string {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Lunes
    return format(weekStart, 'yyyy-MM-dd')
  }

  // Obtener semana siguiente
  static getNextWeek(currentWeek: string): string {
    const current = this.createLocalDate(currentWeek)
    const next = addWeeks(current, 1)
    return format(next, 'yyyy-MM-dd')
  }

  // Obtener semana anterior
  static getPreviousWeek(currentWeek: string): string {
    const current = this.createLocalDate(currentWeek)
    const prev = subWeeks(current, 1)
    return format(prev, 'yyyy-MM-dd')
  }

  // Obtener navegación de semana
  static getWeekNavigation(currentWeek: string): WeekNavigation {
    const current = this.createLocalDate(currentWeek)
    const weekEnd = addDays(current, 6)
    const weekLabel = `Del ${format(current, 'd')} al ${format(weekEnd, 'd')} de ${format(weekEnd, 'MMMM yyyy', { locale: es })}`
    
    // Permitir navegar hasta 4 semanas atrás y 8 semanas adelante
    const minWeek = subWeeks(new Date(), 4)
    const maxWeek = addWeeks(new Date(), 8)
    
    return {
      currentWeek,
      canGoBack: current > minWeek,
      canGoForward: current < maxWeek,
      weekLabel
    }
  }

  // Crear item de menú
  static async createMenuItem(itemData: Omit<AdminMenuItem, 'id'>): Promise<MenuOperationResult> {
    try {
      // Validar datos
      const validation = this.validateMenuItem(itemData)
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', '),
          errors: validation.errors.map(error => ({ field: 'general', message: error }))
        }
      }

      // Verificar código único para la semana
      const existingItem = await this.getMenuItemByCode(itemData.code, itemData.weekStart)
      if (existingItem) {
        return {
          success: false,
          message: `Ya existe un menú con el código "${itemData.code}" en esta semana`,
          errors: [{ field: 'code', message: 'Código duplicado' }]
        }
      }

      const menusRef = collection(db, this.COLLECTION_NAME)
      const docData = {
        ...itemData,
        published: false, // Por defecto no publicado - requiere publicación manual
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(menusRef, docData)
      
      return {
        success: true,
        message: `Menú "${itemData.description}" creado exitosamente. Recuerda publicar la semana para que sea visible a los usuarios.`,
        data: { id: docRef.id, ...docData }
      }
    } catch (error) {
      console.error('Error creating menu item:', error)
      return {
        success: false,
        message: 'Error al crear el menú. Por favor, intenta nuevamente.'
      }
    }
  }

  // Actualizar item de menú
  static async updateMenuItem(id: string, updates: Partial<AdminMenuItem>): Promise<MenuOperationResult> {
    try {
      // Validar que el documento existe
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return {
          success: false,
          message: 'El menú no existe'
        }
      }

      // Si se actualiza el código, verificar que sea único
      if (updates.code) {
        const currentData = docSnap.data() as AdminMenuItem
        if (updates.code !== currentData.code) {
          const existingItem = await this.getMenuItemByCode(updates.code, currentData.weekStart)
          if (existingItem && existingItem.id !== id) {
            return {
              success: false,
              message: `Ya existe un menú con el código "${updates.code}" en esta semana`,
              errors: [{ field: 'code', message: 'Código duplicado' }]
            }
          }
        }
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      }

      await updateDoc(docRef, updateData)
      
      return {
        success: true,
        message: 'Menú actualizado exitosamente'
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      return {
        success: false,
        message: 'Error al actualizar el menú. Por favor, intenta nuevamente.'
      }
    }
  }

  // Eliminar item de menú
  static async deleteMenuItem(id: string): Promise<MenuOperationResult> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return {
          success: false,
          message: 'El menú no existe'
        }
      }

      await deleteDoc(docRef)
      
      return {
        success: true,
        message: 'Menú eliminado exitosamente'
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      return {
        success: false,
        message: 'Error al eliminar el menú. Por favor, intenta nuevamente.'
      }
    }
  }

  // Obtener menú semanal para administración (incluye todos los menús, publicados y no publicados)
  static async getWeeklyMenu(weekStart: string): Promise<AdminWeekMenu | null> {
    try {
      const menusRef = collection(db, this.COLLECTION_NAME)
      const q = query(
        menusRef,
        where('weekStart', '==', weekStart),
        orderBy('date', 'asc'),
        orderBy('type', 'asc')
      )

      const snapshot = await getDocs(q)
      const items: AdminMenuItem[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        items.push({
          id: doc.id,
          code: data.code,
          description: data.description,
          type: data.type,
          date: data.date,
          day: data.day,
          weekStart: data.weekStart,
          active: data.active,
          published: data.published ?? false, // Manejar menús antiguos sin campo published
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        })
      })

      return this.buildAdminWeekStructure(weekStart, items)
    } catch (error) {
      console.error('Error fetching weekly menu:', error)
      return null
    }
  }

  // Obtener estadísticas de la semana
  static async getWeekStats(weekStart: string) {
    try {
      const menu = await this.getWeeklyMenu(weekStart)
      if (!menu) {
        return {
          totalItems: 0,
          activeItems: 0,
          publishedItems: 0,
          daysWithMenus: 0,
          almuerzoCount: 0,
          colacionCount: 0
        }
      }

      const allItems = menu.days.flatMap(day => [...day.almuerzos, ...day.colaciones])
      const activeItems = allItems.filter(item => item.active)
      const publishedItems = allItems.filter(item => (item as AdminMenuItem).published)
      const daysWithMenus = menu.days.filter(day => 
        day.almuerzos.length > 0 || day.colaciones.length > 0
      ).length

      return {
        totalItems: allItems.length,
        activeItems: activeItems.length,
        publishedItems: publishedItems.length,
        daysWithMenus,
        almuerzoCount: allItems.filter(item => item.type === 'almuerzo').length,
        colacionCount: allItems.filter(item => item.type === 'colacion').length
      }
    } catch (error) {
      console.error('Error getting week stats:', error)
      return null
    }
  }

  // Duplicar menú semanal
  static async duplicateWeekMenu(sourceWeek: string, targetWeek: string): Promise<MenuOperationResult> {
    try {
      // Verificar que la semana origen existe
      const sourceMenu = await this.getWeeklyMenu(sourceWeek)
      if (!sourceMenu || sourceMenu.totalItems === 0) {
        return {
          success: false,
          message: 'La semana origen no tiene menús para duplicar'
        }
      }

      // Verificar que la semana destino no tenga menús
      const targetMenu = await this.getWeeklyMenu(targetWeek)
      if (targetMenu && targetMenu.totalItems > 0) {
        return {
          success: false,
          message: 'La semana destino ya tiene menús. Elimínalos primero.'
        }
      }

      // Crear estructura de días para la semana destino
      const targetWeekStart = this.createLocalDate(targetWeek)
      const batch = writeBatch(db)
      const menusRef = collection(db, this.COLLECTION_NAME)

      // Duplicar todos los items
      const allItems = sourceMenu.days.flatMap(day => [...day.almuerzos, ...day.colaciones])
      
      for (let i = 0; i < allItems.length; i++) {
        const sourceItem = allItems[i]
        
        // Calcular nueva fecha (mismo día de la semana en la nueva semana)
        const sourceDayIndex = sourceMenu.days.findIndex(day => day.date === sourceItem.date)
        const newDate = addDays(targetWeekStart, sourceDayIndex)
        const newDateStr = format(newDate, 'yyyy-MM-dd')
        const newDay = format(newDate, 'EEEE', { locale: es }).toLowerCase()

        const newDocRef = doc(menusRef)
        const newItemData = {
          code: sourceItem.code,
          description: sourceItem.description,
          type: sourceItem.type,
          date: newDateStr,
          day: newDay,
          weekStart: targetWeek,
          active: sourceItem.active,
          published: false, // Los menús duplicados no se publican automáticamente
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }

        batch.set(newDocRef, newItemData)
      }

      await batch.commit()

      return {
        success: true,
        message: `Menú duplicado exitosamente. ${allItems.length} items copiados. Recuerda publicar la semana para que sea visible a los usuarios.`
      }
    } catch (error) {
      console.error('Error duplicating week menu:', error)
      return {
        success: false,
        message: 'Error al duplicar el menú semanal. Por favor, intenta nuevamente.'
      }
    }
  }

  // Publicar/despublicar menú semanal
  static async toggleWeekMenuPublication(weekStart: string, publish: boolean): Promise<MenuOperationResult> {
    try {
      const menu = await this.getWeeklyMenu(weekStart)
      if (!menu) {
        return {
          success: false,
          message: 'No se encontró el menú para esta semana'
        }
      }

      if (menu.totalItems === 0) {
        return {
          success: false,
          message: 'No se puede publicar un menú vacío'
        }
      }

      // Actualizar estado de publicación en todos los items activos
      const batch = writeBatch(db)
      const allItems = menu.days.flatMap(day => [...day.almuerzos, ...day.colaciones])
      const activeItems = allItems.filter(item => item.active)

      if (activeItems.length === 0) {
        return {
          success: false,
          message: 'No hay menús activos para publicar'
        }
      }

      activeItems.forEach(item => {
        if (item.id) {
          const docRef = doc(db, this.COLLECTION_NAME, item.id)
          batch.update(docRef, {
            published: publish,
            updatedAt: Timestamp.now()
          })
        }
      })

      await batch.commit()

      return {
        success: true,
        message: publish 
          ? `Menú publicado exitosamente. ${activeItems.length} items ahora son visibles para los usuarios.`
          : `Menú despublicado exitosamente. ${activeItems.length} items ya no son visibles para los usuarios.`
      }
    } catch (error) {
      console.error('Error toggling menu publication:', error)
      return {
        success: false,
        message: 'Error al cambiar el estado de publicación. Por favor, intenta nuevamente.'
      }
    }
  }

  // Eliminar menú semanal completo
  static async deleteWeekMenu(weekStart: string): Promise<MenuOperationResult> {
    try {
      const menu = await this.getWeeklyMenu(weekStart)
      if (!menu || menu.totalItems === 0) {
        return {
          success: false,
          message: 'No hay menús para eliminar en esta semana'
        }
      }

      const batch = writeBatch(db)
      const allItems = menu.days.flatMap(day => [...day.almuerzos, ...day.colaciones])

      allItems.forEach(item => {
        if (item.id) {
          const docRef = doc(db, this.COLLECTION_NAME, item.id)
          batch.delete(docRef)
        }
      })

      await batch.commit()

      return {
        success: true,
        message: `Menú semanal eliminado. ${allItems.length} items eliminados.`
      }
    } catch (error) {
      console.error('Error deleting week menu:', error)
      return {
        success: false,
        message: 'Error al eliminar el menú semanal. Por favor, intenta nuevamente.'
      }
    }
  }

  // Función para migrar menús antiguos sin campo published
  static async migrateOldMenus(): Promise<MenuOperationResult> {
    try {
      const menusRef = collection(db, this.COLLECTION_NAME)
      const q = query(menusRef)
      const snapshot = await getDocs(q)
      
      const batch = writeBatch(db)
      let migratedCount = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        // Si no tiene el campo published, agregarlo como false
        if (data.published === undefined) {
          batch.update(doc.ref, {
            published: false,
            updatedAt: Timestamp.now()
          })
          migratedCount++
        }
      })

      if (migratedCount > 0) {
        await batch.commit()
        return {
          success: true,
          message: `Migración completada. ${migratedCount} menús actualizados con campo 'published'.`
        }
      } else {
        return {
          success: true,
          message: 'No se encontraron menús que requieran migración.'
        }
      }
    } catch (error) {
      console.error('Error migrating old menus:', error)
      return {
        success: false,
        message: 'Error al migrar menús antiguos.'
      }
    }
  }

  // Obtener item por código
  private static async getMenuItemByCode(code: string, weekStart: string): Promise<AdminMenuItem | null> {
    try {
      const menusRef = collection(db, this.COLLECTION_NAME)
      const q = query(
        menusRef,
        where('code', '==', code),
        where('weekStart', '==', weekStart)
      )

      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      const data = doc.data()
      
      return {
        id: doc.id,
        code: data.code,
        description: data.description,
        type: data.type,
        date: data.date,
        day: data.day,
        weekStart: data.weekStart,
        active: data.active,
        published: data.published ?? false,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      }
    } catch (error) {
      console.error('Error getting menu item by code:', error)
      return null
    }
  }

  // Validar datos del item
  private static validateMenuItem(item: Omit<AdminMenuItem, 'id'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!item.code || item.code.trim().length === 0) {
      errors.push('El código es requerido')
    }

    if (!item.description || item.description.trim().length === 0) {
      errors.push('La descripción es requerida')
    }

    if (!item.type || !['almuerzo', 'colacion'].includes(item.type)) {
      errors.push('El tipo debe ser "almuerzo" o "colacion"')
    }

    if (!item.date || !item.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.push('La fecha debe tener formato YYYY-MM-DD')
    }

    if (!item.weekStart || !item.weekStart.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.push('La fecha de inicio de semana debe tener formato YYYY-MM-DD')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Construir estructura de semana para administración
  private static buildAdminWeekStructure(weekStart: string, items: AdminMenuItem[]): AdminWeekMenu {
    const startDate = this.createLocalDate(weekStart)
    
    // Asegurar que sea lunes
    if (startDate.getDay() !== 1) {
      const daysToSubtract = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1
      startDate.setDate(startDate.getDate() - daysToSubtract)
    }

    const endDate = addDays(startDate, 6)
    const weekLabel = `Del ${format(startDate, 'd')} al ${format(endDate, 'd')} de ${format(endDate, 'MMMM yyyy', { locale: es })}`

    const days: AdminDayMenu[] = []
    const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i)
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const dayName = dayNames[i]

      const dayItems = items.filter(item => item.date === dateStr)
      const almuerzos = dayItems.filter(item => item.type === 'almuerzo')
      const colaciones = dayItems.filter(item => item.type === 'colacion')

      days.push({
        date: dateStr,
        day: dayName,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        almuerzos,
        colaciones,
        isEditable: true
      })
    }

    // Verificar si está publicado (si todos los items activos están publicados)
    const activeItems = items.filter(item => item.active)
    const publishedItems = activeItems.filter(item => (item as AdminMenuItem).published === true)
    const isPublished = activeItems.length > 0 && publishedItems.length === activeItems.length

    return {
      weekStart: format(startDate, 'yyyy-MM-dd'),
      weekEnd: format(endDate, 'yyyy-MM-dd'),
      weekLabel,
      days,
      isPublished,
      totalItems: items.length
    }
  }
}