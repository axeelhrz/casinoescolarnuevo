import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { 
  ReportsFilters, 
  ReportsStats, 
  ChartDataPoint, 
  MenuDistribution, 
  UserTypeData, 
  DailyMetrics,
  ReportsData 
} from '@/types/reports'
import { format, parseISO, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

interface OrderData {
  id: string
  userId: string
  status: string
  total?: number
  createdAt?: Timestamp
  selections?: Array<{
    almuerzo?: {
      code: string
      name: string
      price?: number
    }
    colacion?: {
      code: string
      name: string
      price?: number
    }
  }>
  user?: {
    userType: string
    [key: string]: string | number | boolean | Date | null | undefined
  }
}

interface UserData {
  id: string
  userType: string
  [key: string]: string | number | boolean | Date | null | undefined
}

export class ReportsService {
  static async getReportsData(filters: ReportsFilters): Promise<ReportsData> {
    try {
      const [orders] = await Promise.all([
        this.getFilteredOrders(filters),
        this.getUsers()
      ])

      const stats = this.calculateStats(orders)
      const dailyData = this.generateDailyData(orders, filters)
      const revenueData = this.generateRevenueData(orders, filters)
      const menuDistribution = this.calculateMenuDistribution(orders)
      const userTypeData = this.calculateUserTypeData(orders)
      const dailyMetrics = this.calculateDailyMetrics(orders, filters)
      const topMenuItems = this.getTopMenuItems(orders)

      return {
        stats,
        dailyData,
        revenueData,
        menuDistribution,
        userTypeData,
        dailyMetrics,
        topMenuItems,
        isLoading: false,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error fetching reports data:', error)
      throw new Error('No se pudieron cargar los datos de reportes')
    }
  }

  private static async getFilteredOrders(filters: ReportsFilters): Promise<OrderData[]> {
    try {
      const ordersRef = collection(db, 'orders')
      let q = query(ordersRef, orderBy('createdAt', 'desc'))

      // Filtrar por estado si no es 'all'
      if (filters.orderStatus !== 'all') {
        q = query(ordersRef, where('status', '==', filters.orderStatus), orderBy('createdAt', 'desc'))
      }

      const ordersSnapshot = await getDocs(q)
      const orders: OrderData[] = []

      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data()
        const orderDate = orderData.createdAt?.toDate()

        // Filtrar por rango de fechas
        if (orderDate) {
          const orderDateStr = format(orderDate, 'yyyy-MM-dd')
          if (orderDateStr >= filters.dateRange.start && orderDateStr <= filters.dateRange.end) {
            // Obtener datos del usuario
            try {
              const userDoc = await getDoc(doc(db, 'users', orderData.userId))
              let userData: Partial<UserData> = {}
              
              if (userDoc.exists()) {
                userData = userDoc.data()
              }

              // Filtrar por tipo de usuario si no es 'all'
              if (filters.userType !== 'all') {
                if (userData.userType === filters.userType) {
                  orders.push({
                    id: orderDoc.id,
                    ...orderData,
                    user: userData
                  } as OrderData)
                }
              } else {
                orders.push({
                  id: orderDoc.id,
                  ...orderData,
                  user: userData
                } as OrderData)
              }
            } catch (userError) {
              console.error(`Error fetching user ${orderData.userId}:`, userError)
              // Incluir orden sin datos de usuario si hay error
              if (filters.userType === 'all') {
                orders.push({
                  id: orderDoc.id,
                  ...orderData,
                  user: { userType: 'estudiante' } // valor por defecto
                } as OrderData)
              }
            }
          }
        }
      }

      return orders
    } catch (error) {
      console.error('Error fetching filtered orders:', error)
      return []
    }
  }

  private static async getUsers(): Promise<UserData[]> {
    try {
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[]
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  private static calculateStats(orders: OrderData[]): ReportsStats {
    const totalOrders = orders.length
    const paidOrders = orders.filter(order => order.status === 'paid')
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    
    const uniqueUserIds = [...new Set(orders.map(order => order.userId))]
    const totalUsers = uniqueUserIds.length

    // Calcular total de items de menú seleccionados
    const totalMenuItems = orders.reduce((sum, order) => {
      if (!order.selections) return sum
      return sum + order.selections.reduce((itemSum, selection) => {
        let count = 0
        if (selection.almuerzo) count++
        if (selection.colacion) count++
        return itemSum + count
      }, 0)
    }, 0)

    const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

    // Calcular crecimiento (simulado - en producción compararía con período anterior)
    const growthPercentage = Math.random() * 20 - 10 // -10% a +10%

    // Tasa de conversión (pedidos pagados vs total)
    const conversionRate = totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0

    return {
      totalOrders,
      totalRevenue,
      totalUsers,
      totalMenuItems,
      growthPercentage,
      averageOrderValue,
      conversionRate
    }
  }

  private static generateDailyData(orders: OrderData[], filters: ReportsFilters): ChartDataPoint[] {
    const startDate = parseISO(filters.dateRange.start)
    const endDate = parseISO(filters.dateRange.end)
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate()
        return orderDate && format(orderDate, 'yyyy-MM-dd') === dayStr
      })

      const dayRevenue = dayOrders
        .filter(order => order.status === 'paid')
        .reduce((sum, order) => sum + (order.total || 0), 0)

      const uniqueUsers = [...new Set(dayOrders.map(order => order.userId))].length

      return {
        date: dayStr,
        day: format(day, 'dd/MM'),
        orders: dayOrders.length,
        revenue: dayRevenue,
        users: uniqueUsers
      }
    })
  }

  private static generateRevenueData(orders: OrderData[], filters: ReportsFilters): ChartDataPoint[] {
    return this.generateDailyData(orders, filters)
  }

  private static calculateMenuDistribution(orders: OrderData[]): MenuDistribution[] {
    const menuCounts: { [key: string]: { name: string; count: number; revenue: number } } = {}
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']

    orders.forEach(order => {
      if (order.selections && Array.isArray(order.selections)) {
        order.selections.forEach((selection) => {
          if (selection.almuerzo) {
            const key = selection.almuerzo.code
            if (!menuCounts[key]) {
              menuCounts[key] = { 
                name: selection.almuerzo.name, 
                count: 0, 
                revenue: 0 
              }
            }
            menuCounts[key].count++
            menuCounts[key].revenue += selection.almuerzo.price || 0
          }
          if (selection.colacion) {
            const key = selection.colacion.code
            if (!menuCounts[key]) {
              menuCounts[key] = { 
                name: selection.colacion.name, 
                count: 0, 
                revenue: 0 
              }
            }
            menuCounts[key].count++
            menuCounts[key].revenue += selection.colacion.price || 0
          }
        })
      }
    })

    const totalCount = Object.values(menuCounts).reduce((sum, item) => sum + item.count, 0)

    return Object.entries(menuCounts)
      .map(([code, data], index) => ({
        name: data.name,
        code,
        count: data.count,
        percentage: totalCount > 0 ? Math.round((data.count / totalCount) * 100 * 100) / 100 : 0,
        revenue: data.revenue,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }

  private static calculateUserTypeData(orders: OrderData[]): UserTypeData[] {
    const userTypeStats: { [key: string]: { orders: number; revenue: number; users: Set<string> } } = {
      estudiante: { orders: 0, revenue: 0, users: new Set() },
      funcionario: { orders: 0, revenue: 0, users: new Set() }
    }

    orders.forEach(order => {
      const userType = order.user?.userType || 'estudiante'
      if (userTypeStats[userType]) {
        userTypeStats[userType].orders++
        if (order.status === 'paid') {
          userTypeStats[userType].revenue += order.total || 0
        }
        userTypeStats[userType].users.add(order.userId)
      }
    })

    const totalOrders = orders.length

    return Object.entries(userTypeStats).map(([type, data]) => ({
      type: type === 'estudiante' ? 'Estudiantes' : 'Funcionarios',
      orders: data.orders,
      revenue: data.revenue,
      users: data.users.size,
      percentage: totalOrders > 0 ? Math.round((data.orders / totalOrders) * 100 * 100) / 100 : 0
    }))
  }

  private static calculateDailyMetrics(orders: OrderData[], filters: ReportsFilters): DailyMetrics[] {
    const startDate = parseISO(filters.dateRange.start)
    const endDate = parseISO(filters.dateRange.end)
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate()
        return orderDate && format(orderDate, 'yyyy-MM-dd') === dayStr
      })

      const totalRevenue = dayOrders
        .filter(order => order.status === 'paid')
        .reduce((sum, order) => sum + (order.total || 0), 0)

      const uniqueUsers = [...new Set(dayOrders.map(order => order.userId))].length

      let almuerzoOrders = 0
      let colacionOrders = 0

      dayOrders.forEach(order => {
        if (order.selections && Array.isArray(order.selections)) {
          order.selections.forEach((selection) => {
            if (selection.almuerzo) almuerzoOrders++
            if (selection.colacion) colacionOrders++
          })
        }
      })

      return {
        date: dayStr,
        dayName: format(day, 'EEEE', { locale: es }),
        totalOrders: dayOrders.length,
        totalRevenue,
        uniqueUsers,
        almuerzoOrders,
        colacionOrders,
        averageOrderValue: dayOrders.length > 0 ? Math.round((totalRevenue / dayOrders.length) * 100) / 100 : 0
      }
    })
  }

  private static getTopMenuItems(orders: OrderData[]): MenuDistribution[] {
    return this.calculateMenuDistribution(orders).slice(0, 5)
  }

  static getDefaultFilters(): ReportsFilters {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      dateRange: {
        start: format(thirtyDaysAgo, 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      },
      userType: 'all',
      orderStatus: 'all',
      menuType: 'all'
    }
  }

  // Método adicional para exportar datos
  static async exportReportsData(filters: ReportsFilters, format: 'csv' | 'json' = 'json'): Promise<string> {
    try {
      const data = await this.getReportsData(filters)
      
      if (format === 'csv') {
        return this.convertToCSV(data)
      }
      
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Error exporting reports data:', error)
      throw new Error('No se pudieron exportar los datos de reportes')
    }
  }

  private static convertToCSV(data: ReportsData): string {
    const headers = ['Fecha', 'Pedidos', 'Ingresos', 'Usuarios']
    const rows = data.dailyData.map(item => [
      item.date,
      item.orders.toString(),
      item.revenue.toString(),
      item.users.toString()
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
}