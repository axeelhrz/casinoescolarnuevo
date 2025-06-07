"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ArrowRight, Calendar, Clock, CheckCircle, DollarSign, Zap, CalendarX } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWeeklyMenuData } from '@/hooks/useWeeklyMenuData'
import { Navbar } from '@/components/panel/Navbar'
import { DayMenuCard } from '@/components/menu/DayMenuCard'
import { MenuSkeleton } from '@/components/menu/MenuSkeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function MenuPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const { 
    weekMenu, 
    isLoading, 
    error, 
    weekInfo, 
    refetch 
  } = useWeeklyMenuData({ 
    user, 
    useAdminData: false // Solo menús publicados
  })

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  const handleLogout = async () => {
    try {
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Loading state para autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 text-clean">
              Verificando autenticación...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, no mostrar nada (se redirigirá)
  if (!user) {
    return null
  }

  // Separar días laborales y fines de semana
  const weekDays = weekMenu.filter((_, index) => index < 5) // Lunes a Viernes
  const weekendDays = weekMenu.filter((_, index) => index >= 5) // Sábado y Domingo

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Contenido principal con espaciado mejorado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del menú con espaciado superior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 shadow-soft">
                <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 text-elegant">
                  Menú Semanal
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 text-clean">
                  Consulta las opciones disponibles para esta semana
                </p>
              </div>
            </div>
            
            {weekInfo && (
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge variant="outline" className="text-sm px-4 py-2 bg-white dark:bg-slate-800 shadow-soft">
                  <Calendar className="w-4 h-4 mr-2" />
                  {weekInfo.weekLabel}
                </Badge>
                
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-4 py-2 shadow-soft">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Menús Publicados
                </Badge>

                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 shadow-soft">
                  {user.tipoUsuario === 'funcionario' ? 'Funcionario' : 'Apoderado'}
                </Badge>
              </div>
            )}
          </div>
        </motion.div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="max-w-6xl mx-auto">
            <MenuSkeleton />
          </div>
        )}

        {/* Estado de error */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-4xl mx-auto"
          >
            <Alert variant="destructive" className="shadow-soft">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch}
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Estado vacío */}
        {!isLoading && !error && weekMenu.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="shadow-soft-lg border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                  <CalendarX className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-elegant">
                  Menú no disponible
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-clean mb-8 text-lg leading-relaxed">
                  El menú de esta semana aún no ha sido publicado por la administración.
                  Por favor, vuelve a consultar más tarde.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={refetch}
                    className="flex items-center space-x-2 px-6 py-3"
                  >
                    <RefreshCw size={18} />
                    <span>Verificar nuevamente</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/panel')}
                    className="flex items-center space-x-2 px-6 py-3"
                  >
                    <span>Volver al Panel</span>
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Menú semanal */}
        {!isLoading && !error && weekMenu.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            {/* Días laborales */}
            {weekDays.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 justify-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 shadow-soft">
                    <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-elegant">
                      Días Laborales
                    </h2>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 mt-2 shadow-soft">
                      Lunes a Viernes
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {weekDays.map((dayMenu, index) => (
                    <motion.div
                      key={dayMenu.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <DayMenuCard
                        dayMenu={dayMenu}
                        userType={user.tipoUsuario}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Fines de semana */}
            {weekendDays.length > 0 && weekendDays.some(day => day.hasItems) && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 justify-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 shadow-soft">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-elegant">
                      Fin de Semana
                    </h2>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 mt-2 shadow-soft">
                      Sábado y Domingo
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {weekendDays.filter(day => day.hasItems).map((dayMenu, index) => (
                    <motion.div
                      key={dayMenu.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <DayMenuCard
                        dayMenu={dayMenu}
                        userType={user.tipoUsuario}
                        index={index + weekDays.length}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          ${user.tipoUsuario === 'funcionario' ? '4.875' : '5.500'} CLP
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-400 text-clean font-medium">Colación:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-clean text-lg">
                          ${user.tipoUsuario === 'funcionario' ? '4.875' : '5.500'} CLP
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-sm text-blue-800 dark:text-blue-300 text-clean text-center">
                        Precios especiales para {user.tipoUsuario === 'funcionario' ? 'funcionarios' : 'apoderados'}
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

                {/* Acciones rápidas */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-25 dark:from-purple-900/20 dark:to-purple-800/10 shadow-soft-lg hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-elegant">
                        Acciones Rápidas
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <Button
                        onClick={() => router.push('/mi-pedido')}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      >
                        <span>Realizar Pedido</span>
                        <ArrowRight size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/panel')}
                        className="w-full py-3 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        Volver al Panel
                      </Button>
                    </div>
                    <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                      <p className="text-sm text-purple-800 dark:text-purple-300 text-clean text-center">
                        Para realizar pedidos, dirígete a &quot;Mi Pedido&quot;
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Información sobre disponibilidad */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <Alert className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-soft-lg">
                <Clock className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-base leading-relaxed">
                  <strong>Disponibilidad:</strong> Los menús se actualizan automáticamente desde la administración. 
                  Los pedidos están disponibles para días laborales (lunes a viernes) y se pueden realizar hasta el día anterior.
                </AlertDescription>
              </Alert>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}