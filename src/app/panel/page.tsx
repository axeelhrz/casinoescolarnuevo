"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Navbar } from '@/components/panel/Navbar'
import { GreetingCard } from '@/components/panel/dashboard/GreetingCard'
import { OrderStatusCard } from '@/components/panel/dashboard/OrderStatusCard'
import { EconomicSummaryCard } from '@/components/panel/dashboard/EconomicSummaryCard'
import { WeeklyMenuInfoCard } from '@/components/panel/dashboard/WeeklyMenuInfoCard'
import { QuickActionsCard } from '@/components/panel/dashboard/QuickActionsCard'
import { AlertsCard } from '@/components/panel/dashboard/AlertsCard'
import { WeeklyMenu } from '@/components/panel/WeeklyMenu'
import { OrderSummary } from '@/components/panel/OrderSummary'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useOrderStore } from '@/store/orderStore'
import { DayMenu } from '@/types/panel'
import { startOfWeek, format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, DollarSign, Phone, Mail } from 'lucide-react'

export default function PanelPage() {
  const router = useRouter()
  const { dashboardData, isLoading, error } = useDashboardData()
  const [weekMenu, setWeekMenu] = useState<DayMenu[]>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showFullMenu, setShowFullMenu] = useState(false)
  const { clearSelections, getOrderSummary } = useOrderStore()

  // Cargar menú de la semana
  useEffect(() => {
    const loadWeekMenu = async () => {
      if (!dashboardData?.user) return

      try {
        const today = new Date()
        const weekStart = startOfWeek(today, { weekStartsOn: 1 })

        // Generar datos de ejemplo (en producción vendría de Firestore)
        const mockWeekMenu: DayMenu[] = []
        
        for (let i = 0; i < 5; i++) {
          const currentDay = addDays(weekStart, i)
          const dayMenu: DayMenu = {
            date: format(currentDay, 'yyyy-MM-dd'),
            day: format(currentDay, 'EEEE', { locale: es }),
            almuerzos: [
              {
                id: `almuerzo-${i}-1`,
                code: 'A1',
                name: 'Pollo al horno con papas',
                description: 'Pollo al horno con papas doradas, ensalada mixta y postre',
                type: 'almuerzo',
                price: dashboardData.user.userType === 'funcionario' ? 4875 : 5500,
                available: true,
                date: format(currentDay, 'yyyy-MM-dd'),
                dia: format(currentDay, 'EEEE', { locale: es }),
                active: true
              },
              {
                id: `almuerzo-${i}-2`,
                code: 'A2',
                name: 'Pescado a la plancha',
                description: 'Pescado fresco a la plancha con arroz y verduras al vapor',
                type: 'almuerzo',
                price: dashboardData.user.userType === 'funcionario' ? 4875 : 5500,
                available: true,
                date: format(currentDay, 'yyyy-MM-dd'),
                dia: format(currentDay, 'EEEE', { locale: es }),
                active: true
              },
              {
                id: `almuerzo-${i}-3`,
                code: 'A3',
                name: 'Pasta con salsa boloñesa',
                description: 'Pasta fresca con salsa boloñesa casera y queso parmesano',
                type: 'almuerzo',
                price: dashboardData.user.userType === 'funcionario' ? 4875 : 5500,
                available: true,
                date: format(currentDay, 'yyyy-MM-dd'),
                dia: format(currentDay, 'EEEE', { locale: es }),
                active: true
              }
            ],
            colaciones: [
              {
                id: `colacion-${i}-1`,
                code: 'C1',
                name: 'Sándwich de pavo',
                description: 'Sándwich integral con pavo, palta y tomate',
                type: 'colacion',
                price: dashboardData.user.userType === 'funcionario' ? 1800 : 2000,
                available: true,
                date: format(currentDay, 'yyyy-MM-dd'),
                dia: format(currentDay, 'EEEE', { locale: es }),
                active: true
              },
              {
                id: `colacion-${i}-2`,
                code: 'C2',
                name: 'Ensalada de frutas',
                description: 'Mix de frutas frescas de temporada con yogurt',
                type: 'colacion',
                price: dashboardData.user.userType === 'funcionario' ? 1800 : 2000,
                available: true,
                date: format(currentDay, 'yyyy-MM-dd'),
                dia: format(currentDay, 'EEEE', { locale: es }),
                active: true
              }
            ]
          }
          mockWeekMenu.push(dayMenu)
        }

        setWeekMenu(mockWeekMenu)
      } catch (error) {
        console.error('Error al cargar el menú:', error)
      }
    }

    if (dashboardData?.user) {
      loadWeekMenu()
    }
  }, [dashboardData?.user])

  const handleLogout = async () => {
    try {
      clearSelections()
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleProceedToPayment = async () => {
    if (!dashboardData?.user) return

    setIsProcessingPayment(true)
    
    try {
      const summary = getOrderSummary()
      
      // Crear orden en Firestore
      const orderData = {
        userId: dashboardData.user.id,
        weekStart: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        selections: summary.selections,
        total: summary.total,
        status: 'pending',
        createdAt: new Date()
      }

      await addDoc(collection(db, 'orders'), orderData)
      
      // Simular proceso de pago
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const paymentSuccess = Math.random() > 0.1 // 90% de éxito
      
      if (paymentSuccess) {
        alert('¡Pago realizado con éxito! Tu pedido ha sido confirmado.')
        clearSelections()
      } else {
        throw new Error('Error en el procesamiento del pago')
      }
      
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      alert('Hubo un error al procesar el pago. Por favor, intenta nuevamente.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 text-clean">
              Cargando panel...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <Card className="shadow-soft-lg border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-elegant mb-2">
                  Error al cargar el panel
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-clean mb-6">
                  {error}
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>Reintentar</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!dashboardData) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Contenido principal con espaciado mejorado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 mb-12"
        >
          {/* Saludo personalizado */}
          <GreetingCard user={dashboardData.user} />

          {/* Grid de tarjetas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <OrderStatusCard orderStatus={dashboardData.orderStatus} />
            <EconomicSummaryCard economicSummary={dashboardData.economicSummary} />
            <WeeklyMenuInfoCard weeklyMenuInfo={dashboardData.weeklyMenuInfo} />
          </div>

          {/* Acciones rápidas y alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuickActionsCard />
            <AlertsCard alerts={dashboardData.alerts} />
          </div>
        </motion.div>

        {/* Toggle para mostrar menú completo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-0 bg-white dark:bg-slate-800 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-elegant">
                    Gestión de Pedidos
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-clean mt-1">
                    {showFullMenu ? 'Oculta el menú para ver solo el resumen' : 'Muestra el menú completo para realizar pedidos'}
                  </p>
                </div>
                <Button
                  onClick={() => setShowFullMenu(!showFullMenu)}
                  variant={showFullMenu ? "outline" : "default"}
                  className="px-6 py-2"
                >
                  {showFullMenu ? 'Ocultar menú' : 'Mostrar menú completo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menú completo y resumen (condicional) */}
        {showFullMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Área principal - Menú semanal */}
              <div className="lg:col-span-2">
                <WeeklyMenu 
                  weekMenu={weekMenu} 
                  isLoading={false}
                />
              </div>

              {/* Sidebar - Resumen del pedido */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <OrderSummary 
                    onProceedToPayment={handleProceedToPayment}
                    isProcessingPayment={isProcessingPayment}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Información de precios */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-25 dark:from-blue-900/20 dark:to-blue-800/10 shadow-soft-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-elegant">
                  Información de Precios
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 text-clean font-medium">Almuerzo:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-clean text-lg">
                    ${dashboardData.user.userType === 'funcionario' ? '4.875' : '5.500'} CLP
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 text-clean font-medium">Colación:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-clean text-lg">
                    ${dashboardData.user.userType === 'funcionario' ? '1.800' : '2.000'} CLP
                  </span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-300 text-clean text-center">
                  Precios especiales para {dashboardData.user.userType === 'funcionario' ? 'funcionarios' : 'apoderados'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Horarios */}
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-25 dark:from-emerald-900/20 dark:to-emerald-800/10 shadow-soft-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-elegant">
                  Horarios de Servicio
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 text-clean font-medium">Almuerzo:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-clean text-lg">
                    12:00 - 14:00
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 text-clean font-medium">Colación:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-clean text-lg">
                    15:30 - 16:30
                  </span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 text-clean text-center">
                  Horarios de lunes a viernes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-25 dark:from-purple-900/20 dark:to-purple-800/10 shadow-soft-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-elegant">
                  Contacto
                </h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-clean font-medium">Teléfono:</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-clean">
                    +56 2 2345 6789
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-clean font-medium">Email:</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-clean">
                    casino@colegio.cl
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                <p className="text-sm text-purple-800 dark:text-purple-300 text-clean text-center">
                  Estamos aquí para ayudarte
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}