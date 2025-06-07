"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useOrderStore } from '@/store/orderStore'
import { useOrderManagement } from '@/hooks/useOrderManagement'
import { Navbar } from '@/components/panel/Navbar'
import { ChildSelector } from '@/components/mi-pedido/ChildSelector'
import { DaySelector } from '@/components/mi-pedido/DaySelector'
import { OrderSummary } from '@/components/mi-pedido/OrderSummary'
import { PaymentButton } from '@/components/mi-pedido/PaymentButton'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  AlertCircle, 
  RefreshCw,
  Calendar,
  User as UserIcon,
  CalendarDays,
  Utensils,
  CreditCard,
  ExternalLink,
  Wifi,
  Database,
  ArrowRight
} from 'lucide-react'

export default function MiPedidoPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { 
    setUserType, 
    setChildren,
    clearSelectionsByChild,
    getOrderSummaryByChild
  } = useOrderStore()

  // Usar el hook unificado de gestión de pedidos con múltiples semanas
  const {
    currentWeekMenu,
    allWeeks,
    isLoadingMenu,
    menuError,
    weekInfo,
    isLoadingOrder,
    orderError,
    isProcessingPayment,
    paymentError,
    refreshMenu,
    refreshWeek,
    processPayment,
    clearErrors
  } = useOrderManagement()

  // Configurar tipo de usuario y hijos
  useEffect(() => {
    if (user) {
      setUserType(user.tipoUsuario)
      if (user.tipoUsuario === 'apoderado' && user.children) {
        setChildren(user.children.filter(child => child.active))
      }
    }
  }, [user, setUserType, setChildren])

  const handleLogout = () => {
    clearSelectionsByChild()
  }

  const summary = getOrderSummaryByChild()

  if (authLoading || isLoadingMenu || isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Debes iniciar sesión para acceder a esta página
            </p>
            <Button onClick={() => window.location.href = '/auth/login'}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (menuError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Navbar onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error al cargar el menú</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{menuError}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={refreshMenu} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </Button>
                <Button onClick={clearErrors} variant="outline">
                  Limpiar Errores
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <CalendarDays className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Mi Pedido Semanal
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Selecciona tus menús y procede al pago
              </p>
            </div>
          </div>
          
          {weekInfo && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Calendar className="w-3 h-3 mr-1" />
                {weekInfo.weekLabel}
              </Badge>
              
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1">
                <Database className="w-3 h-3 mr-1" />
                Conectado a Firebase
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Información sobre integración con Firebase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <Wifi className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Sistema integrado:</strong> Los menús se obtienen en tiempo real desde Firebase. 
              Los pagos se procesan de forma segura con GetNet. Todos los datos se sincronizan automáticamente.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Errores de pedido o pago */}
        {(orderError || paymentError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{orderError || paymentError}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearErrors}
                  className="ml-4"
                >
                  Cerrar
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-8">
            {/* Selector de hijo (solo para apoderados) */}
            {user.tipoUsuario === 'apoderado' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ChildSelector user={user} isReadOnly={false} />
              </motion.div>
            )}

            {/* Información del usuario funcionario */}
            {user.tipoUsuario === 'funcionario' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                          Pedido Personal
                        </span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ml-2">
                          Funcionario
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Mostrar todas las semanas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-12"
            >
              {allWeeks.map((week, weekIndex) => {
                const weekDays = week.weekMenu.filter((_, index) => index < 5)
                const weekendDays = week.weekMenu.filter((_, index) => index >= 5)
                const isCurrentWeek = week.weekInfo.isCurrentWeek

                return (
                  <div key={week.weekInfo.weekStart} className="space-y-6">
                    {/* Header de la semana */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          isCurrentWeek 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <CalendarDays className={`w-6 h-6 ${
                            isCurrentWeek 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {week.weekInfo.weekLabel}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            {isCurrentWeek && (
                              <Badge variant="default" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Semana Actual
                              </Badge>
                            )}
                            {!isCurrentWeek && (
                              <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                                Próxima Semana
                              </Badge>
                            )}
                            {week.hasMenus && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Menú Disponible
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Botón de refresh para la semana */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshWeek(week.weekInfo.weekStart)}
                        disabled={week.isLoading}
                        className="gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${week.isLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                      </Button>
                    </div>

                    {/* Contenido de la semana */}
                    {week.isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Skeleton key={i} className="h-96 w-full" />
                        ))}
                      </div>
                    ) : week.error ? (
                      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                        <CardContent className="p-6 text-center">
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                          <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                            Error al cargar esta semana
                          </h3>
                          <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                            {week.error}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshWeek(week.weekInfo.weekStart)}
                            className="gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reintentar
                          </Button>
                        </CardContent>
                      </Card>
                    ) : !week.hasMenus ? (
                      <Card className="border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                        <CardContent className="p-8 text-center">
                          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Menú no disponible
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            El menú para esta semana aún no ha sido publicado.
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refreshWeek(week.weekInfo.weekStart)}
                              className="gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Verificar
                            </Button>
                            {isCurrentWeek && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open('/admin/menus', '_blank')}
                                className="gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Panel Admin
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {/* Días laborales */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                              <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                              Días Laborales
                            </h3>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Lunes a Viernes
                            </Badge>
                          </div>
                          
                          {weekDays.length === 0 ? (
                            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                              No hay menús disponibles para los días laborales
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {weekDays.map((dayMenu, index) => (
                                <motion.div
                                  key={dayMenu.date}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 + weekIndex * 0.1 + index * 0.05 }}
                                >
                                  <DaySelector
                                    dayMenu={dayMenu}
                                    user={user}
                                    isReadOnly={false}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Fines de semana */}
                        {weekendDays.length > 0 && weekendDays.some(day => day.hasItems) && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Fin de Semana
                              </h3>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                Sábado y Domingo
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {weekendDays.filter(day => day.hasItems).map((dayMenu, index) => (
                                <motion.div
                                  key={dayMenu.date}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.6 + weekIndex * 0.1 + index * 0.05 }}
                                >
                                  <DaySelector
                                    dayMenu={dayMenu}
                                    user={user}
                                    isReadOnly={false}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Separador entre semanas */}
                    {weekIndex < allWeeks.length - 1 && (
                      <div className="flex items-center justify-center py-6">
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600">
                          <div className="h-px bg-slate-200 dark:bg-slate-700 w-16"></div>
                          <ArrowRight className="w-5 h-5" />
                          <div className="h-px bg-slate-200 dark:bg-slate-700 w-16"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Sidebar - Resumen del pedido */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <OrderSummary
              user={user}
              onProceedToPayment={processPayment}
              isProcessingPayment={isProcessingPayment}
            />

            {/* Botón de pago con GetNet */}
            {currentWeekMenu.length > 0 && (
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          Pago Seguro con GetNet
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Integrado con Firebase
                        </p>
                      </div>
                    </div>

                    <PaymentButton
                      summary={summary}
                      weekDays={currentWeekMenu.map(day => day.date)}
                      isOrderingAllowed={true}
                      onProceedToPayment={processPayment}
                      isProcessingPayment={isProcessingPayment}
                      isReadOnly={false}
                      user={user}
                    />

                    {/* Información adicional sobre el pago */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <p>• Datos sincronizados con Firebase en tiempo real</p>
                      <p>• Pago procesado de forma segura con GetNet</p>
                      <p>• Confirmación automática por webhook</p>
                      <p>• Soporte para tarjetas de crédito y débito</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información de contacto y soporte */}
            <Card className="border-slate-200 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700">
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Sistema Integrado
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>• Menús sincronizados desde Firebase</p>
                  <p>• Pedidos guardados en tiempo real</p>
                  <p>• Pagos procesados con GetNet</p>
                  <p>• Confirmaciones automáticas por webhook</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/admin', '_blank')}
                    className="gap-2 flex-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshMenu}
                    className="gap-2 flex-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer con información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center pt-8 border-t border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1">
              <Database className="w-4 h-4 text-blue-500" />
              <span>Firebase Real-time</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-green-500" />
              <span>GetNet Payments</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-4 h-4 text-purple-500" />
              <span>Webhooks Automáticos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}