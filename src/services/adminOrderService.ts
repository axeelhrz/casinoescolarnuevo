import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { AdminOrderView, OrderFilters, OrderMetrics, OrderUpdateRequest, OrderDetailView } from '@/types/adminOrder'
import { format, parseISO, startOfWeek, endOfWeek, addDays, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

export class AdminOrderService {
  // Cache para mejorar rendimiento
  private static cache = new Map<string, { data: AdminOrderView[]; timestamp: number }>()
  private static CACHE_DURATION = 1 * 60 * 1000 // 1 minuto para datos más frescos

  private static getCacheKey(filters: OrderFilters): string {
    return JSON.stringify(filters)
  }

  private static isValidCache(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < this.CACHE_DURATION
  }

  // Función helper para convertir timestamps de Firebase de forma segura
  private static safeTimestampToDate(timestamp: Date | Timestamp | { seconds: number; nanoseconds?: number } | string | number | null | undefined): Date {
    if (!timestamp) return new Date()
    
    // Si ya es una fecha
    if (timestamp instanceof Date) return timestamp
    
    // Si es un Timestamp de Firebase
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate()
    }
    
    // Si es un objeto con seconds y nanoseconds
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000)
    }
    
    // Si es un string de fecha
    if (typeof timestamp === 'string') {
      return new Date(timestamp)
    }
    
    // Si es un número (timestamp en ms)
    if (typeof timestamp === 'number') {
      return new Date(timestamp)
    }
    
    console.warn('Unknown timestamp format:', timestamp)
    return new Date()
  }

  static async getOrdersWithFilters(filters: OrderFilters): Promise<AdminOrderView[]> {
    try {
      const cacheKey = this.getCacheKey(filters)
      
      // Verificar cache solo si no es una consulta en tiempo real
      if (this.isValidCache(cacheKey)) {
        console.log('Using cached data for filters:', filters)
        return this.cache.get(cacheKey)!.data
      }

      console.log('Fetching fresh data for filters:', filters)
      const ordersRef = collection(db, 'orders')
      
      // Construir query básico - siempre ordenar por fecha de creación
      let q = query(ordersRef, orderBy('createdAt', 'desc'))

      // Aplicar filtro de estado si no es 'all'
      if (filters.status && filters.status !== 'all') {
        q = query(ordersRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
      }

      const ordersSnapshot = await getDocs(q)
      const orders: AdminOrderView[] = []

      console.log(`Processing ${ordersSnapshot.docs.length} orders from Firestore`)

      // Procesar pedidos en lotes para mejor rendimiento
      const batchSize = 20
      const orderDocs = ordersSnapshot.docs
      
      for (let i = 0; i < orderDocs.length; i += batchSize) {
        const batch = orderDocs.slice(i, i + batchSize)
        const batchPromises = batch.map(async (orderDoc) => {
          try {
            const orderData = orderDoc.data()
            
            // Aplicar filtro de semana del lado del cliente
            if (filters.weekStart && orderData.weekStart !== filters.weekStart) {
              return null
            }
            
            // Obtener datos del usuario
            const userDoc = await getDoc(doc(db, 'users', orderData.userId))
            if (!userDoc.exists()) {
              console.warn(`User not found for order ${orderDoc.id}: ${orderData.userId}`)
              return null
            }

            const userData = userDoc.data()

            // Aplicar filtros del lado del cliente
            if (filters.userType && filters.userType !== 'all' && userData.userType !== filters.userType) {
              return null
            }

            if (filters.searchTerm) {
              const searchLower = filters.searchTerm.toLowerCase()
              const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase()
              const email = userData.email.toLowerCase()
              
              if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
                return null
              }
            }

            // Convertir timestamps de forma segura
            const createdAt = this.safeTimestampToDate(orderData.createdAt)
            const paidAt = orderData.paidAt ? this.safeTimestampToDate(orderData.paidAt) : undefined
            const cancelledAt = orderData.cancelledAt ? this.safeTimestampToDate(orderData.cancelledAt) : undefined

            // Calcular estadísticas del pedido
            const selections = orderData.selections || []
            const itemsCount = selections.length
            const hasColaciones = selections.some((s: { colacion?: unknown }) => s.colacion)
            const total = Number(orderData.total) || 0

            // Calcular días desde que está pendiente
            const daysSincePending = orderData.status === 'pending' 
              ? differenceInDays(new Date(), createdAt)
              : 0

            const order: AdminOrderView = {
              id: orderDoc.id,
              userId: orderData.userId,
              weekStart: orderData.weekStart,
              selections: selections,
              total: total,
              status: orderData.status || 'pending',
              createdAt: createdAt,
              paidAt: paidAt,
              cancelledAt: cancelledAt,
              daysSincePending: daysSincePending,
              paymentId: orderData.paymentId,
              user: {
                id: userData.id || orderData.userId,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                userType: userData.userType || 'estudiante'
              },
              dayName: format(createdAt, 'EEEE', { locale: es }),
              formattedDate: format(createdAt, 'dd/MM/yyyy HH:mm'),
              itemsCount: itemsCount,
              hasColaciones: hasColaciones
            }

            // Filtrar por día específico
            if (filters.day && filters.day !== 'none') {
              const hasSelectionForDay = order.selections.some(s => {
                try {
                  const selectionDate = parseISO(s.date)
                  const dayName = format(selectionDate, 'EEEE', { locale: es }).toLowerCase()
                  return dayName === filters.day?.toLowerCase()
                } catch {
                  return false
                }
              })
              if (!hasSelectionForDay) return null
            }

            return order
          } catch (error) {
            console.error('Error processing order:', orderDoc.id, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        orders.push(...batchResults.filter(order => order !== null) as AdminOrderView[])
      }

      console.log(`Processed ${orders.length} orders after filtering`)

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: orders,
        timestamp: Date.now()
      })

      return orders
    } catch (error) {
      console.error('Error fetching admin orders:', error)
      throw new Error('No se pudieron cargar los pedidos')
    }
  }

  static async getOrderMetrics(filters: OrderFilters): Promise<OrderMetrics> {
    try {
      const orders = await this.getOrdersWithFilters(filters)
      
      console.log(`Calculating metrics for ${orders.length} orders`)
      
      const metrics: OrderMetrics = {
        totalOrders: orders.length,
        totalRevenue: 0,
        totalByDay: {
          'lunes': 0,
          'martes': 0,
          'miércoles': 0,
          'jueves': 0,
          'viernes': 0
        },
        totalByUserType: { estudiante: 0, funcionario: 0 },
        averageOrderValue: 0,
        pendingOrders: 0,
        paidOrders: 0,
        cancelledOrders: 0,
        criticalPendingOrders: 0,
        totalByStatus: { pending: 0, paid: 0, cancelled: 0 },
        revenueByStatus: { pending: 0, paid: 0, cancelled: 0 }
      }

      // Calcular métricas
      orders.forEach(order => {
        const orderTotal = Number(order.total) || 0
        
        // Contadores por estado
        switch (order.status) {
          case 'pending':
            metrics.pendingOrders++
            metrics.totalByStatus.pending++
            metrics.revenueByStatus.pending += orderTotal
            
            // Pedidos críticos (más de 3 días pendientes)
            if ((order.daysSincePending || 0) > 3) {
              metrics.criticalPendingOrders++
            }
            break
            
          case 'paid':
            metrics.paidOrders++
            metrics.totalByStatus.paid++
            metrics.revenueByStatus.paid += orderTotal
            metrics.totalRevenue += orderTotal // Solo contar revenue de pedidos pagados
            
            // Totales por tipo de usuario (solo pedidos pagados)
            if (order.user.userType === 'estudiante') {
              metrics.totalByUserType.estudiante += orderTotal
            } else if (order.user.userType === 'funcionario') {
              metrics.totalByUserType.funcionario += orderTotal
            }
            break
            
          case 'cancelled':
            metrics.cancelledOrders++
            metrics.totalByStatus.cancelled++
            metrics.revenueByStatus.cancelled += orderTotal
            break
        }

        // Totales por día (contar todos los pedidos)
        order.selections.forEach(selection => {
          try {
            const dayKey = format(parseISO(selection.date), 'EEEE', { locale: es }).toLowerCase()
            if (metrics.totalByDay[dayKey] !== undefined) {
              metrics.totalByDay[dayKey] = (metrics.totalByDay[dayKey] || 0) + 1
            }
          } catch (error) {
            console.error('Error parsing date:', selection.date, error)
          }
        })
      })

      // Valor promedio (solo de pedidos pagados)
      metrics.averageOrderValue = metrics.paidOrders > 0 
        ? Math.round(metrics.totalRevenue / metrics.paidOrders)
        : 0

      console.log('Calculated metrics:', {
        total: metrics.totalOrders,
        pending: metrics.pendingOrders,
        paid: metrics.paidOrders,
        cancelled: metrics.cancelledOrders,
        critical: metrics.criticalPendingOrders,
        revenue: metrics.totalRevenue,
        averageValue: metrics.averageOrderValue
      })

      return metrics
    } catch (error) {
      console.error('Error calculating metrics:', error)
      throw new Error('No se pudieron calcular las métricas')
    }
  }

  static async updateOrderStatus(request: OrderUpdateRequest): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', request.orderId)
      
      // Verificar que el pedido existe
      const orderDoc = await getDoc(orderRef)
      if (!orderDoc.exists()) {
        throw new Error('El pedido no existe')
      }

      const currentData = orderDoc.data()
      console.log(`Updating order ${request.orderId} from ${currentData.status} to ${request.status}`)

      const updateData: Record<string, string | Timestamp | null> = {
        status: request.status || 'pending',
        updatedAt: Timestamp.now()
      }

      // Manejar timestamps según el nuevo estado
      switch (request.status) {
        case 'paid':
          updateData.paidAt = Timestamp.now()
          // Limpiar cancelledAt si existía
          if (currentData.cancelledAt) {
            updateData.cancelledAt = null
          }
          break
          
        case 'cancelled':
          updateData.cancelledAt = Timestamp.now()
          // Limpiar paidAt si existía
          if (currentData.paidAt) {
            updateData.paidAt = null
          }
          break
          
        case 'pending':
          // Limpiar ambos timestamps si vuelve a pendiente
          if (currentData.paidAt) {
            updateData.paidAt = null
          }
          if (currentData.cancelledAt) {
            updateData.cancelledAt = null
          }
          break
      }

      if (request.notes) {
        updateData.adminNotes = request.notes
      }

      await updateDoc(orderRef, updateData)
      
      console.log(`Order ${request.orderId} updated successfully to ${request.status}`)
      
      // Limpiar cache relacionado
      this.clearCache()
    } catch (error) {
      console.error('Error updating order:', error)
      throw new Error('No se pudo actualizar el pedido')
    }
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      // Verificar que el pedido existe
      const orderRef = doc(db, 'orders', orderId)
      const orderDoc = await getDoc(orderRef)
      
      if (!orderDoc.exists()) {
        throw new Error('El pedido no existe')
      }

      await deleteDoc(orderRef)
      
      console.log(`Order ${orderId} deleted successfully`)
      
      // Limpiar cache
      this.clearCache()
    } catch (error) {
      console.error('Error deleting order:', error)
      throw new Error('No se pudo eliminar el pedido')
    }
  }

  static async getOrderDetail(orderId: string): Promise<OrderDetailView | null> {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId))
      if (!orderDoc.exists()) return null

      const orderData = orderDoc.data()
      const userDoc = await getDoc(doc(db, 'users', orderData.userId))
      
      if (!userDoc.exists()) return null
      const userData = userDoc.data()

      // Convertir timestamps de forma segura
      const createdAt = this.safeTimestampToDate(orderData.createdAt)
      const paidAt = orderData.paidAt ? this.safeTimestampToDate(orderData.paidAt) : undefined
      const cancelledAt = orderData.cancelledAt ? this.safeTimestampToDate(orderData.cancelledAt) : undefined

      // Procesar selecciones con manejo de errores
      const processedSelections = (orderData.selections || []).map((s: { date: string; almuerzo?: { code: string; name: string; price: number }; colacion?: { code: string; name: string; price: number } }) => {
        try {
          return {
            date: s.date,
            dayName: format(parseISO(s.date), 'EEEE', { locale: es }),
            almuerzo: s.almuerzo ? {
              code: s.almuerzo.code,
              name: s.almuerzo.name,
              price: s.almuerzo.price
            } : undefined,
            colacion: s.colacion ? {
              code: s.colacion.code,
              name: s.colacion.name,
              price: s.colacion.price
            } : undefined
          }
        } catch (error) {
          console.error('Error processing selection:', s, error)
          return {
            date: s.date,
            dayName: 'Fecha inválida',
            almuerzo: s.almuerzo,
            colacion: s.colacion
          }
        }
      })

      // Construir historial de pagos
      const paymentHistory = [
        {
          date: createdAt,
          status: 'created',
          amount: Number(orderData.total) || 0
        }
      ]

      if (paidAt) {
        paymentHistory.push({
          date: paidAt,
          status: 'paid',
          amount: Number(orderData.total) || 0
        })
      }

      if (cancelledAt) {
        paymentHistory.push({
          date: cancelledAt,
          status: 'cancelled',
          amount: 0
        })
      }

      const detail: OrderDetailView = {
        id: orderDoc.id,
        userId: orderData.userId,
        weekStart: orderData.weekStart,
        selections: processedSelections,
        total: Number(orderData.total) || 0,
        status: orderData.status,
        createdAt: createdAt,
        paidAt: paidAt,
        cancelledAt: cancelledAt,
        daysSincePending: orderData.status === 'pending' ? differenceInDays(new Date(), createdAt) : 0,
        paymentId: orderData.paymentId,
        user: {
          id: userData.id || orderData.userId,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          userType: userData.userType || 'estudiante'
        },
        dayName: format(createdAt, 'EEEE', { locale: es }),
        formattedDate: format(createdAt, 'dd/MM/yyyy HH:mm'),
        itemsCount: processedSelections.length,
        hasColaciones: processedSelections.some((s: { colacion?: { code: string; name: string; price: number } }) => s.colacion),
        paymentHistory: paymentHistory
      }

      return detail
    } catch (error) {
      console.error('Error fetching order detail:', error)
      throw new Error('No se pudo cargar el detalle del pedido')
    }
  }

  static generateWeekOptions(): Array<{ value: string; label: string; isCurrent: boolean }> {
    const options = []
    const today = new Date()
    
    // Generar opciones para las últimas 8 semanas y las próximas 4
    for (let i = -8; i <= 4; i++) {
      const weekDate = addDays(today, i * 7)
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 })
      
      const weekStartStr = format(weekStart, 'yyyy-MM-dd')
      const isCurrent = i === 0
      
      options.push({
        value: weekStartStr,
        label: `Semana del ${format(weekStart, 'd')} al ${format(weekEnd, 'd')} de ${format(weekEnd, 'MMMM', { locale: es })}`,
        isCurrent
      })
    }
    
    return options.reverse() // Mostrar más recientes primero
  }

  // Método para limpiar cache
  static clearCache(): void {
    console.log('Clearing cache')
    this.cache.clear()
  }

  // Método para obtener estadísticas en tiempo real
  static subscribeToOrdersRealtime(
    filters: OrderFilters,
    callback: (orders: AdminOrderView[]) => void
  ): () => void {
    const ordersRef = collection(db, 'orders')
    let q = query(ordersRef, orderBy('createdAt', 'desc'))

    // Solo aplicar filtros simples para evitar errores de índice
    if (filters.status && filters.status !== 'all') {
      q = query(ordersRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
    }

    return onSnapshot(q, () => {
      // Procesar cambios en tiempo real
      this.clearCache() // Limpiar cache cuando hay cambios
      this.getOrdersWithFilters(filters).then(callback).catch(console.error)
    })
  }
}